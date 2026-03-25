'use client';

import { ColumnDef } from "@tanstack/react-table";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { updateOrderStatus } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { UpdateStatusDialog } from "./update-status-dialog";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const StatusBadge = ({ status }: { status: Order['status'] }) => {
    const variantMap: Record<Order['status'], "default" | "secondary" | "destructive" | "outline"> = {
        processing: 'default',
        shipped: 'secondary',
        delivered: 'secondary',
        cancelled: 'destructive'
    };
    const variant = variantMap[status] || 'outline';

    if(status === 'delivered') {
         return <Badge variant={variant} className="bg-green-600 text-white hover:bg-green-700">Delivered</Badge>
    }
    
    return <Badge variant={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}

const OrderActions = ({ order }: { order: Order }) => {
    const { toast } = useToast();
    const router = useRouter();

    const handleStatusChange = async (status: Order['status']) => {
        const result = await updateOrderStatus(order.id, status);
        toast({
            title: result.success ? "Success" : "Error",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
        if (result.success) {
            router.refresh();
        }
    };
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                 <a href={`/checkout/order-confirmation/${order.id}`} target="_blank" rel="noopener noreferrer">View Order Details</a>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleStatusChange('processing')}>Processing</DropdownMenuItem>
                        <UpdateStatusDialog order={order}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Shipped
                            </DropdownMenuItem>
                        </UpdateStatusDialog>
                        <DropdownMenuItem onClick={() => handleStatusChange('delivered')}>Delivered</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('cancelled')} className="text-destructive">Cancelled</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
    )
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => {
        const id = row.getValue("id") as string;
        return <div className="font-mono text-xs">#{id.split('-')[1]}</div>
    }
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "created_at",
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
      const date = new Date(row.getValue("created_at"));
      // Use consistent date format to avoid hydration mismatch
      return <span>{format(date, "dd MMM yyyy")}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as Order['status'];
        return <StatusBadge status={status} />
    }
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
       return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
       )
    },
    cell: ({ row }) => {
      const order = row.original;
      const total = order.items.reduce((acc, item) => acc + item.price_snapshot.total * item.quantity, 0);
      return <div className="text-right font-medium">{formatCurrency(total)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <OrderActions order={row.original} />
        </div>
      );
    },
  },
];
