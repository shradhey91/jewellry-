

'use server';

import { z } from 'zod';
import { db } from '../db';
import type { User } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  phone_number: z.string().regex(/^\d{10,15}$/, 'A valid 10-15 digit phone number is required.'),
});

export type CustomerFormState = {
  message: string;
  errors?: { [key: string]: string[] | undefined; };
};

export async function saveCustomerAction(
  prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  await db.initialize();
  
  const dataToValidate = {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    email: formData.get("email") || '',
    phone_number: formData.get("phone_number") || '',
  };

  const validatedFields = customerSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      message: "Failed to save customer. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...customerData } = validatedFields.data;

  if (customerData.email) {
    const existing = db.users.find(u => u.email === customerData.email && u.id !== id);
    if (existing) {
        return { message: 'This email is already in use by another account.', errors: { email: ['Email already exists.'] } };
    }
  }
  if (customerData.phone_number) {
      const existing = db.users.find(u => u.phone_number === customerData.phone_number && u.id !== id);
      if (existing) {
          return { message: 'This phone number is already in use by another account.', errors: { phone_number: ['Phone number already exists.'] } };
      }
  }

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
        email_verified: !!customerData.email,
        phone_number_verified: !!customerData.phone_number,
        status: 'active',
    };
    db.users.push(newUser);
  }
  
  await db.saveUsers();
  revalidatePath("/admin/customers");
  return { message: "Customer saved successfully!" };
}

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

export const banUser = (userId: string) => updateUserStatus(userId, 'banned');
export const unbanUser = (userId: string) => updateUserStatus(userId, 'active');


const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type ResetPasswordFormState = {
  message: string;
  success: boolean;
  errors?: { password?: string[]; };
};

export async function resetPassword(prevState: ResetPasswordFormState, formData: FormData): Promise<ResetPasswordFormState> {
    const userId = formData.get('userId') as string;
    const password = formData.get('password') as string;

    const validated = passwordSchema.safeParse({ password });
    if(!validated.success) {
        return { success: false, message: 'Invalid password.', errors: validated.error.flatten().fieldErrors };
    }

    await db.initialize();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
    }

    db.users[userIndex].password = password;
    await db.saveUsers();
    
    return { success: true, message: 'Password has been reset successfully.' };
}
