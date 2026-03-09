
import { PageHeader } from "@/components/admin/page-header";
import { getFooterContent, saveFooterContent } from "@/lib/get-footer-content";
import { FooterEditor } from "./footer-editor";
import { revalidatePath } from "next/cache";
import type { FooterContent } from "@/lib/types";

export const runtime = 'nodejs';

export default async function FooterEditorPage() {
  const content = await getFooterContent();
  
  async function saveAction(prevState: any, formData: FormData): Promise<{ message: string }> {
    "use server";
    
    const newContent: FooterContent = {
      columns: JSON.parse(formData.get('columns') as string),
      contact: JSON.parse(formData.get('contact') as string),
      locations: JSON.parse(formData.get('locations') as string),
      socials: JSON.parse(formData.get('socials') as string),
      bottom: JSON.parse(formData.get('bottom') as string),
    };
    
    try {
        await saveFooterContent(newContent);
        revalidatePath('/'); // Revalidate homepage and all layouts
        revalidatePath('/admin/footer');
        return { message: 'Footer content saved successfully!' };
    } catch (error) {
        return { message: 'Failed to save content.' };
    }
  }

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Edit Footer"
        description="Modify the content of your website's footer."
      />
      <FooterEditor 
        content={content} 
        action={saveAction} 
      />
    </div>
  );
}
