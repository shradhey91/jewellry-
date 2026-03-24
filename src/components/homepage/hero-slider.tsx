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
              <div className="relative w-full h-screen max-h-[100vh] overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.imageHint}
                  fill
                  className="object-cover"
                  data-ai-hint={item.imageHint}
                  priority
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/40" />
                
                {/* Responsive content container */}
                <div className="absolute inset-0 flex items-end sm:items-center justify-start">
                  <div className="w-full px-5 pb-12 sm:pb-0 sm:px-10 md:px-16 lg:px-24 max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold font-headline text-white leading-tight max-w-2xl">
                      {item.title}
                    </h2>
                    <p className="mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base md:text-lg text-white/90 max-w-lg">
                      {item.subtitle}
                    </p>
                    <Button 
                      asChild 
                      size="default"
                      className="mt-4 sm:mt-6 md:mt-8 bg-white text-black hover:bg-white/90 text-sm sm:text-base px-6 sm:px-8"
                    >
                      <Link href={item.ctaLink}>{item.ctaText}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-black/50 hover:bg-black/70 text-white border-none" />
        <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-black/50 hover:bg-black/70 text-white border-none" />
      </Carousel>
    </section>
  );
}