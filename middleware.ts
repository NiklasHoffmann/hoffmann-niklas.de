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
    matcher: [
        '/',
        '/(de|en|es)/:path*',
        '/((?!api|_next|_vercel|admin|chain-preview|.*\\..*).*)'
    ]
};