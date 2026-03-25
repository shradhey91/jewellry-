"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { ChangeHistory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';

export const columns: ColumnDef<ChangeHistory>[] = [
  {
    accessorKey: "entity_type",
    header: "Type",
    cell: ({ row }) => {
        const type = row.getValue("entity_type") as string;
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        if (type === 'Product') variant = 'default';
        if (type === 'Category') variant = 'outline';
        if (type === 'Pricing') variant = 'secondary';
        if (type === 'Menu') variant = 'default';
        if (type === 'Tax') variant = 'outline';
        return <Badge variant={variant}>{type}</Badge>
    }
  },
  {
    accessorKey: "entity_name",
    header: "Entity",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
        const action = row.getValue("action") as string;
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        if (action === 'Created') variant = 'default';
        if (action === 'Updated') variant = 'secondary';
        if (action === 'Deleted') variant = 'destructive';
        return <Badge variant={variant}>{action}</Badge>
    }
  },
  {
    accessorKey: "user",
    header: "User",
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"));
      return <span>{formatDistanceToNow(date, { addSuffix: true })}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const historyItem = row.original;

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
              <DropdownMenuItem
                disabled // Revert action is not implemented
              >
                Revert this change
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
