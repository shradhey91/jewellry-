'use client';

import Image from "next/image";
import Link from "next/link";
import type { MinimalistHomepageContent } from "@/lib/types";

export function MinimalistWorldOfBrand({ data }: { data: MinimalistHomepageContent['world_of_brand'] }) {
  if (!data?.enabled) return null;

  return (
    <section className="bg-background px-4 sm:px-6 lg:px-8 mt-16 md:mt-28">
      <h2 className="mb-12 text-center font-serif text-2xl md:text-3xl">
        {data.title}
      </h2>

      <div className="grid gap-10 md:grid-cols-2">
        {data.items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group relative h-[300px] md:h-[420px] overflow-hidden rounded-3xl"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              data-ai-hint={item.title}
            />

            <div className="absolute inset-0 bg-foreground/25 transition group-hover:bg-foreground/35" />

            <div className="absolute bottom-8 left-8 z-10 text-primary-foreground">
              <p className="font-serif text-3xl">
                {item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
