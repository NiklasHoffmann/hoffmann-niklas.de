'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons/LocalIcon';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ImpressumPage() {
    const t = useTranslations('impressum');
    const { theme } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const isDark = theme === 'dark';

    useEffect(() => {
        setMounted(true);
        window.scrollTo(0, 0);

        // Disable scroll-snap on this page
        document.documentElement.classList.add('no-scroll-snap');

        return () => {
            document.documentElement.classList.remove('no-scroll-snap');
        };
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div
            className="pt-24 pb-16"
            style={{
                backgroundColor: isDark ? '#090909' : '#f9fafb',
                minHeight: 'calc(100vh - 80px)'
            }}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 mb-8 text-accent hover:underline cursor-pointer"
                >
                    <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                    {t('backToHome')}
                </button>

                {/* Header */}
                <div className="mb-12">
                    <h1
                        className="text-4xl md:text-5xl font-bold mb-4"
                        style={{ color: isDark ? '#ffffff' : '#111827' }}
                    >
                        {t('title')}
                    </h1>
                    <p
                        className="text-lg"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                        {t('subtitle')}
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                    {/* Contact Information */}
                    <section
                        className="p-6 rounded-xl border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <h2
                            className="text-2xl font-bold mb-4 flex items-center gap-2"
                            style={{ color: isDark ? '#ffffff' : '#111827' }}
                        >
                            <Icon icon="mdi:account" className="w-6 h-6 text-accent" />
                            {t('contact.title')}
                        </h2>
                        <div
                            className="space-y-2"
                            style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                        >
                            <p className="font-semibold">{t('contact.name')}</p>
                            <p>{t('contact.address.street')}</p>
                            <p>{t('contact.address.city')}</p>
                            <p>{t('contact.address.country')}</p>
                            <div className="pt-4">
                                <p className="flex items-center gap-2">
                                    <Icon icon="mdi:email" className="w-5 h-5 text-accent" />
                                    <a href={`mailto:${t('contact.email')}`} className="hover:text-accent">
                                        {t('contact.email')}
                                    </a>
                                </p>
                                {t('contact.phone') && (
                                    <p className="flex items-center gap-2 mt-2">
                                        <Icon icon="mdi:phone" className="w-5 h-5 text-accent" />
                                        <a href={`tel:${t('contact.phone')}`} className="hover:text-accent">
                                            {t('contact.phone')}
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Responsible for Content */}
                    <section
                        className="p-6 rounded-xl border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <h2
                            className="text-2xl font-bold mb-4 flex items-center gap-2"
                            style={{ color: isDark ? '#ffffff' : '#111827' }}
                        >
                            <Icon icon="mdi:file-document-edit" className="w-6 h-6 text-accent" />
                            {t('responsible.title')}
                        </h2>
                        <p style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                            {t('responsible.content')}
                        </p>
                    </section>

                    {/* Disclaimer */}
                    <section
                        className="p-6 rounded-xl border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <h2
                            className="text-2xl font-bold mb-4 flex items-center gap-2"
                            style={{ color: isDark ? '#ffffff' : '#111827' }}
                        >
                            <Icon icon="mdi:shield-alert" className="w-6 h-6 text-accent" />
                            {t('disclaimer.title')}
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                        >
                            <div>
                                <h3 className="font-semibold mb-2">{t('disclaimer.liability.title')}</h3>
                                <p>{t('disclaimer.liability.content')}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">{t('disclaimer.links.title')}</h3>
                                <p>{t('disclaimer.links.content')}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">{t('disclaimer.copyright.title')}</h3>
                                <p>{t('disclaimer.copyright.content')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Online Dispute Resolution */}
                    <section
                        className="p-6 rounded-xl border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <h2
                            className="text-2xl font-bold mb-4 flex items-center gap-2"
                            style={{ color: isDark ? '#ffffff' : '#111827' }}
                        >
                            <Icon icon="mdi:gavel" className="w-6 h-6 text-accent" />
                            {t('dispute.title')}
                        </h2>
                        <p style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                            {t('dispute.content')}
                        </p>
                        <a
                            href="https://ec.europa.eu/consumers/odr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-4 text-accent hover:underline"
                        >
                            https://ec.europa.eu/consumers/odr
                            <Icon icon="mdi:open-in-new" className="w-4 h-4" />
                        </a>
                    </section>
                </div>

                {/* Last Updated */}
                <div className="mt-12 text-center">
                    <p
                        className="text-sm"
                        style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                    >
                        {t('lastUpdated')}: {new Date().toLocaleDateString('de-DE')}
                    </p>
                </div>
            </div>
        </div>
    );
}
