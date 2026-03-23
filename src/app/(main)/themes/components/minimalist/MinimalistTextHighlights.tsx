// src/app/(main)/themes/components/minimalist/MinimalistTextHighlights.tsx
"use client";

import type { TextHighlightsSection } from "@/lib/types";

export function MinimalistTextHighlights({
  data,
}: {
  data: TextHighlightsSection;
}) {
  if (!data?.enabled || !data.items) return null;
  return (
    // Replaced bg-secondary with border-y treatment
    <section className="bg-background border-y border-gray-100 py-10 my-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {data.items.map((highlight, index) => (
            <div key={index} className="text-center px-4">
              <h3 className="font-serif text-base md:text-lg">
                {highlight.title}
              </h3>
              <p className="text-muted-foreground mt-1 text-xs md:text-sm">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
