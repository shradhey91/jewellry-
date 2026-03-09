

"use client";

import React, { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveMobileAppearanceAction, type AppearanceFormState } from "./actions";
import type { HomepageContent, HeroSliderItem, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast.tsx";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { VideoSelectorDialog } from "@/components/admin/media/video-selector-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, Trash2, Upload, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadFileAction } from "@/lib/server/actions/media";


interface MobileAppearanceFormProps {
  content: HomepageContent;
  categories: Category[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Changes"}</Button>;
}

const ImageEditor: React.FC<{ 
    id: string; 
    label: string; 
    defaultUrl: string; 
    defaultHint: string; 
    hint: string; 
    size?: 'small' | 'default';
    onImageChange: (fieldId: string, value: string) => void;
}> = ({ id, label, defaultUrl, defaultHint, hint, size = 'default', onImageChange }) => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             if (file.size > 2 * 1024 * 1024) { // 2MB size limit
                toast({ title: "File too large", description: "Please select an image smaller than 2MB.", variant: "destructive" });
                return;
            }
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('subfolder', 'themes/default');

            const result = await uploadFileAction(formData);

            if (result.success && result.url) {
                onImageChange(`imageUrl-${id}`, result.url);
                toast({ title: "Upload successful", description: "Image has been uploaded." });
            } else {
                toast({ title: "Upload failed", description: result.message, variant: "destructive" });
            }
            setIsUploading(false);
            e.target.value = "";
        }
    };
    
    return (
    <div className="space-y-4 rounded-lg border p-4">
        <Label className="font-semibold">{label}</Label>
        <div className={size === 'small' ? 'space-y-4' : "grid grid-cols-1 md:grid-cols-3 gap-6 items-start"}>
            <div className={size === 'small' ? 'w-24' : "md:col-span-1"}>
                <div className="aspect-square relative rounded-md overflow-hidden border">
                    <Image
                      src={defaultUrl}
                      alt={defaultHint}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                </div>
            </div>
            <div className={size === 'small' ? 'space-y-4' : "md:col-span-2 space-y-4"}>
                <div className="space-y-2">
                    <Label htmlFor={`imageUrl-${id}`}>Image</Label>
                    <div className="flex items-center gap-2">
                        <Input
                          id={`imageUrl-${id}`}
                          name={`imageUrl-${id}`}
                          value={defaultUrl}
                          onChange={(e) => onImageChange(`imageUrl-${id}`, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                         <Button asChild variant="outline" className="relative" disabled={isUploading}>
                            <div>
                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Upload
                                <Input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isUploading}
                                />
                            </div>
                          </Button>
                    </div>
                     <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`imageHint-${id}`}>Image Hint (for AI)</Label>
                    <Input
                      id={`imageHint-${id}`}
                      name={`imageHint-${id}`}
                      value={defaultHint || ''}
                      placeholder="e.g., dark moody jewelry"
                      onChange={(e) => onImageChange(`imageHint-${id}`, e.target.value)}
                    />
                     <p className="text-xs text-muted-foreground">
                        Provide one or two keywords to describe the image.
                    </p>
                </div>
            </div>
        </div>
    </div>
)};

