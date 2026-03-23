
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/hooks/use-wishlist';
import { getProductsByIds } from '@/lib/server/api';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useUser } from '@/auth/hooks/use-user';
import { PhoneAuthForm } from '@/auth/components/phone-auth-form';

function WishlistGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
            ))}
        </div>
    );
}

export default function WishlistPage() {
    const { user, isLoading: isUserLoading } = useUser();
    const { wishlist, isWishlistReady } = useWishlist();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isWishlistReady || !user) {
            setIsLoading(false);
            return;
        };

        if (wishlist.length > 0) {
            getProductsByIds(wishlist).then(fetchedProducts => {
                const productMap = new Map(fetchedProducts.map(p => [p.id, p]));
                const sortedProducts = wishlist.map(id => productMap.get(id)).filter((p): p is Product => !!p);
                setProducts(sortedProducts);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [wishlist, isWishlistReady, user]);

    if (isLoading || isUserLoading) {
        return (
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Skeleton className="h-8 w-48 mb-12" />
                <WishlistGridSkeleton />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="bg-secondary/30 min-h-[70vh] flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center justify-center text-center">
                    <div className="relative inline-block mb-6">
                        <Heart className="h-20 w-20 text-primary/30" />
                        <Heart className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 animate-ping" />
                    </div>
                    <h1 className="text-3xl font-bold font-headline">Your Wishlist Awaits</h1>
                    <p className="mt-4 max-w-lg text-muted-foreground">
                        Log in or create an account to save your favorite items and view them anytime, anywhere.
                    </p>
                    <div className="mt-8 w-full max-w-sm">
                        <PhoneAuthForm />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-secondary/30 min-h-[70vh]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Wishlist</BreadcrumbPage>
                    </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl">
                        Your Wishlist
                    </h1>
                    {products.length > 0 && (
                        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                            Your saved treasures, waiting for the perfect moment.
                        </p>
                    )}
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 px-6 border-2 border-dashed rounded-xl max-w-2xl mx-auto bg-background">
                        <div className="relative inline-block">
                           <Heart className="h-20 w-20 text-primary/30" />
                           <Heart className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 animate-ping" />
                        </div>
                        <h2 className="mt-6 text-2xl font-semibold font-headline">Your Wishlist is a Blank Canvas</h2>
                        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                            Add items you love to your wishlist. We'll keep them safe for you here.
                        </p>
                        <Button asChild className="mt-8" size="lg">
                            <Link href="/shop">Discover Your Next Treasure</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
