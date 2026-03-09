
"use client";

import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchPostsByTitle } from '@/app/admin/blog/[slug]/actions';
import type { BlogPost } from '@/lib/types';

interface PostSearchProps {
  onPostSelect: (post: BlogPost) => void;
}

export function PostSearch({ onPostSelect }: PostSearchProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length > 2) {
        setIsLoading(true);
        const posts = await searchPostsByTitle(debouncedQuery);
        setResults(posts);
        setIsLoading(false);
        if (posts.length > 0) {
            setIsPopoverOpen(true);
        }
      } else {
        setResults([]);
        setIsPopoverOpen(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSelect = (post: BlogPost) => {
    onPostSelect(post);
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
            placeholder="Search for posts to add..."
            value={query}
            onChange={handleInputChange}
            className="pl-10"
          />
          {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-80 overflow-y-auto p-0">
        <div className="divide-y">
            {results.length > 0 ? results.map(post => (
                <button
                    key={post.id}
                    onClick={() => handleSelect(post)}
                    className="flex items-center gap-4 w-full text-left p-3 hover:bg-accent transition-colors"
                >
                    <div className="relative h-10 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <Image 
                            src={post.featured_image_url}
                            alt={post.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold truncate text-sm">{post.title}</p>
                    </div>
                </button>
            )) : !isLoading && debouncedQuery.length > 2 && (
                <p className="p-4 text-sm text-muted-foreground text-center">No posts found.</p>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
