
import { PageHeader } from "@/components/admin/page-header";
import { getSocialProofSettings, getProductsByIds } from "@/lib/server/api";
import { SocialProofForm } from "@/components/admin/social-proof-form";

export const runtime = 'nodejs';

export default async function SocialProofPage() {
  const settings = await getSocialProofSettings();
  const selectedProducts = await getProductsByIds(settings.productIds || []);

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Social Proof Settings"
        description="Customize the live purchase notifications."
      />
      <SocialProofForm initialSettings={settings} initialProducts={selectedProducts} />
    </div>
  );
}
