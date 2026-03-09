
import { getAllPosts, getAllCategories } from '@/app/admin/blog/[slug]/actions';
import { BlogClientPage } from './blog-client-page';
import Image from 'next/image';

export const runtime = 'nodejs';

export default async function BlogPage() {
    const [posts, categories] = await Promise.all([
        getAllPosts(),
        getAllCategories()
    ]);

    const now = new Date();
    const publishedPosts = posts.filter(p => 
        p.status === 'published' && p.published_at && new Date(p.published_at) <= now
    );
    
    return (
        <div className="bg-background">
            <section className="relative h-[40vh] bg-black text-white flex items-center justify-center text-center">
                <Image
                    src="https://images.unsplash.com/photo-1516245834210-c4c1427873ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxqb3VybmFsfGVufDB8fHx8MTc2ODI3NDg0MXww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="A person writing in a journal"
                    fill
                    className="object-cover opacity-30"
                    data-ai-hint="journal writing"
                    priority
                />
                <div className="relative z-10 p-4 max-w-4xl mx-auto">
                    <h1 className="mt-2 text-4xl font-bold font-headline tracking-tight sm:text-5xl md:text-6xl">The Aparra Journal</h1>
                    <p className="mt-6 text-lg text-white/80">
                        Stories, insights, and inspiration from the world of fine jewelry.
                    </p>
                </div>
            </section>
            
            <BlogClientPage
                posts={publishedPosts}
                categories={categories}
            />

        </div>
    );
}
