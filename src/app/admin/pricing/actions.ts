'use server';

import { verifyAdmin } from '@/lib/server/auth-admin';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { updateMetalPrices, savePurity, deletePurity } from '@/lib/server/api';
import { cookies } from 'next/headers';


const rateSchema = z.object({
  id: z.string(),
  price_per_gram: z.coerce.number().min(0, "Price must be non-negative"),
});

const ratesSchema = z.array(rateSchema);

export type PricingFormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

export async function saveMetalPrices(
  prevState: PricingFormState,
  formData: FormData
): Promise<PricingFormState> {
  await verifyAdmin();
  const entries = Array.from(formData.entries());
  const ratesToSave: { id: string, price_per_gram: number }[] = [];

  for (const [key, value] of entries) {
    if (key.startsWith('price-')) {
      const metalId = key.replace('price-', '');
      ratesToSave.push({ id: metalId, price_per_gram: Number(value) });
    }
  }

  const validatedFields = ratesSchema.safeParse(ratesToSave);
  
  if (!validatedFields.success) {
    return {
      message: 'Failed to save prices. Please check the values.',
      errors: { form: ["Invalid data format."] },
    };
  }

  try {
    await updateMetalPrices(validatedFields.data);
  } catch (error) {
    return { message: 'Database error. Could not save prices.' };
  }

  revalidatePath('/admin/pricing');
  revalidatePath('/admin/products');
  revalidatePath('/products', 'layout');
  revalidatePath('/admin/history');

  return { message: `Metal prices updated successfully!` };
}


const puritySchema = z.object({
  id: z.string().optional(),
  metal_id: z.string({ required_error: 'Metal is required.' }),
  label: z.string().min(1, 'Label is required'),
  fineness: z.coerce.number().min(0, {message: 'Fineness must be non-negative'}).max(1, {message: 'Fineness cannot exceed 1 (100%). Enter a value like 0.916 for 22K.'}),
  is_active: z.boolean(),
});

export type PurityFormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

export async function savePurityAction(
  prevState: PurityFormState,
  formData: FormData
): Promise<PurityFormState> {
  await verifyAdmin();
  const dataToValidate = {
    id: formData.get('id') || undefined,
    metal_id: formData.get('metal_id'),
    label: formData.get('label'),
    fineness: formData.get('fineness'),
    is_active: formData.get('is_active') === 'on',
  };

  const validatedFields = puritySchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.error("Purity validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Failed to save purity. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await savePurity(validatedFields.data);
  } catch (error) {
    return { message: 'Database error. Could not save purity.' };
  }

  revalidatePath('/admin/pricing');
  revalidatePath('/admin/history');
  return { message: 'Purity saved successfully!' };
}

export async function deletePurityAction(formData: FormData): Promise<{ message: string }> {
  await verifyAdmin();
  const id = formData.get('id') as string;
  try {
    await deletePurity(id);
    revalidatePath('/admin/pricing');
    revalidatePath('/admin/history');
    return { message: 'Purity deleted successfully.' };
  } catch (error) {
    return { message: 'Database error. Could not delete purity.' };
  }
}
