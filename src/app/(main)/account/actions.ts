
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
    updateUserName,
    updateUserProfile,
    getUserById,
    getOrdersByUserId,
    saveUserAddress,
    updateUserAddress,
    deleteUserAddress,
    setDefaultUserAddress,
    getUserByEmail,
    createUser,
} from '@/lib/server/api';
import { verifyPassword, hashPassword } from '@/lib/server/auth';
import type { Order, User, Address } from '@/lib/types';
import { randomBytes } from 'crypto';
import { db } from '@/lib/server/db';
import { getSessionPayload } from '@/lib/server/auth-admin';

async function getSessionUser() {
  return getSessionPayload();
}

// --- DATA FETCHING ACTIONS ---

export async function getMyOrders(): Promise<Order[]> {
    const session = await getSessionUser();
    if (!session?.id) return [];
    return getOrdersByUserId(session.id);
}

export async function getAccountDetails(): Promise<User | null> {
    const session = await getSessionUser();
    if (!session?.id) return null;
    const user = await getUserById(session.id);
    return user || null;
}

// --- PROFILE ACTIONS ---

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export async function updateAccountDetails(prevState: any, formData: FormData): Promise<{message: string, errors?: any}> {
    const session = await getSessionUser();
    if (!session?.id) {
        return { message: "Authentication required." };
    }

    const validatedFields = profileSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
    });

    if (!validatedFields.success) {
        return { message: "Validation failed", errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await updateUserProfile(session.id as string, {
            name: validatedFields.data.name,
            phone_number: validatedFields.data.phone || undefined,
            email: validatedFields.data.email || undefined,
        });
        revalidatePath('/account');
        return { message: "Profile updated successfully." };
    } catch (error) {
        return { message: "Failed to update profile." };
    }
}

// --- ADDRESS ACTIONS ---

const addressSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

export async function saveAddress(prevState: any, formData: FormData): Promise<{message: string, errors?: any}> {
    const session = await getSessionUser();
    if (!session?.id) {
        return { message: "Authentication required." };
    }

    const validatedFields = addressSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: "Validation failed", errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { id, ...addressData } = validatedFields.data;

    try {
        if (id) {
            await updateUserAddress(session.id, { id, ...addressData });
        } else {
            await saveUserAddress(session.id, addressData);
        }
        revalidatePath('/account');
        return { message: 'Address saved successfully!' };
    } catch (error) {
        return { message: 'Failed to save address.' };
    }
}

export async function deleteAddress(addressId: string): Promise<{message: string, success: boolean}> {
    const session = await getSessionUser();
    if (!session?.id) {
        return { message: "Authentication required.", success: false };
    }

    if (!addressId) return { message: "Address ID is required.", success: false };

    try {
        await deleteUserAddress(session.id, addressId);
        revalidatePath('/account');
        return { message: 'Address deleted successfully.', success: true };
    } catch (error) {
        return { message: 'Failed to delete address.', success: false };
    }
}

export async function setDefaultAddress(addressId: string): Promise<{ success: boolean; message: string }> {
    const session = await getSessionUser();
    if (!session?.id) {
        return { message: "Authentication required.", success: false };
    }

    if (!addressId) return { message: "Address ID is required.", success: false };

    try {
        await setDefaultUserAddress(session.id, addressId);
        revalidatePath('/account');
        return { success: true, message: "Default address updated." };
    } catch (error) {
        return { success: false, message: "Failed to set default address." };
    }
}

// --- PASSWORD CHANGE WITH OTP ACTIONS ---

export async function sendOtpForChanges(): Promise<{ success: boolean; message: string }> {
    const session = await getSessionUser();
    if (!session?.id) {
        return { success: false, message: "Authentication required." };
    }

    if (!session.email) {
        return { success: false, message: "Email not found. Please add your email first." };
    }

    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
        const otpKey = session.email as string;

        // Store OTP in database keyed by email
        await db.initialize();
        db.tempOtps = [
            { phone: otpKey, otp, expires: expiresAt },
            ...db.tempOtps.filter(o => o.phone !== otpKey),
        ];
        await db.saveTempOtps();

        // In production, send email here
        console.log(`OTP for ${otpKey}: ${otp}`);

        return { success: true, message: "OTP sent successfully to your email." };
    } catch (error) {
        return { success: false, message: "Failed to send OTP." };
    }
}

const changePasswordSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function verifyOtpAndChangePassword(prevState: any, formData: FormData): Promise<{message: string, errors?: any}> {
    const session = await getSessionUser();
    if (!session?.id) {
        return { message: "Authentication required." };
    }

    const validatedFields = changePasswordSchema.safeParse({
        otp: formData.get('otp'),
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
    });

    if (!validatedFields.success) {
        return { message: "Validation failed", errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await db.initialize();
        
        // Verify OTP
        const otpKey = session.email as string;
        const otpEntry = db.tempOtps.find(
            o => o.phone === otpKey && o.otp === validatedFields.data.otp && o.expires > Date.now()
        );

        if (!otpEntry) {
            return { message: "Invalid or expired OTP." };
        }

        // Verify current password using the secure verifyPassword function
        const user = await getUserById(session.id as string);
        if (user?.password && !verifyPassword(validatedFields.data.currentPassword, user.password)) {
            return { message: "Current password is incorrect." };
        }

        // Hash and save the new password
        const userIndex = db.users.findIndex(u => u.id === session.id);
        if (userIndex !== -1) {
            db.users[userIndex].password = hashPassword(validatedFields.data.newPassword);
            await db.saveUsers();
        }

        console.log(`Password changed successfully for user ${session.id}`);

        // Remove used OTP by key, not just OTP value (avoids accidental collision)
        db.tempOtps = db.tempOtps.filter(o => o.phone !== otpKey);
        await db.saveTempOtps();

        revalidatePath('/account');
        return { message: "Password changed successfully." };
    } catch (error) {
        return { message: "Failed to change password." };
    }
}
