// src/app/(main)/themes/components/minimalist/MinimalistHero.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { MinimalistHeroSlide } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

export function MinimalistHero({ data }: { data: { enabled: boolean; slides: MinimalistHeroSlide[] } }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const toggleAutoplay = () => {
    if (isPlaying) plugin.current.stop();
    else plugin.current.play();
    setIsPlaying(!isPlaying);
  };

  if (!data?.enabled || !data.slides || data.slides.length === 0) return null;

  return (
    <section className="bg-background px-4 sm:px-6 lg:px-8 pt-6 relative">
      <Carousel plugins={[plugin.current]} className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {data.slides.map((slide) => (
            <CarouselItem key={slide.id}>
              {/* Mobile height 55vh, desktop 75vh */}
              <div className="relative h-[55vh] md:h-[75vh] rounded-3xl overflow-hidden flex items-center">
                {slide.type === 'video' ? (
                  <video src={slide.videoUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" priority />
                )}
                {/* Stronger gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
                <div className="relative z-10 max-w-md md:max-w-xl p-6 md:p-12 text-white">
                  <h1 className="font-serif text-3xl md:text-5xl leading-tight">{slide.title}</h1>
                  <p className="mt-4 text-white/85">{slide.subtitle}</p>
                  {/* White CTA Button */}
                  <Link href={slide.cta.href} className="inline-block mt-6 rounded-full bg-white px-8 py-3 text-sm font-medium text-black hover:bg-gray-100 transition-colors">
                    {slide.cta.label}
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* WCAG Pause Button */}
        <button onClick={toggleAutoplay} className="absolute bottom-10 right-24 z-20 p-2 rounded-full bg-black/20 text-white hover:bg-black/40">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <CarouselPrevious className="absolute left-10 top-1/2 -translate-y-1/2 z-10" />
        <CarouselNext className="absolute right-10 top-1/2 -translate-y-1/2 z-10" />
      </Carousel>
      {/* SR-Only Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite">Showing slide of {data.slides.length}</div>
    </section>
  );
}