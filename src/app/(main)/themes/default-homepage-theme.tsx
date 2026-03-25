'use client';

import type { HomepageSection, Product, HomepageContent } from '@/lib/types';
import { SectionRenderer } from '@/components/homepage/section-renderer';

interface HomepageThemeProps {
    content: HomepageContent;
    newestProducts: Product[];
    bestSellerProducts: Product[];
}

export function DefaultHomepageTheme({ content, newestProducts, bestSellerProducts }: HomepageThemeProps) {
  const sectionData = {
      newestProducts,
      bestSellerProducts,
      content
  };

  return (
    <main className="flex flex-col space-y-12 md:space-y-20 md:mb-20 overflow-x-hidden w-full">
      {content.layout.filter(section => section.visible).map((section: HomepageSection) => (
        <SectionRenderer key={section.id} section={section} {...sectionData} />
      ))}
    </main>
  );
}
