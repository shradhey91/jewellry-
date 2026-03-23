'use client';

import Image from "next/image";
import Link from "next/link";
import type { MinimalistHomepageContent } from "@/lib/types";

export function MinimalistSignatureCollections({ data }: { data: MinimalistHomepageContent['signature_collections'] }) {
  if (!data?.enabled) return null;

  const { primary, secondary } = data.collections;

  return (
    <section className="bg-background px-4 sm:px-6 lg:px-8 mt-16 md:mt-28">
      <h2 className="mb-12 text-center font-serif text-2xl md:text-3xl">
        {data.title}
      </h2>

      <div className="grid gap-10 md:grid-cols-2">
        {/* PRIMARY COLLECTION */}
        <Link
          href={primary.href}
          className="group relative h-[400px] md:h-[520px] overflow-hidden rounded-3xl"
        >
          {primary.type === 'video' && primary.videoUrl ? (
             <video
              key={primary.videoUrl}
              src={primary.videoUrl}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <Image
              src={primary.image}
              alt={primary.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              data-ai-hint="floral jewelry"
            />
          )}
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="absolute bottom-8 left-8 z-10 text-primary-foreground">
            <p className="font-serif text-3xl">
              {primary.title}
            </p>
          </div>
        </Link>

        {/* SECONDARY COLLECTIONS */}
        <div className="grid gap-10">
          {secondary.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative h-[190px] md:h-[245px] overflow-hidden rounded-3xl"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                data-ai-hint={item.title}
              />
              <div className="absolute inset-0 bg-foreground/15" />
              <div className="absolute bottom-6 left-6 z-10 text-primary-foreground">
                <p className="font-serif text-xl">
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
