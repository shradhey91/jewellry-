import { getCategoryById, getProductsForCategory, getMetals, getPurities } from '@/lib/server/api';
import { notFound } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CategoryClientPage } from './category-client-page';
import { cn } from '@/lib/utils';

export const runtime = 'nodejs';

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [category, products, metals, purities] = await Promise.all([
    getCategoryById(id),
    getProductsForCategory(id),
    getMetals(),
    getPurities()
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 lg:py-10">
      
      {/* Breadcrumb - Desktop only: Reduced margin */}
      <Breadcrumb className="mb-4 hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Category Header: Optimized margins and font sizes */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline tracking-tight px-2 uppercase">
          {category.name}
        </h1>
        {/* Added border-y treatment consistent with TextHighlights improvements */}
        <div className="mt-4 py-4 border-y border-gray-100 max-w-3xl mx-auto">
          <p className="text-sm md:text-base text-muted-foreground px-4 leading-relaxed">
            Explore our exquisite collection of {category.name.toLowerCase()}. 
            Each piece is crafted with precision and passion.
          </p>
        </div>
      </div>

      {/* Grid rendering is handled here - ensure category-client-page doesn't have h-screen */}
      <CategoryClientPage
        products={products}
        metals={metals}
        purities={purities}
      />
    </div>
  );
}