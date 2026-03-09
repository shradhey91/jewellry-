
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchProductsByName } from '@/lib/server/actions/products';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const SearchResultsContent: React.FC<{
  results: Product[];
  isLoading: boolean;
  query: string;
  onSelect: () => void;
}> = ({ results, isLoading, query, onSelect }) => {
  return (
    <div className="divide-y">
      {results.length > 0 ? (
        results.map(product => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            onClick={onSelect}
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
              <p className="font-semibold truncate text-sm">{product.name}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(product.display_price)}</p>
            </div>
          </Link>
        ))
      ) : !isLoading && query.length > 1 ? (
        <p className="p-4 text-sm text-muted-foreground text-center">No products found.</p>
      ) : null}
    </div>
  );
};


export function ProductSearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length > 1) {
        setIsLoading(true);
        const products = await searchProductsByName(debouncedQuery);
        setResults(products);
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    };
    performSearch();
  }, [debouncedQuery]);

  const handleSelect = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 1 && setIsOpen(true)}
          />
          {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-96 overflow-y-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SearchResultsContent results={results} isLoading={isLoading} query={debouncedQuery} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
