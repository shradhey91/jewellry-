'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { MinimalistHomepageContent } from "@/lib/types";

export function MinimalistJournal({ data }: { data: MinimalistHomepageContent['journal'] }) {
  if (!data?.enabled) return null;
  
  return (
    <section className="bg-background px-4 sm:px-6 lg:px-8 mt-16 md:mt-28">
      <h2 className="text-center font-serif text-2xl md:text-3xl mb-12">{data.title}</h2>
      
      {data.entries && data.entries.length > 0 ? (
        <>
          <div className="grid md:grid-cols-3 gap-8">
            {data.entries.map((entry) => (
              <Link key={entry.id} href={entry.link} className="group rounded-3xl overflow-hidden bg-card shadow-sm transition hover:shadow-md">
                <div className="relative h-60">
                  <Image src={entry.imageUrl} alt={entry.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" data-ai-hint={entry.imageHint} />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl">{entry.title}</h3>
                  <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{entry.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
             <Button asChild variant="outline" className="rounded-full">
                <Link href="/blog">
                    View All Posts <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
             </Button>
          </div>
        </>
      ) : (
        <div className="text-center">
            <p className="text-muted-foreground">No journal entries found.</p>
            <Button asChild variant="outline" className="mt-4 rounded-full">
                <Link href="/blog">
                    View All Posts <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
             </Button>
        </div>
      )}
    </section>
  );
}
