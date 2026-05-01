'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product, ProductReview, Category, Metal, Purity } from '@/lib/types';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Gift, Truck, Share2, PlayCircle, Gem, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { PriceBreakupModal } from '../[id]/price-breakup-modal';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { AddToCartForm } from '@/components/cart/add-to-cart-form';
import { ProductCarousel } from '@/components/homepage/product-carousel';
import { WishlistButton } from '@/components/products/wishlist-button';
import { CompareButton } from '@/components/products/compare-button';
import { CustomerReviewForm } from '@/components/products/customer-review-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PincodeChecker } from '@/components/products/pincode-checker';

interface ThemeProps {
    product: Product;
    primaryCategory: Category | null;
    crossSellProducts: Product[];
    upsellProducts: Product[];
    reviews: ProductReview[];
    metal: Metal | undefined;
    purity: Purity | undefined;
}

function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Reviews Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Be the first to share your thoughts on this product.</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-8">
            {reviews.map(review => (
                <div key={review.id} className="flex gap-4">
                    <Avatar>
                        <AvatarFallback>{review.reviewer_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{review.reviewer_name}</p>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-primary fill-primary" : "text-muted-foreground/50")} />
                                ))}
                            </div>
                        </div>
                         <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(review.created_at), "MMMM d, yyyy")}
                        </p>
                        <p className="mt-2 text-foreground/80">{review.text}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function Theme2({ product, primaryCategory, crossSellProducts, upsellProducts, reviews, metal, purity }: ThemeProps) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0;
  const [activeMedia, setActiveMedia] = useState(product.media.find(m => m.is_primary) || product.media[0]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants.length > 0 ? product.variants[0].id : undefined
  );

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  const displayPrice = selectedVariant?.display_price ?? product.display_price;
  const priceBreakup = selectedVariant?.price_breakup ?? product.price_breakup;
  const grossWeight = selectedVariant?.gross_weight ?? product.gross_weight;
  const netWeight = selectedVariant?.net_weight ?? product.net_weight;

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {primaryCategory && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/category/${primaryCategory.id}`}>{primaryCategory.name}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left Column - Gallery */}
            <div className="sticky top-28 flex flex-col gap-2 md:gap-4">
                {/* Main image */}
                <div className="w-full">
                    <Card className="overflow-hidden group">
                        <div className="aspect-square w-full relative">
                        {activeMedia?.media_type === 'video' ? (
                            <video 
                                key={activeMedia.id}
                                src={activeMedia.url} 
                                className="h-full w-full object-cover" 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                            />
                        ) : (
                            <Image
                                key={activeMedia?.id}
                                src={activeMedia?.url || ''}
                                alt={activeMedia?.hint || 'Product image'}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 80vw, 40vw"
                                priority
                            />
                        )}
                        </div>
                    </Card>
                </div>
                {/* Thumbnails row */}
                <div className="grid grid-cols-5 gap-2">
                    {product.media.sort((a,b) => a.sort_order - b.sort_order).map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveMedia(item)}
                        className={cn(
                            "aspect-square w-full relative rounded-md overflow-hidden border-2 transition-all",
                            item.id === activeMedia.id ? "border-primary shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                    >
                        <Image
                            src={item.media_type === 'video' ? "https://uncommongoods.in/media/images/Gemini_Generated_Image_nwhgufnwhgufnwhg.png" : item.url}
                            alt={item.hint || 'Product thumbnail'}
                            fill
                            className="object-cover"
                            sizes="10vw"
                        />
                        {item.media_type === 'video' && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <PlayCircle className="h-6 w-6 text-white" />
                            </div>
                        )}
                    </button>
                    ))}
                </div>
            </div>
            
            {/* Right Column - Details */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold font-headline">{product.name}</h1>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>SKU: {product.id.toUpperCase()}</span>
                    </div>
                    {totalReviews > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                            <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("h-4 w-4", i < averageRating ? "text-primary fill-primary" : "text-muted-foreground/30")} />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground">({totalReviews} Reviews)</span>
                        </div>
                    )}
                </div>

                <Separator />
                
                <div>
                  <div className="flex items-baseline gap-4">
                      <p className="text-3xl font-bold text-foreground">
                          {formatCurrency(displayPrice)}
                      </p>
                       <span className="text-xs text-muted-foreground"> (Incl. of all taxes)</span>
                  </div>
                   <PriceBreakupModal priceBreakup={priceBreakup} finalPrice={displayPrice}>
                     <Button variant="link" className="p-0 h-auto text-sm text-foreground">View Price Breakup</Button>
                   </PriceBreakupModal>
                </div>

                <PincodeChecker />

                <AddToCartForm product={product} selectedVariantId={selectedVariantId} onVariantChange={setSelectedVariantId} showGiftOption={false} />

                <div className="flex items-center justify-start gap-2 text-sm">
                    <WishlistButton product={product} className="flex-1" />
                    <CompareButton product={product} className="flex-1" />
                     <Button variant="outline" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4"/> Share
                    </Button>
                </div>

                <Accordion type="single" collapsible defaultValue="details" className="w-full">
                    <AccordionItem value="details">
                        <AccordionTrigger>Product Details</AccordionTrigger>
                        <AccordionContent className="text-sm">
                           <div className="prose prose-sm max-w-none text-muted-foreground mb-6">
                              <p>{product.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                <span className="text-muted-foreground">Gross Weight</span><span className="font-medium text-right">{grossWeight}g</span>
                                <span className="text-muted-foreground">Net Weight</span><span className="font-medium text-right">{netWeight}g</span>
                                <span className="text-muted-foreground">Metal</span><span className="font-medium text-right">{metal?.name}</span>
                                <span className="text-muted-foreground">Purity</span><span className="font-medium text-right">{purity?.label}</span>
                                {product.height && <><span className="text-muted-foreground">Height</span><span className="font-medium text-right">{product.height} cm</span></>}
                                {product.width && <><span className="text-muted-foreground">Width</span><span className="font-medium text-right">{product.width} cm</span></>}
                                {product.length && <><span className="text-muted-foreground">Length</span><span className="font-medium text-right">{product.length} cm</span></>}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    {product.has_diamonds && product.diamond_details.length > 0 && (
                        <AccordionItem value="diamond-details">
                            <AccordionTrigger>Diamond Details</AccordionTrigger>
                            <AccordionContent>
                                {product.diamond_details.map((diamond, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm not-first:mt-4 not-first:pt-4 not-first:border-t">
                                        <span className="text-muted-foreground">Count</span><span className="font-medium text-right">{diamond.count}</span>
                                        <span className="text-muted-foreground">Total Weight</span><span className="font-medium text-right">{diamond.weight} ct</span>
                                        <span className="text-muted-foreground">Clarity-Color</span><span className="font-medium text-right">{diamond.clarity || 'N/A'}-{diamond.color || 'N/A'}</span>
                                        <span className="text-muted-foreground">Cut</span><span className="font-medium text-right">{diamond.cut || 'N/A'}</span>
                                        <span className="text-muted-foreground">Type</span><span className="font-medium text-right">{diamond.diamond_type || 'N/A'}</span>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    )}
                    <AccordionItem value="more_info">
                        <AccordionTrigger>More Info</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-2">
                             <p>All our jewellery is handcrafted and requires a delivery time of 2-3 weeks.</p>
                             <p>We offer a 15-day money-back policy, so you can shop with confidence.</p>
                             <p>For any inquiries, please contact our customer service team.</p>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="reviews">
                        <AccordionTrigger>Reviews ({totalReviews})</AccordionTrigger>
                        <AccordionContent className="pt-6 space-y-6">
                            <CustomerReviewForm productId={product.id} />
                            <ProductReviews reviews={reviews} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
              </div>
        </div>
        
        <div className="mt-16 space-y-16">
            {product.featureTabs && product.featureTabs.length > 0 && (
            <Tabs defaultValue={product.featureTabs[0].tabTitle}>
                <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
                    {product.featureTabs.map(tab => (
                        <TabsTrigger key={tab.tabTitle} value={tab.tabTitle}>{tab.tabTitle}</TabsTrigger>
                    ))}
                </TabsList>
                {product.featureTabs.map(tab => (
                    <TabsContent key={tab.tabTitle} value={tab.tabTitle} className="mt-8">
                        <Card className="overflow-hidden">
                            <div className="grid md:grid-cols-2 items-center">
                                <div className="p-8 md:p-12">
                                    <h3 className="text-2xl font-serif font-bold mb-4">{tab.contentTitle}</h3>
                                    <ul className="space-y-3 text-muted-foreground">
                                        {tab.points.map((point, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                                <span>{point.replace('{purity?.label}', purity?.label || '').replace('{metal?.name}', metal?.name || '')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="aspect-square relative h-full min-h-[300px]">
                                    <Image src={tab.imageUrl} alt={tab.imageHint} fill className="object-cover" />
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
            )}
            
             {product.showGalleryGrid && product.galleryImages && product.galleryImages.length > 0 && (
                <div className="grid md:grid-cols-3 gap-6">
                    {product.galleryImages.map((item) => {
                        const isVideo = item.url.endsWith('.mp4') || item.url.endsWith('.webm');
                        return (
                        <div key={item.id} className="aspect-[3/4] rounded-lg overflow-hidden bg-muted relative group">
                            {isVideo ? (
                                <video src={item.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                            ) : (
                                <Image src={item.url} alt={item.hint} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw" />
                            )}
                        </div>
                        )
                    })}
                </div>
             )}

          {upsellProducts.length > 0 && (
              <ProductCarousel products={upsellProducts} title="You Might Also Like" />
          )}

          {crossSellProducts.length > 0 && (
              <ProductCarousel products={crossSellProducts} title="Customers Also Viewed" />
          )}
        </div>

      </div>
    </div>
  );
}