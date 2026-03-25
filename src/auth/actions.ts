"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getUserByPhoneNumber,
  findOrCreateUserByPhone,
  getUserByEmail,
  verifyPassword,
  createUser,
} from "@/lib/server/auth";
import type { User } from "@/lib/types";
import { getDeveloperSettings } from "@/lib/server/api";
import { db } from "@/lib/server/db";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { headers } from "next/headers";
import { SignJWT } from "jose";

// Use a strong secret in production (e.g., from process.env.JWT_SECRET)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-change-in-production",
);

const phoneSchema = z
  .string()
  .regex(
    /^\d{10,15}$/,
    "Please enter a valid phone number (10-15 digits, no symbols).",
  );

async function sendOtp(phone: string, otp: string) {
  // In a real app, this would check which service (WhatsApp, SMS) is configured.
  console.log(
    `[MOCK OTP] Sending OTP ${otp} to ${phone} via configured service (SMS/WhatsApp).`,
  );
  // Simulate sending delay
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export type LoginState = {
  success: boolean;
  error?: string;
  needsPhoneVerification?: boolean;
  userId?: string;
  email?: string | null;
  redirect?: string;
};

// THIS IS THE UNIFIED LOGIN ACTION FOR ADMINS AND CUSTOMERS
export async function loginAction(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { success: false, error: "Email/Phone and password are required." };
  }

  const user =
    (await getUserByEmail(identifier)) ||
    (await getUserByPhoneNumber(identifier));

  if (!user || !user.password || !verifyPassword(password, user.password)) {
    return { success: false, error: "Invalid credentials." };
  }

  if (user.status === "banned") {
    return { success: false, error: "This account has been suspended." };
  }

  const sessionPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    status: user.status,
    email: user.email,
    phone_number: user.phone_number,
  };

  // Create a secure, signed JWT for the session
  const token = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Role-based redirect
  if (user.role !== "customer") {
    return { success: true, redirect: "/admin" };
  }

  // Customer specific logic (e.g. phone verification) can be added here if needed
  return { success: true, redirect: "/account" };
}

export type SendOtpState = {
  success: boolean;
  error?: string;
  phone?: string;
  userId?: string;
  email?: string | null;
};

export async function sendVerificationOtpAction(
  prevState: SendOtpState,
  formData: FormData,
): Promise<SendOtpState> {
  const phone = formData.get("phone") as string;
  const userId = formData.get("userId") as string;
  const email = formData.get("email") as string | null;

  const validatedPhone = phoneSchema.safeParse(phone);
  if (!validatedPhone.success) {
    return {
      success: false,
      error: "A valid phone number is required.",
      userId,
      email,
    };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

  try {
    await db.initialize();
    const newOtpEntry = { phone, otp, expires };

    // Remove any existing OTP for this phone before saving the new one
    db.tempOtps = [
      newOtpEntry,
      ...db.tempOtps.filter((o) => o.phone !== phone),
    ];
    await db.saveTempOtps();

    await sendOtp(phone, otp);
    return { success: true, phone, userId, email };
  } catch (error) {
    return { success: false, error: "Failed to send OTP.", userId, email };
  }
}

export type VerifyPhoneState = {
  success: boolean;
  error?: string;
  redirect?: string;
};

const verifyPhoneSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, "OTP must be 6 digits."),
  userId: z.string(),
});

export async function verifyPhoneAction(
  prevState: VerifyPhoneState,
  formData: FormData,
): Promise<VerifyPhoneState> {
  const phone = formData.get("phone") as string;
  const otp = formData.get("otp") as string;
  const userId = formData.get("userId") as string;

  const validatedFields = verifyPhoneSchema.safeParse({ phone, otp, userId });
  if (!validatedFields.success) {
    return {
      success: false,
      error:
        validatedFields.error.flatten().fieldErrors.otp?.[0] || "Invalid data.",
    };
  }

  await db.initialize();

  // Verify against DB instead of memory
  const storedOtp = db.tempOtps.find((o) => o.phone === phone);
  if (!storedOtp || storedOtp.expires < Date.now() || storedOtp.otp !== otp) {
    return { success: false, error: "Incorrect or expired OTP." };
  }

  // Consume the OTP
  db.tempOtps = db.tempOtps.filter((o) => o.phone !== phone);
  await db.saveTempOtps();

  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return { success: false, error: "User not found." };
  }

  db.users[userIndex].phone_number = phone;
  db.users[userIndex].phone_number_verified = true;
  await db.saveUsers();

  const user = db.users[userIndex];
  const sessionPayload = {
    id: user.id,
    name: user.name,
    phone_number: user.phone_number,
    role: user.role,
    status: user.status,
    email: user.email,
  };

  const token = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true, redirect: "/account" };
}

