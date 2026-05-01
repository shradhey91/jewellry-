
'use server';

import { verifyAdmin } from '@/lib/server/auth-admin';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/server/api';
import type { User } from '@/lib/types';
import { db } from '@/lib/server/db';

const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().nullable(),
});

export type CustomerFormState = {
  message: string;
  errors?: { [key: string]: string[] | undefined; };
};


async function updateUserStatus(userId: string, status: 'active' | 'banned'): Promise<{ success: boolean; message: string }> {
    await db.initialize();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
    }
    db.users[userIndex].status = status;
    await db.saveUsers();
    return { success: true, message: `User status updated to ${status}.` };
}

export async function saveCustomerAction(
  prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  await verifyAdmin();
  
  await db.initialize();
  
  const dataToValidate = {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    email: formData.get("email"),
    phone_number: formData.get("phone_number") || null,
  };

  const validatedFields = customerSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      message: "Failed to save customer. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...customerData } = validatedFields.data;

  if (id) {
    const index = db.users.findIndex(c => c.id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...customerData };
    }
  } else {
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: customerData.name,
        email: customerData.email,
        phone_number: customerData.phone_number,
        role: 'customer',
        created_at: new Date().toISOString(),
        email_verified: true, // Manually added customers are pre-verified
        status: 'active',
    };
    db.users.push(newUser);
  }
  
  await db.saveUsers();
  revalidatePath("/admin/customers");
  return { message: "Customer saved successfully!" };
}


export async function banUserAction(userId: string): Promise<{ success: boolean; message: string }> {
  await verifyAdmin();
  const result = await updateUserStatus(userId, 'banned');
  if (result.success) {
    revalidatePath('/admin/customers');
  }
  return result;
}

export async function unbanUserAction(userId: string): Promise<{ success: boolean; message: string }> {
  await verifyAdmin();
  const result = await updateUserStatus(userId, 'active');
  if (result.success) {
    revalidatePath('/admin/customers');
  }
  return result;
}
