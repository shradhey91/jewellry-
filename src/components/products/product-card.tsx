
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useRef } from 'react';
import { WishlistButton } from './wishlist-button';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primaryMedia = product.media.find(m => m.is_primary);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        // Autoplay was prevented.
        console.warn("Video autoplay was prevented:", error);
      });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group">
      <Card 
        className={cn("overflow-hidden h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardContent className="p-0">
          <div className="aspect-square overflow-hidden bg-secondary relative">
            {primaryMedia ? (
              primaryMedia.media_type === 'video' ? (
                <video
                  ref={videoRef}
                  src={primaryMedia.url}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={primaryMedia.url}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={primaryMedia.hint}
                />
              )
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <span className="text-sm text-muted-foreground">No Image</span>
              </div>
            )}
             <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                <WishlistButton product={product} showText={false} variant="secondary" size="icon" className="h-8 w-8 shadow-md" />
            </div>
          </div>
          <div className="p-4 border-t">
            <h3 className="font-semibold text-lg leading-tight truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{product.seo_title}</p>
            <p className="font-bold text-xl mt-2 text-primary">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(product.display_price)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
