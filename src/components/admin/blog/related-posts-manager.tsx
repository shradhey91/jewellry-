
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { X } from "lucide-react";
import type { BlogPost } from "@/lib/types";
import { PostSearch } from "./post-search";
import Image from "next/image";

interface RelatedPostsManagerProps {
    title: string;
    description: string;
    posts: BlogPost[];
    onPostsChange: (posts: BlogPost[]) => void;
    currentPostId: string;
}

export function RelatedPostsManager({ title, description, posts, onPostsChange, currentPostId }: RelatedPostsManagerProps) {

    const addPost = (post: BlogPost) => {
        if (!posts.find(p => p.id === post.id) && post.id !== currentPostId) {
            onPostsChange([...posts, post]);
        }
    };

    const removePost = (idToRemove: string) => {
        onPostsChange(posts.filter(p => p.id !== idToRemove));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <PostSearch onPostSelect={addPost} />
                
                <div className="space-y-2">
                    {posts.length > 0 ? (
                       <div className="grid grid-cols-1 gap-2">
                         {posts.map(post => (
                            <div key={post.id} className="relative group flex items-center gap-4 rounded-md border p-2">
                                <div className="relative h-12 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
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
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7"
                                    onClick={() => removePost(post.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                       </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No related posts added yet.</p>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Changes to this section are saved with the main post form.
                </p>
            </CardFooter>
        </Card>
    );
}
