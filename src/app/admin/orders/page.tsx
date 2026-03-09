
import { PageHeader } from "@/components/admin/page-header";
import { getAllOrders } from "@/lib/server/api";
import { OrdersTable } from "./orders-table";

export const runtime = 'nodejs';

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Orders"
        description="View and manage all customer orders."
      />
      <OrdersTable data={orders} />
    </div>
  );
}
