'use server';

import { revalidatePath } from 'next/cache';

export async function clearCacheAction() {
  try {
    revalidatePath('/', 'layout');
    return { success: true, message: 'Site cache cleared successfully!' };
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return { success: false, message: 'An error occurred while clearing the cache.' };
  }
}
