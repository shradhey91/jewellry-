
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { ShopByCategoryItem } from "@/lib/types";

interface ShopByCategoryProps {
    categories: ShopByCategoryItem[];
}

export function ShopByCategory({ categories }: ShopByCategoryProps) {
    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section className="bg-secondary/50">
            <div className="container mx-auto py-12 md:py-16">
                <h2 className="text-3xl font-headline text-center mb-8">Shop by Category</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link key={category.name} href={category.link} className="group relative block">
                            <div className="aspect-[4/5] relative overflow-hidden rounded-lg">
                                <Image
                                    src={category.imageUrl}
                                    alt={category.imageHint}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={category.imageHint}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6">
                                    <h3 className="text-2xl font-semibold text-white font-headline">{category.name}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                 </div>
                 <div className="text-center mt-8">
                    <Button variant="outline" asChild>
                        <Link href="/shop">View All Categories <ArrowRight className="ml-2" /></Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
