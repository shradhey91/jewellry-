import { PageHeader } from "@/components/admin/page-header";
import { DiscountsTable } from "@/components/admin/discounts/discounts-table";
import { getDiscounts } from "@/lib/server/actions/discounts";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DiscountDialog } from "@/components/admin/discounts/discount-dialog";

export const runtime = 'nodejs';

export default async function DiscountsPage() {
  const discounts = await getDiscounts();

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Discounts"
        description="Manage coupon codes and promotions for your store."
      >
        <DiscountDialog>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Discount
            </Button>
        </DiscountDialog>
      </PageHeader>
      <DiscountsTable data={discounts} />
    </div>
  );
}
