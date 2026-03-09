"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TaxClass } from "@/lib/types";
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
import { TaxClassDialog } from "./tax-class-dialog";
import { TaxClassDeleteDialog } from "./tax-class-delete-dialog";

export const columns: ColumnDef<TaxClass>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "rate_type",
    header: "Type",
    cell: ({ row }) => {
      const rateType = row.getValue("rate_type") as string;
      return (
        <Badge variant={rateType === 'percentage' ? 'default' : 'secondary'}>
          {rateType === 'percentage' ? '%' : '₹'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "rate_value",
    header: "Value",
    cell: ({ row }) => {
      const rateValue = parseFloat(row.getValue("rate_value"));
      const rateType = row.getValue("rate_type") as string;
      return <div>{rateType === 'percentage' ? `${rateValue}%` : `₹${rateValue}`}</div>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
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
      const taxClass = row.original;

      // Disable actions for the default "Jewellery GST"
      if (taxClass.id === 'tax-1') {
        return (
          <div className="text-right">
             <Button variant="ghost" className="h-8 w-8 p-0" disabled>
                <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        );
      }

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
              <TaxClassDialog taxClass={taxClass}>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              </TaxClassDialog>
              <TaxClassDeleteDialog taxClass={taxClass}>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  Delete
                </DropdownMenuItem>
              </TaxClassDeleteDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

    