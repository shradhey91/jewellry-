

'use server';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { User } from '@/lib/types';
import { db } from '../db';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) throw new Error("Authentication required.");
  try {
    const claims = JSON.parse(sessionCookie);
    if (claims.role !== 'admin') {
      throw new Error("Authorization failed.");
    }
  } catch {
    throw new Error('Invalid session.');
  }
}

async function saveUser(userData: Omit<User, 'id' | 'created_at'> & { id?: string }) {
  await db.initialize();
  
  if (userData.email) {
    const existingByEmail = db.users.find(u => u.email === userData.email && u.id !== userData.id);
    if (existingByEmail) {
      throw new Error('This email address is already in use.');
    }
  }

  if (userData.id) {
    const index = db.users.findIndex(u => u.id === userData.id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...userData, id: db.users[index].id };
      await db.saveUsers();
      return db.users[index];
    }
  }
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    created_at: new Date().toISOString(),
    email_verified: true,
  };
  db.users.push(newUser);
  await db.saveUsers();
  return newUser;
}

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "moderator", "designer", "marketer", "customer"]),
});

export type UserFormState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

export async function saveUserAction(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  try {
    await verifyAdmin();
  } catch (error: any) {
    return { message: error.message };
  }

  const dataToValidate = {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  };

  const validatedFields = userSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      message: "Failed to save user. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await saveUser(validatedFields.data as any);
  } catch (error) {
    if (error instanceof Error) {
        if (error.message.includes('email')) {
             return { message: error.message, errors: { email: [error.message] } };
        }
        return { message: error.message };
    }
    return { message: "Database error. Could not save user." };
  }

  revalidatePath("/admin/control-center/admins");
  return { message: "User saved successfully!" };
}
