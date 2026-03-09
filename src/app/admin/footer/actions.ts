

'use server';

import { revalidatePath } from 'next/cache';
import { saveFooterContent, saveMobileFooterContent } from '@/lib/get-footer-content';
import type { FooterContent } from '@/lib/types';
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

export async function saveFooterContentAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string }> {
  await verifyAdmin();
  const newContent: FooterContent = {
    columns: JSON.parse(formData.get('columns') as string),
    contact: JSON.parse(formData.get('contact') as string),
    locations: JSON.parse(formData.get('locations') as string),
    socials: JSON.parse(formData.get('socials') as string),
    bottom: JSON.parse(formData.get('bottom') as string),
  };
  
  try {
      await saveFooterContent(newContent);
      revalidatePath('/'); // Revalidate all pages that use the main layout
      revalidatePath('/admin/appearance');
      return { message: 'Footer content saved successfully!' };
  } catch (error) {
      return { message: 'Failed to save content.' };
  }
}

export async function saveMobileFooterContentAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string }> {
  await verifyAdmin();
  const newContent: FooterContent = {
    columns: JSON.parse(formData.get('columns') as string),
    contact: JSON.parse(formData.get('contact') as string),
    locations: JSON.parse(formData.get('locations') as string),
    socials: JSON.parse(formData.get('socials') as string),
    bottom: JSON.parse(formData.get('bottom') as string),
  };
  
  try {
      await saveMobileFooterContent(newContent);
      revalidatePath('/'); // Revalidate all pages that use the main layout
      revalidatePath('/admin/appearance');
      return { message: 'Mobile footer content saved successfully!' };
  } catch (error) {
      return { message: 'Failed to save content.' };
  }
}

    