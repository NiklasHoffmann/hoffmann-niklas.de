import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/config';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip favicon requests entirely - they should be served as static files
    if (pathname === '/favicon.ico' || pathname === '/favicon.svg' || pathname.startsWith('/favicons/')) {
        return NextResponse.next();
    }

    // Debug logs (werden in production nicht entfernt wenn wir sie brauchen)
    if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 Middleware called for:', pathname);
    }

    // Explizite Root-Weiterleitung
    if (pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = `/${defaultLocale}`;
        return NextResponse.redirect(url);
    }

    const response = intlMiddleware(request);

    if (process.env.NODE_ENV !== 'production' && response) {
        console.log('✅ Middleware response:', response.status, response.headers.get('location'));
    }

    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `api`, `_next`, `_vercel`, `admin`, or `/chain-preview`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // - … favicon files and static assets
    matcher: [
        '/',
        '/(de|en|es)/:path*',
        '/((?!api|_next|_vercel|admin|chain-preview|favicons|.*\\..*).*)'
    ]
};