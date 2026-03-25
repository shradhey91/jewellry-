"use client";

import Image from "next/image";
import Link from "next/link";
import type { MinimalistHomepageContent } from "@/lib/types";

export function MinimalistSignatureCollections({
  data,
}: {
  data: MinimalistHomepageContent["signature_collections"];
}) {
  if (!data?.enabled) return null;
  const { primary, secondary } = data.collections;

  return (
    <section className="bg-background px-4 sm:px-6 lg:px-8 mt-16 md:mt-28">
      <h2 className="mb-12 text-center font-serif text-2xl md:text-3xl">
        {data.title}
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary Collection: 16/9 on mobile */}
        <Link
          href={primary.href}
          className="group relative aspect-[16/9] md:h-[520px] overflow-hidden rounded-3xl"
        >
          <Image
            src={primary.image}
            alt={primary.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          {/* Slide-up hover CTA */}
          <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium">
              Explore Collection
            </span>
          </div>
          <div className="absolute top-8 left-8 z-10 text-white">
            <p className="font-serif text-3xl">{primary.title}</p>
          </div>
        </Link>

        {/* Side-by-side secondary tiles on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
          {secondary.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative aspect-square md:h-[245px] md:aspect-auto overflow-hidden rounded-3xl"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-6 left-6 z-10 text-white">
                <p className="font-serif text-lg md:text-xl">{item.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
