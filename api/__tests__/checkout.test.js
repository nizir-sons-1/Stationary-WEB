import { describe, it, expect, vi, beforeEach } from 'vitest';

let currentSupabaseClient = null;

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => currentSupabaseClient),
}));

import handler, {
  checkDuplicateOrder,
  buildVerifiedOrderRecord,
} from '../checkout.js';

// ── Helpers ──────────────────────────────────────────────────────────

function makeReq(overrides = {}) {
  return {
    method: 'POST',
    headers: {},
    body: {},
    ...overrides,
  };
}

function makeRes() {
  const res = {
    _status: null,
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

describe('Checkout Idempotency & Duplicate Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSupabaseClient = null;
  });

  describe('buildVerifiedOrderRecord', () => {
    it('persists idempotencyKey in idempotency_key column', () => {
      const record = buildVerifiedOrderRecord({
        fullName: 'Ali Khan',
        cleanPhone: '03001234567',
        email: 'ali@example.com',
        address: 'Lahore',
        shippingMethod: 'standard_delivery',
        paymentMethod: 'cod',
        isB2B: false,
        finalTotal: 1500,
        verifiedItems: [{ name: 'Paper A4', quantity: 1, price: 1300 }],
        idempotencyKey: 'idem_test_abc123',
      });

      expect(record.idempotency_key).toBe('idem_test_abc123');
      expect(record.customer_name).toBe('Ali Khan');
      expect(record.customer_phone).toBe('03001234567');
      expect(record.total_amount).toBe(1500);
    });

    it('sets idempotency_key to null if not provided', () => {
      const record = buildVerifiedOrderRecord({
        fullName: 'Ali Khan',
        cleanPhone: '03001234567',
        email: null,
        address: 'Lahore',
        shippingMethod: 'self_pickup',
        paymentMethod: 'shop',
        isB2B: false,
        finalTotal: 1000,
        verifiedItems: [],
      });

      expect(record.idempotency_key).toBeNull();
    });
  });

  describe('checkDuplicateOrder', () => {
    it('returns null if idempotencyKey is missing', async () => {
      const mockSupabase = {
        from: vi.fn(),
      };
      const result = await checkDuplicateOrder(mockSupabase, '03001234567', null);
      expect(result).toBeNull();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('queries orders by customer_phone and idempotency_key within time window', async () => {
      const existingOrder = {
        id: 'ord_12345678_uuid',
        created_at: new Date().toISOString(),
        customer_phone: '03001234567',
        customer_name: 'Ali Khan',
        total_amount: 1500,
        idempotency_key: 'idem_key_999',
        status: 'pending',
      };

      const limitMock = vi.fn().mockResolvedValue({
        data: [existingOrder],
        error: null,
      });
      const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
      const gteMock = vi.fn().mockReturnValue({ order: orderMock });
      const eqIdemMock = vi.fn().mockReturnValue({ gte: gteMock });
      const eqPhoneMock = vi.fn().mockReturnValue({ eq: eqIdemMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqPhoneMock });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: selectMock,
        }),
      };

      const result = await checkDuplicateOrder(
        mockSupabase,
        '03001234567',
        'idem_key_999'
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(eqPhoneMock).toHaveBeenCalledWith('customer_phone', '03001234567');
      expect(eqIdemMock).toHaveBeenCalledWith('idempotency_key', 'idem_key_999');

      expect(result).not.toBeNull();
      expect(result.isDuplicate).toBe(true);
      expect(result.orderId).toBe('ORD_1234');
      expect(result.order).toEqual(existingOrder);
    });

    it('returns null if no matching order is found', async () => {
      const limitMock = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });
      const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
      const gteMock = vi.fn().mockReturnValue({ order: orderMock });
      const eqIdemMock = vi.fn().mockReturnValue({ gte: gteMock });
      const eqPhoneMock = vi.fn().mockReturnValue({ eq: eqIdemMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqPhoneMock });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: selectMock,
        }),
      };

      const result = await checkDuplicateOrder(
        mockSupabase,
        '03001234567',
        'idem_new_key'
      );

      expect(result).toBeNull();
    });
  });

  describe('API handler end-to-end duplicate prevention', () => {
    it('1st request creates new order (201), 2nd request with same idempotency key returns existing order (200)', async () => {
      const ordersDb = [];

      currentSupabaseClient = {
        from: (table) => {
          if (table === 'product_variations') {
            return {
              select: () => ({
                ilike: () => ({
                  ilike: () => ({
                    limit: async () => ({
                      data: [{ id: 'var_1', price: 500, stock: 50, size: 'A4' }],
                    }),
                  }),
                  limit: async () => ({
                    data: [{ id: 'var_1', price: 500, stock: 50, size: 'A4' }],
                  }),
                }),
              }),
            };
          }

          if (table === 'store_settings') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      standard_delivery_fee: 200,
                      goods_transport_min_fee: 350,
                      free_shipping_threshold: 5000,
                      is_free_shipping_enabled: true,
                    },
                  }),
                }),
              }),
            };
          }

          if (table === 'orders') {
            return {
              select: () => ({
                eq: (col1, val1) => ({
                  eq: (col2, val2) => ({
                    gte: () => ({
                      order: () => ({
                        limit: async () => {
                          const matched = ordersDb.filter(
                            (o) => o[col1] === val1 && o[col2] === val2
                          );
                          return { data: matched, error: null };
                        },
                      }),
                    }),
                  }),
                }),
              }),
              insert: (payload) => ({
                select: () => ({
                  single: async () => {
                    if (
                      payload.idempotency_key &&
                      ordersDb.some(
                        (o) =>
                          o.customer_phone === payload.customer_phone &&
                          o.idempotency_key === payload.idempotency_key
                      )
                    ) {
                      return {
                        data: null,
                        error: {
                          code: '23505',
                          message:
                            'duplicate key value violates unique constraint "idx_orders_customer_phone_idempotency_key"',
                        },
                      };
                    }

                    const newOrder = {
                      ...payload,
                      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                      created_at: new Date().toISOString(),
                    };
                    ordersDb.push(newOrder);
                    return { data: newOrder, error: null };
                  },
                }),
              }),
            };
          }

          return {};
        },
      };

      const requestPayload = {
        fullName: 'Zain Ul Abideen',
        phone: '03001234567',
        email: 'zain@example.com',
        address: 'Urdu Bazar, Lahore',
        shippingMethod: 'standard_delivery',
        paymentMethod: 'cod',
        cartItems: [
          {
            name: 'A4 Offset Paper',
            size: 'A4',
            quantity: 2,
            price: 500,
          },
        ],
      };
      const idempotencyKey = 'idem_req_unique_001';

      // ── FIRST SUBMISSION ───────────────────────────────────────────
      const req1 = makeReq({
        headers: { 'x-idempotency-key': idempotencyKey },
        body: requestPayload,
      });
      const res1 = makeRes();

      await handler(req1, res1);

      expect(res1._status).toBe(201);
      expect(res1._json.success).toBe(true);
      expect(res1._json.orderId).toBe('A1B2C3D4');
      expect(res1._json.order.idempotency_key).toBe(idempotencyKey);
      expect(ordersDb.length).toBe(1);

      // ── SECOND SUBMISSION (Same Cart + Same Idempotency Key) ────────
      const req2 = makeReq({
        headers: { 'x-idempotency-key': idempotencyKey },
        body: requestPayload,
      });
      const res2 = makeRes();

      await handler(req2, res2);

      // Must NOT create a second order, and must return 200 with existing order
      expect(res2._status).toBe(200);
      expect(res2._json.success).toBe(true);
      expect(res2._json.isDuplicate).toBe(true);
      expect(res2._json.orderId).toBe('A1B2C3D4');
      expect(res2._json.order.id).toBe(res1._json.order.id);
      expect(ordersDb.length).toBe(1); // Exactly 1 order created in DB!
    });

    it('Defense-in-depth: handles race condition when 2 concurrent requests hit DB constraint', async () => {
      const existingOrder = {
        id: '99887766-aaaa-bbbb-cccc-ddddeeeeffff',
        created_at: new Date().toISOString(),
        customer_phone: '03001234567',
        customer_name: 'Zain Ul Abideen',
        total_amount: 1200,
        idempotency_key: 'idem_race_001',
      };

      currentSupabaseClient = {
        from: (table) => {
          if (table === 'product_variations') {
            return {
              select: () => ({
                ilike: () => ({
                  ilike: () => ({
                    limit: async () => ({
                      data: [{ id: 'var_1', price: 500, stock: 50, size: 'A4' }],
                    }),
                  }),
                  limit: async () => ({
                    data: [{ id: 'var_1', price: 500, stock: 50, size: 'A4' }],
                  }),
                }),
              }),
            };
          }
          if (table === 'store_settings') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: {
                      standard_delivery_fee: 200,
                      free_shipping_threshold: 5000,
                      is_free_shipping_enabled: false,
                    },
                  }),
                }),
              }),
            };
          }
          if (table === 'orders') {
            return {
              select: () => ({
                // When checkDuplicateOrder runs initially, simulate that it didn't find the order yet (race condition)
                eq: (col1, val1) => ({
                  eq: (col2, val2) => ({
                    gte: () => ({
                      order: () => ({
                        limit: async () => ({ data: [], error: null }),
                      }),
                    }),
                    order: () => ({
                      limit: () => ({
                        // Fallback query after 23505
                        maybeSingle: async () => ({ data: existingOrder, error: null }),
                      }),
                    }),
                  }),
                }),
              }),
              insert: () => ({
                select: () => ({
                  single: async () => ({
                    data: null,
                    error: {
                      code: '23505',
                      message: 'duplicate key value violates unique constraint',
                    },
                  }),
                }),
              }),
            };
          }
          return {};
        },
      };

      const req = makeReq({
        headers: { 'x-idempotency-key': 'idem_race_001' },
        body: {
          fullName: 'Zain Ul Abideen',
          phone: '03001234567',
          shippingMethod: 'standard_delivery',
          paymentMethod: 'cod',
          cartItems: [{ name: 'A4 Offset Paper', size: 'A4', quantity: 2, price: 500 }],
        },
      });
      const res = makeRes();

      await handler(req, res);

      // Should return 200 and the existing order without throwing 500
      expect(res._status).toBe(200);
      expect(res._json.isDuplicate).toBe(true);
      expect(res._json.orderId).toBe('99887766');
      expect(res._json.order).toEqual(existingOrder);
    });
  });
});
