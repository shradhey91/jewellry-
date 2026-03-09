
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getSettings, saveSettings } from '@/lib/server/api';

const emailSettingsSchema = z.object({
  smtp_host: z.string().optional(),
  smtp_port: z.coerce.number().optional(),
  smtp_user: z.string().optional(),
  smtp_pass: z.string().optional(),
  smtp_from: z.string().optional(),
});

export async function saveEmailSettings(prevState: { message: string }, formData: FormData): Promise<{ message: string }> {
  const dataToValidate = {
    smtp_host: formData.get('smtp_host'),
    smtp_port: formData.get('smtp_port'),
    smtp_user: formData.get('smtp_user'),
    smtp_pass: formData.get('smtp_pass'),
    smtp_from: formData.get('smtp_from'),
  };

  const validatedFields = emailSettingsSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return { message: 'Failed to save settings. Invalid data.' };
  }

  try {
    const currentSettings = await getSettings();
    const newSettings = {
      ...currentSettings,
      ...validatedFields.data,
    };
    await saveSettings(newSettings);
    
    revalidatePath('/admin/settings/email');
    
    return { message: 'Email settings saved successfully!' };
  } catch (error) {
    console.error('Error saving email settings:', error);
    return { message: 'An unexpected server error occurred.' };
  }
}
