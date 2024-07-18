import {
  clerkMiddleware,
  createRouteMatcher
} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/home(.*)',
  '/profile(.*)',
  '/createpost(.*)',
]);
const isPublicRoute = createRouteMatcher([
  '/',
  '/signin(.*)',
  '/signup(.*)',
]);
const myProfile = createRouteMatcher(['/user/:username']);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth()
  
  if (isProtectedRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (isPublicRoute(req)) {
    if (userId) {
      return NextResponse.redirect(new URL('/profile', req.url));
    }
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};