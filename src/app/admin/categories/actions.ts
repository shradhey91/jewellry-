

// --- Studio Assistant Note ---
// The product category structure is LOCKED.
// Do not modify the logic in this file to add, edit, or delete 
// categories without explicit user confirmation.
// --- End Studio Assistant Note ---

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { saveCategory, deleteCategory } from "@/lib/server/api";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  parent_id: z.string().nullable(),
  icon: z.string().nullable(),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal('')).nullable().optional(),
});

export type CategoryFormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

export async function saveCategoryAction(
  prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const parentId = formData.get("parent_id");
  const dataToValidate = {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    parent_id: parentId === "null" ? null : parentId,
    icon: formData.get("icon") || null,
    imageUrl: formData.get('imageUrl') || null,
  };

  const validatedFields = categorySchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      message: "Failed to save category. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await saveCategory(validatedFields.data);
  } catch (error) {
    return { message: "Database error. Could not save category." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath('/admin/history');
  revalidatePath('/', 'layout');
  return { message: "Category saved successfully!" };
}

export async function deleteCategoryAction(
  id: string
): Promise<{ message: string }> {
  if (!id) {
    return { message: "Error: ID is missing." };
  }
  try {
    await deleteCategory(id);
    revalidatePath("/admin/categories");
    revalidatePath('/admin/history');
    revalidatePath('/', 'layout');
    return { message: "Category deleted successfully." };
  } catch (error: unknown) {
    if (error instanceof Error) {
        return { message: error.message };
    }
    return { message: "An unknown error occurred while deleting the category." };
  }
}
