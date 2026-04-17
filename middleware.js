import {
  clerkMiddleware,
  createRouteMatcher,
} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/home(.*)',
  '/profile(.*)',
  '/settings(.*)',
  '/editprofile(.*)',
  '/follow-requests(.*)',
  '/createpost(.*)',
  '/createprofile(.*)',
  '/editor(.*)',
  '/post(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/signin(.*)',
  '/signup(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  const pathname = req.nextUrl.pathname;

  // Handle protected routes
  if (isProtectedRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Redirect authenticated users away from public routes to profile
  if (isPublicRoute(req) && userId && pathname === '/') {
    return NextResponse.redirect(new URL('/profile', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/',
    '/home/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/editprofile/:path*',
    '/follow-requests/:path*',
    '/createpost/:path*',
    '/createprofile/:path*',
    '/editor/:path*',
    '/post/:path*',
    '/user/:path*',
    '/api/:path*',
  ],
};
