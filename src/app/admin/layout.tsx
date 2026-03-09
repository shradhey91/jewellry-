

import React from 'react';
import type { Metadata } from 'next';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { AdminNav } from '@/app/admin/admin-nav';
import { UserMenu } from '@/auth/components/user-menu';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2 font-headline text-lg group-data-[collapsible=icon]:-ml-1">
            <Icons.logo className="size-6 text-sidebar-primary" />
            <span className="group-data-[collapsible=icon]:hidden">
              Aparra
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <AdminNav />
        </SidebarContent>
        <SidebarFooter>
           {/* UserMenu is now in the header */}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
         <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
           <div className="relative ml-auto flex-1 md:grow-0">
            {/* The admin search was a placeholder and has been removed to avoid confusion with the new storefront search. */}
          </div>
          <UserMenu />
        </header>
        <main className="p-4 sm:px-6 sm:py-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
