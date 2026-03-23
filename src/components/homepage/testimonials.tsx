
import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TestimonialItem } from "@/lib/types";

interface TestimonialsProps {
  title: string;
  items: TestimonialItem[];
}

export function Testimonials({ title, items }: TestimonialsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="bg-secondary/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-3xl font-headline text-center mb-8">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((testimonial, index) => (
            <Card key={index} className="bg-background">
              <CardContent className="p-6 text-center flex flex-col items-center">
                <Image
                  src={testimonial.imageUrl}
                  alt={testimonial.imageHint}
                  width={80}
                  height={80}
                  className="rounded-full mb-4"
                  data-ai-hint={testimonial.imageHint}
                />
                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                <div className="flex mt-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-primary fill-current" />
                  ))}
                </div>
                <p className="mt-4 font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
