"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Role, Permission } from "@/lib/types";
import { saveRolesAction } from "./actions";
import { Loader2 } from "lucide-react";

const allPermissions: { id: Permission; label: string; group: string }[] = [
  // Dashboard & Reports
  {
    id: "dashboard:view",
    label: "View Dashboard",
    group: "Dashboard & Reports",
  },
  {
    id: "reports:view",
    label: "View Sales Reports",
    group: "Dashboard & Reports",
  },
  // Store Management
  { id: "orders:view", label: "View Orders", group: "Store Management" },
  {
    id: "orders:edit",
    label: "Update Order Status",
    group: "Store Management",
  },
  { id: "customers:view", label: "View Customers", group: "Store Management" },
  {
    id: "customers:edit",
    label: "Edit & Ban Customers",
    group: "Store Management",
  },
  {
    id: "discounts:manage",
    label: "Manage Discounts",
    group: "Store Management",
  },
  // Catalog
  { id: "products:view", label: "View Products", group: "Catalog" },
  { id: "products:create", label: "Create Products", group: "Catalog" },
  { id: "products:edit", label: "Edit Products", group: "Catalog" },
  { id: "products:delete", label: "Delete Products", group: "Catalog" },
  { id: "categories:view", label: "View Categories", group: "Catalog" },
  { id: "categories:create", label: "Create Categories", group: "Catalog" },
  { id: "categories:edit", label: "Edit Categories", group: "Catalog" },
  { id: "categories:delete", label: "Delete Categories", group: "Catalog" },
  // Content & Appearance
  { id: "blog:view", label: "View Blog Posts", group: "Content & Appearance" },
  {
    id: "blog:create",
    label: "Create Blog Posts",
    group: "Content & Appearance",
  },
  { id: "blog:edit", label: "Edit Blog Posts", group: "Content & Appearance" },
  {
    id: "blog:delete",
    label: "Delete Blog Posts",
    group: "Content & Appearance",
  },
  {
    id: "media:manage",
    label: "Manage Media Library",
    group: "Content & Appearance",
  },
  {
    id: "pages:manage",
    label: "Manage Static Pages",
    group: "Content & Appearance",
  },
  {
    id: "appearance:manage",
    label: "Manage Homepage Content & Themes",
    group: "Content & Appearance",
  },
  {
    id: "menus:manage",
    label: "Manage Navigation Menus",
    group: "Content & Appearance",
  },
  // Settings
  {
    id: "pricing:manage",
    label: "Manage Pricing & Purities",
    group: "Settings",
  },
  { id: "tax:manage", label: "Manage Tax Classes", group: "Settings" },
  { id: "shipping:manage", label: "Manage Shipping", group: "Settings" },
  {
    id: "settings:manage",
    label: "Manage General & Payment Settings",
    group: "Settings",
  },
  // Administration
  {
    id: "users:manage",
    label: "Manage Admins & Roles",
    group: "Administration",
  },
];

const permissionGroups = [
  "Dashboard & Reports",
  "Store Management",
  "Catalog",
  "Content & Appearance",
  "Settings",
  "Administration",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
        </>
      ) : (
        "Save All Changes"
      )}
    </Button>
  );
}

export function RolesForm({ initialRoles }: { initialRoles: Role[] }) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const { toast } = useToast();
  const [state, formAction] = useFormState(saveRolesAction, { message: "" });

  useEffect(() => {
    if (state.message) {
      toast({
        title: "Success",
        description: state.message,
      });
    }
  }, [state, toast]);

  const handlePermissionChange = (
    roleId: string,
    permissionId: Permission,
    checked: boolean,
  ) => {
    setRoles((currentRoles) =>
      currentRoles.map((role) => {
        if (role.id === roleId) {
          const newPermissions = checked
            ? [...role.permissions, permissionId]
            : role.permissions.filter((p) => p !== permissionId);
          return { ...role, permissions: newPermissions };
        }
        return role;
      }),
    );
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="roles" value={JSON.stringify(roles)} />
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle>{role.name}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {permissionGroups.map((group) => (
                  <div key={group}>
                    <h4 className="font-medium mb-3">{group}</h4>
                    <div className="space-y-3 pl-2">
                      {allPermissions
                        .filter((p) => p.group === group)
                        .map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center gap-3"
                          >
                            <Checkbox
                              id={`${role.id}-${permission.id}`}
                              checked={role.permissions.includes(permission.id)}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  role.id,
                                  permission.id,
                                  !!checked,
                                )
                              }
                              disabled={role.id === "admin"}
                            />
                            <Label
                              htmlFor={`${role.id}-${permission.id}`}
                              className="font-normal cursor-pointer"
                            >
                              {permission.label}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
