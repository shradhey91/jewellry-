
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SplitBannerItem {
    title: string;
    description: string;
    buttonLabel: string;
    buttonLink: string;
    imageUrl: string;
    imageHint: string;
}

interface SplitBannerProps {
    banners: SplitBannerItem[];
}

export function SplitBanner({ banners }: SplitBannerProps) {
    if (!banners || banners.length === 0) return null;

    return (
        <section className="bg-background py-12 md:py-20">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map((banner, index) => (
                         <div key={index} className="relative aspect-[4/5] group overflow-hidden rounded-lg">
                            <Image
                                src={banner.imageUrl}
                                alt={banner.imageHint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={banner.imageHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
                                <h3 className="text-3xl font-headline">{banner.title}</h3>
                                <p className="mt-2 max-w-sm">{banner.description}</p>
                                <Button asChild variant="outline" className="mt-4 w-fit bg-transparent text-white border-white hover:bg-white hover:text-black">
                                    <Link href={banner.buttonLink}>{banner.buttonLabel}</Link>
                                </Button>
                            </div>
                         </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
