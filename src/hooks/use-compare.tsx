
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const MAX_COMPARE_ITEMS = 4;

interface CompareContextType {
  compareItems: string[]; // array of product IDs
  addToCompare: (productId: string) => { success: boolean; message: string };
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  compareCount: number;
  isCompareReady: boolean;
  isCompareFull: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [compareItems, setCompareItems] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedCompare = localStorage.getItem('aparra-compare');
      if (storedCompare) {
        setCompareItems(JSON.parse(storedCompare));
      }
    } catch (error) {
      console.error("Failed to parse compare items from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('aparra-compare', JSON.stringify(compareItems));
    }
  }, [compareItems, isMounted]);

  const addToCompare = useCallback((productId: string): { success: boolean; message: string } => {
    if (compareItems.includes(productId)) {
      return { success: false, message: "This item is already in your compare list." };
    }
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      return { success: false, message: `You can only compare up to ${MAX_COMPARE_ITEMS} items.` };
    }
    setCompareItems(prev => [...prev, productId]);
    return { success: true, message: "Product added to comparison." };
  }, [compareItems]);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareItems(prev => prev.filter(id => id !== productId));
  }, []);
  
  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const isInCompare = useCallback((productId: string) => {
    return compareItems.includes(productId);
  }, [compareItems]);

  const compareCount = useMemo(() => {
    if (!isMounted) return 0;
    return compareItems.length;
  }, [compareItems, isMounted]);
  
  const isCompareFull = useMemo(() => {
      return compareItems.length >= MAX_COMPARE_ITEMS;
  }, [compareItems]);

  const value = useMemo(() => ({
    compareItems,
    addToCompare,
    removeFromCompare,
    isInCompare,
    clearCompare,
    compareCount,
    isCompareFull,
    isCompareReady: isMounted,
  }), [compareItems, addToCompare, removeFromCompare, isInCompare, clearCompare, compareCount, isCompareFull, isMounted]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
