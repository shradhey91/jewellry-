

import { getMenuById, getCategories } from "@/lib/server/api";
import { MenuBuilder } from "@/components/admin/menus/menu-builder";

export const runtime = 'nodejs';

export default async function MenusPage() {
  // In a real app, you might have multiple menus, but for now we hardcode "menu-1"
  const menu = await getMenuById("menu-1");
  const categories = await getCategories();

  if (!menu) {
    return <div>Menu not found.</div>;
  }

  return (
    <div className="container mx-auto py-2 mb-8">
      <MenuBuilder menu={menu} categories={categories} />
    </div>
  );
}


    