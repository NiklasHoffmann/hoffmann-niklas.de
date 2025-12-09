export const locales = ['de', 'en', 'es', 'ja'] as const;
export const defaultLocale = 'de' as const;

export type Locale = (typeof locales)[number];
