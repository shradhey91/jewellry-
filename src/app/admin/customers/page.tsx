

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CustomerDialog } from "@/components/admin/customers/customer-dialog";
import { getCustomers } from "@/lib/server/api";
import { CustomersTable } from "@/components/admin/customers/customers-table";

export const runtime = 'nodejs';

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Customers"
        description="Manage customer accounts and view their details."
      >
        <CustomerDialog>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Customer
            </Button>
        </CustomerDialog>
      </PageHeader>
      
      {customers.length > 0 ? (
        <CustomersTable data={customers} />
      ) : (
         <div className="border rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold">No Customers Found</h3>
            <p className="text-muted-foreground mt-2">
            Customers will appear here once they create an account or are added manually.
            </p>
        </div>
      )}

    </div>
  );
}
