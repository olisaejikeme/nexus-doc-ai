import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// The function name is now 'proxy'
export function proxy(request: NextRequest) {
    const token = request.cookies.get('token');
    const isLoginPage = request.nextUrl.pathname === '/login';

    // 1. If trying to access dashboard WITHOUT a token -> Redirect to Login
    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. If already logged in and trying to go to Login -> Redirect to Dashboard
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// The 'config' object and matcher remain unchanged
export const config = {
    matcher: [
        '/',
        '/chat/:path*',
        '/login'
    ],
};