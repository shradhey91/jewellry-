
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { saveDiamondGuideContent } from '@/lib/get-diamond-guide-content';
import { DiamondGuideContent } from '@/lib/types';

// Simplified schema for form processing - doesn't need to be as strict as the type
const formSchema = z.record(z.string());

export async function saveDiamondGuideContentAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string }> {
  
  const form = Object.fromEntries(formData.entries());

  const content: DiamondGuideContent = {
    hero: {
      eyebrow: form['hero-eyebrow'] as string,
      title: form['hero-title'] as string,
      subtitle: form['hero-subtitle'] as string,
      imageUrl: form['imageUrl-hero'] as string,
      imageHint: form['imageHint-hero'] as string,
    },
    fourCs: {
      title: form['fourCs-title'] as string,
      subtitle: form['fourCs-subtitle'] as string,
      items: [
        { icon: 'Scissors', title: form['fourCs-0-title'] as string, description: form['fourCs-0-description'] as string, imageUrl: form['imageUrl-fourCs-0'] as string, imageHint: form['imageHint-fourCs-0'] as string },
        { icon: 'Droplets', title: form['fourCs-1-title'] as string, description: form['fourCs-1-description'] as string, imageUrl: form['imageUrl-fourCs-1'] as string, imageHint: form['imageHint-fourCs-1'] as string },
        { icon: 'Search', title: form['fourCs-2-title'] as string, description: form['fourCs-2-description'] as string, imageUrl: form['imageUrl-fourCs-2'] as string, imageHint: form['imageHint-fourCs-2'] as string },
        { icon: 'Scaling', title: form['fourCs-3-title'] as string, description: form['fourCs-3-description'] as string, imageUrl: form['imageUrl-fourCs-3'] as string, imageHint: form['imageHint-fourCs-3'] as string },
      ]
    },
    shapes: {
      title: form['shapes-title'] as string,
      subtitle: form['shapes-subtitle'] as string,
      items: Array.from({ length: 8 }).map((_, i) => ({
        name: form[`shapes-${i}-name`] as string,
        imageUrl: form[`imageUrl-shapes-${i}`] as string,
        imageHint: form[`imageHint-shapes-${i}`] as string,
      }))
    },
    anatomy: {
      title: form['anatomy-title'] as string,
      subtitle: form['anatomy-subtitle'] as string,
      imageUrl: form['imageUrl-anatomy'] as string,
      imageHint: form['imageHint-anatomy'] as string,
    },
    cta: {
      title: form['cta-title'] as string,
      subtitle: form['cta-subtitle'] as string,
      ctaText: form['cta-ctaText'] as string,
      ctaLink: form['cta-ctaLink'] as string,
    }
  };

  try {
    await saveDiamondGuideContent(content);
    revalidatePath('/guides/diamond-guide');
    revalidatePath('/admin/pages/diamond-guide');
    return { message: 'Diamond Guide content saved successfully!' };
  } catch (error) {
    return { message: 'Failed to save content.' };
  }
}
