// src/app/layout.tsx
import { FaviconProvider } from "@/hooks/use-favicon";
import { SiteLogoProvider } from "@/hooks/use-site-logo";
import { HeaderSettingsProvider } from "@/hooks/use-header-settings";
import { SocialProofProvider } from "@/hooks/use-social-proof";
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/providers';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { getMenuById, getCategories } from "@/lib/server/api";
import type { Menu, Category } from "@/lib/types";
import ClientLayoutShell from "./_components/client-layout-shell";

export const runtime = 'nodejs';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
});

// Fetch menu data once on the server — result is passed into Providers so the
// header renders with real data immediately (no client-side loading skeleton).
async function getMenuData(): Promise<{ menu: Menu | null; categories: Category[] }> {
  try {
    const [menu, categories] = await Promise.all([
      getMenuById("menu-1"),
      getCategories(),
    ]);
    return { menu: menu || null, categories };
  } catch (error) {
    console.error("Failed to fetch menu data for layout:", error);
    return { menu: null, categories: [] };
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { menu, categories } = await getMenuData();

  return (
    <SiteLogoProvider>
      <FaviconProvider>
        <HeaderSettingsProvider>
          <SocialProofProvider>
            <html lang="en" suppressHydrationWarning>
              <head />
              <body className={cn("font-body antialiased", montserrat.variable)}>
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:p-4 focus:text-black"
                >
                  Skip to content
                </a>
                <Providers menu={menu} categories={categories}>
                  <ClientLayoutShell>
                    {children}
                  </ClientLayoutShell>
                  <Toaster />
                </Providers>
              </body>
            </html>
          </SocialProofProvider>
        </HeaderSettingsProvider>
      </FaviconProvider>
    </SiteLogoProvider>
  );
}
