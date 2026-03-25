"use client";

import React, { createContext, useContext, useMemo } from 'react';
import type { Menu, Category } from '@/lib/types';

// ---------------------------------------------------------------------------
// MenuContext — menu data is now fetched on the SERVER (in layout.tsx) and
// passed down as props. This eliminates the client-side fetch that was
// causing the header to show a loading skeleton on every page navigation.
// ---------------------------------------------------------------------------

interface MenuContextType {
  menu: Menu | null;
  categories: Category[];
  isLoading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

interface MenuProviderProps {
  children: React.ReactNode;
  menu: Menu | null;
  categories: Category[];
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children, menu, categories }) => {
  const value = useMemo(() => ({
    menu,
    categories,
    isLoading: false, // Data is always ready — it came from the server
  }), [menu, categories]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
