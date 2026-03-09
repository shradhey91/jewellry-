'use client';

import type { TextHighlightsSection } from "@/lib/types";

export function MinimalistTextHighlights({ data }: { data: TextHighlightsSection }) {
  if (!data?.enabled || !data.items) return null;
  return (
    <section className="bg-secondary py-12 md:py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {data.items.map((highlight, index) => (
            <div key={index} className="text-center">
              <h3 className="font-semibold text-lg">{highlight.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{highlight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