export async function signOutAction() {
  cookies().delete("session");
  redirect("/auth/login");
}

// --- Password Reset Actions ---

const emailSchema = z.string().email("Please enter a valid email address.");

export async function requestPasswordReset(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const email = formData.get("email") as string;
  const validatedEmail = emailSchema.safeParse(email);

  if (!validatedEmail.success) {
    return { success: false, message: "Invalid email format." };
  }

  const user = await getUserByEmail(email);

  // This flow is only for admins
  if (user && user.role === "admin") {
    await db.initialize();
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiry

    if (!db.passwordResetTokens) {
      db.passwordResetTokens = [];
    }

    db.passwordResetTokens.push({
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString(),
    });
    await db.savePasswordResetTokens();

    const origin = headers().get("origin");
    const resetLink = `${origin}/auth/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetLink);
  }

  return {
    success: true,
    message:
      "If an admin account with this email exists, a password reset link has been sent.",
  };
}

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
    token: z.string().min(1, "Token is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function resetPasswordAction(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: any }> {
  const validatedFields = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    token: formData.get("token"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validatedFields.data;

  await db.initialize();

  const tokenEntry = db.passwordResetTokens.find((t) => t.token === token);
  if (!tokenEntry || new Date(tokenEntry.expiresAt) < new Date()) {
    return {
      success: false,
      message: "This password reset token is invalid or has expired.",
    };
  }

  const userIndex = db.users.findIndex((u) => u.id === tokenEntry.userId);
  if (userIndex === -1) {
    return { success: false, message: "User not found." };
  }

  db.users[userIndex].password = password;
  db.passwordResetTokens = db.passwordResetTokens.filter(
    (t) => t.token !== token,
  );

  await db.saveUsers();
  await db.savePasswordResetTokens();

  return {
    success: true,
    message: "Your password has been reset successfully. You can now log in.",
  };
}

// --- Signup Actions ---

export type InitiateSignupState = {
  success: boolean;
  message?: string;
  errors?: { [key: string]: string[] | undefined };
  phone?: string;
};

const initiateSignupSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone_number: phoneSchema,
});

export async function initiateSignupAction(
  prevState: InitiateSignupState,
  formData: FormData,
): Promise<InitiateSignupState> {
  const validatedFields = initiateSignupSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Please check the form for errors.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, phone_number } = validatedFields.data;

  await db.initialize();
  const existingByEmail = await getUserByEmail(email);
  if (existingByEmail) {
    return {
      success: false,
      errors: { email: ["An account with this email already exists."] },
    };
  }
  const existingByPhone = await getUserByPhoneNumber(phone_number);
  if (existingByPhone) {
    return {
      success: false,
      errors: {
        phone_number: ["An account with this phone number already exists."],
      },
    };
  }

  try {
    // Create user but mark phone as unverified
    await createUser({
      name,
      email,
      password,
      phone_number,
      role: "customer",
      phone_number_verified: false,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000;

    const newOtpEntry = { phone: phone_number, otp, expires };
    db.tempOtps = [
      newOtpEntry,
      ...db.tempOtps.filter((o) => o.phone !== phone_number),
    ];
    await db.saveTempOtps();

    await sendOtp(phone_number, otp);

    return { success: true, phone: phone_number };
  } catch (error) {
    console.error("Initiate signup error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export type CompleteSignupState = {
  success: boolean;
  message?: string;
  redirect?: string;
};

export async function completeSignupAction(
  prevState: CompleteSignupState,
  formData: FormData,
): Promise<CompleteSignupState> {
  const phone_number = formData.get("phone_number") as string;
  const otp = formData.get("otp") as string;

  await db.initialize();

  const storedOtp = db.tempOtps.find((o) => o.phone === phone_number);
  if (!storedOtp || storedOtp.expires < Date.now() || storedOtp.otp !== otp) {
    return { success: false, message: "Incorrect or expired OTP." };
  }

  // Consume OTP
  db.tempOtps = db.tempOtps.filter((o) => o.phone !== phone_number);
  await db.saveTempOtps();

  const userIndex = db.users.findIndex((u) => u.phone_number === phone_number);

  if (userIndex === -1) {
    return {
      success: false,
      message: "User not found. Please try signing up again.",
    };
  }

  const user = db.users[userIndex];
  user.phone_number_verified = true;
  await db.saveUsers();

  // Automatically log the user in securely
  const sessionPayload = {
    id: user.id,
    name: user.name,
    phone_number: user.phone_number,
    role: user.role,
    status: user.status,
    email: user.email,
  };

  const token = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true, message: "Signup successful!", redirect: "/account" };
}
