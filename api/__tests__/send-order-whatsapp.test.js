import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler, { formatPhoneNumber, buildCustomerMessage, buildAdminMessage } from '../send-order-whatsapp.js';

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

const SAMPLE_ORDER = {
  order_id: 'ORD-78901',
  customer_name: 'Ahmed Khan',
  customer_phone: '03001234567',
  customer_address: 'Main Market, Gulberg, Lahore',
  shipping_method: 'Standard Delivery (Rs 200)',
  payment_method: 'Cash on Delivery (COD)',
  total_amount: 3200,
  items: [
    { name: 'Art Paper', size: '23x36', gsm: '130', quantity: 2, price: 1500, packingType: 'Ream' }
  ]
};

describe('formatPhoneNumber', () => {
  it('formats local 03xx numbers to 923xx', () => {
    expect(formatPhoneNumber('0320-2220001')).toBe('923202220001');
    expect(formatPhoneNumber('0300 1234567')).toBe('923001234567');
  });

  it('preserves existing 92 numbers', () => {
    expect(formatPhoneNumber('+923202220001')).toBe('923202220001');
    expect(formatPhoneNumber('00923202220001')).toBe('923202220001');
  });

  it('handles empty strings gracefully', () => {
    expect(formatPhoneNumber('')).toBe('');
  });
});

describe('Message builders', () => {
  it('buildCustomerMessage includes order id and items', () => {
    const msg = buildCustomerMessage(SAMPLE_ORDER);
    expect(msg).toContain('ORD-78901');
    expect(msg).toContain('Ahmed Khan');
    expect(msg).toContain('Art Paper');
    expect(msg).toContain('3,200');
  });

  it('buildAdminMessage includes customer phone and order details', () => {
    const msg = buildAdminMessage(SAMPLE_ORDER);
    expect(msg).toContain('ORD-78901');
    expect(msg).toContain('03001234567');
    expect(msg).toContain('Art Paper');
  });
});

describe('send-order-whatsapp handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.ULTRAMSG_INSTANCE_ID;
    delete process.env.ULTRAMSG_TOKEN;
    delete process.env.WHATSAPP_CLOUD_API_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  });

  it('rejects non-POST with 405', async () => {
    const res = makeRes();
    await handler(makeReq({ method: 'GET' }), res);
    expect(res._status).toBe(405);
  });

  it('rejects missing phone or orderDetails with 400', async () => {
    const res = makeRes();
    await handler(makeReq({ body: { orderDetails: { customer_name: 'Test' } } }), res);
    expect(res._status).toBe(400);
  });

  it('operates in simulation mode when API keys are not yet configured', async () => {
    const res = makeRes();
    await handler(makeReq({ body: { orderDetails: SAMPLE_ORDER } }), res);
    expect(res._status).toBe(200);
    expect(res._json.success).toBe(true);
    expect(res._json.customer.simulated).toBe(true);
    expect(res._json.admin.simulated).toBe(true);
  });

  it('calls UltraMsg endpoint when ULTRAMSG keys are present', async () => {
    process.env.ULTRAMSG_INSTANCE_ID = 'instance999';
    process.env.ULTRAMSG_TOKEN = 'token123';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sent: true, id: 'msg-1' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = makeRes();
    await handler(makeReq({ body: { orderDetails: SAMPLE_ORDER } }), res);

    expect(res._status).toBe(200);
    expect(mockFetch).toHaveBeenCalled();
    expect(mockFetch.mock.calls[0][0]).toContain('https://api.ultramsg.com/instance999/messages/chat');
  });
});
