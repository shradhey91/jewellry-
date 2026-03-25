
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Video } from "lucide-react";
import type { HomepageContent, DiamondGuideContent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useSiteLogo } from "@/hooks/use-site-logo";
import { useFavicon } from "@/hooks/use-favicon";
import { Input } from "@/components/ui/input";

import { getUploadedMedia, deleteFileAction, uploadFileAction } from "@/lib/server/actions/media";
import type { MediaFile } from "@/lib/server/actions/media";
import Link from "next/link";


function UnifiedMediaLibrary() {
  const [mediaItems, setMediaItems] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadMedia = async () => {
    setLoading(true);
    const files = await getUploadedMedia();
    setMediaItems(files);
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleDelete = async (fileUrl: string) => {
    const result = await deleteFileAction(fileUrl);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
    if (result.success) {
      loadMedia();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadFileAction(formData);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
    if (result.success) {
      loadMedia();
    }
    // Clear file input
    e.target.value = "";
  }
  
  if (loading) {
     return <div className="text-center py-16">Loading media...</div>
  }
  
  const hasMedia = mediaItems.length > 0;

  return (
    <div>
        <div className="mb-4">
             <Button asChild variant="outline" className="relative">
                <div>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Media
                    <Input 
                        type="file" 
                        accept="image/*,video/mp4,video/webm"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {mediaItems.map((media) => (
            <Card key={media.url} className="overflow-hidden group relative">
                <div className="aspect-square relative bg-muted">
                    {media.type === 'video' ? (
                        <video src={media.url} className="h-full w-full object-cover" muted loop playsInline />
                    ) : (
                        <Image
                            src={media.url}
                            alt={media.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />
                    )}
                     {media.type === 'video' && (
                        <div className="absolute top-2 left-2 bg-background/80 text-foreground rounded-full p-1 shadow">
                            <Video className="h-3 w-3" />
                        </div>
                    )}
                </div>
                <div className="p-2 text-xs border-t">
                    <p className="font-medium truncate">{media.name}</p>
                </div>
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(media.url)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete media</span>
                </Button>
            </Card>
        ))}

        {!hasMedia && !loading && (
                <div className="col-span-full text-center py-16 border rounded-lg">
                    <h3 className="text-xl font-semibold">No Media Found</h3>
                    <p className="text-muted-foreground mt-2">
                    Use the upload button to add images and videos to your library.
                    </p>
                </div>
            )}
        </div>
    </div>
  );
}

interface WebsiteImage {
    id: string;
    url: string;
    hint: string;
    source: string; // e.g. "Homepage Hero", "Testimonial"
}

export function WebsiteImages({ homepageContent, mobileHomepageContent, diamondGuideContent }: { homepageContent: HomepageContent, mobileHomepageContent: HomepageContent, diamondGuideContent: DiamondGuideContent }) {
  const { siteLogoUrl, removeSiteLogo } = useSiteLogo();
  const { currentFaviconUrl, removeFavicon } = useFavicon();
  const { toast } = useToast();
  const [websiteImages, setWebsiteImages] = useState<WebsiteImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadWebsiteImages() {
        setLoading(true);
        
        const images: WebsiteImage[] = [];
        const seenUrls = new Set<string>();

        const addImage = (id: string, url: string, hint: string, source: string) => {
            if (url && !seenUrls.has(url)) {
                images.push({ id, url, hint, source });
                seenUrls.add(url);
            }
        };

        // Desktop Content
        addImage('hero-fallback', homepageContent.hero.fallbackImageUrl, "Hero Fallback", "Homepage");
        homepageContent.iconHighlights.items.forEach(item => addImage(item.id, item.imageUrl, item.imageHint, "Icon Highlight"));
        homepageContent.heroSlider.items.forEach(item => addImage(item.id, item.imageUrl, item.imageHint, "Hero Slider"));
        addImage('banner1', homepageContent.imageBanner1.imageUrl, homepageContent.imageBanner1.imageHint, "Image Banner 1");
        addImage('banner2', homepageContent.imageBanner2.imageUrl, homepageContent.imageBanner2.imageHint, "Image Banner 2");
        homepageContent.shopByCategory.categories.forEach(item => addImage(item.id, item.imageUrl, item.imageHint, "Shop by Category"));
        homepageContent.testimonials.items.forEach(item => addImage(item.id, item.imageUrl, item.imageHint, `Testimonial: ${item.name}`));
        homepageContent.journal.entries.forEach(item => addImage(item.id, item.imageUrl, item.imageHint, `Journal: ${item.title}`));
        
        // Mobile Content (only add if different from desktop)
        addImage('mobile-hero-fallback', mobileHomepageContent.hero.fallbackImageUrl, "Hero Fallback", "Mobile Homepage");
        mobileHomepageContent.heroSlider.items.forEach(item => addImage(`mobile-${item.id}`, item.imageUrl, item.imageHint, "Mobile Hero Slider"));

        // Diamond Guide Content
        addImage('diamond-hero', diamondGuideContent.hero.imageUrl, diamondGuideContent.hero.imageHint, "Diamond Guide Hero");
        diamondGuideContent.fourCs.items.forEach((item, i) => addImage(`diamond-4c-${i}`, item.imageUrl, item.imageHint, `4Cs: ${item.title}`));
        diamondGuideContent.shapes.items.forEach((item, i) => addImage(`diamond-shape-${i}`, item.imageUrl, item.imageHint, `Shape: ${item.name}`));
        addImage('diamond-anatomy', diamondGuideContent.anatomy.imageUrl, diamondGuideContent.anatomy.imageHint, "Diamond Anatomy");

        setWebsiteImages(images);
        setLoading(false);
    }
    loadWebsiteImages();
  }, [homepageContent, mobileHomepageContent, diamondGuideContent]);

  const handleLogoDelete = () => {
    removeSiteLogo();
    toast({ title: "Site Logo Removed", description: "The site logo has been cleared." });
  };

  const handleFaviconDelete = () => {
    removeFavicon();
    toast({ title: "Favicon Removed", description: "The favicon has been removed." });
  };

  if (loading) {
     return <div className="text-center py-16">Loading images...</div>
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Site Identity</CardTitle>
          <CardDescription>View your site's logo and favicon. Upload new versions in Settings.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {siteLogoUrl && (
                <Card className="overflow-hidden group relative">
                    <div className="aspect-square relative">
                        <Image src={siteLogoUrl} alt="Current Site Logo" fill className="object-contain p-4" sizes="20vw" />
                    </div>
                    <div className="p-2 text-xs border-t"><p className="font-medium truncate">Site Logo</p></div>
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={handleLogoDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </Card>
            )}
            {currentFaviconUrl && (
                <Card className="overflow-hidden group relative">
                    <div className="aspect-square relative">
                        <Image src={currentFaviconUrl} alt="Current Favicon" fill className="object-contain p-4" sizes="20vw" />
                    </div>
                    <div className="p-2 text-xs border-t"><p className="font-medium truncate">Favicon</p></div>
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={handleFaviconDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </Card>
            )}
            {!siteLogoUrl && !currentFaviconUrl && <PlaceholderTab title="No Site Identity Images" description="Upload a logo and favicon in Settings." />}
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Homepage & Content Images</CardTitle>
          <CardDescription>Images used across your website's pages and sections.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {websiteImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden group relative">
                        <div className="aspect-square relative">
                            <Image src={image.url} alt={image.hint} fill className="object-cover" sizes="20vw" />
                        </div>
                        <div className="p-2 text-xs border-t">
                            <p className="font-medium truncate">{image.source}</p>
                            <p className="text-muted-foreground truncate">{image.hint}</p>
                        </div>
                    </Card>
                ))}
                {websiteImages.length === 0 && <div className="col-span-full"><PlaceholderTab title="No Website Images" description="Images from your homepage will appear here." /></div>}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}


