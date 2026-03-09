'use client';

import Image from "next/image";
import Link from "next/link";
import type { MinimalistHomepageContent } from "@/lib/types";

export function MinimalistCategoryGridWithTrending({ data }: { data: MinimalistHomepageContent['category_grid_with_trending'] }) {
  if (!data?.enabled) return null;

  return (
    <section className="bg-background px-6 mt-16 md:mt-28">
      {/* CATEGORY GRID */}
      <h2 className="mb-12 text-center font-serif text-2xl md:text-3xl">
        {data.categories.title}
      </h2>

      <div className="grid grid-cols-3 gap-4 md:grid-cols-6 md:gap-8">
        {data.categories.items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group rounded-2xl bg-card p-2 md:p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="relative h-20 md:h-32 overflow-hidden rounded-xl">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={item.title}
              />
            </div>

            <p className="mt-4 text-center text-sm font-medium">
              {item.title}
            </p>
          </Link>
        ))}
      </div>

      {/* TRENDING */}
      <div className="mt-16 md:mt-24">
        <h3 className="mb-10 text-center font-serif text-xl md:text-2xl">
          {data.trending.title}
        </h3>

        <div className="grid gap-8 md:grid-cols-3">
          {data.trending.items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group overflow-hidden rounded-3xl bg-card shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-80">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  data-ai-hint={item.title}
                />
              </div>

              <div className="p-6 text-center">
                <p className="font-medium">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
