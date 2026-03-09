
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { VideoHighlightItem } from "@/lib/types";

interface VideoHighlightsProps {
    eyebrow: string;
    title: string;
    description: string;
    items: VideoHighlightItem[];
}

function VideoCard({ item }: { item: VideoHighlightItem }) {
    return (
        <Link href={item.link} className="relative aspect-[4/5] group overflow-hidden rounded-lg block">
             <video
                className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-105 transition-transform duration-300"
                autoPlay
                loop
                muted
                playsInline
                key={item.videoUrl}
                src={item.videoUrl}
              />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-semibold text-white font-headline">{item.title}</h3>
            </div>
        </Link>
    )
}

export function VideoHighlights({ eyebrow, title, description, items }: VideoHighlightsProps) {
  return (
    <section className="bg-background">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="p-8 flex flex-col justify-center text-left h-full bg-stone-100 rounded-lg lg:col-span-2 aspect-[4/5]">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
                <h3 className="font-headline text-3xl mt-2">{title}</h3>
                <p className="mt-4 text-muted-foreground">{description}</p>
            </div>
             {items.slice(0, 1).map(item => (
                 <div key={item.id} className="lg:col-span-2">
                    <VideoCard item={item} />
                 </div>
             ))}
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {items.slice(1).map(item => (
                    <div key={item.id}>
                        <VideoCard item={item} />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}
