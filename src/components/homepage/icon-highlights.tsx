
import { Gem, Gift, Heart, Circle, ShoppingBag } from 'lucide-react';

const highlights = [
    { name: 'Earrings', icon: <Circle className="w-8 h-8" /> },
    { name: 'Necklaces', icon: <Heart className="w-8 h-8" /> },
    { name: 'Bracelets', icon: <Gem className="w-8 h-8" /> },
    { name: 'Rings', icon: <Circle className="w-8 h-8" /> },
    { name: 'Gifting', icon: <Gift className="w-8 h-8" /> },
];

export function IconHighlights() {
    return (
        <section className="bg-background py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-around items-center">
                    {highlights.map((highlight, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 text-center text-muted-foreground hover:text-primary transition-colors">
                           {highlight.icon}
                            <span className="text-sm font-medium">{highlight.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
