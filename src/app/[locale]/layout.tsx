import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';
import { ChatProvider } from '@/contexts/ChatContext';
import { ClientChatWidget } from '@/components/chat';
import { AnalyticsProvider } from '@/components/providers';
import { StructuredData } from '@/components/seo';
import { locales } from '@/i18n/config';

// Generate static params for all locales
export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const messages = (await import(`@/messages/${locale}.json`)).default;

    const title = locale === 'de'
        ? 'Niklas Hoffmann | Full-Stack & Web3 Frontend Developer'
        : 'Niklas Hoffmann | Full-Stack & Web3 Frontend Developer';

    const description = locale === 'de'
        ? 'Full-Stack Developer – Spezialisiert auf moderne Web-Apps, Web3-Frontend-Integration und Wallet-Konnektivität. React, Next.js, TypeScript, Wagmi, MetaMask, Ethereum.'
        : 'Full-Stack Developer – Specialized in modern web apps, Web3 frontend integration and wallet connectivity. React, Next.js, TypeScript, Wagmi, MetaMask, Ethereum.';

    const keywords = locale === 'de'
        ? 'Web Developer, Full-Stack Developer, Web3 Frontend, Wallet Integration, dApp Frontend, React, Next.js, TypeScript, Wagmi, Ethereum, Web3.js, MetaMask, IPFS, Fotografie, Webentwicklung, Deutschland, Blockchain Developer, Smart Contract Integration'
        : 'Web Developer, Full-Stack Developer, Web3 Frontend, Wallet Integration, dApp Frontend, React, Next.js, TypeScript, Wagmi, Ethereum, Web3.js, MetaMask, IPFS, Photography, Web Development, Germany, Blockchain Developer, Smart Contract Integration';

    // Verwende statisches OG-Image aus /public
    // OG Image: Screenshot der chain-preview Route (Section 1 mit Hero-Text)
    // Zum Erstellen: /chain-preview aufrufen, Section 1 auf 1200x630 zuschneiden
    const ogImageUrl = 'https://hoffmann-niklas.de/og-image.jpg';

    return {
        metadataBase: new URL('https://hoffmann-niklas.de'),
        title: {
            default: title,
            template: '%s | Niklas Hoffmann'
        },
        description,
        keywords,
        authors: [{ name: 'Niklas Hoffmann', url: 'https://hoffmann-niklas.de' }],
        creator: 'Niklas Hoffmann',
        publisher: 'Niklas Hoffmann',
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        openGraph: {
            type: 'website',
            locale: locale === 'de' ? 'de_DE' : locale === 'es' ? 'es_ES' : 'en_US',
            url: `https://hoffmann-niklas.de/${locale}`,
            title,
            description,
            siteName: 'Niklas Hoffmann Portfolio',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: 'Niklas Hoffmann - Full-Stack & Web3 Frontend Developer',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
            creator: '@NiklasHoffmann', // Falls du einen Twitter-Account hast
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: `https://hoffmann-niklas.de/${locale}`,
            languages: {
                'de': 'https://hoffmann-niklas.de/de',
                'en': 'https://hoffmann-niklas.de/en',
                'es': 'https://hoffmann-niklas.de/es',
                'x-default': 'https://hoffmann-niklas.de/en',
            },
        },
        verification: {
            // google: 'deine-google-verification-id', // Wenn du Google Search Console nutzt
        },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Load both languages to enable instant switching
    const [currentMessages, otherMessages] = await Promise.all([
        import(`@/messages/${locale}.json`),
        import(`@/messages/${locale === 'de' ? 'en' : 'de'}.json`)
    ]);

    const messages = currentMessages.default;

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <StructuredData locale={locale} />
            <ChatProvider>
                <AnalyticsProvider />
                {children}
                <ClientChatWidget />
            </ChatProvider>
        </NextIntlClientProvider>
    );
}