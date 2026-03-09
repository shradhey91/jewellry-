
import { PageHeader } from "@/components/admin/page-header";
import { BlogCategoryTable } from "@/components/admin/blog/blog-category-table";
import { getAllCategories } from "@/app/admin/blog/[slug]/actions";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CategoryDialog } from "@/components/admin/blog/blog-category-dialog";

export const runtime = 'nodejs';

export default async function BlogCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Blog Categories"
        description="Manage categories for your blog posts."
      >
        <CategoryDialog>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
            </Button>
        </CategoryDialog>
      </PageHeader>
      <div className="md:col-span-2">
        <BlogCategoryTable categories={categories} />
      </div>
    </div>
  );
}