function PlaceholderTab({ title, description }: { title: string; description: string; }) {
    return (
        <div className="text-center py-16 border rounded-lg">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-2">{description}</p>
        </div>
    )
}

interface MediaTabsProps {
    homepageContent: HomepageContent;
    mobileHomepageContent: HomepageContent;
    diamondGuideContent: DiamondGuideContent;
}

export function MediaTabs({ homepageContent, mobileHomepageContent, diamondGuideContent }: MediaTabsProps) {
  return (
      <Tabs defaultValue="media-library">
        <TabsList className="mb-4">
          <TabsTrigger value="media-library">Media Library</TabsTrigger>
          <TabsTrigger value="website">Website Images</TabsTrigger>
          <TabsTrigger value="blog">Blog Images</TabsTrigger>
        </TabsList>
        <TabsContent value="media-library">
            <Card>
                <CardHeader>
                    <CardTitle>Media Library</CardTitle>
                    <CardDescription>Manage all images and videos for your products.</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <UnifiedMediaLibrary />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="website">
            <WebsiteImages 
                homepageContent={homepageContent}
                mobileHomepageContent={mobileHomepageContent}
                diamondGuideContent={diamondGuideContent}
            />
        </TabsContent>
        <TabsContent value="blog">
             <Card>
                <CardContent className="p-4">
                    <PlaceholderTab title="No Blog Images Found" description="Images from your blog posts will appear here." />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
  );
}

    