
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getSettings, saveSettings } from '@/lib/server/api';
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

const shippingSettingsSchema = z.object({
  blockedPincodes: z.array(z.string()),
  blockedCities: z.array(z.string()),
  delhivery: z.object({
    apiToken: z.string().optional(),
  }).optional(),
  sequel: z.object({
    apiToken: z.string().optional(),
  }).optional(),
  shiprocket: z.object({
    apiToken: z.string().optional(),
  }).optional(),
});

export async function saveShippingSettings(prevState: any, formData: FormData): Promise<{ message: string }> {
  await verifyAdmin();

  const blockedPincodes = (formData.get('blockedPincodes') as string)
    .split(/[\n,]+/)
    .map(p => p.trim())
    .filter(Boolean);
    
  const blockedCities = (formData.get('blockedCities') as string)
    .toLowerCase()
    .split(/[\n,]+/)
    .map(c => c.trim())
    .filter(Boolean);

  const dataToValidate = {
    blockedPincodes,
    blockedCities,
    delhivery: {
      apiToken: formData.get('delhiveryApiToken') as string,
    },
    sequel: {
      apiToken: formData.get('sequelApiToken') as string,
    },
    shiprocket: {
        apiToken: formData.get('shiprocketApiToken') as string,
    }
  };

  const validatedFields = shippingSettingsSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return { message: 'Failed to save settings. Invalid data.' };
  }
  
  try {
    const currentSettings = await getSettings();
    const newSettings = {
      ...currentSettings,
      shipping: {
        ...currentSettings.shipping,
        ...validatedFields.data,
      },
    };
    await saveSettings(newSettings);
    
    revalidatePath('/admin/shipping');
    
    return { message: 'Shipping settings saved successfully!' };
  } catch (error) {
    console.error('Error saving shipping settings:', error);
    return { message: 'An unexpected server error occurred.' };
  }
}
