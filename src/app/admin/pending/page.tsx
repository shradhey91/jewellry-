import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUsers } from "@/lib/server/api";
import type { User } from "@/lib/types";
import { PendingUserActions } from "./pending-user-actions";

export const runtime = 'nodejs';

export default async function PendingPage() {
  const allUsers = await getUsers();
  const pendingUsers = allUsers.filter(user => user.role === 'customer' && !user.email_verified);

  return (
    <div className="container mx-auto py-2">
      <PageHeader
        title="Pending Verifications"
        description="Customers who have not yet verified their email address."
      />
      <Card>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Sign-up Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pendingUsers.length > 0 ? pendingUsers.map((user: User) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <PendingUserActions userId={user.id} />
                            </TableCell>
                        </TableRow>
                    )) : (
                       <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No pending verifications. All customers are verified.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
