'use client';

import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchProductsByName } from '@/lib/server/actions/products';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const SearchResultsContent: React.FC<{
  results: Product[];
  isLoading: boolean;
  query: string;
  onSelect: () => void;
}> = ({ results, isLoading, query, onSelect }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {results.length > 0 ? (
        results.map(product => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            onClick={onSelect}
            className="flex items-center gap-4 w-full text-left p-3 hover:bg-accent/50 transition-colors group"
          >
            <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
              <Image
                src={product.media.find(m => m.is_primary)?.url || 'https://picsum.photos/seed/placeholder/100/100'}
                alt={product.name}
                fill
                sizes="56px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex-grow min-w-0 space-y-0.5">
              <p className="font-medium truncate text-sm text-foreground group-hover:text-primary transition-colors">
                {product.name}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                {formatCurrency(product.display_price)}
              </p>
            </div>
          </Link>
        ))
      ) : query.length > 1 ? (
        <div className="p-8 text-center space-y-2">
          <p className="text-sm font-medium">No results found</p>
          <p className="text-xs text-muted-foreground">Try searching for a different keyword or category.</p>
        </div>
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
      if (debouncedQuery.trim().length > 1) {
        setIsLoading(true);
        try {
          const products = await searchProductsByName(debouncedQuery);
          setResults(products);
          setIsOpen(true);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
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

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative ml-auto flex-1 md:grow-0 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search our collection..."
            className={cn(
              "w-full h-10 rounded-full bg-secondary/50 border-transparent pl-10 pr-10 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20 md:w-[240px] lg:w-[400px] transition-all",
              isOpen && "rounded-b-none"
            )}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 1 && setIsOpen(true)}
            aria-label="Search products"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : query.length > 0 ? (
              <button 
                onClick={clearSearch}
                className="hover:text-foreground text-muted-foreground transition-colors"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] max-h-[480px] overflow-y-auto p-0 rounded-b-xl border-t-0 shadow-xl" 
        onOpenAutoFocus={(e) => e.preventDefault()}
        align="start"
      >
        <SearchResultsContent 
          results={results} 
          isLoading={isLoading} 
          query={debouncedQuery} 
          onSelect={handleSelect} 
        />
      </PopoverContent>
    </Popover>
  );
}