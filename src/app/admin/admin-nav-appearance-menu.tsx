
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Palette } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AdminNavAppearanceMenu() {
    const pathname = usePathname();
    const isAppearanceActive = pathname.startsWith('/admin/appearance');

    return (
        <Collapsible defaultOpen={isAppearanceActive}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isAppearanceActive}>
                        <Palette />
                        <span>Appearance</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent asChild>
                <SidebarMenuSub>
                    <SidebarMenuSubButton asChild isActive={pathname === '/admin/appearance'}>
                        <Link href="/admin/appearance">Default Theme</Link>
                    </SidebarMenuSubButton>
                    <SidebarMenuSubButton asChild isActive={pathname === '/admin/appearance/minimalist'}>
                        <Link href="/admin/appearance/minimalist">Minimalist Theme</Link>
                    </SidebarMenuSubButton>
                    <SidebarMenuSubButton asChild isActive={pathname === '/admin/appearance/themes'}>
                        <Link href="/admin/appearance/themes">Homepage Themes</Link>
                    </SidebarMenuSubButton>
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    );
}
