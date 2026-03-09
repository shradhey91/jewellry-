
'use client';

import type { Product, ProductCarouselSection } from "@/lib/types";
import { ProductCarousel } from "@/components/homepage/product-carousel";

export function MinimalistProductCarousel({ data, products }: { data: ProductCarouselSection, products: Product[] }) {
  if (!data?.enabled) return null;
  return (
    <section className="bg-background py-20">
      <ProductCarousel title={data.title} products={products} />
    </section>
  );
}
