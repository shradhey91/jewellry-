

"use server";

import { verifyAdmin } from '@/lib/server/auth-admin';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from '../db';
import type { Discount } from '@/lib/types';
import { cookies } from 'next/headers';


const discountSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, "Code must be at least 3 characters").max(50),
  type: z.enum(['percentage', 'fixed_amount']),
  value: z.coerce.number().positive("Value must be a positive number"),
  min_purchase: z.coerce.number().min(0).default(0),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().nullable(),
  is_active: z.boolean(),
  usage_limit: z.coerce.number().nullable(),
});

export type DiscountFormState = {
  message: string;
  errors?: { [key: string]: string[] | undefined; };
};

export async function saveDiscount(
  prevState: DiscountFormState,
  formData: FormData
): Promise<DiscountFormState> {
  await verifyAdmin();
  const id = formData.get('id') as string | undefined;

  const dataToValidate = {
    id: id || undefined,
    code: formData.get('code'),
    type: formData.get('type'),
    value: formData.get('value'),
    min_purchase: formData.get('min_purchase') || 0,
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date') || null,
    is_active: formData.get('is_active') === 'on',
    usage_limit: formData.get('usage_limit') || null,
  };

  const validatedFields = discountSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      message: 'Failed to save discount. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  await db.initialize();
  
  // Check for unique code
  const existingByCode = db.discounts.find(d => d.code.toLowerCase() === validatedFields.data.code.toLowerCase());
  if (existingByCode && existingByCode.id !== id) {
      return { message: 'This code is already in use.', errors: { code: ['Code must be unique.'] } };
  }

  if (id) {
    // Update
    const index = db.discounts.findIndex(d => d.id === id);
    if (index > -1) {
      db.discounts[index] = { ...db.discounts[index], ...validatedFields.data };
    } else {
      return { message: 'Discount not found.' };
    }
  } else {
    // Create
    const newDiscount: Discount = {
      ...validatedFields.data,
      id: `disc-${Date.now()}`,
      usage_count: 0,
    };
    db.discounts.push(newDiscount);
  }

  await db.saveDiscounts();
  revalidatePath("/admin/discounts");
  return { message: "Discount saved successfully!" };
}

export async function deleteDiscount(formData: FormData): Promise<{ message: string }> {
    await verifyAdmin();
    const id = formData.get('id') as string;
    await db.initialize();
    db.discounts = db.discounts.filter(d => d.id !== id);
    await db.saveDiscounts();
    revalidatePath('/admin/discounts');
    return { message: 'Discount deleted successfully.' };
}

export async function getDiscounts(): Promise<Discount[]> {
    await db.initialize();
    return db.discounts;
}

export async function getDiscountByCode(code: string): Promise<Discount | undefined> {
    await db.initialize();
    return db.discounts.find(d => d.code.toLowerCase() === code.toLowerCase());
}

    