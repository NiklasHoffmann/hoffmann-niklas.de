import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    const validLocale = (locales.includes(locale as Locale) ? locale : defaultLocale) as string;

    const messages = (await import(`../messages/${validLocale}.json`)).default;

    return {
        locale: validLocale,
        messages,
        timeZone: 'Europe/Berlin',
    };
});
