
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { JournalEntry } from "@/lib/types";

interface JournalProps {
    title: string;
    entries: JournalEntry[];
}

export function Journal({ title, entries }: JournalProps) {
    if (!entries) {
        return null;
    }

    return (
         <section className="bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-headline text-center mb-8">{title}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {entries.map((entry, index) => (
                        <Link key={index} href={entry.link} className="group">
                             <Card className="overflow-hidden h-full border-none shadow-none rounded-lg">
                                <CardContent className="p-0">
                                    <div className="aspect-video relative">
                                        <Image
                                            src={entry.imageUrl}
                                            alt={entry.imageHint}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint={entry.imageHint}
                                        />
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="font-semibold text-xl font-headline">{entry.title}</h3>
                                        <p className="text-muted-foreground text-sm mt-2">{entry.excerpt}</p>
                                    </div>
                                </CardContent>
                             </Card>
                        </Link>
                    ))}
                 </div>
                 <div className="text-center mt-8">
                    <Button variant="outline" asChild>
                        <Link href="/blog">View All Posts <ArrowRight className="ml-2" /></Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
