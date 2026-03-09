
import { getCategories, getProducts, getMetals, getPurities } from '@/lib/server/api';
import { getShopPageContent } from '@/lib/get-shop-page-content';
import { ShopPageClient } from './shop-page-client';
import Image from 'next/image';

export const runtime = 'nodejs';

export default async function ShopPage() {
    const [content, allCategories, allProducts, metals, purities] = await Promise.all([
        getShopPageContent(),
        getCategories(),
        getProducts(),
        getMetals(),
        getPurities()
    ]);
    
    // Filter and sort categories based on admin settings
    const visibleCategoryIds = content.categories.filter(c => c.visible).map(c => c.id);
    const displayedCategories = allCategories
        .filter(c => visibleCategoryIds.includes(c.id))
        .sort((a, b) => visibleCategoryIds.indexOf(a.id) - visibleCategoryIds.indexOf(b.id));

    return (
        <div>
            <section className="relative h-[40vh] bg-black text-white flex items-center justify-center text-center">
                <Image
                    src={content.hero.imageUrl}
                    alt={content.hero.imageHint}
                    fill
                    className="object-cover opacity-30"
                    data-ai-hint={content.hero.imageHint}
                    priority
                />
                <div className="relative z-10 p-4 max-w-4xl mx-auto">
                    <h1 className="mt-2 text-4xl font-bold font-headline tracking-tight sm:text-5xl md:text-6xl">{content.hero.title}</h1>
                    <p className="mt-6 text-lg text-white/80">
                        {content.hero.subtitle}
                    </p>
                </div>
            </section>
            
            <ShopPageClient
                content={content}
                categories={displayedCategories}
                allCategories={allCategories}
                products={allProducts}
                metals={metals}
                purities={purities}
            />

        </div>
    );
}
