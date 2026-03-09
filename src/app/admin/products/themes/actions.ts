

'use server';

import { revalidatePath } from "next/cache";
import { getThemeSettings, saveThemeSettings } from "@/lib/server/api";

export async function saveThemeSelection(prevState: any, formData: FormData): Promise<{ message: string }> {
    const theme = formData.get('theme') as string;
    
    if (!theme) {
        return { message: "No theme selected." };
    }

    try {
        const currentSettings = await getThemeSettings();
        const newSettings = { ...currentSettings, activeProductTheme: theme };
        await saveThemeSettings(newSettings);

        revalidatePath('/products', 'layout'); // Revalidate all product pages
        revalidatePath('/admin/products/themes');
        return { message: "Active theme updated successfully!" };
    } catch (error) {
        return { message: "Failed to save theme settings." };
    }
}
