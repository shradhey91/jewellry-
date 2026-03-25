"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gem,
  LayoutDashboard,
  Package,
  Tag,
  Scale,
  Coins,
  Shapes,
  Menu,
  Newspaper,
  Shield,
  UserSquare,
  Settings,
  Image,
  Palette,
  History,
  FileText,
  Footprints,
  Wifi,
  Users,
  ShoppingBag,
  MessageCircle,
  BarChart3,
  Ticket,
  UserCheck,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { AdminNavBlogMenu } from "./admin-nav-blog-menu";
import { AdminNavProductsMenu } from "./admin-nav-products-menu";
import { AdminNavControlCenterMenu } from "./admin-nav-control-center-menu";
import { AdminNavAppearanceMenu } from "./admin-nav-appearance-menu";
import { AdminNavSettingsMenu } from "./admin-nav-settings-menu";

const links = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/report",
    label: "Reports",
    icon: BarChart3,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: Users,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Shapes,
  },
  {
    href: "/admin/discounts",
    label: "Discounts",
    icon: Ticket,
  },
  {
    href: "/admin/media",
    label: "Media",
    icon: Image,
  },
  {
    href: "/admin/menus",
    label: "Menus",
    icon: Menu,
  },
  {
    href: "/admin/pages",
    label: "Pages",
    icon: FileText,
  },
  {
    href: "/admin/pricing",
    label: "Pricing",
    icon: Coins,
  },
  {
    href: "/admin/tax-classes",
    label: "Tax Classes",
    icon: Scale,
  },
  {
    href: "/admin/shipping",
    label: "Shipping",
    icon: Truck,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => {
        const isActive =
          link.href === "/admin"
            ? pathname === link.href
            : pathname.startsWith(link.href);

        const Icon = link.icon as React.ElementType;

        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={{ children: link.label }}
            >
             <Link href={link.href}>
                <Icon /> 
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}

      <AdminNavAppearanceMenu />
      <AdminNavProductsMenu />

      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith("/admin/pending")}
          tooltip={{ children: "Pending" }}
        >
          <Link href="/admin/pending">
            <UserCheck />
            <span>Pending</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <AdminNavControlCenterMenu />
      <AdminNavBlogMenu />

      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith("/admin/integrations")}
          tooltip={{ children: "WhatsApp" }}
        >
          <Link href="/admin/integrations/whatsapp">
            <MessageCircle />
            <span>WhatsApp</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith("/admin/history")}
          tooltip={{ children: "History" }}
        >
          <Link href="/admin/history">
            <History />
            <span>History</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith("/admin/social-proof")}
          tooltip={{ children: "Social Proof" }}
        >
          <Link href="/admin/social-proof">
            <Wifi />
            <span>Social Proof</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <AdminNavSettingsMenu />
    </SidebarMenu>
  );
}
