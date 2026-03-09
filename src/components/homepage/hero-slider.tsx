
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
    <section className="w-full">
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
                className="relative w-full"
                style={{
                  ...sliderStyle,
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
                <div className="relative z-10 flex h-full flex-col items-start justify-center p-8 text-left md:p-16 lg:p-24">
                  <h2 className="max-w-2xl text-3xl font-bold font-headline md:text-5xl lg:text-6xl text-white">
                    {item.title}
                  </h2>
                  <p className="mt-4 max-w-lg text-sm md:text-lg text-white/90">
                    {item.subtitle}
                  </p>
                  <Button asChild size="lg" className="mt-8 bg-white text-black hover:bg-white/90">
                    <Link href={item.ctaLink}>{item.ctaText}</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
      </Carousel>
    </section>
  );
}
