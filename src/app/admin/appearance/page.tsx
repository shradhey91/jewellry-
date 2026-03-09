import { PageHeader } from "@/components/admin/page-header";
import { AppearanceForm } from "./appearance-form";
import type { HomepageContent } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderSettingsForm } from "./header-settings-form";
import { MobileAppearanceForm } from "./mobile-appearance-form";
import { MobileHeaderSettingsForm } from "./mobile-header-settings-form";
import { getCategories, getThemeSettings } from "@/lib/server/api";
import { HomepageLayoutEditor } from "./homepage-layout-editor";
import {
  getFooterContent,
  getMobileFooterContent,
} from "@/lib/get-footer-content";
import { FooterEditor } from "../footer/footer-editor";
import {
  saveFooterContentAction,
  saveMobileFooterContentAction,
} from "../footer/actions";
import { HomepageStatusSwitch } from "./homepage-status-switch";
import {
  getHomepageContent,
  getMobileHomepageContent,
} from "@/lib/get-homepage-content";

export const runtime = "nodejs";

export default async function AppearancePage() {
  const [
    homepageContent,
    mobileHomepageContent,
    categories,
    footerContent,
    mobileFooterContent,
    themeSettings,
  ] = await Promise.all([
    getHomepageContent(),
    getMobileHomepageContent(),
    getCategories(),
    getFooterContent(),
    getMobileFooterContent(),
    getThemeSettings(),
  ]);

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Homepage Appearance"
        description="Customize the look, feel, and content of your storefront."
      >
        <HomepageStatusSwitch
          isEnabled={(homepageContent as any).isEnabled ?? true}
        />
      </PageHeader>
      <Tabs defaultValue="homepage-content">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Homepage
            </h3>
            <TabsList>
              <TabsTrigger value="homepage-layout">Layout</TabsTrigger>
              <TabsTrigger value="mobile-homepage-layout">
                Mobile Layout
              </TabsTrigger>
              <TabsTrigger value="homepage-content">Content</TabsTrigger>
              <TabsTrigger value="mobile-homepage">Mobile Content</TabsTrigger>
            </TabsList>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Header & Footer
            </h3>
            <TabsList>
              <TabsTrigger value="header">Header</TabsTrigger>
              <TabsTrigger value="mobile-header">Mobile Header</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="mobile-footer">Mobile Footer</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="homepage-layout">
          <HomepageLayoutEditor content={homepageContent} />
        </TabsContent>
        <TabsContent value="mobile-homepage-layout">
          <HomepageLayoutEditor
            content={mobileHomepageContent}
            isMobile={true}
          />
        </TabsContent>
        <TabsContent value="homepage-content">
          <AppearanceForm content={homepageContent} categories={categories} />
        </TabsContent>
        <TabsContent value="mobile-homepage">
          <MobileAppearanceForm
            content={mobileHomepageContent}
            categories={categories}
          />
        </TabsContent>
        <TabsContent value="header">
          <HeaderSettingsForm />
        </TabsContent>
        <TabsContent value="mobile-header">
          <MobileHeaderSettingsForm />
        </TabsContent>
        <TabsContent value="footer">
          <FooterEditor
            content={footerContent}
            action={saveFooterContentAction}
          />
        </TabsContent>
        <TabsContent value="mobile-footer">
          <FooterEditor
            content={mobileFooterContent}
            action={saveMobileFooterContentAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
