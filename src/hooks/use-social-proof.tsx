
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// This hook is no longer used for controlling social proof settings.
// It is kept for potential future use or can be removed.
// The settings are now managed in the admin panel and fetched via an API route.

const SOCIAL_PROOF_KEY = 'aparra-social-proof-settings';

interface SocialProofSettings {
  isEnabled: boolean;
  position: 'bottom-left' | 'bottom-right';
  showOnMobile: boolean;
}

const defaultSettings: SocialProofSettings = {
  isEnabled: true,
  position: 'bottom-left',
  showOnMobile: true,
};

interface SocialProofContextType {
  settings: SocialProofSettings;
  setSetting: <K extends keyof SocialProofSettings>(key: K, value: SocialProofSettings[K]) => void;
  isMounted: boolean;
}

const SocialProofContext = createContext<SocialProofContextType | undefined>(undefined);

export const SocialProofProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SocialProofSettings>(defaultSettings);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      // We only read legacy settings here to not break the UI if the new system fails.
      const storedSettings = localStorage.getItem(SOCIAL_PROOF_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        // We only care about a subset of keys for the UI settings now.
        setSettings(prev => ({
          ...prev,
          isEnabled: parsed.isEnabled ?? prev.isEnabled,
          position: parsed.position ?? prev.position,
          showOnMobile: parsed.showOnMobile ?? prev.showOnMobile,
        }));
      }
    } catch (error) {
      console.error("Failed to read social proof settings from localStorage", error);
    }
  }, []);

  const setSetting = useCallback(<K extends keyof SocialProofSettings>(key: K, value: SocialProofSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // This effect will persist the UI settings to localStorage
  useEffect(() => {
    if (isMounted) {
        try {
            const settingsToStore = {
                isEnabled: settings.isEnabled,
                position: settings.position,
                showOnMobile: settings.showOnMobile,
            };
            localStorage.setItem(SOCIAL_PROOF_KEY, JSON.stringify(settingsToStore));
        } catch(error) {
            console.error("Failed to write settings to local storage", error);
        }
    }
  }, [settings, isMounted]);


  const value = useMemo(() => ({
    settings,
    setSetting,
    isMounted,
  }), [settings, setSetting, isMounted]);

  return (
    <SocialProofContext.Provider value={value}>
      {children}
    </SocialProofContext.Provider>
  );
};

export const useSocialProof = () => {
  const context = useContext(SocialProofContext);
  if (context === undefined) {
    throw new Error('useSocialProof must be used within a SocialProofProvider');
  }
  return context;
};
