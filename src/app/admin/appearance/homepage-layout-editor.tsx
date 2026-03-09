
"use client";

import { useState } from 'react';
import type { HomepageContent, HomepageSection, SectionType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { saveAppearanceAction, saveMobileAppearanceAction } from './actions';
import { useToast } from '@/hooks/use-toast.tsx';
import { useFormStatus } from 'react-dom';

const sectionNames: Record<SectionType, string> = {
    hero: 'Hero',
    iconHighlights: 'Icon Highlights',
    heroSlider: 'Hero Slider',
    videoHighlights: 'Video Highlights',
    newestProducts: 'Newest Products Carousel',
    imageBanner1: 'Image Banner 1',
    shopByCategory: 'Shop by Category',
    bestSellers: 'Best Sellers Carousel',
    imageBanner2: 'Image Banner 2',
    testimonials: 'Testimonials',
    journal: 'Journal',
    promoBanners: 'Promo Banners',
    videoSection: 'Video Section',
};

interface HomepageLayoutEditorProps {
    content: HomepageContent;
    isMobile?: boolean;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Layout"}</Button>;
}

export function HomepageLayoutEditor({ content: initialContent, isMobile = false }: HomepageLayoutEditorProps) {
    const [layout, setLayout] = useState<HomepageSection[]>(initialContent.layout || []);
    const { toast } = useToast();

    const handleVisibilityChange = (sectionId: string, visible: boolean) => {
        setLayout(current => current.map(s => s.id === sectionId ? { ...s, visible } : s));
    };

    const formAction = async (formData: FormData) => {
        const fullFormData = new FormData();
        fullFormData.append('layout', JSON.stringify(layout));

        const action = isMobile ? saveMobileAppearanceAction : saveAppearanceAction;

        const result = await action({ message: "", errors: {} }, fullFormData);
        if (result.message) {
            toast({
                title: result.errors ? "Error" : "Success",
                description: result.message,
                variant: result.errors ? "destructive" : "default",
            });
        }
    };

    return (
        <form action={formAction}>
            <Card>
                <CardHeader>
                    <CardTitle>{isMobile ? 'Mobile ' : ''}Homepage Layout</CardTitle>
                    <CardDescription>
                        Manage the sections on your {isMobile ? 'mobile ' : ''}homepage. Drag to reorder.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {layout.map((section) => (
                        <div key={section.id} className="flex items-center justify-between rounded-lg border p-4 bg-muted/40">
                             <div className="flex items-center gap-3">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <p className="font-medium">{sectionNames[section.type]}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    {section.visible ? 'Visible' : 'Hidden'}
                                </span>
                                <Switch
                                    checked={section.visible}
                                    onCheckedChange={(checked) => handleVisibilityChange(section.id, checked)}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                     <SubmitButton />
                </CardFooter>
            </Card>
        </form>
    );
}
