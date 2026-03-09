"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Discount } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DiscountDialog } from "./discount-dialog";
import { DiscountDeleteDialog } from "./discount-delete-dialog";

export const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => {
      const code = row.getValue("code") as string;
      return <Badge variant="outline" className="font-mono">{code}</Badge>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return type === 'percentage' ? "Percentage" : "Fixed Amount";
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const type = row.original.type;
      const value = parseFloat(row.getValue("value"));
      if (type === 'percentage') {
        return <div>{value}%</div>;
      }
      return <div>₹{value.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "usage_count",
    header: "Usage",
    cell: ({ row }) => {
      const count = row.getValue("usage_count") as number;
      const limit = row.original.usage_limit;
      return <div>{count} / {limit ?? '∞'}</div>;
    },
  },
    {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      const endDate = row.original.end_date ? new Date(row.original.end_date) : null;
      const hasExpired = endDate && endDate < new Date();

      if (hasExpired) {
          return <Badge variant="destructive">Expired</Badge>;
      }

      return (
        <Badge variant={isActive ? "secondary" : "outline"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const discount = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DiscountDialog discount={discount}>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              </DiscountDialog>
              <DiscountDeleteDialog discount={discount}>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onSelect={(e) => e.preventDefault()}
                >
                  Delete
                </DropdownMenuItem>
              </DiscountDeleteDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
