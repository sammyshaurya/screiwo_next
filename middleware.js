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
  '/signup(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }

  const pathname = req.nextUrl.pathname;

  if (isPublicRoute(req) && auth().userId) {
    return NextResponse.redirect(new URL('/home', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
