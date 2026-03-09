
import { PageHeader } from "@/components/admin/page-header";
import { getDiamondGuideContent } from "@/lib/get-diamond-guide-content";
import { DiamondGuideForm } from "./diamond-guide-form";
import { saveDiamondGuideContentAction } from "./actions";

export const runtime = 'nodejs';

export default async function DiamondGuideEditorPage() {
  const content = await getDiamondGuideContent();

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Edit Diamond Guide Page"
        description="Modify the content and images for the diamond guide."
      />
      <DiamondGuideForm content={content} action={saveDiamondGuideContentAction} />
    </div>
  );
}
