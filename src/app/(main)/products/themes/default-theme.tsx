
'use client';

import Image from 'next/image';
import { ProductGallery } from '@/components/products/product-gallery';
import { AddToCartForm } from '@/components/cart/add-to-cart-form';
import { Separator } from '@/components/ui/separator';
import { ProductCarousel } from '@/components/homepage/product-carousel';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Star, MessageCircle, Gift, Truck, Share2, Gem, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceBreakupModal } from '../[id]/price-breakup-modal';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Product, ProductReview, Category, Metal, Purity } from '@/lib/types';
import { WishlistButton } from '@/components/products/wishlist-button';
import { CompareButton } from '@/components/products/compare-button';
import { useState } from 'react';
import { CustomerReviewForm } from '@/components/products/customer-review-form';
import { PincodeChecker } from '@/components/products/pincode-checker';

function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-background">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Reviews Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Be the first to share your thoughts on this product.</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-8 bg-background p-6 rounded-lg border">
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

interface ThemeProps {
    product: Product;
    primaryCategory: Category | null;
    crossSellProducts: Product[];
    upsellProducts: Product[];
    reviews: ProductReview[];
    metal: Metal | undefined;
    purity: Purity | undefined;
}

export function DefaultTheme({ product, primaryCategory, crossSellProducts, upsellProducts, reviews, metal, purity }: ThemeProps) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0;
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants.length > 0 ? product.variants[0].id : undefined
  );
  
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  const displayPrice = selectedVariant?.display_price ?? product.display_price;
  const priceBreakup = selectedVariant?.price_breakup ?? product.price_breakup;
  const grossWeight = selectedVariant?.gross_weight ?? product.gross_weight;
  
  return (
    <div className="bg-secondary/30">
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
        
        <Card className="p-4 sm:p-6 lg:p-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
              <ProductGallery media={product.media} />
              
              <div className="sticky top-28 flex flex-col gap-6">
                
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold font-headline">{product.name}</h1>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>SKU: {product.id.toUpperCase()}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>Product ID: {product.id}</span>
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

                <div className="flex items-center justify-between gap-2 text-sm">
                    <WishlistButton product={product} className="flex-1" />
                    <CompareButton product={product} className="flex-1" />
                     <Button variant="outline" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4"/> Share
                    </Button>
                </div>

              </div>
            </div>
        </Card>
        
        <div className="mt-16 space-y-16">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-secondary/80 rounded-lg">
                <TabsTrigger value="details">Product Details</TabsTrigger>
                <TabsTrigger value="more_info">More Info</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({totalReviews})</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
                <Card>
                    <CardContent className="p-6 text-sm">
                        <div className="prose prose-sm max-w-none text-muted-foreground mb-8">
                          <p>{product.description}</p>
                        </div>
                        <Accordion type="single" collapsible defaultValue="metal-details">
                            <AccordionItem value="metal-details">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-3">
                                        <Gem className="h-5 w-5 text-primary" />
                                        <span className="font-semibold text-base">METAL DETAILS</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4">
                                    <div className="grid grid-cols-3 gap-y-4 gap-x-8 text-center">
                                        <div>
                                            <p className="font-bold text-lg">{purity?.label || 'N/A'}</p>
                                            <p className="text-sm text-muted-foreground">Karatage</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">Yellow</p>
                                            <p className="text-sm text-muted-foreground">Material Colour</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{grossWeight}g</p>
                                            <p className="text-sm text-muted-foreground">Gross Weight</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{metal?.name || 'N/A'}</p>
                                            <p className="text-sm text-muted-foreground">Metal</p>
                                        </div>
                                        {product.has_size_dimensions && product.height && (
                                            <div>
                                                <p className="font-bold text-lg">{product.height} cm</p>
                                                <p className="text-sm text-muted-foreground">Height</p>
                                            </div>
                                        )}
                                        {product.has_size_dimensions && product.width && (
                                            <div>
                                                <p className="font-bold text-lg">{product.width} cm</p>
                                                <p className="text-sm text-muted-foreground">Width</p>
                                            </div>
                                        )}
                                        {product.has_size_dimensions && product.length && (
                                            <div>
                                                <p className="font-bold text-lg">{product.length} cm</p>
                                                <p className="text-sm text-muted-foreground">Length</p>
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                             {product.has_diamonds && product.diamond_details.length > 0 && (
                                <AccordionItem value="diamond-details">
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-3">
                                            <Gem className="h-5 w-5 text-primary" />
                                            <span className="font-semibold text-base">DIAMOND DETAILS</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4">
                                        {product.diamond_details.map((diamond, index) => (
                                            <div key={index} className="grid grid-cols-3 gap-y-4 gap-x-8 text-center">
                                                <div>
                                                    <p className="font-bold text-lg">{diamond.count}</p>
                                                    <p className="text-sm text-muted-foreground">Count</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{diamond.weight} ct</p>
                                                    <p className="text-sm text-muted-foreground">Total Weight</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{diamond.clarity || 'N/A'}-{diamond.color || 'N/A'}</p>
                                                    <p className="text-sm text-muted-foreground">Clarity-Color</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{diamond.cut || 'N/A'}</p>
                                                    <p className="text-sm text-muted-foreground">Cut</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{diamond.diamond_type || 'N/A'}</p>
                                                    <p className="text-sm text-muted-foreground">Type</p>
                                                </div>
                                                 <div>
                                                    <p className="font-bold text-lg">
                                                        {formatCurrency(diamond.price || 0)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">Approx. Value</p>
                                                </div>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            )}
                        </Accordion>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="more_info" className="mt-6">
                 <Card>
                    <CardContent className="p-6 text-sm space-y-4">
                        <p>All our jewellery is handcrafted and requires a delivery time of 2-3 weeks. We offer a 15-day money-back policy, so you can shop with confidence.</p>
                        <p>For any inquiries, please contact our customer service team.</p>
                    </CardContent>
                 </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6 space-y-8">
              <CustomerReviewForm productId={product.id} />
              <ProductReviews reviews={reviews} />
            </TabsContent>
          </Tabs>

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
