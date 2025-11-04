import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatWidget from '@/components/ChatWidget';

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
        ? 'Web Developer, Full-Stack Developer, Web3 Frontend, Wallet Integration, dApp Frontend, React, Next.js, TypeScript, Wagmi, Ethereum, Web3.js, MetaMask, IPFS, Fotografie, Webentwicklung, Deutschland'
        : 'Web Developer, Full-Stack Developer, Web3 Frontend, Wallet Integration, dApp Frontend, React, Next.js, TypeScript, Wagmi, Ethereum, Web3.js, MetaMask, IPFS, Photography, Web Development, Germany';

    return {
        metadataBase: new URL('https://hoffmann-niklas.de'),
        title,
        description,
        keywords,
        authors: [{ name: 'Niklas Hoffmann' }],
        creator: 'Niklas Hoffmann',
        openGraph: {
            type: 'website',
            locale: locale === 'de' ? 'de_DE' : 'en_US',
            url: `https://hoffmann-niklas.de/${locale}`,
            title,
            description,
            siteName: 'Niklas Hoffmann Portfolio',
            images: [
                {
                    url: '/og-image.jpg',
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
            images: ['/og-image.jpg'],
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
            },
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
            <ChatProvider>
                {children}
                <ChatWidget />
            </ChatProvider>
        </NextIntlClientProvider>
    );
}