import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildCanonical, buildLocalePath } from '@/lib/seo';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    const titles: Record<string, string> = {
        de: 'Datenschutzerklärung',
        en: 'Privacy Policy',
        es: 'Política de Privacidad',
    };

    const descriptions: Record<string, string> = {
        de: 'Datenschutzerklärung von Niklas Hoffmann - Informationen zur Verarbeitung personenbezogener Daten.',
        en: 'Privacy Policy of Niklas Hoffmann - Information about the processing of personal data.',
        es: 'Política de Privacidad de Niklas Hoffmann - Información sobre el procesamiento de datos personales.',
    };

    const title = titles[locale] || titles.en;
    const description = descriptions[locale] || descriptions.en;

    return {
        title,
        description,
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: buildCanonical(buildLocalePath(locale, 'datenschutz')),
            languages: {
                'de': buildCanonical(buildLocalePath('de', 'datenschutz')),
                'en': buildCanonical(buildLocalePath('en', 'datenschutz')),
                'es': buildCanonical(buildLocalePath('es', 'datenschutz')),
            },
        },
    };
}

export default function DatenschutzLayout({
    children,
}: {
    children: ReactNode;
}) {
    return children;
}
