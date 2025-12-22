import { MetadataRoute } from 'next';
import { buildCanonical, buildLocalePath } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hoffmann-niklas.de';
    const lastModified = new Date();

    const locales = ['de', 'en', 'es', 'ja', 'uk', 'fa'];

    const makeLocaleEntry = (locale: string) => ({
        url: buildCanonical(buildLocalePath(locale)),
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 1,
        alternates: {
            languages: locales.reduce((acc, l) => {
                if (l !== locale) acc[l] = buildCanonical(buildLocalePath(l));
                return acc;
            }, {} as Record<string, string>),
        },
    });

    return [
        makeLocaleEntry('de'),
        makeLocaleEntry('en'),
        makeLocaleEntry('es'),
        {
            url: buildCanonical(buildLocalePath('de', 'impressum')),
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
            alternates: {
                languages: locales.reduce((acc, l) => {
                    if (l !== 'de') acc[l] = buildCanonical(buildLocalePath(l, 'impressum'));
                    return acc;
                }, {} as Record<string, string>)
            }
        },
        {
            url: buildCanonical(buildLocalePath('de', 'datenschutz')),
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
            alternates: {
                languages: locales.reduce((acc, l) => {
                    if (l !== 'de') acc[l] = buildCanonical(buildLocalePath(l, 'datenschutz'));
                    return acc;
                }, {} as Record<string, string>)
            }
        },
    ];
}
