
import { PageHeader } from "@/components/admin/page-header";
import { getShopPageContent, saveShopPageContent } from "@/lib/get-shop-page-content";
import { getCategories } from "@/lib/server/api";
import { ShopPageEditorForm } from "./shop-page-editor-form";
import { revalidatePath } from "next/cache";

export const runtime = 'nodejs';

export default async function ShopPageEditor() {
  const [content, allCategories] = await Promise.all([
    getShopPageContent(),
    getCategories()
  ]);
  
  async function saveAction(prevState: any, formData: FormData): Promise<{ message: string }> {
    "use server";
    
    const categoryOrder = JSON.parse(formData.get('categoryOrder') as string);
    
    const newContent = {
        hero: {
            title: formData.get('hero-title') as string,
            subtitle: formData.get('hero-subtitle') as string,
            imageUrl: formData.get('imageUrl-hero') as string,
            imageHint: formData.get('imageHint-hero') as string,
        },
        main: {
            title: formData.get('main-title') as string,
            allProductsLinkText: formData.get('main-allProductsLinkText') as string,
        },
        categories: categoryOrder,
    };
    
    try {
        await saveShopPageContent(newContent);
        revalidatePath('/shop');
        revalidatePath('/admin/pages/shop');
        return { message: 'Shop page content saved successfully!' };
    } catch (error) {
        return { message: 'Failed to save content.' };
    }
  }

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Edit 'Shop by Category' Page"
        description="Modify the content and layout of your main shop page."
      />
      <ShopPageEditorForm 
        content={content} 
        allCategories={allCategories}
        action={saveAction} 
      />
    </div>
  );
}
