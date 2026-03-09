
"use server";

import { saveTaxClassAction as saveTaxClassActionApi, deleteTaxClassAction as deleteTaxClassActionApi, type TaxClassFormState } from "@/lib/server/actions/tax";

export async function saveTaxClassAction(
  prevState: TaxClassFormState,
  formData: FormData
): Promise<TaxClassFormState> {
  return saveTaxClassActionApi(prevState, formData);
}

export async function deleteTaxClassAction(
  formData: FormData
): Promise<{ message: string }> {
  return deleteTaxClassActionApi(formData);
}
