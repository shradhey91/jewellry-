
'use client';

import { useState, useMemo } from 'react';
import type { BlogPost, BlogCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface BlogClientPageProps {
    posts: BlogPost[];
    categories: BlogCategory[];
}

export function BlogClientPage({ posts, categories }: BlogClientPageProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const filteredPosts = useMemo(() => {
        if (!selectedCategoryId) {
            return posts;
        }
        return posts.filter(p => p.category_ids.includes(selectedCategoryId));
    }, [posts, selectedCategoryId]);
    
    const usedCategoryIds = useMemo(() => {
        const ids = new Set<string>();
        posts.forEach(post => {
            post.category_ids?.forEach(id => ids.add(id));
        });
        return Array.from(ids);
    }, [posts]);
    
    const usedCategories = categories.filter(c => usedCategoryIds.includes(c.id));

    return (
        <div className="container mx-auto py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <h2 className="text-3xl font-headline font-bold">All Posts</h2>
                <div className="flex items-center gap-2 mt-4 md:mt-0 overflow-x-auto pb-2">
                    <Button 
                        variant={selectedCategoryId === null ? 'default' : 'outline'}
                        onClick={() => setSelectedCategoryId(null)}
                        className="shrink-0"
                    >
                        All Posts
                    </Button>
                    {usedCategories.map(category => (
                        <Button 
                            key={category.id}
                            variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                            onClick={() => setSelectedCategoryId(category.id!)}
                            className="shrink-0"
                        >
                           {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                       <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                            <Card className="overflow-hidden h-full border-none shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                                <CardContent className="p-0">
                                    <div className="aspect-video relative">
                                        <Image
                                            src={post.featured_image_url}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm text-muted-foreground">
                                             {new Date(post.published_at!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        <h3 className="font-semibold text-xl font-headline line-clamp-2 mt-2">{post.title}</h3>
                                        <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-24">
                        <h3 className="text-2xl font-semibold">No Posts Found</h3>
                        <p className="mt-2 text-muted-foreground">
                            There are no posts in this category yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
