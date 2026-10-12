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

async function loadHandler() {
  vi.resetModules();
  const mod = await import('../send-order-email.js');
  return mod.default;
}

beforeEach(() => {
  vi.restoreAllMocks();
  delete process.env.RESEND_API_KEY;
});

const VALID_ORDER = {
  customer_name: 'Ali',
  customer_email: 'ali@example.com',
  order_id: 'ORD-001',
  shipping_method: 'Standard',
  payment_method: 'Cash',
  total_amount: 5000,
};

// ── Method check ─────────────────────────────────────────────────────

describe('send-order-email handler', () => {
  it('rejects non-POST with 405', async () => {
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ method: 'GET' }), res);
    expect(res._status).toBe(405);
  });

  // ── Validation ───────────────────────────────────────────────────

  it('rejects missing orderDetails with 400', async () => {
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ body: {} }), res);
    expect(res._status).toBe(400);
  });

  it('rejects missing customer_email with 400', async () => {
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ body: { orderDetails: { customer_name: 'Ali' } } }), res);
    expect(res._status).toBe(400);
  });

  // ── Config check ─────────────────────────────────────────────────

  it('returns 500 when RESEND_API_KEY is missing', async () => {
    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ body: { orderDetails: VALID_ORDER } }), res);
    expect(res._status).toBe(500);
  });

  // ── Successful send ──────────────────────────────────────────────

  it('sends email and returns 200 on success', async () => {
    process.env.RESEND_API_KEY = 'test-key';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'email-456' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const handler = await loadHandler();
    const res = makeRes();
    await handler(makeReq({ body: { orderDetails: VALID_ORDER } }), res);

    expect(res._status).toBe(200);
    expect(res._json.success).toBe(true);
    expect(res._json.id).toBe('email-456');

    // Verify Resend call
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' })
    );

    // Verify email content includes order ID
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.to).toBe('ali@example.com');
    expect(body.subject).toContain('ORD-001');
  });
});
