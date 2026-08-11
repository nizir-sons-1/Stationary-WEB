import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load from local storage if available
    const saved = localStorage.getItem('paperWebCart');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to local storage whenever cart changes
  useEffect(() => {
    localStorage.setItem('paperWebCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1, isBulk = false, bulkDetails = null, isInstallment = false, installmentPlan = null) => {
    setCartItems(prev => {
      // Check if item already exists with exact same bulk/installment status
      const existingItemIndex = prev.findIndex(item =>
        item.id === product.id &&
        !!item.isBulk === !!isBulk &&
        !!item.isInstallment === !!isInstallment &&
        (item.installmentPlan || null) === (installmentPlan || null)
      );

      if (existingItemIndex >= 0) {
        // Replace the matched item rather than mutating it in place: the old
        // version bumped `quantity` on the existing object, so React saw the
        // same reference and any memoised consumer could miss the update.
        return prev.map((item, i) =>
          i === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      return [...prev, { ...product, quantity, isBulk, bulkDetails, isInstallment, installmentPlan }];
    });
  }, []);

  const removeFromCart = useCallback((productId, isBulk, isInstallment = false, installmentPlan = null) => {
    setCartItems(prev => prev.filter(item => !(
      item.id === productId &&
      !!item.isBulk === !!isBulk &&
      !!item.isInstallment === !!isInstallment &&
      (item.installmentPlan || null) === (installmentPlan || null)
    )));
  }, []);

  const updateQuantity = useCallback((productId, isBulk, newQuantity, isInstallment = false, installmentPlan = null) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item =>
      (item.id === productId && !!item.isBulk === !!isBulk && !!item.isInstallment === !!isInstallment && (item.installmentPlan || null) === (installmentPlan || null))
        ? { ...item, quantity: newQuantity }
        : item
    ));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  // Memoised so the context value keeps a stable identity between renders —
  // otherwise every product card in the shop grid re-rendered on any cart change.
  const value = useMemo(() => {
    let cartTotal = 0;
    let cartCount = 0;
    for (const item of cartItems) {
      cartTotal += item.price * item.quantity;
      cartCount += item.quantity;
    }
    return { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount };
  }, [cartItems, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
