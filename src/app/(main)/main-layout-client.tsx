"use client";

import { Footer } from "@/components/layout/footer";
import { MobileFooter } from "@/components/layout/mobile-footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import type { FooterContent } from "@/lib/types";

interface MainLayoutClientProps {
    footerContent: FooterContent;
    mobileFooterContent: FooterContent;
}

export function MainLayoutClient({ footerContent, mobileFooterContent }: MainLayoutClientProps) {
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-48 bg-secondary/50" />;
  }

  return (
    <>
      {isMobile 
        ? <MobileFooter content={mobileFooterContent} /> 
        : <Footer content={footerContent} />
      }
    </>
  );
}