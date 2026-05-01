

'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Palette, Link as LinkIcon, Loader2, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { RichTextEditor } from "./rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BlogTheme, BlogPost, BlogCategory } from '@/lib/types';
import { RelatedPostsManager } from '@/components/admin/blog/related-posts-manager';
import { ProductSearch } from '@/components/admin/blog/product-search';
import { savePost, PostFormState, getAllCategories } from '@/app/admin/blog/[slug]/actions';
import { useToast } from '@/hooks/use-toast.tsx';
import { BlogCategoryManager } from '@/components/admin/blog/blog-category-manager';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function SubmitButton({ intent, isScheduled }: { intent: 'save' | 'publish', isScheduled: boolean }) {
  const { pending } = useFormStatus();
  
  const text = {
      save: "Save as Draft",
      publish: isScheduled ? "Schedule" : "Publish"
  }

  return (
    <Button type="submit" name="intent" value={intent} disabled={pending}>
      {pending ? "Saving..." : text[intent]}
    </Button>
  );
}

export default function NewBlogPostPage() {
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<BlogTheme>('classic');
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<BlogCategory[]>([]);
  const [publishDate, setPublishDate] = useState<Date | undefined>(new Date());
  const router = useRouter();
  const { toast } = useToast();
  
  const initialState: PostFormState = { message: "", errors: {} };
  const [state, setState] = useState(initialState);

  useEffect(() => {
    async function fetchCategories() {
        const cats = await getAllCategories();
        setAllCategories(cats);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors && Object.keys(state.errors).length > 0 ? "Error" : "Success",
        description: state.message,
        variant: state.errors && Object.keys(state.errors).length > 0 ? "destructive" : "default",
      });
      if (state.post_slug && state.post_id) {
          router.push(`/admin/blog/${state.post_slug}`);
      }
    }
  }, [state, toast, router]);

  const formAction = async (formData: FormData) => {
    formData.set('id', 'new');
    formData.set('content', content);
    formData.set('theme', theme);
    formData.set('related_post_ids', JSON.stringify(relatedPosts.map(p => p.id)));
    formData.set('category_ids', JSON.stringify(categoryIds));
    if (publishDate) {
        formData.set('published_at', publishDate.toISOString());
    }
    const result = await savePost(initialState, formData);
    setState(result);
  };

  const isScheduled = publishDate ? publishDate > new Date() : false;

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Create New Post"
        description="Fill in the details for your new blog article."
      >
        <Button variant="outline" asChild>
            <Link href="/admin/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Posts
            </Link>
        </Button>
      </PageHeader>
      <form action={formAction} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Post Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Post Title</Label>
                            <Input id="title" name="title" placeholder="Your amazing blog post title" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <RichTextEditor value={content} onChange={setContent} />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <LinkIcon className="h-5 w-5" />
                           Product Links
                        </CardTitle>
                        <CardDescription>
                            Search for a product and copy its shortcode to embed it in your post content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProductSearch />
                    </CardContent>
                </Card>

                 <RelatedPostsManager
                    title="Related Posts"
                    description="Suggest these posts to readers at the end of the article."
                    posts={relatedPosts}
                    onPostsChange={setRelatedPosts}
                    currentPostId="new"
                 />
            </div>
            <div className="lg:col-span-1 space-y-8 sticky top-24">
                <Card>
                    <CardHeader>
                        <CardTitle>Publish</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <p className="text-sm text-muted-foreground">Status: <strong>Draft</strong></p>
                       <div className="space-y-2">
                            <Label>Publish Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !publishDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {publishDate ? format(publishDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={publishDate}
                                    onSelect={setPublishDate}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                       </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                         <SubmitButton intent="save" isScheduled={isScheduled} />
                         <SubmitButton intent="publish" isScheduled={isScheduled} />
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Post Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label>Featured Image URL</Label>
                             <Input name="featured_image_url_text" placeholder="https://images.unsplash.com/..."/>
                        </div>
                    </CardContent>
                </Card>
                 <BlogCategoryManager
                    allCategories={allCategories}
                    selectedCategoryIds={categoryIds}
                    onSelectedCategoryIdsChange={setCategoryIds}
                />
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette />
                            Theme
                        </CardTitle>
                         <CardDescription>Choose a visual theme for this post.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select value={theme} onValueChange={(value) => setTheme(value as BlogTheme)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="classic">Classic</SelectItem>
                                <SelectItem value="magazine">Magazine</SelectItem>
                                <SelectItem value="minimalist">Minimalist</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </div>
        </div>
      </form>
    </div>
  );
}
