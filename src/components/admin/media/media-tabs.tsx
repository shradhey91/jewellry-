
"use client";

import { useState, useEffect } from "react";
import { getProducts, updateProductMedia } from "@/lib/server/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Product, ProductMedia, HomepageContent, DiamondGuideContent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast.tsx";
import { useSiteLogo } from "@/hooks/use-site-logo.tsx";
import { useFavicon } from "@/hooks/use-favicon.tsx";
import { VideoLibrary } from "@/components/admin/media/video-library";

type MediaWithProductInfo = ProductMedia & { productName: string; product_id: string };

function ProductImages() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaWithProductInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadMedia = async () => {
    setLoading(true);
    const fetchedProducts = await getProducts();
    setProducts(fetchedProducts);
    const allMedia = fetchedProducts.flatMap(p =>
      p.media.map(m => ({ ...m, productName: p.name, product_id: p.id }))
    ).sort((a,b) => b.sort_order - a.sort_order); 
    setMediaItems(allMedia);
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleDelete = async (mediaId: string, productId: string) => {
    const productToUpdate = products.find(p => p.id === productId);
    if (!productToUpdate) return;

    const updatedMedia = productToUpdate.media.filter(m => m.id !== mediaId);

    if (updatedMedia.length > 0 && !updatedMedia.some(m => m.is_primary)) {
      updatedMedia[0].is_primary = true;
    }
    
    try {
      await updateProductMedia(productId, updatedMedia);
      toast({ title: "Success", description: "Image deleted successfully." });
      await loadMedia();
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast({ title: "Error", description: "Could not delete image.", variant: "destructive" });
    }
  };
  
  if (loading) {
     return <div className="text-center py-16">Loading images...</div>
  }
  
  const hasMedia = mediaItems.length > 0;

  return (
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {mediaItems.map((media) => (
        <Card key={media.id} className="overflow-hidden group relative">
            <Link href={`/admin/products/${media.product_id}`}>
                <div className="aspect-square relative">
                    <Image
                        src={media.image_url}
                        alt={media.image_hint}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                </div>
                 <div className="p-2 text-xs border-t">
                    <p className="font-medium truncate">{media.productName}</p>
                    <p className="text-muted-foreground truncate">{media.image_hint}</p>
                </div>
            </Link>
            <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(media.id, media.product_id)}
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete image</span>
            </Button>
        </Card>
      ))}

       {!hasMedia && !loading && (
            <div className="col-span-full text-center py-16">
                <h3 className="text-xl font-semibold">No Product Images Found</h3>
                <p className="text-muted-foreground mt-2">
                Images for products will appear here. You can add them when editing a product.
                </p>
            </div>
        )}
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
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Product Images</TabsTrigger>
          <TabsTrigger value="website">Website Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="blog">Blog Images</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
            <Card>
                <CardContent className="p-4">
                    <ProductImages />
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
        <TabsContent value="videos">
            <Card>
                <CardHeader>
                    <CardTitle>Video Library</CardTitle>
                    <CardDescription>Manage videos for your website.</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <VideoLibrary />
                </CardContent>
            </Card>
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

    