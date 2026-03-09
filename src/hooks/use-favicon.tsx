
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const FAVICON_STORAGE_KEY = 'aparra-favicon-url';

interface FaviconContextType {
  currentFaviconUrl: string | null;
  setFaviconUrl: (url: string) => void;
  removeFavicon: () => void;
}

const FaviconContext = createContext<FaviconContextType | undefined>(undefined);

export const FaviconProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFaviconUrl, _setCurrentFaviconUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedFavicon = localStorage.getItem(FAVICON_STORAGE_KEY);
      if (storedFavicon) {
        _setCurrentFaviconUrl(storedFavicon);
      }
    } catch (error) {
      console.error("Failed to read favicon from localStorage", error);
    }
  }, []);

  const persistFavicon = (url: string | null) => {
    try {
      if (url) {
        localStorage.setItem(FAVICON_STORAGE_KEY, url);
      } else {
        localStorage.removeItem(FAVICON_STORAGE_KEY);
      }
      window.dispatchEvent(new StorageEvent('storage', {
          key: FAVICON_STORAGE_KEY,
          newValue: url,
      }));
    } catch (error) {
      console.error("Failed to write favicon to localStorage", error);
    }
  };

  const setFaviconUrl = useCallback((url: string) => {
    _setCurrentFaviconUrl(url);
    persistFavicon(url);
  }, []);

  const removeFavicon = useCallback(() => {
    _setCurrentFaviconUrl(null);
    persistFavicon(null);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === FAVICON_STORAGE_KEY) {
        _setCurrentFaviconUrl(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isMounted]);

  const value = useMemo(() => ({
    currentFaviconUrl,
    setFaviconUrl,
    removeFavicon,
  }), [currentFaviconUrl, setFaviconUrl, removeFavicon]);

  return (
    <FaviconContext.Provider value={value}>
      {children}
    </FaviconContext.Provider>
  );
};

export const useFavicon = () => {
  const context = useContext(FaviconContext);
  if (context === undefined) {
    throw new Error('useFavicon must be used within a FaviconProvider');
  }
  return context;
};
