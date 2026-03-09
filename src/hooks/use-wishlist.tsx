
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

interface WishlistContextType {
  wishlist: string[]; // array of product IDs
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  isWishlistReady: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [isMounted, setIsMounted] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedWishlist = localStorage.getItem('aparra-wishlist');
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
        console.error("Failed to parse wishlist from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('aparra-wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isMounted]);

  const addToWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.filter(id => id !== productId));
  }, []);
  
  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const wishlistCount = useMemo(() => {
    if (!isMounted) return 0;
    return wishlist.length;
  }, [wishlist, isMounted]);

  const value = useMemo(() => ({
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistCount,
    isWishlistReady: isMounted,
  }), [wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount, isMounted]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
