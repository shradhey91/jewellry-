"use client";

import React from "react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/lib/types";
import { getAllPosts, deletePostAction } from "@/app/admin/blog/[slug]/actions";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast.tsx";
import { useRouter } from "next/navigation";

function BlogPosts() {
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    async function fetchPosts() {
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const handleDelete = async (postId: string, postSlug: string) => {
    const result = await deletePostAction(postId, postSlug);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  if (loading) {
    return <div className="text-center py-16">Loading posts...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold">No Blog Posts Yet</h3>
        <p className="text-muted-foreground mt-2">
          Click "Add New Post" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="flex flex-col">
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
          <CardHeader>
            <CardTitle className="line-clamp-2">{post.title}</CardTitle>
            <div className="flex items-center gap-2 pt-1">
              <Badge
                variant={post.status === "published" ? "secondary" : "outline"}
              >
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </Badge>
              {post.published_at && (
                <span className="text-xs text-muted-foreground">
                  {new Date(post.published_at).toLocaleDateString("en-GB")}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.excerpt}
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/blog/${post.slug}`}
                      className="flex items-center"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span>View on site</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive flex items-center"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete this post?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the post titled "{post.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(post.id, post.slug)}
                  >
                    Delete Post
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function BlogPostsPage() {
  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Blog Posts"
        description="Create and manage your blog articles."
      >
        <Button asChild>
          <Link href="/admin/blog/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Post
          </Link>
        </Button>
      </PageHeader>
      <BlogPosts />
    </div>
  );
}
