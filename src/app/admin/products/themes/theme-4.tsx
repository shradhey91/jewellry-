
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Product, ProductReview, Category, Metal, Purity, ProductVariant } from '@/lib/types';

import { cn } from '@/lib/utils';

import { PriceBreakupModal } from '../[id]/price-breakup-modal';
import { ProductCard } from '@/components/products/product-card';
import { ProductCarousel } from '@/components/homepage/product-carousel';
import { ProductGallery } from '@/components/products/product-gallery';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CheckCircle2, Gem, Info, MessageCircle, Shield, Star, Truck } from 'lucide-react';
import { AddToCartForm } from '@/components/cart/add-to-cart-form';


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
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(product.variants.length > 0 ? product.variants[0].id : undefined);

  const discountPercentage = product.auto_price_enabled === false && product.manual_price && product.manual_price < product.price_breakup.total 
    ? Math.round(((product.price_breakup.total - product.manual_price) / product.price_breakup.total) * 100)
    : 0;

  return (
    <div className="bg-gray-50/50">
      <div className="container mx-auto py-8 md:py-12">
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
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(product.display_price)}
                    </p>
                    {discountPercentage > 0 && (
                        <>
                            <p className="text-xl text-muted-foreground line-through">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(product.price_breakup.total)}
                            </p>
                            <Badge variant="destructive">SAVE {discountPercentage}%</Badge>
                        </>
                    )}
                </div>
                 <PriceBreakupModal priceBreakup={product.price_breakup} finalPrice={product.display_price}>
                    <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground -mt-4">View Price Breakup</Button>
                </PriceBreakupModal>

                <p className="text-sm text-muted-foreground">{product.description}</p>
                
                {product.variants.length > 0 && product.has_ring_size && (
                     <div className="space-y-3">
                        <Label className="font-semibold">Select Size</Label>
                        <ToggleGroup type="single" value={selectedVariantId} onValueChange={(value) => {if(value) setSelectedVariantId(value)}}>
                            {product.variants.map(variant => (
                                <ToggleGroupItem key={variant.id} value={variant.id} aria-label={variant.label}>
                                    {variant.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                )}

                <AddToCartForm product={product} />

                <Card className="bg-background">
                    <CardContent className="p-4 space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>Free, fast shipping & returns.</span>
                        </div>
                         <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>Lifetime warranty on all products.</span>
                        </div>
                         <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>100% authenticity guarantee.</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="mt-16 md:mt-24 space-y-16">
            <Tabs defaultValue="features">
                <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
                    <TabsTrigger value="features">Outstanding Features</TabsTrigger>
                    <TabsTrigger value="quality">Supreme Quality</TabsTrigger>
                    <TabsTrigger value="design">Unique Design</TabsTrigger>
                </TabsList>
                <TabsContent value="features" className="mt-8">
                    <Card className="overflow-hidden">
                        <div className="grid md:grid-cols-2 items-center">
                            <div className="p-8 md:p-12">
                                <h3 className="text-2xl font-serif font-bold mb-4">Crafted for Brilliance</h3>
                                <ul className="space-y-3 text-muted-foreground">
                                    <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /><span>Hand-selected, ethically sourced diamonds and gemstones.</span></li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /><span>Solid {purity?.label} {metal?.name} for lasting beauty.</span></li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /><span>Artisanal craftsmanship in every single detail.</span></li>
                                    <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /><span>Includes a certificate of authenticity.</span></li>
                                </ul>
                            </div>
                            <div className="aspect-square relative h-full min-h-[300px]">
                                <Image src="https://picsum.photos/seed/features/800/800" alt="Lifestyle image" fill className="object-cover" />
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
            
             <div className="grid md:grid-cols-3 gap-6">
                <Image src="https://picsum.photos/seed/gallery1/600/800" alt="Gallery image 1" width={600} height={800} className="rounded-lg object-cover w-full h-full" />
                <Image src="https://picsum.photos/seed/gallery2/600/800" alt="Gallery image 2" width={600} height={800} className="rounded-lg object-cover w-full h-full" />
                <Image src="https://picsum.photos/seed/gallery3/600/800" alt="Gallery image 3" width={600} height={800} className="rounded-lg object-cover w-full h-full" />
            </div>

            <div>
                <Accordion type="single" collapsible defaultValue="details" className="w-full max-w-3xl mx-auto">
                    <AccordionItem value="details">
                        <AccordionTrigger className="text-xl font-serif">Product Details</AccordionTrigger>
                        <AccordionContent className="pt-4 text-sm text-gray-600">
                             <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                                <span className="text-gray-500">Gross Weight</span><span className="font-medium text-right">{product.gross_weight}g</span>
                                <span className="text-gray-500">Net Weight</span><span className="font-medium text-right">{product.net_weight}g</span>
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
                </Accordion>
            </div>

            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-serif">Customer Reviews</CardTitle>
                        {totalReviews > 0 && (
                            <CardDescription>
                                See what others are saying about this product.
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <ProductReviews reviews={reviews} />
                    </CardContent>
                </Card>
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
