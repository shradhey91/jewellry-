
import { getMetals, getPurities } from "@/lib/server/api";
import { PageHeader } from "@/components/admin/page-header";
import { PricingForm } from "@/components/admin/pricing/pricing-form";

export const runtime = 'nodejs';

export default async function PricingPage() {
  const metals = await getMetals();
  const purities = await getPurities();

  const metalsWithPurities = metals.map(metal => ({
    ...metal,
    purities: purities.filter(p => p.metal_id === metal.id).sort((a, b) => b.fineness - a.fineness)
  }));


  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Pricing Management"
        description="Manage base metal prices and their associated purities."
      />
      <div className="max-w-4xl">
        <PricingForm metalsWithPurities={metalsWithPurities} />
      </div>
    </div>
  );
}
