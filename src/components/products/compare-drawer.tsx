'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCompare } from '@/hooks/use-compare';
import { getProductsByIdsAction, getMetalsAction, getPuritiesAction } from '@/lib/actions/client-data';
import type { Product, Metal, Purity } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

function CompareTableSkeleton() {
    return (
        <div className="flex gap-4 p-1">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="min-w-[250px] space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-2/3" />
                </div>
            ))}
        </div>
    );
}


export function CompareDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const [products, setProducts] = useState<Product[]>([]);
  const [metals, setMetals] = useState<Metal[]>([]);
  const [purities, setPurities] = useState<Purity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompareData = async () => {
      if (compareItems.length > 0) {
        setIsLoading(true);
        try {
            const [fetchedProducts, allMetals, allPurities] = await Promise.all([
                getProductsByIdsAction(compareItems),
                getMetalsAction(),
                getPuritiesAction(),
            ]);

            const productMap = new Map(fetchedProducts.map(p => [p.id, p]));
            const sortedProducts = compareItems.map(id => productMap.get(id)).filter((p): p is Product => !!p);

            setProducts(sortedProducts);
            setMetals(allMetals);
            setPurities(allPurities);
        } catch (error) {
            console.error("Failed to fetch comparison data:", error);
            // Handle error state if necessary
        } finally {
            setIsLoading(false);
        }
      } else {
        setProducts([]);
        setIsLoading(false);
      }
    };
    fetchCompareData();
  }, [compareItems]);
  
  const renderValue = (value: any, unit: string = '') => {
      if (value === null || value === undefined || value === '') return <span className="text-muted-foreground">-</span>;
      return `${value}${unit}`;
  }

  const comparisonAttributes = [
    { label: 'Price', key: 'display_price', format: (val: number) => formatCurrency(val) },
    { label: 'Metal', key: 'metal_id', lookup: (id: string) => metals.find(m => m.id === id)?.name },
    { label: 'Purity', key: 'purity_id', lookup: (id: string) => purities.find(p => p.id === id)?.label },
    { label: 'Gross Weight', key: 'gross_weight', unit: 'g' },
    { label: 'Net Weight', key: 'net_weight', unit: 'g' },
    { label: 'Dimensions (HxW)', key: 'dimensions' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>Compare Products</SheetTitle>
          <SheetDescription>
            Side-by-side comparison of your selected items.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
                {isLoading ? (
                    <CompareTableSkeleton />
                ) : products.length > 0 ? (
                <div className="p-1">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-background z-10">
                            <tr>
                                <th className="text-left font-semibold p-4 w-[150px]">Feature</th>
                                {products.map(product => (
                                    <th key={product.id} className="p-4 border-l min-w-[250px]">
                                        <div className="relative">
                                            <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-7 w-7" onClick={() => removeFromCompare(product.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Link href={`/products/${product.id}`} className="group">
                                                <div className="w-full aspect-square relative rounded-md overflow-hidden mx-auto max-w-[200px]">
                                                    <Image 
                                                        src={product.media.find(m => m.is_primary)?.url || 'https://picsum.photos/seed/placeholder/200/200'} 
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <p className="font-semibold text-sm mt-2 group-hover:text-primary truncate">{product.name}</p>
                                            </Link>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {comparisonAttributes.map(attr => (
                                <tr key={attr.key}>
                                    <td className="p-4 font-medium text-muted-foreground w-[150px]">{attr.label}</td>
                                    {products.map(product => {
                                        let value: any;
                                        if (attr.key === 'dimensions') {
                                            value = product.height && product.width ? `${product.height} x ${product.width}` : null;
                                        } else {
                                            value = (product as any)[attr.key];
                                        }
                                        
                                        const displayValue = attr.lookup
                                            ? attr.lookup(value)
                                            : attr.format
                                            ? attr.format(value)
                                            : renderValue(value, attr.unit);
                                        
                                        return (
                                            <td key={product.id} className="p-4 text-center border-l">
                                                {displayValue}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <h3 className="text-xl font-semibold">Comparison List is Empty</h3>
                        <p className="text-muted-foreground mt-2">Add some products to compare their features.</p>
                    </div>
                )}
                 <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>

        <SheetFooter className="border-t pt-4">
             <Button variant="outline" onClick={clearCompare}>Clear All</Button>
            <SheetClose asChild>
                <Button>Close</Button>
            </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
