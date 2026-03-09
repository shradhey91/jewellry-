
import { PageHeader } from "@/components/admin/page-header";
import { getHomepageContent, getMobileHomepageContent } from "@/lib/get-homepage-content";
import { getDiamondGuideContent } from "@/lib/get-diamond-guide-content";
import { MediaTabs } from "./media-tabs";

export const runtime = 'nodejs';

export default async function MediaPage() {
  const [homepageContent, mobileHomepageContent, diamondGuideContent] = await Promise.all([
    getHomepageContent(),
    getMobileHomepageContent(),
    getDiamondGuideContent()
  ]);

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Media Library"
        description="Manage all images for your products, blog, and website."
      />
      <MediaTabs 
        homepageContent={homepageContent}
        mobileHomepageContent={mobileHomepageContent}
        diamondGuideContent={diamondGuideContent}
      />
    </div>
  );
}
