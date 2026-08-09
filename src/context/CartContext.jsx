import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const addToCart = (product, quantity = 1, isBulk = false, bulkDetails = null) => {
    setCartItems(prev => {
      // Check if item already exists with exact same bulk status
      const existingItemIndex = prev.findIndex(item => item.id === product.id && item.isBulk === isBulk);
      
      if (existingItemIndex >= 0) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }
      
      return [...prev, { ...product, quantity, isBulk, bulkDetails }];
    });
  };

  const removeFromCart = (productId, isBulk) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.isBulk === isBulk)));
  };

  const updateQuantity = (productId, isBulk, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map(item => 
      (item.id === productId && item.isBulk === isBulk) 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
