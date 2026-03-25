"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { useFavicon } from "@/hooks/use-favicon";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/layout/header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { cn } from "@/lib/utils";

function FaviconUpdater() {
  const { currentFaviconUrl } = useFavicon();
  useEffect(() => {
    let link: HTMLLinkElement | null =
      document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = currentFaviconUrl || "/favicon.ico";
  }, [currentFaviconUrl]);
  return null;
}

export default function ClientLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const isAuthPage =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup");
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => setIsMounted(true), []);

  const showHeader = !isAdminPage && !isAuthPage;

  const HeaderComponent = () => {
    if (!isMounted) return <div className="h-28" />;
    return isMobile ? <MobileHeader /> : <Header />;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <FaviconUpdater />
      {showHeader && (
        <Suspense fallback={<div className="h-28" />}>
          <HeaderComponent />
        </Suspense>
      )}
      <main
        id="main-content"
        className={cn("flex-1", showHeader && (isMobile ? "pt-16" : "pt-28"))}
      >
        {children}
      </main>
    </div>
  );
}
