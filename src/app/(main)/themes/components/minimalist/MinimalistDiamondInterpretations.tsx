'use client';

import Image from "next/image";
import Link from "next/link";
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { MinimalistHomepageContent } from "@/lib/types";

export function MinimalistDiamondInterpretations({ data }: { data: MinimalistHomepageContent['diamond_interpretations'] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  if (!data?.enabled) return null;

  return (
    <section className="bg-background px-4 sm:px-6 lg:px-8 mt-16 md:mt-20">
      <h2 className="mb-10 text-center font-serif text-2xl md:text-3xl">
        {data.title}
      </h2>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[plugin.current]}
        className="w-full max-w-6xl mx-auto"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {data.cards.map((card) => (
            <CarouselItem key={card.id} className="basis-1/2 md:basis-1/3">
              <div className="p-1">
                <Link
                  href={card.href}
                  className="group rounded-2xl overflow-hidden bg-card shadow-sm transition hover:shadow-md block"
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      data-ai-hint={card.title}
                    />
                  </div>

                  <div className="p-6 text-center">
                    <p className="font-medium">{card.title}</p>
                  </div>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-[-50px] hidden md:flex" />
        <CarouselNext className="right-[-50px] hidden md:flex" />
      </Carousel>
    </section>
  );
}
