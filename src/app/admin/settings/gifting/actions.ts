
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { saveGiftMessages } from '@/lib/server/api';
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

export async function saveGiftMessagesAction(prevState: any, formData: FormData): Promise<{ message: string }> {
  await verifyAdmin();
  
  const giftMessagesRaw = formData.get('giftMessages') as string | null;

  if (!giftMessagesRaw) {
      return { message: "No data received." };
  }
  
  try {
    const giftMessages = JSON.parse(giftMessagesRaw);
    await saveGiftMessages(giftMessages);
    revalidatePath('/admin/settings/gifting');
    return { message: 'Gift messages saved successfully!' };
  } catch (error) {
    console.error("Failed to save gift messages:", error);
    return { message: 'An error occurred while saving.' };
  }
}
