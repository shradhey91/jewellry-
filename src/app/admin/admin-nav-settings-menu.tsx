"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AdminNavSettingsMenu() {
  const pathname = usePathname();
  const isSettingsActive = pathname.startsWith("/admin/settings");

  return (
    <Collapsible defaultOpen={isSettingsActive}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isSettingsActive}>
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>
      <CollapsibleContent asChild>
        <SidebarMenuSub>
          <SidebarMenuSubButton
            asChild
            isActive={pathname === "/admin/settings"}
          >
            <Link href="/admin/settings">General</Link>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton
            asChild
            isActive={pathname === "/admin/settings/payment"}
          >
            <Link href="/admin/settings/payment">Payment Gateways</Link>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton
            asChild
            isActive={pathname === "/admin/settings/email"}
          >
            <Link href="/admin/settings/email">Email</Link>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton
            asChild
            isActive={pathname === "/admin/settings/gifting"}
          >
            <Link href="/admin/settings/gifting">Gifting</Link>
          </SidebarMenuSubButton>
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
