
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Product, ProductReview, Category, Metal, Purity } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Star, Gift, Truck, Share2, MessageCircle, PlayCircle, GitCompareArrows, CheckCircle2 } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
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
            <div className="text-center py-12 rounded-lg">
                <MessageCircle className="mx-auto h-12 w-12 text-stone-500" />
                <h3 className="mt-4 text-lg font-semibold font-serif">No Reviews Yet</h3>
                <p className="mt-1 text-sm text-stone-600">Be the first to share your thoughts on this product.</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            {reviews.map(review => (
                <div key={review.id} className="flex gap-6 border-b border-stone-200 pb-6">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-stone-200 text-stone-600">{review.reviewer_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-stone-800">{review.reviewer_name}</p>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-amber-600 fill-amber-600" : "text-stone-300")} />
                                ))}
                            </div>
                        </div>
                         <p className="text-xs text-stone-500 mt-0.5">
                            {format(new Date(review.created_at), "MMMM d, yyyy")}
                        </p>
                        <p className="mt-3 text-stone-700 leading-relaxed">{review.text}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}


export function Theme3({ product, primaryCategory, crossSellProducts, upsellProducts, reviews, metal, purity }: ThemeProps) {
  const [activeMedia, setActiveMedia] = useState(product.media.find(m => m.is_primary) || product.media[0]);
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0;
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants.length > 0 ? product.variants[0].id : undefined
  );

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  const displayPrice = selectedVariant?.display_price ?? product.display_price;
  const priceBreakup = selectedVariant?.price_breakup ?? product.price_breakup;
  const grossWeight = selectedVariant?.gross_weight ?? product.gross_weight;
  const netWeight = selectedVariant?.net_weight ?? product.net_weight;
  
  return (
    <div className="text-stone-800 font-sans">
      <div className="container mx-auto py-8 md:py-12">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="hover:text-stone-900">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {primaryCategory && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/category/${primaryCategory.id}`} className="hover:text-stone-900">{primaryCategory.name}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="text-stone-800">{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* --- Single Column Layout Starts --- */}
        <div className="max-w-4xl mx-auto">
            {/* Gallery Section */}
            <section className="mb-12">
                <div className="aspect-square w-full relative rounded-lg overflow-hidden shadow-sm group">
                    {activeMedia?.media_type === 'video' ? (
                        <video key={activeMedia.id} src={activeMedia.url} className="h-full w-full object-cover" autoPlay loop muted playsInline />
                    ) : (
                        <Image key={activeMedia?.id} src={activeMedia?.url || ''} alt={activeMedia?.hint || 'Product image'} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" priority />
                    )}
                </div>
                <div className="flex justify-center gap-3 mt-4">
                    {product.media.sort((a,b) => a.sort_order - b.sort_order).map(item => (
                        <button key={item.id} onClick={() => setActiveMedia(item)} className={cn("h-20 w-20 relative rounded-md overflow-hidden border-2 transition-all", item.id === activeMedia.id ? "border-stone-800" : "border-transparent opacity-60 hover:opacity-100")}>
                            <Image src={item.media_type === 'video' ? "https://uncommongoods.in/media/images/Gemini_Generated_Image_nwhgufnwhgufnwhg.png" : item.url} alt={item.hint || 'Product thumbnail'} fill className="object-cover" sizes="10vw" />
                             {item.media_type === 'video' && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <PlayCircle className="h-6 w-6 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </section>
            
            {/* Product Info & Purchase Section */}
            <section className="text-center space-y-6">
                <h1 className="text-4xl font-serif text-stone-900">{product.name}</h1>
                <p className="text-stone-600 max-w-2xl mx-auto">{product.seo_title}</p>
                
                 {totalReviews > 0 && (
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={cn("h-4 w-4", i < averageRating ? "text-amber-600 fill-amber-600" : "text-stone-300")} />
                            ))}
                        </div>
                        <span className="text-xs text-stone-500">({totalReviews} Reviews)</span>
                    </div>
                )}
                
                <Separator className="w-1/4 mx-auto !my-8 bg-stone-200" />
                
                <div>
                  <p className="text-4xl font-light text-amber-900/90">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(displayPrice)}
                  </p>
                   <span className="text-xs text-stone-500 mt-1 block"> (Inclusive of all taxes)</span>
                   <PriceBreakupModal priceBreakup={priceBreakup} finalPrice={displayPrice}>
                     <Button variant="link" className="p-0 h-auto text-sm text-stone-700 hover:text-stone-900">View Price Breakup</Button>
                   </PriceBreakupModal>
                </div>

                <div className="max-w-md mx-auto !my-8">
                  <PincodeChecker />
                </div>
                
                <div className="max-w-md mx-auto">
                    <AddToCartForm product={product} selectedVariantId={selectedVariantId} onVariantChange={setSelectedVariantId} showGiftOption={false} />
                </div>
                
                <div className="flex items-center justify-center gap-2 text-sm pt-2">
                    <WishlistButton product={product} variant="ghost" className="text-stone-600 hover:bg-stone-200/50">Add to Wishlist</WishlistButton>
                    <CompareButton product={product} variant="ghost" className="text-stone-600 hover:bg-stone-200/50" />
                    <Button variant="ghost" className="text-stone-600 hover:bg-stone-200/50"> <Share2 className="mr-2 h-4 w-4"/> Share </Button>
                </div>
            </section>
            
            {/* Accordion Details Section */}
            <section className="mt-16 space-y-16">
                 <Accordion type="single" collapsible defaultValue="details" className="w-full border-t border-stone-200">
                    <AccordionItem value="details">
                        <AccordionTrigger className="text-lg font-serif text-stone-800 hover:no-underline">Product Details</AccordionTrigger>
                        <AccordionContent className="text-base text-stone-700 space-y-6 pt-4">
                           <div className="prose prose-base max-w-none text-stone-700 leading-relaxed">
                              <p>{product.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                                <span className="text-stone-500">Gross Weight</span><span className="font-medium text-right">{grossWeight}g</span>
                                <span className="text-stone-500">Net Weight</span><span className="font-medium text-right">{netWeight}g</span>
                                <span className="text-stone-500">Metal</span><span className="font-medium text-right">{metal?.name}</span>
                                <span className="text-stone-500">Purity</span><span className="font-medium text-right">{purity?.label}</span>
                                {product.height && <><span className="text-stone-500">Height</span><span className="font-medium text-right">{product.height} cm</span></>}
                                {product.width && <><span className="text-stone-500">Width</span><span className="font-medium text-right">{product.width} cm</span></>}
                                {product.length && <><span className="text-stone-500">Length</span><span className="font-medium text-right">{product.length} cm</span></>}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    {product.has_diamonds && product.diamond_details.length > 0 && (
                        <AccordionItem value="diamond-details">
                            <AccordionTrigger className="text-lg font-serif text-stone-800 hover:no-underline">Diamond Details</AccordionTrigger>
                            <AccordionContent className="pt-4">
                                {product.diamond_details.map((diamond, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm not-first:mt-4 not-first:pt-4 not-first:border-t not-first:border-stone-200">
                                        <span className="text-stone-500">Count</span><span className="font-medium text-right">{diamond.count}</span>
                                        <span className="text-stone-500">Total Weight</span><span className="font-medium text-right">{diamond.weight} ct</span>
                                        <span className="text-stone-500">Clarity-Color</span><span className="font-medium text-right">{diamond.clarity || 'N/A'}-{diamond.color || 'N/A'}</span>
                                        <span className="text-stone-500">Cut</span><span className="font-medium text-right">{diamond.cut || 'N/A'}</span>
                                        <span className="text-stone-500">Type</span><span className="font-medium text-right">{diamond.diamond_type || 'N/A'}</span>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    )}
                     <AccordionItem value="shipping">
                        <AccordionTrigger className="text-lg font-serif text-stone-800 hover:no-underline">Shipping & Returns</AccordionTrigger>
                        <AccordionContent className="text-base text-stone-700 pt-4 prose max-w-none">
                            <p>We offer complimentary, insured shipping on all orders. Please allow 2-3 weeks for handcrafted pieces. We also provide a 15-day money-back guarantee for your peace of mind.</p>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="reviews">
                        <AccordionTrigger className="text-lg font-serif text-stone-800 hover:no-underline">Reviews ({totalReviews})</AccordionTrigger>
                        <AccordionContent className="pt-8 space-y-8">
                            <CustomerReviewForm productId={product.id} />
                            <ProductReviews reviews={reviews} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

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

            </section>
        </div>
        </div>

        {/* Related Products */}
        <div className="mt-24 space-y-16">
             {upsellProducts.length > 0 && (
                 <ProductCarousel products={upsellProducts} title="You Might Also Like" />
            )}

            {crossSellProducts.length > 0 && (
                 <ProductCarousel products={crossSellProducts} title="Complete The Look" />
            )}
        </div>

    </div>
  );
}
