import { describe, it, expect, vi, beforeEach } from 'vitest';

let currentSupabaseClient = null;

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => currentSupabaseClient),
}));

import handler, { getClientIp, isRateLimited, rateLimitMap } from '../track-order.js';

function makeReq(overrides = {}) {
  return {
    method: 'POST',
    headers: {},
    body: {},
    socket: { remoteAddress: '198.51.100.25' },
    ...overrides,
  };
}

function makeRes() {
  const res = {
    _status: 200,
    _json: null,
    status(code) {
      res._status = code;
      return res;
    },
    json(data) {
      res._json = data;
      return res;
    },
  };
  return res;
}

describe('Track Order API Security & Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMap.clear();
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    delete process.env.TRUSTED_PROXIES;
    currentSupabaseClient = null;
  });

  describe('clientIp derivation', () => {
    it('uses socket.remoteAddress by default and strictly ignores spoofed X-Forwarded-For', () => {
      const req = makeReq({
        headers: {
          'x-forwarded-for': '1.2.3.4, 5.6.7.8',
          'x-real-ip': '9.9.9.9',
        },
        socket: { remoteAddress: '203.0.113.50' },
      });

      const ip = getClientIp(req);
      expect(ip).toBe('203.0.113.50');
    });

    it('normalizes IPv6-mapped IPv4 addresses', () => {
      const req = makeReq({
        socket: { remoteAddress: '::ffff:203.0.113.50' },
      });

      const ip = getClientIp(req);
      expect(ip).toBe('203.0.113.50');
    });

    it('falls back to 127.0.0.1 if socket address is missing', () => {
      const req = makeReq({
        socket: {},
      });

      const ip = getClientIp(req);
      expect(ip).toBe('127.0.0.1');
    });

    it('trusts x-vercel-forwarded-for when running in Vercel environment', () => {
      process.env.VERCEL = '1';
      const req = makeReq({
        headers: {
          'x-vercel-forwarded-for': '175.45.176.10, 10.0.0.1',
          'x-forwarded-for': '1.2.3.4',
        },
        socket: { remoteAddress: '127.0.0.1' },
      });

      const ip = getClientIp(req);
      expect(ip).toBe('175.45.176.10');
    });

    it('trusts X-Forwarded-For only when connecting from an allowlisted trusted proxy', () => {
      process.env.TRUSTED_PROXIES = '10.0.0.1, 192.168.1.100';

      // 1. Untrusted socket: X-Forwarded-For is ignored
      const untrustedReq = makeReq({
        headers: { 'x-forwarded-for': '8.8.8.8' },
        socket: { remoteAddress: '203.0.113.99' },
      });
      expect(getClientIp(untrustedReq)).toBe('203.0.113.99');

      // 2. Allowlisted socket: X-Forwarded-For is trusted
      const trustedReq = makeReq({
        headers: { 'x-forwarded-for': '8.8.8.8, 10.0.0.1' },
        socket: { remoteAddress: '10.0.0.1' },
      });
      expect(getClientIp(trustedReq)).toBe('8.8.8.8');
    });
  });

  describe('isRateLimited sliding window', () => {
    it('permits up to 10 requests and blocks the 11th', () => {
      const testIp = '198.51.100.99';

      for (let i = 0; i < 10; i++) {
        expect(isRateLimited(testIp)).toBe(false);
      }

      // 11th request must be rate limited
      expect(isRateLimited(testIp)).toBe(true);
    });

    it('tracks different IPs independently', () => {
      const ipA = '198.51.100.1';
      const ipB = '198.51.100.2';

      for (let i = 0; i < 10; i++) {
        isRateLimited(ipA);
      }
      expect(isRateLimited(ipA)).toBe(true);
      expect(isRateLimited(ipB)).toBe(false);
    });
  });

  describe('Handler anti-enumeration & generic error responses', () => {
    it('returns generic 429 when rate limited without leaking rate limit counters or details', async () => {
      const attackerSocketIp = '198.51.100.88';

      // Exhaust 10 allowed attempts
      for (let i = 0; i < 10; i++) {
        isRateLimited(attackerSocketIp);
      }

      // Attacker attempts to bypass by rotating X-Forwarded-For
      const req = makeReq({
        headers: { 'x-forwarded-for': '11.22.33.44' },
        socket: { remoteAddress: attackerSocketIp },
        body: { query: '7E08E7C0' },
      });
      const res = makeRes();

      await handler(req, res);

      // Must be blocked because socket IP is locked
      expect(res._status).toBe(429);
      expect(res._json).toEqual({
        error: 'Order not found or invalid request',
      });
      // Ensure specific internal details are NOT leaked
      expect(res._json.rateLimited).toBeUndefined();
      expect(res._json.attempts).toBeUndefined();
    });

    it('returns generic error on invalid/too-short input', async () => {
      const req = makeReq({
        body: { query: 'ab' },
        socket: { remoteAddress: '198.51.100.5' },
      });
      const res = makeRes();

      await handler(req, res);

      expect(res._status).toBe(400);
      expect(res._json).toEqual({
        error: 'Order not found or invalid request',
        order: null,
      });
    });

    it('returns generic error when order is not found', async () => {
      currentSupabaseClient = {
        from: () => ({
          select: () => ({
            gte: () => ({
              lte: () => ({
                order: () => ({
                  limit: () => ({
                    maybeSingle: async () => ({ data: null }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      const req = makeReq({
        body: { query: '7E08E7C0' },
        socket: { remoteAddress: '198.51.100.5' },
      });
      const res = makeRes();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(res._json).toEqual({
        success: false,
        error: 'Order not found or invalid request',
        order: null,
      });
    });

    it('returns order data when legitimate order matches', async () => {
      const mockOrder = {
        id: '7e08e7c0-0000-0000-0000-000000000000',
        status: 'processing',
        total_amount: 2500,
        customer_name: 'Ahmed Khan',
      };

      currentSupabaseClient = {
        from: () => ({
          select: () => ({
            gte: () => ({
              lte: () => ({
                order: () => ({
                  limit: () => ({
                    maybeSingle: async () => ({ data: mockOrder }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      const req = makeReq({
        body: { query: '7E08E7C0' },
        socket: { remoteAddress: '198.51.100.5' },
      });
      const res = makeRes();

      await handler(req, res);

      expect(res._status).toBe(200);
      expect(res._json).toEqual({
        success: true,
        order: mockOrder,
      });
    });
  });
});
