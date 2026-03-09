
import Image from 'next/image';
import { Gem, Scissors, Droplets, Search, Scaling } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getDiamondGuideContent } from '@/lib/get-diamond-guide-content';

export const runtime = 'nodejs';

export default async function DiamondGuidePage() {
  const content = await getDiamondGuideContent();

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-black text-white flex items-center justify-center text-center">
        <Image
          src={content.hero.imageUrl}
          alt={content.hero.imageHint}
          fill
          className="object-cover opacity-40"
          data-ai-hint={content.hero.imageHint}
          priority
        />
        <div className="relative z-10 p-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">{content.hero.eyebrow}</p>
          <h1 className="mt-2 text-5xl font-bold font-headline tracking-tight md:text-7xl">{content.hero.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* 4Cs Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-headline font-bold">{content.fourCs.title}</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
                {content.fourCs.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.fourCs.items.map((c) => (
              <Card key={c.title} className="overflow-hidden border-2 border-transparent hover:border-primary hover:shadow-2xl transition-all duration-300 group">
                <div className="aspect-video relative">
                     <Image src={c.imageUrl} alt={c.imageHint} fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={c.imageHint} />
                </div>
                <CardContent className="p-8">
                    <div className="flex items-center gap-4">
                        {c.icon === 'Scissors' && <Scissors className="h-10 w-10 text-primary" />}
                        {c.icon === 'Droplets' && <Droplets className="h-10 w-10 text-primary" />}
                        {c.icon === 'Search' && <Search className="h-10 w-10 text-primary" />}
                        {c.icon === 'Scaling' && <Scaling className="h-10 w-10 text-primary" />}
                        <h3 className="text-2xl font-bold font-headline">{c.title}</h3>
                    </div>
                    <p className="mt-4 text-muted-foreground">{c.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Diamond Shapes Section */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-4xl font-headline font-bold">{content.shapes.title}</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
                {content.shapes.subtitle}
            </p>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
                {content.shapes.items.map((shape, index) => (
                    <div key={shape.name || index} className="flex flex-col items-center gap-3 group">
                        <div className="relative h-20 w-20 bg-background rounded-full flex items-center justify-center shadow-inner transition-all duration-300 group-hover:bg-white group-hover:shadow-lg">
                           <Image src={shape.imageUrl} alt={shape.name || 'diamond shape'} width={48} height={48} className="object-contain" data-ai-hint={`diamond shape ${shape.name ? shape.name.toLowerCase() : ''}`}/>
                        </div>
                        <p className="font-semibold text-sm tracking-wide text-muted-foreground group-hover:text-primary">{shape.name}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Anatomy Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-4xl text-center">
             <h2 className="text-4xl font-headline font-bold">{content.anatomy.title}</h2>
             <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
                {content.anatomy.subtitle}
            </p>
            <div className="mt-12 relative">
                <Image src={content.anatomy.imageUrl} alt={content.anatomy.imageHint} width={800} height={600} className="mx-auto" data-ai-hint={content.anatomy.imageHint} />
            </div>
        </div>
      </section>

       {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl py-16 text-center">
          <h2 className="text-3xl font-bold font-headline">{content.cta.title}</h2>
          <p className="mt-4 text-lg opacity-90">
            {content.cta.subtitle}
          </p>
          <Button asChild variant="outline" size="lg" className="mt-8 text-primary bg-primary-foreground hover:bg-primary-foreground/90">
            <Link href={content.cta.ctaLink}>{content.cta.ctaText}</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
