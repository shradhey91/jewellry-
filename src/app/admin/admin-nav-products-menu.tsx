"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Palette } from "lucide-react";
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

export function AdminNavProductsMenu() {
  const pathname = usePathname();
  const isProductsActive = pathname.startsWith("/admin/products");

  return (
    <Collapsible defaultOpen={isProductsActive}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isProductsActive}>
            <Package />
            <span>Products</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>
      <CollapsibleContent asChild>
        <SidebarMenuSub>
          <SidebarMenuSubButton
            asChild
            isActive={pathname === "/admin/products"}
          >
            <Link href="/admin/products">All Products</Link>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton
            asChild
            isActive={pathname === "/admin/products/new"}
          >
            <Link href="/admin/products/new">Add New</Link>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton
            asChild
            isActive={pathname === "/admin/products/bulk-upload"}
          >
            <Link href="/admin/products/bulk-upload">Bulk Upload</Link>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton
            asChild
            isActive={pathname === "/admin/products/themes"}
          >
            <Link href="/admin/products/themes">Themes</Link>
          </SidebarMenuSubButton>
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
