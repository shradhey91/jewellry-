
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
    const userData = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        phone_number: payload.phone_number
    };
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ user: null });
  }
}
