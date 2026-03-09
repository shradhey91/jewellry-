

"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Menu, Category } from '@/lib/types';
import { getMenuById, getCategories } from "@/lib/server/api";

interface MenuContextType {
  menu: Menu | null;
  categories: Category[];
  isLoading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [headerMenu, allCategories] = await Promise.all([
            getMenuById("menu-1"),
            getCategories()
        ]);
        setMenu(headerMenu || null);
        setCategories(allCategories);
      } catch (error) {
        console.error("Failed to fetch menu data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const value = useMemo(() => ({
    menu,
    categories,
    isLoading,
  }), [menu, categories, isLoading]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};


    