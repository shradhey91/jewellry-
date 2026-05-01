

"use client";

import type { CartItem } from '@/lib/types';
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { validateDiscountCode } from '@/app/(main)/cart/actions';

export interface DiscountInfo {
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'created_at'>) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  updateGiftMessage: (productId: string, variantId: string, giftMessage: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  discount: DiscountInfo | null;
  discountAmount: number;
  cartTotal: number;
  isCartReady: boolean;
  applyDiscount: (code: string) => Promise<{ success: boolean; message: string }>;
  removeDiscount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<DiscountInfo | null>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedCart = localStorage.getItem('aparra-cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart.items || []);
        setDiscount(parsedCart.discount || null);
      }
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if(isMounted) {
       const cartToStore = {
          items: cartItems,
          discount: discount,
      };
      localStorage.setItem('aparra-cart', JSON.stringify(cartToStore));
    }
  }, [cartItems, discount, isMounted]);


  const addToCart = useCallback((item: Omit<CartItem, 'created_at'>) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        i => i.product_id === item.product_id && i.variant_id === item.variant_id
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        const existingItem = newItems[existingItemIndex];
        newItems[existingItemIndex] = { 
            ...existingItem, 
            quantity: existingItem.quantity + item.quantity,
            gift_message: item.gift_message ?? existingItem.gift_message
        };
        return newItems;
      } else {
        const newItem: CartItem = {
          ...item,
          created_at: new Date().toISOString()
        };
        return [...prevItems, newItem];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string, variantId: string) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.product_id === productId && item.variant_id === variantId))
    );
  }, []);

  const updateQuantity = useCallback((productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product_id === productId && item.variant_id === variantId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const updateGiftMessage = useCallback((productId: string, variantId: string, giftMessage: string) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product_id === productId && item.variant_id === variantId
          ? { ...item, gift_message: giftMessage || undefined }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setDiscount(null);
  }, []);

  const cartCount = useMemo(() => {
    if (!isMounted) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems, isMounted]);
  
  const cartSubtotal = useMemo(() => {
    if (!isMounted) return 0;
    return cartItems.reduce((total, item) => total + item.price_snapshot.total * item.quantity, 0);
  }, [cartItems, isMounted]);

  const discountAmount = useMemo(() => {
      if (!discount || !isMounted) return 0;
      if (discount.type === 'fixed_amount') {
          return discount.value;
      }
      if (discount.type === 'percentage') {
          return cartSubtotal * (discount.value / 100);
      }
      return 0;
  }, [discount, cartSubtotal, isMounted]);

  const cartTotal = useMemo(() => {
      const total = cartSubtotal - discountAmount;
      return total > 0 ? total : 0;
  }, [cartSubtotal, discountAmount]);

  const applyDiscount = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    const result = await validateDiscountCode(code, cartSubtotal);
    if (result.success && result.discount) {
      setDiscount({
        code: result.discount.code,
        type: result.discount.type,
        value: result.discount.value
      });
    } else {
      setDiscount(null);
    }
    return { success: result.success, message: result.message };
  }, [cartSubtotal]);

  const removeDiscount = useCallback(() => {
    setDiscount(null);
  }, []);


  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateGiftMessage,
    clearCart,
    cartCount,
    cartSubtotal,
    discount,
    discountAmount,
    cartTotal,
    isCartReady: isMounted,
    applyDiscount,
    removeDiscount,
  }), [cartItems, addToCart, removeFromCart, updateQuantity, updateGiftMessage, clearCart, cartCount, cartSubtotal, discount, discountAmount, cartTotal, isMounted, applyDiscount, removeDiscount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
