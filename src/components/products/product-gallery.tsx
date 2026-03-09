
"use client";

import Image from 'next/image';
import type { ProductMedia } from '@/lib/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '../ui/card';
import { PlayCircle } from 'lucide-react';

interface ProductGalleryProps {
  media: ProductMedia[];
}

export function ProductGallery({ media }: ProductGalleryProps) {
  if (!media || media.length === 0) {
    return (
      <div className="aspect-square w-full flex items-center justify-center bg-muted rounded-lg">
        <span className="text-sm text-muted-foreground">No Image</span>
      </div>
    );
  }

  const sortedMedia = [...media].sort((a, b) => a.sort_order - b.sort_order);
  const [primaryMedia, setPrimaryMedia] = useState(sortedMedia[0]);

  return (
    <div className="space-y-4">
        <Card className="overflow-hidden group">
            <div className="aspect-square w-full relative">
                {primaryMedia.media_type === 'video' ? (
                     <video 
                        key={primaryMedia.id}
                        src={primaryMedia.url} 
                        className="h-full w-full object-cover" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                     />
                ) : (
                    <Image
                        key={primaryMedia.id}
                        src={primaryMedia.url}
                        alt={primaryMedia.hint || 'Product image'}
                        fill
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                        sizes="(max-width: 768px) 80vw, 40vw"
                        priority
                        data-ai-hint={primaryMedia.hint}
                    />
                )}
            </div>
        </Card>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {sortedMedia.map(item => (
                <button
                    key={item.id}
                    onClick={() => setPrimaryMedia(item)}
                    className={cn(
                        "aspect-square relative rounded-md overflow-hidden border-2 transition-all",
                        item.id === primaryMedia.id ? "border-primary shadow-lg" : "border-transparent opacity-70 hover:opacity-100 hover:border-primary/50"
                    )}
                >
                    <Image
                        src={item.media_type === 'video' ? "https://uncommongoods.in/media/images/Gemini_Generated_Image_nwhgufnwhgufnwhg.png" : item.url}
                        alt={item.hint || 'Product thumbnail'}
                        fill
                        className="object-cover"
                        sizes="15vw"
                        data-ai-hint={item.hint}
                    />
                    {item.media_type === 'video' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <PlayCircle className="h-6 w-6 text-white" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    </div>
  );
}
