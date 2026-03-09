
import Link from "next/link";
import { getProducts } from "@/lib/server/api";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ProductDataTable } from "./product-data-table";

export const runtime = 'nodejs';

export default async function AdminProductsPage() {
  const data = await getProducts();

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Products"
        description="Manage your store's products, prices, and inventory."
      >
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </PageHeader>
      <ProductDataTable data={data} />
    </div>
  );
}
