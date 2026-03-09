

'use server';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSettings, saveSettings } from "@/lib/server/api";
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

const permalinkSchema = z.enum([
    'plain',
    'day_and_name',
    'month_and_name',
    'numeric',
    'post_name',
    'custom'
]);

const settingsSchema = z.object({
  permalink_structure: permalinkSchema,
  permalink_custom_structure: z.string().optional(),
  site_logo_url: z.string().url().or(z.literal("")).nullable(),
});

export type SettingsFormState = {
  message: string;
  errors?: {
    [key:string]: string[] | undefined;
  };
};

export async function saveSettingsAction(
  prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
    await verifyAdmin();
    const dataToValidate = {
        permalink_structure: formData.get('permalink_structure'),
        permalink_custom_structure: formData.get('permalink_custom_structure'),
        site_logo_url: formData.get('site_logo_url') || null,
    };
    
    const validatedFields = settingsSchema.safeParse(dataToValidate);

    if (!validatedFields.success) {
        console.error("Settings validation failed:", validatedFields.error.flatten().fieldErrors);
        return {
            message: "Failed to save settings. Please check the fields.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
  
    try {
        const currentSettings = await getSettings();
        const newSettings = { ...currentSettings, ...validatedFields.data };
        await saveSettings(newSettings);
        
        revalidatePath("/admin/settings");
        revalidatePath("/", "layout");
    
        return { message: "Settings saved successfully!" };
    } catch (e) {
        console.error("Failed to save settings:", e);
        return { message: "An unexpected error occurred while saving settings." };
    }
}
