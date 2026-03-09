import { getCategoryById, getProductsForCategory, getMetals, getPurities } from '@/lib/server/api';
import { notFound } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CategoryClientPage } from './category-client-page';

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
    <div className="container mx-auto px-4 py-6 md:py-12">
      {/* Breadcrumb - Desktop only */}
      <Breadcrumb className="mb-3 md:mb-4 hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Category Header */}
      <div className="text-center mb-6 md:mb-12">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-headline tracking-tight px-2">
          {category.name}
        </h1>
        <p className="mt-2 md:mt-4 max-w-2xl mx-auto text-sm md:text-base text-muted-foreground px-4">
          Explore our exquisite collection of {category.name.toLowerCase()}. Each piece is crafted with precision and passion.
        </p>
      </div>

      <CategoryClientPage
        products={products}
        metals={metals}
        purities={purities}
      />
    </div>
  );
}
