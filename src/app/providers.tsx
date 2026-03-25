"use client";

import { CartProvider } from "@/hooks/use-cart";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MenuProvider } from "@/hooks/use-menu";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { CompareProvider } from "@/hooks/use-compare";
import type { Menu, Category } from "@/lib/types";

interface ProvidersProps {
  children: React.ReactNode;
  menu: Menu | null;
  categories: Category[];
}

export function Providers({ children, menu, categories }: ProvidersProps) {
  return (
    <MenuProvider menu={menu} categories={categories}>
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
