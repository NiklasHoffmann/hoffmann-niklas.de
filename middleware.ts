import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/config';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
    console.log('🔍 Middleware called for:', request.nextUrl.pathname);

    const response = intlMiddleware(request);

    if (response) {
        console.log('✅ Middleware response:', response.status, response.headers.get('location'));
    } else {
        console.log('⚠️ Middleware returned nothing');
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
