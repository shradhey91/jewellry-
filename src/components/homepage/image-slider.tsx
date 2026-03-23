
'use client';

import React from 'react';
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
import type { ImageSliderItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ImageSliderProps {
  eyebrow: string;
  title: string;
  ctaText: string;
  ctaLink: string;
  items: ImageSliderItem[];
}

export function ImageSlider({ eyebrow, title, ctaText, ctaLink, items }: ImageSliderProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <section className="bg-stone-100 py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 text-center md:text-left">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
                <h2 className="text-5xl font-headline text-amber-900 mt-2">{title}</h2>
                <Button asChild className="mt-6" variant="outline">
                    <Link href={ctaLink}>{ctaText}</Link>
                </Button>
            </div>
            <div className="w-full md:w-2/3">
                <Carousel
                    plugins={[plugin.current]}
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {items.map((item) => (
                            <CarouselItem key={item.id} className="basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <div className="aspect-[4/5] relative rounded-lg overflow-hidden group">
                                         <Image 
                                            src={item.imageUrl}
                                            alt={item.imageHint}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint={item.imageHint}
                                        />
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </div>
        </div>
      </div>
    </section>
  );
}
