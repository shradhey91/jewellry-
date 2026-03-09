

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
  
  const isAuthPage = pathname.startsWith('/auth');
  const isAdminPage = pathname.startsWith('/admin');
  const isAccountPage = pathname.startsWith('/account');

  // If user is logged in
  if (decodedClaims) {
    // and is an admin...
    if (decodedClaims.role !== 'customer') {
      //...and tries to access a customer auth page, redirect to admin dashboard.
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } else { // if user is a customer...
      //...and tries to access admin pages, redirect away.
      if (isAdminPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      //...and tries to access customer login/signup, redirect to their account.
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/account', request.url));
      }
    }
  }

  // If user is NOT logged in
  if (!decodedClaims) {
    // and tries to access a protected route (admin or account), redirect to the login page.
    if (isAdminPage || isAccountPage) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }
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
