'use client';

import Image from "next/image";
import Link from "next/link";
import type { ImageGridSection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MinimalistImageGrid({ data }: { data: ImageGridSection }) {
    if (!data?.enabled || !data.items || data.items.length === 0) return null;

    return (
        <section className="bg-background mt-16 md:mt-20">
            <div className="container mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.items.map((item, index) => (
                        <Card key={index} className="overflow-hidden group border-none shadow-none rounded-lg bg-transparent">
                           {item.type === 'text' ? (
                                <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full bg-secondary/80 rounded-2xl">
                                    <h3 className="font-serif text-2xl">{item.title}</h3>
                                    <p className="mt-2 text-muted-foreground">{item.content}</p>
                                    <Button variant="link" asChild className="mt-4 text-foreground">
                                        <Link href={item.buttonLink}>{item.buttonLabel}</Link>
                                    </Button>
                                </CardContent>
                           ) : (
                               <div className="aspect-[4/5] relative rounded-2xl overflow-hidden">
                                    <Image 
                                        src={item.imageUrl}
                                        alt={item.imageHint}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={item.imageHint}
                                    />
                               </div>
                           )}
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
