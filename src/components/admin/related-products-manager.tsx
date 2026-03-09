
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { X } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductSearch } from "./product-search";
import { ProductCard } from "../products/product-card";

interface RelatedProductsManagerProps {
    title: string;
    description: string;
    products: Product[];
    onProductsChange: (products: Product[]) => void;
    currentProductId: string;
}

export function RelatedProductsManager({ title, description, products, onProductsChange, currentProductId }: RelatedProductsManagerProps) {

    const addProduct = (product: Product) => {
        if (!products.find(p => p.id === product.id) && product.id !== currentProductId) {
            onProductsChange([...products, product]);
        }
    };

    const removeProduct = (idToRemove: string) => {
        onProductsChange(products.filter(p => p.id !== idToRemove));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ProductSearch onProductSelect={addProduct} />
                
                <div className="space-y-4">
                    {products.length > 0 ? (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {products.map(product => (
                            <div key={product.id} className="relative group">
                                <ProductCard product={product} className="h-full" />
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="icon" 
                                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeProduct(product.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                       </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No products added yet.</p>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Changes to this section are saved with the main product form.
                </p>
            </CardFooter>
        </Card>
    );
}
