
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import type { IconHighlightItem } from '@/lib/types';

interface CategoryHighlightsProps {
    items: IconHighlightItem[];
    showText?: boolean;
}

export function CategoryHighlights({ items, showText = true }: CategoryHighlightsProps) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className="bg-background">
            <div className="container mx-auto">
                <div className="flex flex-nowrap justify-around items-center gap-2 overflow-x-auto pb-4 px-4 md:overflow-visible md:pb-0 md:px-0 md:gap-4">
                    {items.map((highlight) => (
                        <Link key={highlight.id} href={highlight.link} className="flex-shrink-0">
                            <div className="flex flex-col items-center gap-3 text-center text-muted-foreground hover:text-primary transition-colors duration-300 w-20">
                                <div className="relative h-12 w-12 md:h-16 md:w-16 rounded-full overflow-hidden">
                                  <Image
                                    src={highlight.imageUrl}
                                    alt={highlight.name}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={highlight.imageHint}
                                  />
                                </div>
                                {showText && <span className="text-xs font-medium uppercase tracking-wider">{highlight.name}</span>}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
