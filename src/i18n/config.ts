export const locales = ['de', 'en', 'es', 'ja', 'uk'] as const;
export const defaultLocale = 'de' as const;

export type Locale = (typeof locales)[number];
