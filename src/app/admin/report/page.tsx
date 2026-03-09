
import { PageHeader } from "@/components/admin/page-header";
import { getSalesDataForChart } from "@/lib/server/api";
import { SalesChart } from "./sales-chart";

export const runtime = 'nodejs';

export default async function ReportPage() {
  const salesData = await getSalesDataForChart();

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Reports & Analytics"
        description="Visualize your store's performance."
      />
      <SalesChart data={salesData} />
    </div>
  );
}
