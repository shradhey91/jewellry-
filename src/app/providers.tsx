
"use client";

import { CartProvider } from "@/hooks/use-cart.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MenuProvider } from "@/hooks/use-menu.tsx";
import { WishlistProvider } from "@/hooks/use-wishlist.tsx";
import { CompareProvider } from "@/hooks/use-compare.tsx";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <TooltipProvider>
        <WishlistProvider>
          <CartProvider>
            <CompareProvider>
              {children}
            </CompareProvider>
          </CartProvider>
        </WishlistProvider>
      </TooltipProvider>
    </MenuProvider>
  );
}
