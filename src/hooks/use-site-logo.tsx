
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const LOGO_STORAGE_KEY = 'aparra-site-logo-url';

interface SiteLogoContextType {
  siteLogoUrl: string | null;
  setSiteLogoUrl: (url: string | null) => void;
  removeSiteLogo: () => void;
}

const SiteLogoContext = createContext<SiteLogoContextType | undefined>(undefined);

export const SiteLogoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteLogoUrl, _setSiteLogoUrl] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const initializeLogo = async () => {
      try {
        // First, try localStorage
        const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
        if (storedLogo) {
          _setSiteLogoUrl(storedLogo);
          return;
        }

        // If not in localStorage, fetch from server settings
        const response = await fetch('/api/settings');
        if (response.ok) {
            const settings = await response.json();
            if (settings.site_logo_url) {
                _setSiteLogoUrl(settings.site_logo_url);
                localStorage.setItem(LOGO_STORAGE_KEY, settings.site_logo_url);
            }
        }
      } catch (error) {
        console.error("Failed to initialize site logo:", error);
      }
    };
    initializeLogo();
  }, []);
  
  const setSiteLogoUrl = useCallback((url: string | null) => {
    _setSiteLogoUrl(url);
    try {
        if (url) {
            localStorage.setItem(LOGO_STORAGE_KEY, url);
        } else {
            localStorage.removeItem(LOGO_STORAGE_KEY);
        }
        // Dispatch a storage event to sync across tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: LOGO_STORAGE_KEY,
            newValue: url,
        }));
    } catch (error) {
        console.error("Failed to write site logo to localStorage", error);
    }
  }, []);

  const removeSiteLogo = useCallback(() => {
    setSiteLogoUrl(null);
  }, [setSiteLogoUrl]);
  
  useEffect(() => {
    if (!isMounted) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOGO_STORAGE_KEY) {
        _setSiteLogoUrl(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isMounted]);

  const value = useMemo(() => ({
    siteLogoUrl,
    setSiteLogoUrl,
    removeSiteLogo,
  }), [siteLogoUrl, setSiteLogoUrl, removeSiteLogo]);

  return (
    <SiteLogoContext.Provider value={value}>
      {children}
    </SiteLogoContext.Provider>
  );
};

export const useSiteLogo = () => {
  const context = useContext(SiteLogoContext);
  if (context === undefined) {
    throw new Error('useSiteLogo must be used within a SiteLogoProvider');
  }
  return context;
};
