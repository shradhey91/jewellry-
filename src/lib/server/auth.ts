'use server';

import type { User } from '@/lib/types';
import { db } from './db';
import crypto from 'crypto';

// Securely verify a password against a stored hash
export const verifyPassword = (password: string, hash: string): boolean => {
    // Fallback for existing plaintext passwords during the transition phase
    if (!hash.includes(':')) {
        return password === hash;
    }
    
    try {
        const [salt, key] = hash.split(':');
        const hashedBuffer = crypto.scryptSync(password, salt, 64);
        const keyBuffer = Buffer.from(key, 'hex');
        return crypto.timingSafeEqual(hashedBuffer, keyBuffer);
    } catch {
        return false;
    }
}

// Securely hash a new password with a random salt
export const hashPassword = (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedBuffer = crypto.scryptSync(password, salt, 64);
    return `${salt}:${hashedBuffer.toString('hex')}`;
}

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
    await db.initialize();
    return db.users.find(u => u.email === email);
}

export const getUserByPhoneNumber = async (phone: string): Promise<User | undefined> => {
    await db.initialize();
    return db.users.find(u => u.phone_number === phone);
}

export const findOrCreateUserByPhone = async (phone: string): Promise<User> => {
    await db.initialize();
    let user = await getUserByPhoneNumber(phone);
    if (!user) {
        user = {
            id: `user-${Date.now()}`,
            name: `User ${phone.slice(-4)}`,
            phone_number: phone,
            role: 'customer',
            created_at: new Date().toISOString(),
            phone_number_verified: true,
            status: 'active',
        };
        db.users.push(user);
        await db.saveUsers();
    }
    return user;
};


export const findOrCreateGuestUser = async (email: string, name: string, phone_number: string): Promise<User> => {
    await db.initialize();

    // 1. Find by phone number (primary identifier for login)
    if (phone_number) {
        const userByPhone = await getUserByPhoneNumber(phone_number);
        if (userByPhone) {
            return userByPhone;
        }
    }

    // 2. Find by email
    if (email) {
        const userByEmail = await getUserByEmail(email);
        if (userByEmail) {
            // If user exists by email but doesn't have a phone number, add it.
            if (!userByEmail.phone_number && phone_number) {
                const userIndex = db.users.findIndex(u => u.id === userByEmail.id);
                if (userIndex !== -1) {
                    db.users[userIndex].phone_number = phone_number;
                    db.users[userIndex].phone_number_verified = false;
                    await db.saveUsers();
                    return db.users[userIndex];
                }
            }
            return userByEmail;
        }
    }
    
    // 3. Create new user if no match found
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        phone_number,
        role: 'customer',
        created_at: new Date().toISOString(),
        email_verified: false,
        phone_number_verified: false,
        status: 'active',
    };
    db.users.push(newUser);
    await db.logChange('User', newUser.id, newUser.name, 'Created');
    await db.saveUsers();
    return newUser;
};

export const createUserWithPhone = async (phone: string): Promise<User> => {
    await db.initialize();
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: `User ${phone.slice(-4)}`, // Default name
        phone_number: phone,
        role: 'customer',
        created_at: new Date().toISOString(),
        phone_number_verified: true, // Verified via OTP
        status: 'active',
    };
    db.users.push(newUser);
    await db.saveUsers();
    return newUser;
};

export const createUser = async (userData: Omit<User, 'id' | 'created_at'>): Promise<User> => {
    await db.initialize();
    const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
        // Ensure the password is encrypted before saving it to the DB
        password: userData.password ? hashPassword(userData.password) : undefined,
        created_at: new Date().toISOString(),
        email_verified: false,
        status: 'active',
    };
    db.users.push(newUser);
    await db.saveUsers();
    return newUser;
};