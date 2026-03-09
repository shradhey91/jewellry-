

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar, User } from 'lucide-react';
import type { BlogPost, BlogTheme, Product } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { getAllPosts, getPostBySlug } from '@/app/admin/blog/[slug]/actions';
import { getProductById } from '@/lib/server/api';
import { ProductCard } from '@/components/products/product-card';

export const runtime = 'nodejs';

// Helper function to parse content and fetch product data
async function parseContent(content: string): Promise<({ type: 'html', data: string } | { type: 'product', data: Product })[]> {
    const shortcodeRegex = /\[product:(.*?)\]/g;
    const parts = content.split(shortcodeRegex);
    const contentAndProducts = [];

    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 1) { // This is a product ID
            const productId = parts[i];
            const product = await getProductById(productId);
            if (product) {
                contentAndProducts.push({ type: 'product', data: product });
            }
        } else { // This is a regular HTML string
             if (parts[i]) {
                contentAndProducts.push({ type: 'html', data: parts[i] });
             }
        }
    }
    return contentAndProducts;
}

const PostContent = ({ parsedContent }: { parsedContent: Awaited<ReturnType<typeof parseContent>> }) => {
    return (
        <>
            {parsedContent.map((item, index) => {
                if (item.type === 'html') {
                    return <div key={index} dangerouslySetInnerHTML={{ __html: item.data as string }} />;
                }
                if (item.type === 'product') {
                    const product = item.data as Product;
                    return (
                        <div key={index} className="my-8 flex justify-center not-prose">
                            <div className="w-full max-w-sm">
                                <ProductCard product={product} />
                            </div>
                        </div>
                    );
                }
                return null;
            })}
        </>
    );
};

const PostMeta = ({ post }: { post: BlogPost }) => (
    <div className="mt-4 flex items-center justify-center gap-x-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{post.author}</span>
        </div>
        {post.published_at && (
            <>
                <span className="opacity-50">|</span>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                </div>
            </>
        )}
    </div>
);

// --- Theme Layouts ---

const ClassicLayout = ({ post, parsedContent }: { post: BlogPost, parsedContent: Awaited<ReturnType<typeof parseContent>> }) => (
    <div className="bg-background">
        <div className="container max-w-4xl mx-auto py-12 md:py-16">
            <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink href="/blog">Blog</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>{post.title}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">{post.title}</h1>
                <PostMeta post={post} />
            </header>

            <div className="aspect-[16/9] relative rounded-xl overflow-hidden mb-12">
                <Image src={post.featured_image_url} alt={post.title} fill className="object-cover"/>
            </div>

            <article className="prose prose-lg lg:prose-xl max-w-none mx-auto">
                <PostContent parsedContent={parsedContent} />
            </article>
        </div>
    </div>
);


const MagazineLayout = ({ post, parsedContent }: { post: BlogPost, parsedContent: Awaited<ReturnType<typeof parseContent>> }) => (
    <div className="bg-background">
        <header className="relative h-[70vh] text-white flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0">
                <Image src={post.featured_image_url} alt={post.title} fill className="object-cover"/>
                <div className="absolute inset-0 bg-black/60" />
            </div>
            <div className="relative z-10 container max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter">{post.title}</h1>
                <div className="mt-6 flex items-center justify-center gap-x-6 text-sm text-white/90">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                    </div>
                    {post.published_at && (
                        <>
                            <span className="opacity-50">|</span>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <time dateTime={post.published_at}>
                                    {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </time>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>

        <article className="py-12 md:py-16">
            <div className="container max-w-3xl mx-auto prose prose-lg lg:prose-xl">
                 <PostContent parsedContent={parsedContent} />
            </div>
        </article>
    </div>
);


const MinimalistLayout = ({ post, parsedContent }: { post: BlogPost, parsedContent: Awaited<ReturnType<typeof parseContent>> }) => (
    <div className="bg-stone-50 text-stone-800 font-serif">
         <div className="container max-w-3xl mx-auto py-16 md:py-24">
             <Breadcrumb className="mb-8 text-sm">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/" className="text-stone-500 hover:text-stone-800">Home</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbLink href="/blog" className="text-stone-500 hover:text-stone-800">Blog</BreadcrumbLink></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-medium tracking-tight">{post.title}</h1>
                 <div className="mt-6 border-t pt-4 flex items-center gap-x-6 text-xs uppercase text-stone-500 tracking-wider">
                    <span>By {post.author}</span>
                    {post.published_at && (
                        <>
                            <span>/</span>
                            <time dateTime={post.published_at}>
                                {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>
                        </>
                    )}
                </div>
            </header>

            <article className="prose prose-lg max-w-none prose-stone prose-p:leading-relaxed prose-headings:font-medium">
                 <PostContent parsedContent={parsedContent} />
            </article>
        </div>
    </div>
);


// --- Main Page Controller ---

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post || post.status !== 'published' || (post.published_at && new Date(post.published_at) > new Date())) {
    notFound();
  }

  const allPosts = await getAllPosts();
  const relatedPosts = allPosts.filter(p => post.related_post_ids?.includes(p.id) && p.id !== post.id);
  
  const theme = post.theme || 'classic';
  const parsedContent = await parseContent(post.content);

  const LayoutComponent = {
      classic: ClassicLayout,
      magazine: MagazineLayout,
      minimalist: MinimalistLayout,
  }[theme];

  return (
    <>
      <LayoutComponent post={post} parsedContent={parsedContent} />

      {relatedPosts.length > 0 && (
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container max-w-5xl mx-auto">
            <h2 className="text-3xl font-headline text-center mb-8">Related Reads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map(relatedPost => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group">
                  <Card className="overflow-hidden h-full border-none shadow-lg transition-shadow hover:shadow-xl">
                    <CardContent className="p-0">
                      <div className="aspect-video relative">
                        <Image
                          src={relatedPost.featured_image_url}
                          alt={relatedPost.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-xl font-headline line-clamp-2">{relatedPost.title}</h3>
                        <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
