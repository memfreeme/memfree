import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export const publicRoutes = [
    '/',
    '/login',
    '/blog',
    '/docs',
    '/guides',
    '/pricing',
];

const protectedRoutes = ['/dashboard'];

export const DEFAULT_REDIRECT = '/';

export default async function middleware(request: NextRequest) {
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
    if (isProtectedRoute && !(await auth())) {
        return NextResponse.redirect(
            new URL(DEFAULT_REDIRECT, request.nextUrl),
        );
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|images|site.webmanifest|_next/static|_next/image|.*\\.png$).*)',
    ],
};
