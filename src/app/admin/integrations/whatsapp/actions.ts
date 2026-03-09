'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getSettings, saveSettings } from '@/lib/server/api';

const settingsSchema = z.object({
  enabled: z.boolean(),
  phoneNumber: z.string(),
  defaultMessage: z.string().optional(),
});

export type WhatsAppFormState = {
  message: string;
  errors?: {
    phoneNumber?: string[];
  };
};

export async function saveWhatsAppSettings(
  prevState: WhatsAppFormState,
  formData: FormData
): Promise<WhatsAppFormState> {

  const enabled = formData.get('enabled') === 'on';
  const phoneNumber = formData.get('phoneNumber') as string;
  const defaultMessage = formData.get('defaultMessage') as string;

  if (enabled && (!phoneNumber || !/^[0-9]{10,15}$/.test(phoneNumber))) {
    return {
        message: 'A valid phone number is required when the widget is enabled.',
        errors: { phoneNumber: ['Please enter a valid phone number with country code (10-15 digits), without spaces or symbols.'] }
    };
  }

  try {
    const currentSettings = await getSettings();
    const newSettings = {
      ...currentSettings,
      whatsapp: {
          enabled,
          phoneNumber,
          defaultMessage,
      },
    };
    await saveSettings(newSettings);
    
    revalidatePath('/admin/integrations/whatsapp');
    revalidatePath('/', 'layout');
    
    return { message: 'WhatsApp settings saved successfully!' };
  } catch (error) {
    console.error('Error saving WhatsApp settings:', error);
    return { message: 'An unexpected server error occurred.' };
  }
}
