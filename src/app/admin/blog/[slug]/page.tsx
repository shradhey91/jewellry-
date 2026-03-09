

'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Palette, Link as LinkIcon, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "@/app/admin/blog/new/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BlogPost, BlogTheme, BlogCategory } from '@/lib/types';
import { getPostBySlug, savePost, getAllPosts, getAllCategories, PostFormState } from './actions';
import { RelatedPostsManager } from '@/components/admin/blog/related-posts-manager';
import { ProductSearch } from '@/components/admin/blog/product-search';
import { useToast } from '@/hooks/use-toast.tsx';
import { useFormStatus } from 'react-dom';
import { BlogCategoryManager } from '@/components/admin/blog/blog-category-manager';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


function SubmitButton({ intent, isPublished, isScheduled }: { intent: 'save' | 'publish' | 'unpublish', isPublished: boolean, isScheduled: boolean }) {
  const { pending } = useFormStatus();
  
  const text = {
      save: "Save Draft",
      publish: isPublished ? "Update" : isScheduled ? "Schedule" : "Publish",
      unpublish: "Unpublish"
  }
  
  return (
    <Button type="submit" name="intent" value={intent} disabled={pending}>
      {pending ? "Saving..." : text[intent]}
    </Button>
  );
}


export default function EditBlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState(params.slug);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [theme, setTheme] = useState<BlogTheme>('classic');
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<BlogCategory[]>([]);
  const [publishDate, setPublishDate] = useState<Date | undefined>();
  const router = useRouter();
  const { toast } = useToast();
  
  const initialState: PostFormState = { message: "", errors: {} };
  const [state, setState] = useState(initialState);
  
  const isScheduled = post?.status === 'draft' && post?.published_at && new Date(post.published_at) > new Date();

  useEffect(() => {
    const fetchPostAndCategories = async () => {
      const [fetchedPost, fetchedCategories] = await Promise.all([
          getPostBySlug(params.slug),
          getAllCategories()
      ]);
      
      setAllCategories(fetchedCategories);

      if (fetchedPost) {
        setPost(fetchedPost);
        setContent(fetchedPost.content);
        setTitle(fetchedPost.title);
        setSlug(fetchedPost.slug);
        setFeaturedImageUrl(fetchedPost.featured_image_url);
        setTheme(fetchedPost.theme || 'classic');
        setCategoryIds(fetchedPost.category_ids || []);
        setPublishDate(fetchedPost.published_at ? new Date(fetchedPost.published_at) : new Date());


        if(fetchedPost.related_post_ids) {
            const allPosts = await getAllPosts();
            const related = allPosts.filter(p => fetchedPost.related_post_ids?.includes(p.id));
            setRelatedPosts(related);
        }
      } else {
        notFound();
      }
      setIsLoading(false);
    };

    fetchPostAndCategories();
  }, [params.slug]);
  
  useEffect(() => {
    if (state.message) {
        toast({
            title: state.errors ? "Error" : "Success",
            description: state.message,
            variant: state.errors ? "destructive" : "default",
        });
        if (state.post_slug && state.post_slug !== params.slug) {
            router.push(`/admin/blog/${state.post_slug}`);
        } else {
            router.refresh();
        }
    }
  }, [state, toast, router, params.slug]);

  const formAction = async (formData: FormData) => {
    if (!post) return;
    formData.set('id', post.id);
    formData.set('content', content);
    formData.set('theme', theme);
    formData.set('related_post_ids', JSON.stringify(relatedPosts.map(p => p.id)));
    formData.set('category_ids', JSON.stringify(categoryIds));
    if (publishDate) {
        formData.set('published_at', publishDate.toISOString());
    }
    const result = await savePost(state, formData);
    setState(result);
  }

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Add a proper skeleton loader
  }

  if (!post) {
    return notFound();
  }

  const getStatusText = () => {
    if (post.status === 'published') return 'Published';
    if (isScheduled) return `Scheduled for ${format(new Date(post.published_at!), "PPP")}`;
    return 'Draft';
  }

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title={`Edit Post`}
        description="Update the details for your blog article."
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
                            <Input id="title" name="title" defaultValue={post.title} />
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
                    currentPostId={post.id}
                 />
            </div>
            <div className="lg:col-span-1 space-y-8 sticky top-24">
                <Card>
                    <CardHeader>
                        <CardTitle>Publish</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="text-sm text-muted-foreground">
                            Status: <strong className="text-foreground">{getStatusText()}</strong>
                        </div>
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
                        <SubmitButton intent="save" isPublished={post.status === 'published'} isScheduled={!!isScheduled} />
                        {post.status === 'draft' ? (
                            <SubmitButton intent="publish" isPublished={post.status === 'published'} isScheduled={!!isScheduled} />
                        ) : (
                             <SubmitButton intent="unpublish" isPublished={post.status === 'published'} isScheduled={!!isScheduled} />
                        )}
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Post Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input id="slug" name="slug" defaultValue={slug} />
                        </div>
                         <div className="space-y-2">
                            <Label>Featured Image URL</Label>
                            <Input name="featured_image_url_text" defaultValue={featuredImageUrl} placeholder="https://images.unsplash.com/..."/>
                            {featuredImageUrl && <img src={featuredImageUrl} alt="Featured" className="mt-2 rounded-md aspect-video object-cover" />}
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
