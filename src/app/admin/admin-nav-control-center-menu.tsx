
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Shield } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AdminNavControlCenterMenu() {
    const pathname = usePathname();
    const isControlCenterActive = pathname.startsWith('/admin/control-center');

    return (
        <Collapsible>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isControlCenterActive}>
                        <Users />
                        <span>Control Center</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent asChild>
                <SidebarMenuSub>
                    <SidebarMenuSubButton asChild isActive={pathname === '/admin/control-center/admins'}>
                        <Link href="/admin/control-center/admins">Admins</Link>
                    </SidebarMenuSubButton>
                    <SidebarMenuSubButton asChild isActive={pathname === '/admin/control-center/roles'}>
                        <Link href="/admin/control-center/roles">Roles</Link>
                    </SidebarMenuSubButton>
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    );
}
