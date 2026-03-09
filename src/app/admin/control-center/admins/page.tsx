

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { UserDialog } from "@/components/admin/users/user-dialog";
import { getAdmins } from "@/lib/server/api";
import { UsersTable } from "@/components/admin/users/users-table";
import type { User } from "@/lib/types";

export const runtime = 'nodejs';

export default async function AdminsPage() {
  const admins = await getAdmins();

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Admins"
        description="Manage admins and their roles."
      >
        <UserDialog>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Admin
            </Button>
        </UserDialog>
      </PageHeader>
      {admins.length > 0 ? (
        <UsersTable data={admins} />
      ) : (
        <div className="border rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold">No Admins Found</h3>
            <p className="text-muted-foreground mt-2">
            Click "Add Admin" to get started.
            </p>
        </div>
      )}
    </div>
  );
}
