import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  imageHint: string;
  textPosition?: "left" | "right";
}

export function ImageBanner({
  title,
  subtitle,
  ctaText,
  ctaLink,
  imageUrl,
  imageHint,
  textPosition = "left",
}: ImageBannerProps) {
  const textAlignment = textPosition === "left" ? "items-start text-left" : "items-end text-right";
  const contentOrder = textPosition === "left" ? "md:flex-row" : "md:flex-row-reverse";

  return (
    <section className="bg-background">
      <div className="container mx-auto px-0 md:px-8">
        <div className={cn("flex flex-col md:items-center", contentOrder)}>
          <div className="w-full md:w-1/2">
            <div className={cn("flex flex-col justify-center h-full p-8 md:p-16", textAlignment)}>
              <p className="text-lg tracking-wider uppercase text-muted-foreground">{subtitle}</p>
              <h2 className="mt-2 text-4xl md:text-5xl font-headline">{title}</h2>
              <Button asChild className="mt-6 w-fit" variant="outline" size="lg">
                <Link href={ctaLink}>{ctaText}</Link>
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/2 aspect-[4/3] relative">
            <Image
              src={imageUrl}
              alt={imageHint}
              fill
              className="object-cover"
              data-ai-hint={imageHint}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
