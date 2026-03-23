'use client';

import Image from "next/image";
import { Star } from "lucide-react";
import type { MinimalistHomepageContent } from "@/lib/types";

export function MinimalistTestimonials({ data }: { data: MinimalistHomepageContent['testimonials'] }) {
  if (!data?.enabled) return null;
  return (
    <section className="bg-background px-4 sm:px-6 lg:px-8 mt-16 md:mt-28">
      <h2 className="text-center font-serif text-2xl md:text-3xl mb-12">{data.title}</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {data.items.map((item) => (
          <div key={item.id} className="bg-card p-6 md:p-8 rounded-2xl shadow-sm text-center">
             <div className="flex justify-center mb-4">
              <Image src={item.imageUrl} alt={item.imageHint} width={80} height={80} className="rounded-full" data-ai-hint={item.imageHint}/>
            </div>
            <p className="italic text-foreground/80">"{item.text}"</p>
            <div className="mt-6">
              <div className="flex justify-center mb-2">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                ))}
              </div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
