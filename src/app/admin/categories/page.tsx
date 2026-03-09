
// --- Studio Assistant Note ---
// The product category structure is LOCKED.
// Do not add, edit, or delete categories without explicit user confirmation.
// The data source for categories is `src/lib/server/data/categories.json`
// and the schema is reflected in `docs/backend.json`.
// Both files are considered read-only unless the user specifies a change.
// --- End Studio Assistant Note ---

import { getCategories } from "@/lib/server/api";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryList } from "@/components/admin/categories/category-list";
import type { Category } from "@/lib/types";

export const runtime = 'nodejs';

export default async function CategoriesPage() {
  const allCategories = await getCategories();

  // Helper to build a hierarchical structure for display
  const buildHierarchy = (categories: Category[], parentId: string | null = null): Category[] => {
    return categories
      .filter(category => category.parent_id === parentId)
      .flatMap(category => [
        category,
        ...buildHierarchy(categories, category.id)
      ]);
  };
  
  const hierarchicalCategories = buildHierarchy(allCategories);
  
  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Product Categories"
        description="Organize your products into a hierarchy of categories."
      />
      <CategoryList categories={hierarchicalCategories} allCategories={allCategories} />
    </div>
  );
}
