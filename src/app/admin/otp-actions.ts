'use server';
import { revalidatePath } from 'next/cache';
import { getDeveloperSettings, saveDeveloperSettings } from '@/lib/server/api';
import { db } from '@/lib/server/db';

export async function toggleOtpViewerAction(isEnabled: boolean): Promise<{ success: boolean }> {
    const settings = await getDeveloperSettings();
    settings.show_otp_in_admin = isEnabled;
    await saveDeveloperSettings(settings);
    revalidatePath('/admin');
    return { success: true };
}

export async function clearOtpsAction(): Promise<{ success: boolean }> {
    await db.initialize();
    db.tempOtps = [];
    await db.saveTempOtps();
    revalidatePath('/admin');
    return { success: true };
}
