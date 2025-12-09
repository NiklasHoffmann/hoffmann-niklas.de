import type { Metadata } from 'next';
import type { ReactNode } from 'react';

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
            canonical: `https://hoffmann-niklas.de/${locale}/datenschutz`,
            languages: {
                'de': 'https://hoffmann-niklas.de/de/datenschutz',
                'en': 'https://hoffmann-niklas.de/en/datenschutz',
                'es': 'https://hoffmann-niklas.de/es/datenschutz',
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
