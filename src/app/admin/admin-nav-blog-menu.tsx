"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Newspaper, Palette } from "lucide-react";
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

export function AdminNavBlogMenu() {
  const pathname = usePathname();
  const isBlogActive = pathname.startsWith("/admin/blog");

  return (
    <Collapsible>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isBlogActive}>
            <Newspaper />
            <span>Blog</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>
      <CollapsibleContent asChild>
        <SidebarMenuSub>
          <SidebarMenuSubButton asChild isActive={pathname === "/admin/blog"}>
            <Link href="/admin/blog">All Posts</Link>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton
            asChild
            isActive={pathname === "/admin/blog/categories"}
          >
            <Link href="/admin/blog/categories">Categories</Link>
          </SidebarMenuSubButton>
          <SidebarMenuSubButton
            asChild
            isActive={pathname === "/admin/blog/themes"}
          >
            <Link href="/admin/blog/themes">Themes</Link>
          </SidebarMenuSubButton>
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
