
'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Must match the secret used in src/auth/actions.ts and middleware.ts
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

// Define all internal staff roles that have admin access
const allowedAdminRoles = ['admin', 'moderator', 'designer', 'marketer'];

/**
 * Verifies if the current user has an active, valid admin-level session.
 * Throws an Error if unauthorized, otherwise returns the decoded session payload.
 */
export async function verifyAdmin() {
    const sessionCookie = cookies().get('session')?.value;

    if (!sessionCookie) {
        throw new Error("Unauthorized: No session cookie found.");
    }

    try {
        // Securely verify and decode the JWT session
        const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);

        // Check against the array of allowed internal roles instead of just 'admin'
        if (!payload.role || !allowedAdminRoles.includes(payload.role as string)) {
            throw new Error(`Unauthorized: Your role ('${payload.role}') lacks admin privileges.`);
        }

        if (payload.status === 'banned') {
            throw new Error("Unauthorized: Account suspended.");
        }

        return payload;
    } catch (error) {
        console.error("Admin verification failed:", error);
        throw new Error("Unauthorized: Invalid or expired session.");
    }
}

/**
 * Decodes the current user's JWT session without requiring admin role.
 * Returns null if no valid session exists.
 */
export async function getSessionPayload() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;
    try {
        const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
        return payload;
    } catch {
        return null;
    }
}
