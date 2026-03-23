

interface TextHighlight {
    title: string;
    description: string;
}

interface TextHighlightsProps {
    items: TextHighlight[];
}

export function TextHighlights({ items }: TextHighlightsProps) {
    return (
        <section className="bg-stone-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {items.map((highlight, index) => (
                        <div key={index} className="text-center">
                            <h3 className="font-semibold text-lg">{highlight.title}</h3>
                            <p className="text-muted-foreground mt-1">{highlight.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
