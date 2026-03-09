
'use server';

import { NextResponse, type NextRequest } from 'next/server';

// The session manager is deprecated. We now parse the cookie directly.
async function verifySessionCookie(session: string | undefined) {
  if (!session) {
    return null;
  }
  try {
    const decodedClaims = JSON.parse(session);
    return decodedClaims;
  } catch (error) {
    // This can happen if the cookie is malformed or invalid.
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;
  const decodedClaims = await verifySessionCookie(sessionCookie);

  if (decodedClaims && decodedClaims.status === 'banned') {
    const response = NextResponse.redirect(new URL('/auth/login?error=banned', request.url));
    response.cookies.delete('session');
    return response;
  }
  
  const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');
  const isAdminPage = pathname.startsWith('/admin');
  const isAccountPage = pathname.startsWith('/account');

  // If user is logged in and tries to access login/signup, redirect to their account page
  if (decodedClaims && isAuthPage) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!decodedClaims && (isAdminPage || isAccountPage)) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in but not an admin, and tries to access admin pages, redirect to home
  if (decodedClaims && isAdminPage && decodedClaims.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
