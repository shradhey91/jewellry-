'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const pageSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  status: z.enum(['Published', 'Draft']),
});

export type PageFormData = z.infer<typeof pageSchema>;

export async function savePageData(pageId: string, data: PageFormData): Promise<{ success: boolean; message: string }> {
  try {
    const validatedData = pageSchema.parse(data);
    
    // For now, we'll just log this - in a real app you'd save to database
    console.log(`Saving page ${pageId}:`, validatedData);
    
    // Revalidate the pages admin page
    revalidatePath('/admin/pages');
    
    return { success: true, message: 'Page saved successfully!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Validation failed: ' + error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, message: 'Failed to save page.' };
  }
}

export async function deletePageData(pageId: string): Promise<{ success: boolean; message: string }> {
  try {
    // For now, we'll just log this - pages are hardcoded so can't actually delete
    console.log(`Deleting page ${pageId}`);
    
    // Revalidate the pages admin page
    revalidatePath('/admin/pages');
    
    return { success: true, message: 'Page deleted successfully!' };
  } catch (error) {
    return { success: false, message: 'Failed to delete page.' };
  }
}
