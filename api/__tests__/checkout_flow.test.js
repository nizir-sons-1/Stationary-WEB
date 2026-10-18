import { describe, it, expect } from 'vitest';
import { validateCheckoutInput, getShippingFeeText } from '../../src/lib/orderCheckout.js';
import { validateAndBuildOrderPayload } from '../checkout.js';

describe('Checkout Address, Pricing & Variation Matching', () => {
  const dummyItem = {
    id: '2a0d5b5e-a51b-43b8-bb87-98f9020ceb7f', // Night Star variation UUID
    productId: '2852acb1-065a-4370-ac35-f8b8ed837d1f',
    name: 'Night Star',
    price: 4441.94,
    size: '25x36',
    gsm: '300',
    quantity: 1,
  };

  describe('Address Visibility & Validation', () => {
    it('allows empty address for Goods Transport (Adda)', () => {
      const res = validateCheckoutInput({
        checkoutPhase: 'checkout',
        fullName: 'Muhammad Ali',
        phone: '03001234567',
        address: '',
        isB2B: false,
        shippingMethod: 'delivery_open',
      });
      expect(res.valid).toBe(true);
    });

    it('allows empty address for Self Pickup', () => {
      const res = validateCheckoutInput({
        checkoutPhase: 'checkout',
        fullName: 'Muhammad Ali',
        phone: '03001234567',
        address: '',
        isB2B: false,
        shippingMethod: 'self_pickup',
      });
      expect(res.valid).toBe(true);
    });

    it('rejects empty address for Standard Delivery (Courier / COD)', () => {
      const res = validateCheckoutInput({
        checkoutPhase: 'checkout',
        fullName: 'Muhammad Ali',
        phone: '03001234567',
        address: '',
        isB2B: false,
        shippingMethod: 'standard_delivery',
      });
      expect(res.valid).toBe(false);
      expect(res.message).toContain('Please enter your delivery address');
    });

    it('accepts filled address for Standard Delivery', () => {
      const res = validateCheckoutInput({
        checkoutPhase: 'checkout',
        fullName: 'Muhammad Ali',
        phone: '03001234567',
        address: '123 Main Road, Lahore',
        isB2B: false,
        shippingMethod: 'standard_delivery',
      });
      expect(res.valid).toBe(true);
    });
  });

  describe('Shipping Fee Display', () => {
    it('returns FREE for self_pickup', () => {
      expect(getShippingFeeText('self_pickup')).toBe('FREE');
    });

    it('returns Rs 350 for delivery_open (Adda)', () => {
      expect(getShippingFeeText('delivery_open')).toBe('Rs 350');
    });

    it('returns Rs 350 for standard_delivery when threshold not met', () => {
      expect(getShippingFeeText('standard_delivery', null, 1000)).toBe('Rs 350');
    });
  });

  describe('Server-side Verification & Total Calculation', () => {
    const mockSupabase = {
      from: (table) => {
        if (table === 'product_variations') {
          return {
            select: () => ({
              eq: (col, val) => ({
                maybeSingle: async () => {
                  if (col === 'id' && val === dummyItem.id) {
                    return {
                      data: {
                        id: dummyItem.id,
                        price: 4441.94,
                        stock: 50,
                        size: '25x36',
                        gsm: '300',
                        product_id: dummyItem.productId,
                      },
                      error: null,
                    };
                  }
                  return { data: null, error: null };
                },
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
                    standard_delivery_fee: 350,
                    goods_transport_min_fee: 350,
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
              eq: () => ({
                eq: () => ({
                  gte: () => ({
                    order: () => ({
                      limit: async () => ({ data: [], error: null }),
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      },
    };

    it('verifies Popular Picks item by ID without price mismatch and adds Rs 350 for Adda', async () => {
      const payload = {
        cartItems: [dummyItem],
        fullName: 'Ali Raza',
        phone: '03001234567',
        address: '',
        shippingMethod: 'delivery_open',
        paymentMethod: 'online',
        isB2B: false,
        idempotencyKey: 'idem_test_1',
      };

      const result = await validateAndBuildOrderPayload(payload, mockSupabase);
      expect(result.valid).toBe(true);
      expect(result.finalTotal).toBe(4441.94 + 350);
      expect(result.orderPayload.shipping_method).toContain('Goods Transport');
    });

    it('verifies Popular Picks item for Self Pickup with Rs 0 fee', async () => {
      const payload = {
        cartItems: [dummyItem],
        fullName: 'Ali Raza',
        phone: '03001234567',
        address: '',
        shippingMethod: 'self_pickup',
        paymentMethod: 'shop',
        isB2B: false,
        idempotencyKey: 'idem_test_2',
      };

      const result = await validateAndBuildOrderPayload(payload, mockSupabase);
      expect(result.valid).toBe(true);
      expect(result.finalTotal).toBe(4441.94);
      expect(result.orderPayload.shipping_method).toContain('Self Pickup (FREE)');
    });

    it('verifies Standard Delivery with Rs 350 fee', async () => {
      const payload = {
        cartItems: [dummyItem],
        fullName: 'Ali Raza',
        phone: '03001234567',
        address: 'Model Town, Lahore',
        shippingMethod: 'standard_delivery',
        paymentMethod: 'cod',
        isB2B: false,
        idempotencyKey: 'idem_test_3',
      };

      const result = await validateAndBuildOrderPayload(payload, mockSupabase);
      expect(result.valid).toBe(true);
      expect(result.finalTotal).toBe(4441.94 + 350);
      expect(result.orderPayload.shipping_method).toContain('Standard Delivery');
    });
  });
});
