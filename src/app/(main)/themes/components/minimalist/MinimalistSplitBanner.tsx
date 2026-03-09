'use client';

import Image from "next/image";
import Link from "next/link";
import type { SplitBannerSection } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function MinimalistSplitBanner({ data }: { data: SplitBannerSection }) {
  if (!data?.enabled || !data.banners || data.banners.length === 0) return null;

  return (
    <section className="bg-background mt-16 md:mt-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.banners.map((banner, index) => (
            <div key={index} className="relative aspect-[4/5] group overflow-hidden rounded-3xl">
              <Image
                src={banner.imageUrl}
                alt={banner.imageHint}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={banner.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent flex flex-col justify-end p-6 md:p-8 text-primary-foreground">
                <h3 className="text-2xl md:text-3xl font-serif">{banner.title}</h3>
                <p className="mt-2 max-w-sm">{banner.description}</p>
                <Button asChild variant="outline" className="mt-4 w-fit bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-foreground">
                  <Link href={banner.buttonLink}>{banner.buttonLabel}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
