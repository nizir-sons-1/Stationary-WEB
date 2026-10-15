import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler, {
  formatPhoneNumber,
  buildCustomerMessage,
  buildAdminMessage,
  cleanWa,
  enforceMessageLimit,
  validateOrderDetails,
  stripHtml
} from '../send-order-whatsapp.js';

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

describe('cleanWa sanitization and normalization', () => {
  it('strips HTML, style, and script blocks using linear non-regex parser', () => {
    const dirty = '<script>alert("hack")</script><style>.hidden{display:none}</style><b>Order #123</b> <p>Details</p>';
    expect(stripHtml(dirty)).toBe('Order #123 Details');
  });

  it('strips script blocks and remaining HTML tags in cleanWa', () => {
    const dirty = '<script>alert("hack")</script><b>Special Offer</b> <p>Details</p>';
    expect(cleanWa(dirty)).toBe('Special Offer Details');
  });

  it('strips WhatsApp markdown formatting characters (*, _, ~, `)', () => {
    const dirty = '*bold* _italic_ ~strike~ `code`';
    expect(cleanWa(dirty)).toBe('bold italic strike code');
  });

  it('normalizes CRLF and collapses triple+ newlines to double newlines', () => {
    const dirty = 'Line 1\r\n\r\n\r\n\r\nLine 2\r\n\r\nLine 3';
    expect(cleanWa(dirty)).toBe('Line 1\n\nLine 2\n\nLine 3');
  });

  it('collapses multiple horizontal spaces into single space', () => {
    const dirty = 'Nazir   and     Sons    Paper';
    expect(cleanWa(dirty)).toBe('Nazir and Sons Paper');
  });
});

describe('enforceMessageLimit', () => {
  it('preserves messages under 4096 characters', () => {
    const msg = 'Order confirmed for Nazir & Sons';
    expect(enforceMessageLimit(msg)).toBe(msg);
  });

  it('truncates messages exceeding 4096 characters to fit WhatsApp limit', () => {
    const huge = 'A'.repeat(5000);
    const result = enforceMessageLimit(huge);
    expect(result.length).toBeLessThanOrEqual(4096);
    expect(result).toContain('... [truncated]');
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

  it('rejects oversized bulkDetails (e.g. 5KB payload) with 400 error', async () => {
    const res = makeRes();
    const oversizedBulk = 'X'.repeat(5120); // 5KB payload
    await handler(
      makeReq({
        body: {
          orderDetails: {
            ...SAMPLE_ORDER,
            bulkDetails: oversizedBulk
          }
        }
      }),
      res
    );
    expect(res._status).toBe(400);
    expect(res._json.error).toBe('Field too long: bulkDetails exceeds 2000 characters');
  });

  it('rejects oversized customer_name (>100 chars) with 400 error', async () => {
    const res = makeRes();
    await handler(
      makeReq({
        body: {
          orderDetails: {
            ...SAMPLE_ORDER,
            customer_name: 'A'.repeat(101)
          }
        }
      }),
      res
    );
    expect(res._status).toBe(400);
    expect(res._json.error).toBe('Field too long: customer_name exceeds 100 characters');
  });

  it('rejects oversized customer_address (>500 chars) with 400 error', async () => {
    const res = makeRes();
    await handler(
      makeReq({
        body: {
          orderDetails: {
            ...SAMPLE_ORDER,
            customer_address: 'B'.repeat(501)
          }
        }
      }),
      res
    );
    expect(res._status).toBe(400);
    expect(res._json.error).toBe('Field too long: customer_address exceeds 500 characters');
  });

  it('rejects too many items (>50 items) with 400 error', async () => {
    const res = makeRes();
    const tooManyItems = Array.from({ length: 51 }, (_, i) => ({
      name: `Item ${i + 1}`,
      price: 100,
      quantity: 1
    }));
    await handler(
      makeReq({
        body: {
          orderDetails: {
            ...SAMPLE_ORDER,
            items: tooManyItems
          }
        }
      }),
      res
    );
    expect(res._status).toBe(400);
    expect(res._json.error).toBe('Too many items: maximum 50 items allowed per order');
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

