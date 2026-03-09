

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchProductsByName } from '@/lib/server/actions/products';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProductSearchProps {
  onProductSelect: (product: Product) => void;
  filterActive?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);


export function ProductSearch({ onProductSelect, filterActive = false }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length > 2) {
        setIsLoading(true);
        let products = await searchProductsByName(debouncedQuery);
        if (filterActive) {
          products = products.filter(p => p.is_active);
        }
        setResults(products);
        setIsLoading(false);
        if (products.length > 0) {
            setIsPopoverOpen(true);
        }
      } else {
        setResults([]);
        setIsPopoverOpen(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, filterActive]);

  const handleSelect = (product: Product) => {
    onProductSelect(product);
    setQuery('');
    setResults([]);
    setIsPopoverOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!e.target.value) {
        setIsPopoverOpen(false);
    }
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for products to add..."
            value={query}
            onChange={handleInputChange}
            className="pl-10"
          />
          {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-80 overflow-y-auto p-0">
        <div className="divide-y">
            {results.length > 0 ? results.map(product => (
                <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="flex items-center gap-4 w-full text-left p-3 hover:bg-accent transition-colors"
                >
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <Image 
                            src={product.media.find(m => m.is_primary)?.url || 'https://picsum.photos/seed/placeholder/100/100'}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(product.display_price)}</p>
                    </div>
                </button>
            )) : !isLoading && debouncedQuery.length > 2 && (
                <p className="p-4 text-sm text-muted-foreground text-center">No products found.</p>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
