

import { getMetals, getPurities, getTaxClasses, getCategories } from "@/lib/server/api";
import { PageHeader } from "@/components/admin/page-header";
import { ProductEditFormShell } from "@/components/admin/product-edit-form-shell";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const runtime = 'nodejs';

export default async function NewProductPage() {
  const [metals, purities, taxClasses, categories] = await Promise.all([
    getMetals(),
    getPurities(),
    getTaxClasses(),
    getCategories(),
  ]);

  const newProduct = {
    id: 'new', // Placeholder ID for creation
    name: '',
    description: '',
    seo_title: '',
    seo_description: '',
    gross_weight: 0,
    net_weight: 0,
    metal_id: metals.find(m => m.is_active)?.id || '',
    purity_id: '',
    tax_class_id: taxClasses.find(t => t.is_active)?.id || '',
    category_ids: [],
    making_charge_type: 'percentage' as const,
    making_charge_value: 0,
    auto_price_enabled: true,
    manual_price: null,
    is_active: false,
    variants: [],
    media: [],
    certificates: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // These will be calculated on the backend, but need to be here for type conformity
    price_breakup: { metal_value: 0, making_charge: 0, diamond_value: 0, gst: 0, total: 0 },
    display_price: 0,
    availability: 'OUT_OF_STOCK' as const,
    has_diamonds: false,
    diamond_details: [],
    cross_sell_products: [],
    upsell_products: [],
    has_size_dimensions: false,
    height: null,
    width: null,
    length: null,
    has_ring_size: false,
    featureTabs: [],
    galleryImages: [],
  };

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Create New Product"
        description="Fill in the details to add a new product to your store."
      >
        <Button variant="outline" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </PageHeader>
      <ProductEditFormShell
        product={newProduct}
        metals={metals}
        purities={purities}
        taxClasses={taxClasses}
        categories={categories}
        isNew
      />
    </div>
  );
}
