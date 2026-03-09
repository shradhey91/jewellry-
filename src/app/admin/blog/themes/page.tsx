

import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paintbrush } from "lucide-react";

const themes = [
    {
        name: 'Classic',
        description: 'A timeless, clean, and professional layout perfect for formal articles and announcements. Features a prominent featured image and centered, readable content.',
        tags: ['Professional', 'Readable', 'Clean'],
    },
    {
        name: 'Magazine',
        description: 'A dynamic, visually-driven layout with a bold, full-width featured image acting as a hero. Ideal for feature stories and high-impact content.',
        tags: ['Visual', 'Dynamic', 'Modern'],
    },
    {
        name: 'Minimalist',
        description: 'A serene and simple layout with a focus on typography and whitespace. Perfect for personal essays and distraction-free reading, with a more subtle use of imagery.',
        tags: ['Simple', 'Elegant', 'Typographic'],
    }
];

export default function BlogThemesPage() {
    // In a real application, a 'Save' action would likely save to a configuration file or database.
    // For this prototype, the themes are defined in the code, so the save action is a placeholder.
    async function saveThemesAction() {
        'use server';
        console.log("Saving themes (mock action)...");
        // In a real implementation, you might revalidate paths or update a config file here.
    }

    return (
        <div className="container mx-auto py-2">
            <PageHeader
                title="Blog Themes"
                description="Manage the visual appearance of your blog posts."
            />
            <form action={saveThemesAction}>
                <Card>
                    <CardHeader>
                        <CardTitle>Available Themes</CardTitle>
                        <CardDescription>
                            These themes control the layout and styling of your articles on the website. You can select a theme when editing a post.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {themes.map(theme => (
                            <div key={theme.name} className="border rounded-lg p-6 flex flex-col">
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Paintbrush className="h-5 w-5 text-primary" />
                                        {theme.name}
                                    </h3>
                                    <p className="text-muted-foreground mt-2 text-sm">{theme.description}</p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {theme.tags.map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Save All Themes</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
