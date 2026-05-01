
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Product, ProductReview, Category, Metal, Purity } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { PriceBreakupModal } from '../[id]/price-breakup-modal';
import { ProductCarousel } from '@/components/homepage/product-carousel';
import { ProductGallery } from '@/components/products/product-gallery';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, MessageCircle, Shield, Star, Truck, Share2, Gift } from 'lucide-react';
import { AddToCartForm } from '@/components/cart/add-to-cart-form';
import { WishlistButton } from '@/components/products/wishlist-button';
import { CompareButton } from '@/components/products/compare-button';
import { CustomerReviewForm } from '@/components/products/customer-review-form';
import { PincodeChecker } from '@/components/products/pincode-checker';

// --- Sub-components for Theme 4 ---

function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 rounded-lg">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold font-serif">No Reviews Yet</h3>
                <p className="mt-1 text-sm text-gray-500">Be the first to share your thoughts on this product.</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            {reviews.map(review => (
                <div key={review.id} className="flex gap-4 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gray-100 text-gray-500">{review.reviewer_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800">{review.reviewer_name}</p>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-primary fill-primary" : "text-gray-300")} />
                                ))}
                            </div>
                        </div>
                         <p className="text-xs text-gray-500 mt-0.5">
                            {format(new Date(review.created_at), "MMMM d, yyyy")}
                        </p>
                        <p className="mt-3 text-gray-700 leading-relaxed text-sm">{review.text}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

// --- Main Theme Component ---

interface ThemeProps {
    product: Product;
    primaryCategory: Category | null;
    crossSellProducts: Product[];
    upsellProducts: Product[];
    reviews: ProductReview[];
    metal: Metal | undefined;
    purity: Purity | undefined;
}

export function Theme4({ product, primaryCategory, crossSellProducts, upsellProducts, reviews, metal, purity }: ThemeProps) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10 : 0;
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants.length > 0 ? product.variants[0].id : undefined
  );
  
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  const displayPrice = selectedVariant?.display_price ?? product.display_price;
  const priceBreakup = selectedVariant?.price_breakup ?? product.price_breakup;
  const grossWeight = selectedVariant?.gross_weight ?? product.gross_weight;
  const netWeight = selectedVariant?.net_weight ?? product.net_weight;

  const discountPercentage = product.auto_price_enabled === false && product.manual_price && product.manual_price < priceBreakup.total 
    ? Math.round(((priceBreakup.total - product.manual_price) / priceBreakup.total) * 100)
    : 0;

  return (
    <div className="bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            {primaryCategory && (
              <>
                <BreadcrumbItem><BreadcrumbLink href={`/category/${primaryCategory.id}`}>{primaryCategory.name}</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left: Gallery */}
            <div className="sticky top-28">
                 <ProductGallery media={product.media} />
            </div>
           
            {/* Right: Details */}
            <div className="flex flex-col gap-6">
                <div>
                    {primaryCategory && <Badge variant="outline">{primaryCategory.name}</Badge>}
                    <h1 className="text-3xl lg:text-4xl font-bold font-serif mt-2">{product.name}</h1>
                    {totalReviews > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                            <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("h-5 w-5", i < Math.floor(averageRating) ? "text-primary fill-primary" : "text-muted-foreground/30")} />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">({totalReviews} Reviews)</span>
                        </div>
                    )}
                </div>

                <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(displayPrice)}
                    </p>
                    {discountPercentage > 0 && (
                        <>
                            <p className="text-xl text-muted-foreground line-through">
                                {formatCurrency(priceBreakup.total)}
                            </p>
                            <Badge variant="destructive">SAVE {discountPercentage}%</Badge>
                        </>
                    )}
                </div>
                 <PriceBreakupModal priceBreakup={priceBreakup} finalPrice={displayPrice}>
                    <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground">View Price Breakup</Button>
                 </PriceBreakupModal>

                <p className="text-sm text-muted-foreground">{product.description}</p>
                
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

        <div className="mt-16 md:mt-24 space-y-16">
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

            <div>
                <Accordion type="single" collapsible defaultValue="details" className="w-full max-w-3xl mx-auto">
                    <AccordionItem value="details">
                        <AccordionTrigger className="text-xl font-serif">Product Details</AccordionTrigger>
                        <AccordionContent className="pt-4 text-sm text-gray-600">
                             <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                                <span className="text-gray-500">Gross Weight</span><span className="font-medium text-right">{grossWeight}g</span>
                                <span className="text-gray-500">Net Weight</span><span className="font-medium text-right">{netWeight}g</span>
                                <span className="text-gray-500">Metal</span><span className="font-medium text-right">{metal?.name}</span>
                                <span className="text-gray-500">Purity</span><span className="font-medium text-right">{purity?.label}</span>
                                {product.height && <><span className="text-gray-500">Height</span><span className="font-medium text-right">{product.height} cm</span></>}
                                {product.width && <><span className="text-gray-500">Width</span><span className="font-medium text-right">{product.width} cm</span></>}
                                {product.length && <><span className="text-gray-500">Length</span><span className="font-medium text-right">{product.length} cm</span></>}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    {product.has_diamonds && product.diamond_details.length > 0 && (
                        <AccordionItem value="diamonds">
                             <AccordionTrigger className="text-xl font-serif">Diamond Details</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                                {product.diamond_details.map((diamond, index) => (
                                    <div key={index} className="text-sm text-gray-600 grid grid-cols-2 gap-y-3 gap-x-8 not-first:mt-4 not-first:pt-4 not-first:border-t">
                                        <span className="text-gray-500 col-span-2 font-semibold">Diamond {index + 1}</span>
                                        <span className="text-gray-500">Count</span><span className="font-medium text-right">{diamond.count}</span>
                                        <span className="text-gray-500">Total Weight</span><span className="font-medium text-right">{diamond.weight} ct</span>
                                        <span className="text-gray-500">Clarity-Color</span><span className="font-medium text-right">{diamond.clarity || 'N/A'}-{diamond.color || 'N/A'}</span>
                                        <span className="text-gray-500">Cut</span><span className="font-medium text-right">{diamond.cut || 'N/A'}</span>
                                        <span className="text-gray-500">Type</span><span className="font-medium text-right">{diamond.diamond_type || 'N/A'}</span>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    )}
                     <AccordionItem value="shipping">
                        <AccordionTrigger className="text-xl font-serif">Shipping & Returns</AccordionTrigger>
                        <AccordionContent className="prose max-w-none prose-sm text-gray-600 pt-2">
                            <p>We offer complimentary, insured shipping on all orders. Please allow 2-3 weeks for handcrafted pieces. We also provide a 15-day money-back guarantee for your peace of mind.</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="reviews">
                        <AccordionTrigger className="text-xl font-serif">Reviews ({totalReviews})</AccordionTrigger>
                        <AccordionContent className="pt-6">
                            <div className="space-y-8">
                                <CustomerReviewForm productId={product.id} />
                                <ProductReviews reviews={reviews} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            
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
