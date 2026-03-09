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
import type { MinimalistHeroSlide } from "@/lib/types";
import { Button } from "@/components/ui/button";

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;

  let videoId: string | null = null;

  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes("youtube.com")) {
      videoId = urlObj.searchParams.get("v");
    }
  } catch {
    return null;
  }

  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    controls: "0",
    rel: "0",
    playsinline: "1",
    modestbranding: "1",
    showinfo: "0",
    iv_load_policy: "3",
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};


export function MinimalistHero({ data }: { data: { enabled: boolean; slides: MinimalistHeroSlide[] } }) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  if (!data?.enabled || !data.slides || data.slides.length === 0) return null;

  return (
    <section className="bg-background px-6 pt-6">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {data.slides.map((slide) => {
            const youtubeEmbedUrl = slide.type === 'video' && slide.videoUrl ? getYouTubeEmbedUrl(slide.videoUrl) : null;
            return (
              <CarouselItem key={slide.id}>
                <div className="relative h-[80vh] md:h-[75vh] rounded-3xl overflow-hidden flex items-center">
                  {slide.type === 'video' && slide.videoUrl ? (
                    youtubeEmbedUrl ? (
                      <div className="absolute top-1/2 left-1/2 w-[177.78vh] min-w-full min-h-full h-[100vh] -translate-x-1/2 -translate-y-1/2 scale-[1.35]">
                         <iframe
                            key={slide.id}
                            src={youtubeEmbedUrl}
                            className="w-full h-full pointer-events-none"
                            frameBorder="0"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            title="Background Video"
                          />
                      </div>
                    ) : (
                      <video
                        key={slide.videoUrl}
                        src={slide.videoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    )
                  ) : (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority
                      data-ai-hint="lifestyle fashion"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/45 to-transparent" />

                  <div className="relative z-10 max-w-md md:max-w-xl p-6 md:p-12 text-primary-foreground">
                    <h1 className="font-serif text-4xl md:text-5xl leading-tight">
                      {slide.title}
                    </h1>
                    <p className="mt-4 text-primary-foreground/85">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.cta.href}
                      className="inline-block mt-6 rounded-full bg-primary-foreground px-6 py-3 text-sm font-medium text-foreground"
                    >
                      {slide.cta.label}
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious variant="ghost" className="absolute left-10 top-1/2 -translate-y-1/2 z-10 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" />
        <CarouselNext variant="ghost" className="absolute right-10 top-1/2 -translate-y-1/2 z-10 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" />
      </Carousel>
    </section>
  );
}
