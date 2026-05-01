'use server';

import { verifyAdmin } from '@/lib/server/auth-admin';

import { revalidatePath } from 'next/cache';
import { getRoles, saveRoles } from '@/lib/server/api';
import type { Role } from '@/lib/types';
import { cookies } from 'next/headers';


export async function saveRolesAction(prevState: any, formData: FormData): Promise<{ message: string }> {
  await verifyAdmin();
  
  const rolesRaw = formData.get('roles') as string | null;

  if (!rolesRaw) {
      return { message: "No data received." };
  }
  
  try {
    const roles: Role[] = JSON.parse(rolesRaw);
    await saveRoles(roles);
    revalidatePath('/admin/control-center/roles');
    return { message: 'Roles and permissions saved successfully!' };
  } catch (error) {
    console.error("Failed to save roles:", error);
    return { message: 'An error occurred while saving.' };
  }
}
