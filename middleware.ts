import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/config';

export default createMiddleware({
    locales: locales as unknown as string[],
    defaultLocale: defaultLocale,
    localePrefix: 'always',
});

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
