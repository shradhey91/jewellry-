

import { getProductById, getMetals, getPurities, getTaxClasses, getProductsByIds, getCategories, getAllReviewsForProduct } from "@/lib/server/api";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductEditFormShell } from "@/components/admin/product-edit-form-shell";
import { AddReviewDialog } from "@/components/admin/reviews/add-review-dialog";

export const runtime = 'nodejs';

export default async function ProductEditPage({ params }: { params: { id:string } }) {
  const [product, metals, purities, taxClasses, categories, reviews] = await Promise.all([
    getProductById(params.id),
    getMetals(),
    getPurities(),
    getTaxClasses(),
    getCategories(),
    getAllReviewsForProduct(params.id)
  ]);

  if (!product) {
    notFound();
  }

  const [crossSellProducts, upsellProducts] = await Promise.all([
      product.cross_sell_products ? getProductsByIds(product.cross_sell_products) : Promise.resolve([]),
      product.upsell_products ? getProductsByIds(product.upsell_products) : Promise.resolve([]),
  ]);

  return (
    <div className="container mx-auto py-2 mb-8">
      <PageHeader
        title="Edit Product"
        description={`Manage details for ${product.name}`}
      >
        <div className="flex items-center gap-2">
            <AddReviewDialog productId={product.id}>
                <Button variant="outline">
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    Add Review
                </Button>
            </AddReviewDialog>
            <Button variant="outline" asChild>
              <Link href="/admin/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
        </div>
      </PageHeader>
      <ProductEditFormShell 
        product={product}
        metals={metals}
        purities={purities}
        taxClasses={taxClasses}
        categories={categories}
        crossSellProducts={crossSellProducts}
        upsellProducts={upsellProducts}
        reviews={reviews}
      />
    </div>
  );
}

    