'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { InstagramSection } from "@/lib/types";

export function MinimalistInstagram({ data }: { data: InstagramSection }) {
    if (!data?.enabled || !data.postImageUrls || data.postImageUrls.length === 0) return null;

    return (
        <section className="bg-secondary py-16 md:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-2xl md:text-3xl font-serif text-center mb-2">Join Our Instagram</h2>
                 <p className="text-muted-foreground mb-8">{data.handle}</p>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {data.postImageUrls.map((imageUrl, index) => (
                        <Link key={index} href="#" className="group">
                             <div className="aspect-square relative overflow-hidden rounded-lg">
                                <Image
                                    src={imageUrl}
                                    alt={`Instagram post ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint="instagram lifestyle"
                                />
                             </div>
                        </Link>
                    ))}
                 </div>
                  <Button asChild className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3">
                    <Link href="#">Follow Us</Link>
                </Button>
            </div>
        </section>
    );
}
