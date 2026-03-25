
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const decodedClaims = JSON.parse(sessionCookie);
    const userData = {
        id: decodedClaims.id,
        email: decodedClaims.email,
        name: decodedClaims.name,
        role: decodedClaims.role,
        phone_number: decodedClaims.phone_number
    };
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ user: null });
  }
}
