import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from '../CartContext.jsx';

// localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _store: store,
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

/** Renders a component that exposes the cart context via a ref-like object. */
function renderCart(initialStorage = null) {
  if (initialStorage) {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialStorage));
  }

  const ctx = {};
  function Consumer() {
    Object.assign(ctx, useCart());
    return null;
  }
  render(
    <CartProvider>
      <Consumer />
    </CartProvider>
  );
  return ctx;
}

const PRODUCT_A = { id: 'a', name: 'Art Card A4', price: 100 };
const PRODUCT_B = { id: 'b', name: 'Sketch Pad', price: 250 };

beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
});

// ── addToCart ─────────────────────────────────────────────────────────

describe('addToCart', () => {
  it('adds a new item', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 2));
    expect(ctx.cartItems).toHaveLength(1);
    expect(ctx.cartItems[0].id).toBe('a');
    expect(ctx.cartItems[0].quantity).toBe(2);
  });

  it('increments quantity for duplicate item', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 1));
    act(() => ctx.addToCart(PRODUCT_A, 3));
    expect(ctx.cartItems).toHaveLength(1);
    expect(ctx.cartItems[0].quantity).toBe(4);
  });

  it('treats bulk and regular as separate line items', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 1, false));
    act(() => ctx.addToCart(PRODUCT_A, 1, true, { minQty: 10 }));
    expect(ctx.cartItems).toHaveLength(2);
  });

  it('treats installment and regular as separate line items', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 1, false, null, false));
    act(() => ctx.addToCart(PRODUCT_A, 1, false, null, true, '3-month'));
    expect(ctx.cartItems).toHaveLength(2);
  });
});

// ── removeFromCart ────────────────────────────────────────────────────

describe('removeFromCart', () => {
  it('removes exact match by id + bulk + installment', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 1, false));
    act(() => ctx.addToCart(PRODUCT_A, 1, true, { minQty: 10 }));
    act(() => ctx.removeFromCart('a', false));
    expect(ctx.cartItems).toHaveLength(1);
    expect(ctx.cartItems[0].isBulk).toBe(true);
  });

  it('no-ops when id does not exist', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 1));
    act(() => ctx.removeFromCart('nonexistent', false));
    expect(ctx.cartItems).toHaveLength(1);
  });
});

// ── updateQuantity ───────────────────────────────────────────────────

describe('updateQuantity', () => {
  it('updates quantity of matching item', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 1));
    act(() => ctx.updateQuantity('a', false, 5));
    expect(ctx.cartItems[0].quantity).toBe(5);
  });

  it('ignores quantity < 1', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 3));
    act(() => ctx.updateQuantity('a', false, 0));
    expect(ctx.cartItems[0].quantity).toBe(3);
  });
});

// ── clearCart ─────────────────────────────────────────────────────────

describe('clearCart', () => {
  it('empties the cart', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 1));
    act(() => ctx.addToCart(PRODUCT_B, 2));
    act(() => ctx.clearCart());
    expect(ctx.cartItems).toHaveLength(0);
  });
});

// ── cartTotal / cartCount ────────────────────────────────────────────

describe('computed totals', () => {
  it('cartTotal sums price × quantity', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 2));  // 100 × 2 = 200
    act(() => ctx.addToCart(PRODUCT_B, 1));  // 250 × 1 = 250
    expect(ctx.cartTotal).toBe(450);
  });

  it('cartCount sums quantities', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 2));
    act(() => ctx.addToCart(PRODUCT_B, 3));
    expect(ctx.cartCount).toBe(5);
  });
});

// ── localStorage persistence ─────────────────────────────────────────

describe('localStorage', () => {
  it('saves cart on change', () => {
    const ctx = renderCart();
    act(() => ctx.addToCart(PRODUCT_A, 1));
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'paperWebCart',
      expect.any(String)
    );
    const saved = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)[1]);
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('a');
  });

  it('restores cart from localStorage on mount', () => {
    const ctx = renderCart([{ ...PRODUCT_B, quantity: 4, isBulk: false, isInstallment: false }]);
    expect(ctx.cartItems).toHaveLength(1);
    expect(ctx.cartItems[0].name).toBe('Sketch Pad');
    expect(ctx.cartItems[0].quantity).toBe(4);
  });
});
