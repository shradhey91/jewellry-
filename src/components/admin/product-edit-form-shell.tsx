"use client";

import dynamic from "next/dynamic";
import { ProductEditFormProps } from "./product-edit-form";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

// Dynamically import the form with SSR disabled
const ProductEditForm = dynamic(
  () => import("./product-edit-form").then((mod) => mod.ProductEditForm),
  {
    ssr: false,
    loading: () => <ProductFormSkeleton />,
  }
);

function ProductFormSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProductEditFormShell(props: ProductEditFormProps) {
  return <ProductEditForm {...props} />;
}
