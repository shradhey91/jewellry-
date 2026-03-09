

'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/server/db';
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

export async function approveUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAdmin();
    await db.initialize();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }
    db.users[userIndex].email_verified = true;
    await db.saveUsers();
    revalidatePath('/admin/pending');
    return { success: true, message: 'User approved successfully.' };
  } catch (error) {
    console.error('Failed to approve user:', error);
    return { success: false, message: 'An error occurred while approving the user.' };
  }
}

export async function rejectUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    await verifyAdmin();
    await db.initialize();
    const initialLength = db.users.length;
    db.users = db.users.filter(u => u.id !== userId);
    if (db.users.length < initialLength) {
      await db.saveUsers();
      revalidatePath('/admin/pending');
      return { success: true, message: 'User rejected and deleted successfully.' };
    }
    return { success: false, message: 'User not found.' };
  } catch (error) {
    console.error('Failed to reject user:', error);
    return { success: false, message: 'An error occurred while rejecting the user.' };
  }
}

    