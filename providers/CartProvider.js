"use client";
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('cart')) || [];
    }
    return [];
  });

  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferredCurrency') || 'INR';
    }
    return 'INR';
  });

  // Store cart in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Store currency preference
  useEffect(() => {
    localStorage.setItem('preferredCurrency', currency);
  }, [currency]);

  // Calculate total items
  const itemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Calculate total price using useMemo for both currencies
  const totals = useMemo(() => {
    const rupees = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const dollars = cart.reduce((acc, item) => acc + item.priceDollars * item.quantity, 0);
    
    return {
      INR: rupees,
      USD: dollars,
      current: currency === 'INR' ? rupees : dollars
    };
  }, [cart, currency]);

  // Format price based on currency
  const formatPrice = useCallback((price, currencyType = currency) => {
    if (currencyType === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }).format(price);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
      }).format(price);
    }
  }, [currency]);

  // Toggle currency
  const toggleCurrency = useCallback(() => {
    setCurrency(prev => prev === 'INR' ? 'USD' : 'INR');
  }, []);

  // Check if item exists in cart (handles variants)
  const itemExists = useCallback((newItem) => {
    return cart.findIndex(item => {
      // If both have variants, check if variants match
      if (newItem.variant && item.variant) {
        return item.id === newItem.id && item.variant.id === newItem.variant.id;
      }
      // If neither has variants, compare product IDs
      if (!newItem.variant && !item.variant) {
        return item.id === newItem.id;
      }
      // One has variant, other doesn't - they're different
      return false;
    });
  }, [cart]);

  // Add item to cart
  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const existingItemIndex = itemExists(product);

      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const newCart = [...prevCart];
        const item = newCart[existingItemIndex];
        
        // Check if adding would exceed available stock
        const newQuantity = item.quantity + product.quantity;
        if (product.maxStock && newQuantity > product.maxStock) {
          toast.error(`Cannot add more than ${product.maxStock} units of this item`);
          return prevCart;
        }
        
        newCart[existingItemIndex] = {
          ...item,
          quantity: newQuantity
        };
        
        toast.success("Cart updated successfully");
        return newCart;
      } else {
        // New item, add to cart
        toast.success(`${product.title} added to cart`);
        return [...prevCart, { ...product }];
      }
    });
  }, [itemExists]);

  // Remove item from cart
  const removeFromCart = useCallback((index) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      const removedItem = newCart[index];
      
      newCart.splice(index, 1);
      toast.info(`${removedItem.title} removed from cart`);
      
      return newCart;
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((index, newQuantity) => {
    if (newQuantity < 1) return;

    setCart(prevCart => {
      const newCart = [...prevCart];
      const item = newCart[index];
      
      // Check if new quantity exceeds available stock
      if (item.maxStock && newQuantity > item.maxStock) {
        toast.error(`Cannot add more than ${item.maxStock} units of this item`);
        return prevCart;
      }
      
      newCart[index] = {
        ...item,
        quantity: newQuantity
      };
      
      return newCart;
    });
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('cart');
    toast.info("Cart has been cleared");
  }, []);

  const cartContext = {
    cart,
    itemCount,
    totals,
    currency,
    formatPrice,
    toggleCurrency,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={cartContext}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}