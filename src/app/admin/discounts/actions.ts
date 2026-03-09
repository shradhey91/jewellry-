
"use server";

import { saveDiscount, deleteDiscount, type DiscountFormState } from "@/lib/server/actions/discounts";

export async function saveDiscountAction(
  prevState: DiscountFormState,
  formData: FormData
): Promise<DiscountFormState> {
  return saveDiscount(prevState, formData);
}

export async function deleteDiscountAction(
  formData: FormData
): Promise<{ message: string }> {
  return deleteDiscount(formData);
}
