
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface InstagramProps {
    handle: string;
    postImageUrls: string[];
}

export function Instagram({ handle, postImageUrls }: InstagramProps) {
    if (!postImageUrls || postImageUrls.length === 0) return null;

    return (
        <section className="bg-secondary py-12 md:py-20">
            <div className="container mx-auto text-center">
                 <h2 className="text-3xl font-headline text-center mb-2">Join Our Instagram</h2>
                 <p className="text-muted-foreground mb-8">{handle}</p>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {postImageUrls.map((imageUrl, index) => (
                        <Link key={index} href="#" className="group">
                             <div className="aspect-square relative overflow-hidden rounded-lg">
                                <Image
                                    src={imageUrl}
                                    alt={`Instagram post ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint="instagram lifestyle"
                                />
                             </div>
                        </Link>
                    ))}
                 </div>
                  <Button asChild className="mt-8">
                    <Link href="#">Follow Us</Link>
                </Button>
            </div>
        </section>
    );
}
