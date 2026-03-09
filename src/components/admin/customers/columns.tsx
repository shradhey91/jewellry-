
"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Customer, User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CustomerActions } from "./customer-actions";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone_number",
    header: "Phone Number",
    cell: ({ row }) => {
      return row.getValue("phone_number") || <span className="text-muted-foreground">N/A</span>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
     cell: ({ row }) => {
      return row.getValue("email") || <span className="text-muted-foreground">N/A</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original;
      if (user.status === 'banned') {
        return <Badge variant="destructive">Banned</Badge>;
      }
      if (!user.email_verified && !user.phone_number_verified) {
        return <Badge variant="outline">Pending</Badge>;
      }
      return <Badge variant="secondary">Active</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Date Joined",
    cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        // Use consistent date format to avoid hydration mismatch
        const formattedDate = date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        return <span>{formattedDate}</span>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;
      return <CustomerActions customer={customer} />;
    },
  },
];
