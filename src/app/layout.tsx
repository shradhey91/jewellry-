// src/app/layout.tsx
"use client";

import { useFavicon, FaviconProvider } from "@/hooks/use-favicon.tsx";
import { SiteLogoProvider } from "@/hooks/use-site-logo.tsx";
import { HeaderSettingsProvider } from "@/hooks/use-header-settings.tsx";
import { SocialProofProvider } from "@/hooks/use-social-proof.tsx";
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/providers';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useEffect, useState, Suspense } from 'react';
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { useIsMobile } from "@/hooks/use-mobile";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
});

function FaviconUpdater() {
  const { currentFaviconUrl } = useFavicon();
  useEffect(() => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = currentFaviconUrl || '/favicon.ico';
  }, [currentFaviconUrl]);
  return null;
}

function SiteLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');
    const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);
    const isMobile = useIsMobile();
    
    const showHeader = !isAdminPage && !isAuthPage;

    const HeaderComponent = () => {
        if (!isMounted) return <div className="h-28" />;
        return isMobile ? <MobileHeader /> : <Header />;
    };

    return (
        <html lang="en" suppressHydrationWarning>
          <head><FaviconUpdater /></head>
          <body className={cn("font-body antialiased", montserrat.variable)}>
            {/* Added Skip to Content Link */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:p-4 focus:text-black">
              Skip to content
            </a>
            <Providers>
                <div className="flex min-h-screen flex-col">
                  {showHeader && (
                    <Suspense fallback={<div className="h-28" />}>
                        <HeaderComponent />
                    </Suspense>
                  )}
                  {/* Added main-content ID */}
                  <main id="main-content" className={cn("flex-1", showHeader && (isMobile ? "pt-16" : "pt-28"))}>
                    {children}
                  </main>
                </div>
              <Toaster />
            </Providers>
          </body>
        </html>
    );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
      <SiteLogoProvider>
        <FaviconProvider>
          <HeaderSettingsProvider>
              <SocialProofProvider>
                <SiteLayout>{children}</SiteLayout>
              </SocialProofProvider>
          </HeaderSettingsProvider>
        </FaviconProvider>
      </SiteLogoProvider>
  );
}