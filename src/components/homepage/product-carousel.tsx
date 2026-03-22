
'use client';

import React from 'react';
import Autoplay from "embla-carousel-autoplay";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/products/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";
import Link from "next/link";

interface ProductCarouselProps {
    products: Product[];
    title: string;
}

export function ProductCarousel({ products, title }: ProductCarouselProps) {
    const plugin = React.useRef(
      Autoplay({ delay: 4000, stopOnInteraction: true })
    )

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="w-full">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold font-headline">{title}</h2>
                     <Button variant="outline" asChild>
                        <Link href="/shop">View All</Link>
                    </Button>
                </div>
                <div className="overflow-hidden">
                    <Carousel
                        plugins={[plugin.current]}
                        onMouseEnter={plugin.current.stop}
                        onMouseLeave={plugin.current.reset}
                        opts={{
                            align: "start",
                            loop: products.length > 5,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {products.map((product) => (
                                <CarouselItem key={product.id} className="pl-4 md:basis-1/3 lg:basis-1/5">
                                    <ProductCard product={product} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex" />
                        <CarouselNext className="hidden md:flex" />
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
