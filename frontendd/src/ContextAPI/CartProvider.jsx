import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load cart items and count from localStorage if available
  const storedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const storedCartItemCount = storedCartItems.length;

  const [cartItems, setCartItems] = useState(storedCartItems);
  const [cartItemCount, setCartItemCount] = useState(storedCartItemCount);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    const existingItemIndex = cartItems.findIndex(cartItem =>
      cartItem.productName === item.productName && cartItem.productSize === item.productSize
    );
  
    if (existingItemIndex !== -1) {
      const updatedCartItems = [...cartItems];
      const existingItem = updatedCartItems[existingItemIndex];
      existingItem.productQuantity += 1;
      existingItem.productTotalPrice = existingItem.productQuantity * existingItem.productPrice;
  
      setCartItems(updatedCartItems);
      setCartItemCount(updatedCartItems.length);
    } else {
      const updatedCartItems = [...cartItems, item];
      setCartItems(updatedCartItems);
      setCartItemCount(updatedCartItems.length);
    }
  };
  
  const removeFromCart = (productNameToRemove, productSizeToRemove, productCategoryToRemove) => {
    const updatedCartItems = cartItems.filter(item => {
      if (productCategoryToRemove === 'Caps') {
        return item.productName !== productNameToRemove || item.productCategory !== 'Caps';
      }
      return item.productName !== productNameToRemove || item.productSize !== productSizeToRemove;
    });
  
    setCartItems(updatedCartItems);
    setCartItemCount(updatedCartItems.length);
  };
  

  const updateCartWhenCheckedOutSuccess = () => {
    setCartItems([]);
    setCartItemCount(0);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, cartItemCount, updateCartWhenCheckedOutSuccess }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
