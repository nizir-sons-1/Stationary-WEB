import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Helpers ──────────────────────────────────────────────────────────

function makeReq(overrides = {}) {
  return { method: 'POST', body: {}, ...overrides };
}

function makeRes() {
  const res = {
    _status: null,
    _json: null,
    status(code) { res._status = code; return res; },
    json(data) { res._json = data; return res; },
  };
  return res;
}

// We need to dynamically import the handler because it reads process.env
// and we need to control that per-test.

async function loadHandler() {
  // Clear module cache so each test gets a fresh import
  vi.resetModules();
  const mod = await import('../subscribe.js');
  return mod.default;
}

beforeEach(() => {
  vi.restoreAllMocks();
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM_EMAIL;
});

// ── Method check ─────────────────────────────────────────────────────

describe('subscribe handler', () => {
  it('rejects non-POST with 405', async () => {
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ method: 'GET' }), res);
    expect(res._status).toBe(405);
  });

  // ── Validation ───────────────────────────────────────────────────

  it('rejects missing email with 400', async () => {
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ body: {} }), res);
    expect(res._status).toBe(400);
  });

  it('rejects invalid email with 400', async () => {
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ body: { email: 'not-an-email' } }), res);
    expect(res._status).toBe(400);
  });

  // ── Config check ─────────────────────────────────────────────────

  it('returns 500 when RESEND_API_KEY is missing', async () => {
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ body: { email: 'test@example.com' } }), res);
    expect(res._status).toBe(500);
    expect(res._json.error).toContain('not configured');
  });

  // ── Successful send ──────────────────────────────────────────────

  it('calls Resend API and returns 200 on success', async () => {
    process.env.RESEND_API_KEY = 'test-key';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'email-123' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ body: { email: 'user@example.com' } }), res);

    expect(res._status).toBe(200);
    expect(res._json.success).toBe(true);

    // Verify Resend was called with correct URL
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
