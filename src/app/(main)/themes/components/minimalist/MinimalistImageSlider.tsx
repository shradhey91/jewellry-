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
import type { ImageSliderSection } from '@/lib/types';

export function MinimalistImageSlider({ data }: { data: ImageSliderSection }) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )
    if (!data?.enabled || !data.items) return null;

  return (
    <section className="bg-secondary py-16 md:py-20">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 text-center md:text-left">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">{data.eyebrow}</p>
                <h2 className="text-4xl md:text-5xl font-serif text-foreground mt-2">{data.title}</h2>
                <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3">
                    <Link href={data.ctaLink}>{data.ctaText}</Link>
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
                        {data.items.map((item) => (
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
                    <CarouselPrevious className="hidden md:flex left-[-50px]" />
                    <CarouselNext className="hidden md:flex right-[-50px]" />
                </Carousel>
            </div>
        </div>
      </div>
    </section>
  );
}
