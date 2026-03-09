
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PromoBannerItem } from "@/lib/types";

interface PromoBannersProps {
    items: PromoBannerItem[];
}

export function PromoBanners({ items }: PromoBannersProps) {
  if (!items || items.length === 0) {
    return null;
  }
  
  return (
    <section className="bg-background">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item) => (
            <Card key={item.id} className="bg-accent text-accent-foreground p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-headline">{item.title}</h3>
                <p className="text-lg mt-2">{item.subtitle}</p>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-4">
                    <p className="font-mono text-sm">
                        Use Code: <span className="font-bold border border-dashed border-accent-foreground p-2 rounded-md">{item.code}</span>
                    </p>
                     <Button variant="ghost" asChild>
                        <Link href={item.ctaLink}>{item.ctaText} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
