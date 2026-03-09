"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";
import { Product } from "@/lib/types";

const DataTableLoader = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>
      <div className="rounded-md border">
        <div className="h-[500px] w-full"></div>
      </div>
    </div>
  );
};

const DataTable = dynamic(
  () => import("./data-table").then((mod) => mod.DataTable),
  {
    ssr: false,
    loading: () => <DataTableLoader />,
  }
);

interface ProductDataTableProps {
  data: Product[];
}

export function ProductDataTable({ data }: ProductDataTableProps) {
  return <DataTable columns={columns} data={data} />;
}
