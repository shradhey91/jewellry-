
'use server';

import { verifyAdmin } from '@/lib/server/auth-admin';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { saveGiftMessages } from '@/lib/server/api';
import { cookies } from 'next/headers';


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
