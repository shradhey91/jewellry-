

'use server';

import { verifyAdmin } from '@/lib/server/auth-admin';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { saveTaxClass, deleteTaxClass } from "@/lib/server/api";
import { cookies } from 'next/headers';


const taxClassSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  rate_type: z.enum(['percentage', 'flat']),
  rate_value: z.coerce.number().min(0, "Rate must be non-negative"),
  is_active: z.boolean(),
});

export type TaxClassFormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

export async function saveTaxClassAction(
  prevState: TaxClassFormState,
  formData: FormData
): Promise<TaxClassFormState> {
  await verifyAdmin();
  const dataToValidate = {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    rate_type: formData.get("rate_type"),
    rate_value: formData.get("rate_value"),
    is_active: formData.get("is_active") === "on",
  };

  const validatedFields = taxClassSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      message: "Failed to save tax class. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await saveTaxClass(validatedFields.data);
  } catch (error) {
    return { message: "Database error. Could not save tax class." };
  }

  revalidatePath("/admin/tax-classes");
  revalidatePath("/admin/history");
  return { message: "Tax class saved successfully!" };
}

export async function deleteTaxClassAction(
  formData: FormData
): Promise<{ message: string }> {
  await verifyAdmin();
  const id = formData.get("id") as string;
  if (!id) {
    return { message: "Error: ID is missing." };
  }
  try {
    await deleteTaxClass(id);
    revalidatePath("/admin/tax-classes");
    revalidatePath("/admin/history");
    return { message: "Tax class deleted successfully." };
  } catch (error: unknown) {
    if (error instanceof Error) {
        return { message: error.message };
    }
    return { message: "An unknown error occurred while deleting the tax class." };
  }
}
