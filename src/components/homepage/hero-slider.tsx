"use client";

import React, { useRef, useEffect, useState } from 'react';
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
  );
  
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowWidth(window.innerWidth);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic height based on screen size
  const getDynamicHeight = () => {
    if (height) {
      return `min(${height}px, ${isMobile ? '70vh' : '90vh'})`;
    }
    return isMobile ? '70vh' : '90vh';
  };

  const getFontSizes = () => {
    if (isMobile) {
      return {
        title: 'text-2xl sm:text-3xl',
        subtitle: 'text-sm sm:text-base',
        button: 'text-xs sm:text-sm'
      };
    }
    return {
      title: 'text-3xl md:text-5xl lg:text-6xl',
      subtitle: 'text-sm md:text-lg',
      button: 'text-xs sm:text-sm'
    };
  };

  const fontSizes = getFontSizes();

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
          {items.map((item, index) => (
            <CarouselItem key={item.id}>
              <div 
                className="relative w-full overflow-hidden"
                style={{
                  height: getDynamicHeight(),
                  minHeight: isMobile ? '400px' : '500px',
                }}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.imageHint}
                  fill
                  className="object-cover"
                  data-ai-hint={item.imageHint}
                  priority={index === 0}
                  sizes="100vw"
                  quality={isMobile ? 85 : 90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20 md:bg-black/40" />
                
                <div className={`
                  relative z-10 flex h-full w-full
                  ${isMobile 
                    ? 'flex-col items-start justify-end pb-8 px-4' 
                    : 'flex-col items-start justify-center pb-12 px-5 sm:px-10 md:px-16 lg:px-24'
                  }
                `}>
                  {/* Mobile-optimized content container */}
                  <div className={`
                    max-w-full ${isMobile ? 'w-full' : 'max-w-2xl lg:max-w-3xl'}
                    ${isMobile ? 'bg-black/30 backdrop-blur-sm rounded-lg p-4' : ''}
                  `}>
                    <h2 className={`
                      font-bold font-headline text-white leading-tight
                      ${fontSizes.title}
                      ${isMobile ? 'mb-2 line-clamp-2' : 'mb-3'}
                    `}>
                      {item.title}
                    </h2>
                    
                    <p className={`
                      text-white/90
                      ${fontSizes.subtitle}
                      ${isMobile ? 'line-clamp-2 mb-3' : 'mb-4 sm:mb-6'}
                      ${isMobile ? 'max-w-full' : 'max-w-lg'}
                    `}>
                      {item.subtitle}
                    </p>
                    
                    <Button 
                      asChild 
                      size={isMobile ? "default" : "lg"}
                      className={`
                        ${fontSizes.button}
                        ${isMobile 
                          ? 'bg-white text-black hover:bg-white/90 w-full sm:w-auto' 
                          : 'bg-white text-black hover:bg-white/90'
                        }
                        transition-all duration-300 hover:scale-105
                      `}
                    >
                      <Link href={item.ctaLink}>{item.ctaText}</Link>
                    </Button>
                  </div>
                </div>
                
                {/* Optional: Show slide indicator on mobile */}
                {isMobile && items.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                    {items.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          i === index ? 'bg-white w-3' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Hide navigation arrows on mobile for cleaner look, or keep them smaller */}
        {!isMobile && (
          <>
            <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white/80 hover:bg-white" />
            <CarouselNext className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white/80 hover:bg-white" />
          </>
        )}
        
        {/* Optional: Show touch-friendly navigation on mobile */}
        {isMobile && items.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            <button 
              onClick={() => {
                const carousel = document.querySelector('[data-carousel]');
                // You'd need to implement carousel navigation here
              }}
              className="bg-white/20 backdrop-blur-sm rounded-full p-2 w-8 h-8 flex items-center justify-center"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button 
              onClick={() => {
                // Next slide navigation
              }}
              className="bg-white/20 backdrop-blur-sm rounded-full p-2 w-8 h-8 flex items-center justify-center"
              aria-label="Next slide"
            >
              →
            </button>
          </div>
        )}
      </Carousel>
    </section>
  );
}