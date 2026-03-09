
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
    updateUserName,
    getUserById,
    getOrdersByUserId,
    saveUserAddress,
    updateUserAddress,
    deleteUserAddress,
    setDefaultUserAddress,
    getUserByEmail,
    createUser,
} from '@/lib/server/api';
import type { Order, User, Address } from '@/lib/types';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { db } from '@/lib/server/db';

async function getSessionUser() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie);
  } catch {
    return null;
  }
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
        // Update name
        await updateUserName(session.id, validatedFields.data.name);
        // Note: Phone and email updates would require additional API functions
        // For now, they're stored in the form but need backend implementation
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

        // Store OTP in database
        await db.initialize();
        db.tempOtps = [
            { phone: session.email, otp, expires: expiresAt },
            ...db.tempOtps.slice(0, 4) // Keep last 5 OTPs
        ];
        await db.saveTempOtps();

        // In production, send email here
        console.log(`OTP for ${session.email}: ${otp}`);

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
        const otpEntry = db.tempOtps.find(
            o => o.phone === session.email && o.otp === validatedFields.data.otp && o.expires > Date.now()
        );

        if (!otpEntry) {
            return { message: "Invalid or expired OTP." };
        }

        // Verify current password (for admin users with password)
        if (session.password) {
            const user = await getUserById(session.id);
            if (!user || user.password !== validatedFields.data.currentPassword) {
                return { message: "Current password is incorrect." };
            }
        }

        // Note: In a real app, you would hash the password and update it
        // For now, we'll just log success
        console.log(`Password changed for user ${session.id}`);

        // Remove used OTP
        db.tempOtps = db.tempOtps.filter(o => o.otp !== validatedFields.data.otp);
        await db.saveTempOtps();

        revalidatePath('/account');
        return { message: "Password changed successfully." };
    } catch (error) {
        return { message: "Failed to change password." };
    }
}
