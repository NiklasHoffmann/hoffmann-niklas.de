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
        de: 'Impressum',
        en: 'Legal Notice',
        es: 'Aviso Legal',
    };

    const descriptions: Record<string, string> = {
        de: 'Impressum von Niklas Hoffmann - Kontaktinformationen und rechtliche Angaben.',
        en: 'Legal Notice of Niklas Hoffmann - Contact information and legal details.',
        es: 'Aviso Legal de Niklas Hoffmann - Información de contacto y detalles legales.',
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
            canonical: buildCanonical(buildLocalePath(locale, 'impressum')),
            languages: {
                'de': buildCanonical(buildLocalePath('de', 'impressum')),
                'en': buildCanonical(buildLocalePath('en', 'impressum')),
                'es': buildCanonical(buildLocalePath('es', 'impressum')),
            },
        },
    };
}

export default function ImpressumLayout({
    children,
}: {
    children: ReactNode;
}) {
    return children;
}
