

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { saveMenu, getMenuById } from "@/lib/server/api";
import type { MenuItem } from "@/lib/types";

const menuItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  link: z.string().min(1, "Link is required"),
  parent_id: z.string().nullable(),
  sort_order: z.number(),
  icon: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  
  promoTitle: z.string().nullable().optional(),
  promoDescription: z.string().nullable().optional(),
  promoImageUrl: z.string().url().nullable().optional(),
  promoImageHint: z.string().nullable().optional(),
  promoLink: z.string().url().nullable().optional(),

  promo2Title: z.string().nullable().optional(),
  promo2Description: z.string().nullable().optional(),
  promo2ImageUrl: z.string().url().nullable().optional(),
  promo2ImageHint: z.string().nullable().optional(),
  promo2Link: z.string().url().nullable().optional(),

  subnavPromoTitle: z.string().nullable().optional(),
  subnavPromoImageUrl: z.string().url().nullable().optional(),
  subnavPromoImageHint: z.string().nullable().optional(),
  subnavPromoLink: z.string().url().nullable().optional(),

  subnavColumns: z.coerce.number().min(1).max(4).nullable().optional(),
});

const menuSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(menuItemSchema),
});

export type MenuFormState = {
  message: string;
  errors?: {
    [key: string]: any;
  };
};

export async function saveMenuAction(
  prevState: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const menuId = formData.get("menuId") as string;
  const itemsRaw = formData.get("items") as string;

  if (!menuId || !itemsRaw) {
    return {
      message: "Failed to save menu. Missing data.",
      errors: { form: "Menu ID and items are required." },
    };
  }

  try {
    const items: MenuItem[] = JSON.parse(itemsRaw);
    const existingMenu = await getMenuById(menuId);
    
    if (!existingMenu) {
        return { message: "Menu not found." };
    }

    const idMap = new Map<string, string>();
    items.forEach(item => {
        if (item.id.startsWith("new-")) {
            idMap.set(item.id, `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
        }
    });

    const finalItems = items.map(item => {
        const id = idMap.get(item.id) || item.id;
        const parent_id = item.parent_id ? (idMap.get(item.parent_id) || item.parent_id) : null;
        return { ...item, id, parent_id};
    });

    const updatedMenu = {
        ...existingMenu,
        items: finalItems
    }

    const validatedFields = menuSchema.safeParse(updatedMenu);

    if (!validatedFields.success) {
      console.error(validatedFields.error.flatten().fieldErrors);
      return {
        message: "Failed to save menu. Please check the fields.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    await saveMenu(validatedFields.data);

    revalidatePath("/admin/menus");
    revalidatePath("/", "layout"); // Revalidate the entire site to update header
    revalidatePath('/admin/history');

    return { message: "Menu saved successfully!" };
  } catch (error) {
    console.error(error);
    return { message: "An unexpected error occurred. Could not save menu." };
  }
}
