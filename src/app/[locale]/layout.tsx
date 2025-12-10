import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { StructuredData } from '@/components/seo';
import { ScrollToTop } from '@/components/ui';
import { locales } from '@/i18n/config';

// Lazy-load non-critical components to reduce initial script evaluation
const AnalyticsProvider = dynamic(
    () => import('@/components/providers/AnalyticsProvider').then(mod => ({ default: mod.AnalyticsProvider }))
);

// Lazy-load Chat components (includes socket.io ~50KB) - only loaded when needed
const ChatProvider = dynamic(
    () => import('@/contexts/ChatContext').then(mod => ({ default: mod.ChatProvider }))
);
const ClientChatWidget = dynamic(
    () => import('@/components/chat/ClientChatWidget')
);

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

    const titles: Record<string, string> = {
        de: 'Niklas Hoffmann | Full-Stack & Web3 Frontend Developer',
        en: 'Niklas Hoffmann | Full-Stack & Web3 Frontend Developer',
        es: 'Niklas Hoffmann | Desarrollador Full-Stack & Web3 Frontend',
        ja: 'Niklas Hoffmann | フルスタック & Web3 フロントエンド開発者',
    };

    const descriptions: Record<string, string> = {
        de: 'Full-Stack Developer – Spezialisiert auf moderne Web-Apps, Web3-Frontend-Integration und Wallet-Konnektivität. React, Next.js, TypeScript, Wagmi, MetaMask, Ethereum.',
        en: 'Full-Stack Developer – Specialized in modern web apps, Web3 frontend integration and wallet connectivity. React, Next.js, TypeScript, Wagmi, MetaMask, Ethereum.',
        es: 'Desarrollador Full-Stack – Especializado en aplicaciones web modernas, integración Web3 frontend y conectividad de wallet. React, Next.js, TypeScript, Wagmi, MetaMask, Ethereum.',
        ja: 'フルスタック開発者 – モダンなウェブアプリ、Web3フロントエンド統合、ウォレット接続に特化。React、Next.js、TypeScript、Wagmi、MetaMask、Ethereum。',
    };

    const keywordsList: Record<string, string> = {
        de: 'Web Developer, Full-Stack Developer, Web3 Frontend, Wallet Integration, dApp Frontend, React, Next.js, TypeScript, Wagmi, Ethereum, Web3.js, MetaMask, IPFS, Fotografie, Webentwicklung, Deutschland, Blockchain Developer, Smart Contract Integration',
        en: 'Web Developer, Full-Stack Developer, Web3 Frontend, Wallet Integration, dApp Frontend, React, Next.js, TypeScript, Wagmi, Ethereum, Web3.js, MetaMask, IPFS, Photography, Web Development, Germany, Blockchain Developer, Smart Contract Integration',
        es: 'Desarrollador Web, Desarrollador Full-Stack, Web3 Frontend, Integración Wallet, dApp Frontend, React, Next.js, TypeScript, Wagmi, Ethereum, Web3.js, MetaMask, IPFS, Fotografía, Desarrollo Web, Alemania, Desarrollador Blockchain, Integración Smart Contract',
        ja: 'ウェブ開発者, フルスタック開発者, Web3フロントエンド, ウォレット統合, dAppフロントエンド, React, Next.js, TypeScript, Wagmi, Ethereum, Web3.js, MetaMask, IPFS, 写真撮影, ウェブ開発, ドイツ, ブロックチェーン開発者, スマートコントラクト統合',
    };

    const title = titles[locale] || titles.en;
    const description = descriptions[locale] || descriptions.en;
    const keywords = keywordsList[locale] || keywordsList.en;

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
            locale: locale === 'de' ? 'de_DE' : locale === 'es' ? 'es_ES' : locale === 'ja' ? 'ja_JP' : 'en_US',
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
            google: "SPiBjO6w7P1Ug44_amSud06RABoCwsJehrqk0ECyu_M"
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

    // Load only current language messages (other languages loaded on-demand when switching)
    const messages = (await import(`@/messages/${locale}.json`)).default;

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <StructuredData locale={locale} />
            <ChatProvider>
                <AnalyticsProvider />
                {children}
                <ScrollToTop />
                <ClientChatWidget />
            </ChatProvider>
        </NextIntlClientProvider>
    );
}