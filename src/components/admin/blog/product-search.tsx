"use client";

import { formatCurrency } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import { Search, Loader2, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchProductsByName } from '@/lib/server/actions/products';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function ProductSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length > 2) {
        setIsLoading(true);
        const products = await searchProductsByName(debouncedQuery);
        setResults(products);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleCopyShortcode = (productId: string) => {
    const shortcode = `[product:${productId}]`;
    navigator.clipboard.writeText(shortcode);
    toast({
      title: "Shortcode Copied",
      description: `Copied "${shortcode}" to your clipboard.`,
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }

  return (
    <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a product..."
            value={query}
            onChange={handleInputChange}
            className="pl-10"
          />
          {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>
        
        {results.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto border rounded-md p-2">
                {results.map(product => (
                    <div
                        key={product.id}
                        className="flex items-center gap-4 w-full text-left p-2 rounded-md transition-colors"
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
                            <p className="font-semibold truncate text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(product.display_price)}</p>
                        </div>
                        <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCopyShortcode(product.id)}
                            className="shrink-0"
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                        </Button>
                    </div>
                ))}
            </div>
        )}

        {!isLoading && debouncedQuery.length > 2 && results.length === 0 && (
             <p className="p-4 text-sm text-muted-foreground text-center">No products found.</p>
        )}
    </div>
  );
}
