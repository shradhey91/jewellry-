

import { PageHeader } from "@/components/admin/page-header";
import { getMinimalistHomepageContent, getMobileMinimalistHomepageContent } from "@/lib/get-minimalist-homepage-content";
import { getCategories } from "@/lib/server/api";
import { MinimalistAppearanceForm } from "./minimalist-appearance-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileMinimalistAppearanceForm } from "./mobile-minimalist-appearance-form";

export const runtime = 'nodejs';

export default async function MinimalistThemePage() {
  const [content, mobileContent, categories] = await Promise.all([
    getMinimalistHomepageContent(),
    getMobileMinimalistHomepageContent(),
    getCategories()
  ]);

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader title="Edit Minimalist Homepage" description="Customize the content for your minimalist theme." />
       <Tabs defaultValue="desktop">
        <TabsList className="mb-4">
            <TabsTrigger value="desktop">Desktop Content</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Content</TabsTrigger>
        </TabsList>
        <TabsContent value="desktop">
            <MinimalistAppearanceForm content={content} categories={categories} />
        </TabsContent>
        <TabsContent value="mobile">
            <MobileMinimalistAppearanceForm content={mobileContent} categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