export function MobileAppearanceForm({ content: initialContent, categories }: MobileAppearanceFormProps) {
  const [content, setContent] = useState(initialContent);
  const initialState: AppearanceFormState = { message: "", errors: {} };
  const [state, formAction] = useFormState(saveMobileAppearanceAction, initialState);
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState(content.hero.videoUrl);
  const [heroSlides, setHeroSlides] = useState<HeroSliderItem[]>(content.heroSlider.items);
  const [showIconText, setShowIconText] = useState(content.iconHighlights.showText ?? true);
  const [videoEnabled, setVideoEnabled] = useState(content.hero.videoEnabled ?? true);
  
  const handleImageChange = (fieldId: string, value: string) => {
    const parts = fieldId.split('-');
    const type = parts[0]; // imageUrl or imageHint
    const key = parts[1]; // hero, icon, etc
    const id = parts.slice(2).join('-');
    const fieldToUpdate = type === 'imageUrl' ? 'imageUrl' : 'imageHint';

    if (key === 'hero' && id === 'fallback') {
        const heroField = type === 'imageUrl' ? 'fallbackImageUrl' : 'fallbackImageHint';
        setContent(prev => ({ ...prev, hero: { ...prev.hero, [heroField]: value }}));
    } else if (key === 'banner' && id === 'diamonds') {
        setContent(prev => ({ ...prev, imageBanner1: { ...prev.imageBanner1, [fieldToUpdate]: value }}));
    } else if (key === 'banner' && id === 'gifting') {
        setContent(prev => ({ ...prev, imageBanner2: { ...prev.imageBanner2, [fieldToUpdate]: value }}));
    } else if (key === 'icon') {
        setContent(prev => ({...prev, iconHighlights: {...prev.iconHighlights, items: prev.iconHighlights.items.map(i => i.id === id ? {...i, [fieldToUpdate]: value} : i)}}));
    } else if (key === 'category') {
        setContent(prev => ({...prev, shopByCategory: {...prev.shopByCategory, categories: prev.shopByCategory.categories.map(c => c.id === id ? {...c, [fieldToUpdate]: value} : c)}}));
    } else if (key === 'testimonial') {
        setContent(prev => ({...prev, testimonials: {...prev.testimonials, items: prev.testimonials.items.map(t => t.id === id ? {...t, [fieldToUpdate]: value} : t)}}));
    } else if (key === 'journal') {
        setContent(prev => ({...prev, journal: {...prev.journal, entries: prev.journal.entries.map(e => e.id === id ? {...e, [fieldToUpdate]: value} : e)}}));
    } else if(key === 'heroSlider') {
        setHeroSlides(prev => prev.map(s => s.id === id ? {...s, [fieldToUpdate]: value} : s));
    }
  };

  const handleVideoSelect = (url: string) => {
    setVideoUrl(url);
  }

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors ? "Error" : "Success",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
    }
  }, [state, toast]);

  const addSlide = () => {
    const newSlide: HeroSliderItem = {
      id: `new-${Date.now()}`,
      title: 'New Slide Title',
      subtitle: 'A compelling subtitle for your new slide.',
      ctaText: 'Shop Now',
      ctaLink: '/',
      imageUrl: 'https://picsum.photos/seed/new-slide-mobile/1200/600',
      imageHint: 'placeholder'
    };
    setHeroSlides(prev => [...prev, newSlide]);
  };
  
  const removeSlide = (id: string) => {
    setHeroSlides(prev => prev.filter(slide => slide.id !== id));
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="hero-videoUrl" value={videoUrl} />
      <input type="hidden" name="heroSliderItems" value={JSON.stringify(heroSlides)} />
      
      {/* Hidden inputs for dynamically updated images */}
      <input type="hidden" name="imageUrl-hero-fallback" value={content.hero.fallbackImageUrl} />
      <input type="hidden" name="imageHint-hero-fallback" value={content.hero.fallbackImageHint || ''} />
      
      {content.iconHighlights.items.map((item) => (
        <React.Fragment key={item.id}>
          <input type="hidden" name={`imageUrl-icon-${item.id}`} value={item.imageUrl} />
          <input type="hidden" name={`imageHint-icon-${item.id}`} value={item.imageHint} />
        </React.Fragment>
      ))}
      
      {content.shopByCategory.categories.map((cat) => (
        <React.Fragment key={cat.id}>
          <input type="hidden" name={`imageUrl-category-${cat.id}`} value={cat.imageUrl} />
          <input type="hidden" name={`imageHint-category-${cat.id}`} value={cat.imageHint} />
        </React.Fragment>
      ))}
      
      {content.testimonials.items.map((item) => (
        <React.Fragment key={item.id}>
          <input type="hidden" name={`imageUrl-testimonial-${item.id}`} value={item.imageUrl} />
          <input type="hidden" name={`imageHint-testimonial-${item.id}`} value={item.imageHint} />
        </React.Fragment>
      ))}
      
      {content.journal.entries.map((entry) => (
        <React.Fragment key={entry.id}>
          <input type="hidden" name={`imageUrl-journal-${entry.id}`} value={entry.imageUrl} />
          <input type="hidden" name={`imageHint-journal-${entry.id}`} value={entry.imageHint} />
        </React.Fragment>
      ))}
      
      <input type="hidden" name="imageUrl-banner-diamonds" value={content.imageBanner1.imageUrl} />
      <input type="hidden" name="imageHint-banner-diamonds" value={content.imageBanner1.imageHint} />
      
      <input type="hidden" name="imageUrl-banner-gifting" value={content.imageBanner2.imageUrl} />
      <input type="hidden" name="imageHint-banner-gifting" value={content.imageBanner2.imageHint} />
      
        <div className="space-y-6">
            <Accordion type="single" collapsible defaultValue="hero" className="w-full space-y-4">
              <AccordionItem value="hero">
                <Card>
                  <AccordionTrigger className="p-6 w-full">
                      <CardHeader className="p-0 text-left">
                        <CardTitle>Hero Section</CardTitle>
                        <CardDescription>The main section at the top of your mobile homepage.</CardDescription>
                      </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                          <Label htmlFor="hero-title">Top Text Line</Label>
                          <Input id="hero-title" name="hero-title" defaultValue={content.hero.title} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="hero-titleHighlight">Large Highlight Text</Label>
                          <Input id="hero-titleHighlight" name="hero-titleHighlight" defaultValue={content.hero.titleHighlight} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="hero-subtitle">Subtitle</Label>
                          <Input id="hero-subtitle" name="hero-subtitle" defaultValue={content.hero.subtitle} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="hero-ctaText">CTA Button Text</Label>
                          <Input id="hero-ctaText" name="hero-ctaText" defaultValue={content.hero.ctaText} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="hero-ctaLink">CTA Button Link</Label>
                          <Input id="hero-ctaLink" name="hero-ctaLink" defaultValue={content.hero.ctaLink} />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="hero-videoEnabled" className="text-base">Background Video</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable to play a video in the hero background.
                            </p>
                        </div>
                        <Switch id="hero-videoEnabled" name="hero-videoEnabled" checked={videoEnabled} onCheckedChange={setVideoEnabled} />
                      </div>
                      <div className="space-y-2">
                          <Label>Background Video URL</Label>
                          <div className="p-4 border rounded-lg">
                            {videoUrl && <video key={videoUrl} className="w-full rounded" controls src={videoUrl} />}
                            <div className="flex items-center gap-2 mt-2">
                                <Input value={videoUrl || ""} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Enter video URL" />
                                <VideoSelectorDialog onSelect={handleVideoSelect} />
                              </div>
                          </div>
                      </div>
                      <ImageEditor id="hero-fallback" label="Video Fallback Image" defaultUrl={content.hero.fallbackImageUrl} defaultHint={content.hero.fallbackImageHint || 'jewelry model'} hint="Displayed if the video fails to load or is disabled." onImageChange={handleImageChange} />
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              <AccordionItem value="icon-highlights">
                <Card>
                  <AccordionTrigger className="p-6 w-full">
                    <CardHeader className="p-0 text-left">
                      <CardTitle>Icon Highlights</CardTitle>
                      <CardDescription>The icon strip below the hero section.</CardDescription>
                    </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="iconHighlights-showText" className="text-base">Show Text Labels</Label>
                            <p className="text-sm text-muted-foreground">
                                Display the text labels below the icons.
                            </p>
                        </div>
                        <Switch id="iconHighlights-showText" name="iconHighlights-showText" checked={showIconText} onCheckedChange={setShowIconText} />
                      </div>
                      {content.iconHighlights.items.map((item, index) => (
                        <div key={item.id} className="p-4 border rounded-lg space-y-4">
                          <h4 className="font-semibold">Highlight {index + 1}</h4>
                           <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`icon-${index}-name`}>Name</Label>
                              <Input id={`icon-${index}-name`} name={`icon-${index}-name`} defaultValue={item.name} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`icon-${index}-link`}>Link</Label>
                              <Input id={`icon-${index}-link`} name={`icon-${index}-link`} defaultValue={item.link} />
                            </div>
                          </div>
                          <ImageEditor 
                            id={`icon-${item.id}`}
                            label="Highlight Icon"
                            defaultUrl={item.imageUrl}
                            defaultHint={item.imageHint}
                            hint="Recommended size: 96x96px (1:1 aspect ratio)."
                            size="small"
                            onImageChange={handleImageChange}
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
              
              <AccordionItem value="hero-slider">
                <Card>
                  <AccordionTrigger className="p-6 w-full">
                      <CardHeader className="p-0 text-left">
                        <CardTitle>Hero Slider</CardTitle>
                        <CardDescription>An auto-playing carousel of promotional slides.</CardDescription>
                      </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6">
                          {heroSlides.map((item, index) => (
                              <div key={item.id} className="p-4 border rounded-lg space-y-4 relative">
                                <h4 className="font-semibold">Slide {index + 1}</h4>
                                <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeSlide(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="space-y-2">
                                    <Label htmlFor={`heroSlider-${item.id}-title`}>Title</Label>
                                    <Input id={`heroSlider-${item.id}-title`} name={`heroSlider-${item.id}-title`} defaultValue={item.title} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`heroSlider-${item.id}-subtitle`}>Subtitle</Label>
                                    <Textarea id={`heroSlider-${item.id}-subtitle`} name={`heroSlider-${item.id}-subtitle`} defaultValue={item.subtitle} />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <Label htmlFor={`heroSlider-${item.id}-ctaText`}>CTA Button Text</Label>
                                      <Input id={`heroSlider-${item.id}-ctaText`} name={`heroSlider-${item.id}-ctaText`} defaultValue={item.ctaText} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor={`heroSlider-${item.id}-ctaLink`}>CTA Button Link</Label>
                                      <Input id={`heroSlider-${item.id}-ctaLink`} name={`heroSlider-${item.id}-ctaLink`} defaultValue={item.ctaLink} />
                                  </div>
                                </div>
                                <ImageEditor id={`heroSlider-${item.id}`} label="Background Image" defaultUrl={item.imageUrl} defaultHint={item.imageHint} hint="Image for this slide." onImageChange={handleImageChange} />
                              </div>
                          ))}
                          <Button type="button" variant="outline" onClick={addSlide}>
                            <PlusCircle className="mr-2" /> Add Slide
                          </Button>
                      </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              <AccordionItem value="carousels">
                <Card>
                  <AccordionTrigger className="p-6 w-full">
                      <CardHeader className="p-0 text-left">
                        <CardTitle>Product Carousels</CardTitle>
                        <CardDescription>Carousels for 'Newest In' and 'Best Sellers'.</CardDescription>
                      </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4 border p-4 rounded-lg">
                        <h4 className="font-semibold">Newest In</h4>
                        <div className="space-y-2">
                          <Label htmlFor="newest-title">Section Title</Label>
                          <Input id="newest-title" name="newest-title" defaultValue={content.newestProducts.title} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newest-categoryId">Category</Label>
                          <Select name="newest-categoryId" defaultValue={content.newestProducts.categoryId ?? 'all'}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Products</SelectItem>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4 border p-4 rounded-lg">
                        <h4 className="font-semibold">Best Sellers</h4>
                        <div className="space-y-2">
                          <Label htmlFor="bestsellers-title">Section Title</Label>
                          <Input id="bestsellers-title" name="bestsellers-title" defaultValue={content.bestSellers.title} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bestsellers-categoryId">Category</Label>
                          <Select name="bestsellers-categoryId" defaultValue={content.bestSellers.categoryId ?? 'all'}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Products</SelectItem>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
              
              <AccordionItem value="banners">
                <Card>
                  <AccordionTrigger className="p-6 w-full">
                      <CardHeader className="p-0 text-left">
                        <CardTitle>Image Banners</CardTitle>
                        <CardDescription>Full-width banners to highlight collections.</CardDescription>
                      </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6">
                          <div className="p-4 border rounded-lg space-y-4">
                              <h4 className="font-semibold">Banner 1 (Everyday Diamonds)</h4>
                              <div className="space-y-2">
                                  <Label htmlFor="banner1-title">Title</Label>
                                  <Input id="banner1-title" name="banner1-title" defaultValue={content.imageBanner1.title} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="banner1-subtitle">Subtitle</Label>
                                  <Input id="banner1-subtitle" name="banner1-subtitle" defaultValue={content.imageBanner1.subtitle} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="banner1-ctaText">CTA Button Text</Label>
                                  <Input id="banner1-ctaText" name="banner1-ctaText" defaultValue={content.imageBanner1.ctaText} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="banner1-ctaLink">CTA Button Link</Label>
                                  <Input id="banner1-ctaLink" name="banner1-ctaLink" defaultValue={content.imageBanner1.ctaLink} />
                              </div>
                              <ImageEditor id="banner-diamonds" label="Banner Image" defaultUrl={content.imageBanner1.imageUrl} defaultHint={content.imageBanner1.imageHint} hint="Image for the first banner." onImageChange={handleImageChange} />
                          </div>
                          <div className="p-4 border rounded-lg space-y-4">
                              <h4 className="font-semibold">Banner 2 (Gifting Season)</h4>
                              <div className="space-y-2">
                                  <Label htmlFor="banner2-title">Title</Label>
                                  <Input id="banner2-title" name="banner2-title" defaultValue={content.imageBanner2.title} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="banner2-subtitle">Subtitle</Label>
                                  <Input id="banner2-subtitle" name="banner2-subtitle" defaultValue={content.imageBanner2.subtitle} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="banner2-ctaText">CTA Button Text</Label>
                                  <Input id="banner2-ctaText" name="banner2-ctaText" defaultValue={content.imageBanner2.ctaText} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="banner2-ctaLink">CTA Button Link</Label>
                                  <Input id="banner2-ctaLink" name="banner2-ctaLink" defaultValue={content.imageBanner2.ctaLink} />
                              </div>
                              <ImageEditor id="banner-gifting" label="Banner Image" defaultUrl={content.imageBanner2.imageUrl} defaultHint={content.imageBanner2.imageHint} hint="Image for the second banner." onImageChange={handleImageChange} />
                          </div>
                      </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              <AccordionItem value="categories">
                <Card>
                  <AccordionTrigger className="p-6 w-full">
                      <CardHeader className="p-0 text-left">
                        <CardTitle>Shop By Category</CardTitle>
                        <CardDescription>Image grid for category navigation.</CardDescription>
                      </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {content.shopByCategory.categories.map((category, index) => (
                              <div key={`category-${index}`} className="space-y-4 border p-4 rounded-lg">
                                <h4 className="font-semibold">Category {index + 1}</h4>
                                  <div className="space-y-2">
                                      <Label htmlFor={`category-${index}-name`}>Name</Label>
                                      <Input id={`category-${index}-name`} name={`category-${index}-name`} defaultValue={category.name} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor={`category-${index}-link`}>Link</Label>
                                      <Input id={`category-${index}-link`} name={`category-${index}-link`} defaultValue={category.link} />
                                  </div>
                                <ImageEditor id={`category-${category.id}`} label="Category Image" defaultUrl={category.imageUrl} defaultHint={category.imageHint} hint="Image for this category." onImageChange={handleImageChange} />
                              </div>
                          ))}
                      </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              <AccordionItem value="testimonials">
                <Card>
                  <AccordionTrigger className="p-6 w-full">
                      <CardHeader className="p-0 text-left">
                        <CardTitle>Testimonials</CardTitle>
                        <CardDescription>Content for the customer testimonials section.</CardDescription>
                      </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                      <div className="space-y-2">
                          <Label htmlFor="testimonials-title">Section Title</Label>
                          <Input id="testimonials-title" name="testimonials-title" defaultValue={content.testimonials.title} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                          {content.testimonials.items.map((testimonial, index) => (
                              <div key={`testimonial-${index}`} className="space-y-4 border p-4 rounded-lg">
                                  <h4 className="font-semibold">Testimonial {index + 1}</h4>
                                  <div className="space-y-2">
                                      <Label htmlFor={`testimonial-${index}-text`}>Text</Label>
                                      <Textarea id={`testimonial-${index}-text`} name={`testimonial-${index}-text`} defaultValue={testimonial.text} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor={`testimonial-${index}-name`}>Customer Name</Label>
                                      <Input id={`testimonial-${index}-name`} name={`testimonial-${index}-name`} defaultValue={testimonial.name} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor={`testimonial-${index}-location`}>Location</Label>
                                      <Input id={`testimonial-${index}-location`} name={`testimonial-${index}-location`} defaultValue={testimonial.location} />
                                  </div>
                                  <ImageEditor id={`testimonial-${testimonial.id}`} label="Customer Image" defaultUrl={testimonial.imageUrl} defaultHint={testimonial.imageHint} hint="Photo of the customer." onImageChange={handleImageChange} />
                              </div>
                          ))}
                      </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
              
              <AccordionItem value="journal">
                <Card>
                  <AccordionTrigger className="p-6 w-full">
                      <CardHeader className="p-0 text-left">
                        <CardTitle>Journal / Blog</CardTitle>
                        <CardDescription>Content for the homepage blog preview section.</CardDescription>
                      </CardHeader>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                      <div className="space-y-2">
                          <Label htmlFor="journal-title">Section Title</Label>
                          <Input id="journal-title" name="journal-title" defaultValue={content.journal.title} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                          {content.journal.entries.map((entry, index) => (
                              <div key={`journal-${index}`} className="space-y-4 border p-4 rounded-lg">
                                  <h4 className="font-semibold">Entry {index + 1}</h4>
                                  <div className="space-y-2">
                                      <Label htmlFor={`journal-${index}-title`}>Title</Label>
                                      <Input id={`journal-${index}-title`} name={`journal-${index}-title`} defaultValue={entry.title} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor={`journal-${index}-excerpt`}>Excerpt</Label>
                                      <Textarea id={`journal-${index}-excerpt`} name={`journal-${index}-excerpt`} defaultValue={entry.excerpt} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor={`journal-${index}-link`}>Link</Label>
                                      <Input id={`journal-${index}-link`} name={`journal-${index}-link`} defaultValue={entry.link} />
                                  </div>
                                  <ImageEditor id={`journal-${entry.id}`} label="Article Image" defaultUrl={entry.imageUrl} defaultHint={entry.imageHint} hint="Image for the journal entry." onImageChange={handleImageChange} />
                              </div>
                          ))}
                      </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
            <Card>
                <CardFooter className="p-6">
                    <SubmitButton />
                </CardFooter>
            </Card>
        </div>
    </form>
  );
}
