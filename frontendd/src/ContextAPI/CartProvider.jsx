import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);

  const addToCart = (item) => {
    setCartItems([...cartItems, item]);
    setCartItemCount(cartItemCount + 1);
  };

  const removeFromCart = (productNameToRemove, productSizeToRemove) => {
    const updatedCartItems = cartItems.filter(item => {
      return item.productName !== productNameToRemove || item.productSize !== productSizeToRemove;
    });
    setCartItems(updatedCartItems);
    setCartItemCount(cartItemCount - 1);
  };

  const updateCartWhenCheckedOutSuccess = () => {
    setCartItemCount(0);
  }

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, cartItemCount, updateCartWhenCheckedOutSuccess }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);