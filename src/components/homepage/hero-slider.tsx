"use client";

import React, { useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import type { HeroSliderItem } from '@/lib/types';

interface HeroSliderProps {
  items: HeroSliderItem[];
  height?: number;
}

export function HeroSlider({ items, height }: HeroSliderProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  const sliderStyle = height ? { height: `${height}px` } : {};
  const imageAspectRatio = height ? undefined : "16/7";

  return (
    <section className="w-full overflow-hidden">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id}>
              <div 
                className="relative w-full overflow-hidden"
                style={{
                  ...(height ? { height: `min(${height}px, 100vh)` } : {}),
                  aspectRatio: imageAspectRatio
                }}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.imageHint}
                  fill
                  className="object-cover"
                  data-ai-hint={item.imageHint}
                  priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 flex h-full flex-col items-start justify-end pb-12 px-5 text-left sm:justify-center sm:pb-0 sm:px-10 md:px-16 lg:px-24">
                  <h2 className="max-w-2xl text-xl font-bold font-headline sm:text-3xl md:text-5xl lg:text-6xl text-white leading-tight">
                    {item.title}
                  </h2>
                  <p className="mt-2 max-w-lg text-xs sm:text-sm md:text-lg text-white/90 line-clamp-3 sm:line-clamp-none">
                    {item.subtitle}
                  </p>
                  <Button asChild size="sm" className="mt-4 sm:mt-8 sm:size-lg bg-white text-black hover:bg-white/90 text-xs sm:text-sm">
                    <Link href={item.ctaLink}>{item.ctaText}</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10" />
        <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10" />
      </Carousel>
    </section>
  );
}