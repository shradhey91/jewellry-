
import { getTaxClasses } from "@/lib/server/api";
import { PageHeader } from "@/components/admin/page-header";
import { TaxClassesTable } from "@/components/admin/tax/tax-classes-table";
import { TaxClassDialog } from "@/components/admin/tax/tax-class-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const runtime = 'nodejs';

export default async function TaxClassesPage() {
  const taxClasses = await getTaxClasses();

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Tax Classes"
        description="Manage tax rates for your products."
      >
        <TaxClassDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tax Class
          </Button>
        </TaxClassDialog>
      </PageHeader>
      <TaxClassesTable data={taxClasses} />
    </div>
  );
}
