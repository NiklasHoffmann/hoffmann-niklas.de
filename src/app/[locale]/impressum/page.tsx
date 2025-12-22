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

        // Enable scrolling on this page
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.documentElement.classList.add('no-scroll-snap');

        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.documentElement.classList.remove('no-scroll-snap');
        };
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div
            className="pt-20 xs:pt-24 pb-12 xs:pb-16"
            style={{
                backgroundColor: isDark ? '#090909' : '#f9fafb',
                minHeight: 'calc(100vh - 80px)'
            }}
        >
            <div className="max-w-4xl mx-auto px-4 xs:px-6 sm:px-8 lg:px-12">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/#footer')}
                    className="inline-flex items-center gap-1.5 xs:gap-2 mb-6 xs:mb-8 text-accent hover:underline cursor-pointer touch-target"
                >
                    <Icon icon="mdi:arrow-left" className="w-4 xs:w-5 h-4 xs:h-5" />
                    {t('backToHome')}
                </button>

                {/* Header */}
                <div className="mb-8 xs:mb-12">
                    <h1
                        className="text-3xl xs:text-4xl md:text-5xl font-bold mb-3 xs:mb-4"
                        style={{ color: isDark ? '#ffffff' : '#111827' }}
                    >
                        {t('title')}
                    </h1>
                    <p
                        className="text-base xs:text-lg"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                        {t('subtitle')}
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-5 xs:space-y-8">
                    {/* Contact Information */}
                    <section
                        className="p-5 xs:p-7 md:p-8 rounded-xl border xs:border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <h2
                            className="text-xl xs:text-2xl font-bold mb-3 xs:mb-4 flex items-center gap-1.5 xs:gap-2"
                            style={{ color: isDark ? '#ffffff' : '#111827' }}
                        >
                            <Icon icon="mdi:account" className="w-5 xs:w-6 h-5 xs:h-6 text-accent" />
                            {t('contact.title')}
                        </h2>
                        <div
                            className="space-y-1.5 xs:space-y-2"
                            style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                        >
                            <p className="font-semibold">{t('contact.name')}</p>
                            <p>{t('contact.address.street')}</p>
                            <p>{t('contact.address.city')}</p>
                            <p>{t('contact.address.country')}</p>
                            <div className="pt-3 xs:pt-4">
                                <p className="flex items-center gap-1.5 xs:gap-2">
                                    <Icon icon="mdi:email" className="w-4 xs:w-5 h-4 xs:h-5 text-accent" />
                                    <a href={`mailto:${t('contact.email')}`} className="hover:text-accent">
                                        {t('contact.email')}
                                    </a>
                                </p>
                                {t('contact.phone') && (
                                    <p className="flex items-center gap-1.5 xs:gap-2 mt-1.5 xs:mt-2">
                                        <Icon icon="mdi:phone" className="w-4 xs:w-5 h-4 xs:h-5 text-accent" />
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
                        className="p-5 xs:p-7 md:p-8 rounded-xl border xs:border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <h2
                            className="text-xl xs:text-2xl font-bold mb-3 xs:mb-4 flex items-center gap-1.5 xs:gap-2"
                            style={{ color: isDark ? '#ffffff' : '#111827' }}
                        >
                            <Icon icon="mdi:file-document-edit" className="w-5 xs:w-6 h-5 xs:h-6 text-accent" />
                            {t('responsible.title')}
                        </h2>
                        <p style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                            {t('responsible.content')}
                        </p>
                    </section>

                    {/* Disclaimer */}
                    <section
                        className="p-5 xs:p-7 md:p-8 rounded-xl border xs:border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <h2
                            className="text-xl xs:text-2xl font-bold mb-3 xs:mb-4 flex items-center gap-1.5 xs:gap-2"
                            style={{ color: isDark ? '#ffffff' : '#111827' }}
                        >
                            <Icon icon="mdi:shield-alert" className="w-5 xs:w-6 h-5 xs:h-6 text-accent" />
                            {t('disclaimer.title')}
                        </h2>
                        <div
                            className="space-y-3 xs:space-y-4"
                            style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                        >
                            <div>
                                <h3 className="font-semibold mb-1.5 xs:mb-2">{t('disclaimer.liability.title')}</h3>
                                <p>{t('disclaimer.liability.content')}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1.5 xs:mb-2">{t('disclaimer.links.title')}</h3>
                                <p>{t('disclaimer.links.content')}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1.5 xs:mb-2">{t('disclaimer.copyright.title')}</h3>
                                <p>{t('disclaimer.copyright.content')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Online Dispute Resolution */}
                    <section
                        className="p-5 xs:p-7 md:p-8 rounded-xl border xs:border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <h2
                            className="text-xl xs:text-2xl font-bold mb-3 xs:mb-4 flex items-center gap-1.5 xs:gap-2"
                            style={{ color: isDark ? '#ffffff' : '#111827' }}
                        >
                            <Icon icon="mdi:gavel" className="w-5 xs:w-6 h-5 xs:h-6 text-accent" />
                            {t('dispute.title')}
                        </h2>
                        <p style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                            {t('dispute.content')}
                        </p>
                        <a
                            href="https://ec.europa.eu/consumers/odr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 xs:gap-2 mt-3 xs:mt-4 text-accent hover:underline touch-target"
                        >
                            https://ec.europa.eu/consumers/odr
                            <Icon icon="mdi:open-in-new" className="w-3.5 xs:w-4 h-3.5 xs:h-4" />
                        </a>
                    </section>
                </div>

                {/* Last Updated */}
                <div className="mt-8 xs:mt-12 text-center">
                    <p
                        className="text-xs xs:text-sm"
                        style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                    >
                        {t('lastUpdated')}: {new Date().toLocaleDateString('de-DE')}
                    </p>
                </div>
            </div>
        </div>
    );
}
