
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GridItemText {
    type: 'text';
    title: string;
    content: string;
    buttonLabel: string;
    buttonLink: string;
}

interface GridItemImage {
    type: 'image';
    imageUrl: string;
    imageHint: string;
}

type GridItem = GridItemText | GridItemImage;

interface ImageGridProps {
    items: GridItem[];
}

export function ImageGrid({ items }: ImageGridProps) {
    if (!items || items.length === 0) return null;

    return (
        <section className="bg-background py-12 md:py-20">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item, index) => (
                        <Card key={index} className="overflow-hidden group border-none shadow-none rounded-lg bg-transparent">
                           {item.type === 'text' ? (
                                <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full bg-secondary">
                                    <h3 className="font-headline text-2xl">{item.title}</h3>
                                    <p className="mt-2 text-muted-foreground">{item.content}</p>
                                    <Button variant="link" className="mt-4">{item.buttonLabel}</Button>
                                </CardContent>
                           ) : (
                               <div className="aspect-[4/5] relative">
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
