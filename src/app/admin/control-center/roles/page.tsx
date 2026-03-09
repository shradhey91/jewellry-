
import { PageHeader } from "@/components/admin/page-header";
import { getRoles } from "@/lib/server/api";
import { RolesForm } from "./roles-form";

export const runtime = 'nodejs';

export default async function RolesPage() {
    const roles = await getRoles();

    return (
        <div className="container mx-auto py-2">
            <PageHeader
                title="Roles & Permissions"
                description="Configure roles for different types of admin users."
            />
            <RolesForm initialRoles={roles} />
        </div>
    );
}
