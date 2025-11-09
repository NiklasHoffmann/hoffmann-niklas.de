'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { TRANSITIONS } from '@/lib/transitions';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

function FooterComponent() {
    const t = useTranslations('footer');
    const tNav = useTranslations('header.nav');
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const currentYear = new Date().getFullYear();
    const { showActive } = useInteractiveMode();
    const socialLinks = [
        { icon: Github, href: 'https://github.com/hoffmannniklas', label: 'GitHub' },
        { icon: Linkedin, href: 'https://linkedin.com/in/hoffmannniklas', label: 'LinkedIn' },
        { icon: Twitter, href: 'https://twitter.com/hoffmannniklas', label: 'Twitter' },
        { icon: Mail, href: 'mailto:hoffmann.niklas@googlemail.com', label: 'Email' },
    ];

    return (
        <footer id="footer" className="scroll-snap-section bg-secondary/50 min-h-screen flex items-center py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="max-w-4xl mx-auto w-full">
                {/* Content Stack */}
                <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 mb-8 sm:mb-10">
                    {/* Brand */}
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2 sm:mb-3">
                            Niklas Hoffmann
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-md">
                            {t('brand')}
                        </p>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t('followMe')}</h4>
                        <div className="flex gap-3 sm:gap-4 justify-center">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-lg bg-secondary/50 hover:bg-accent hover:text-accent-foreground border border-border hover:border-accent/50"
                                        style={{ transition: TRANSITIONS.backgroundAndBorder }}
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border mb-6" style={{ transition: TRANSITIONS.border }} />

                {/* Copyright & Legal Links - Centered */}
                <div className="text-center text-xs sm:text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <Link
                            href={`/${locale}/impressum`}
                            className={showActive ? 'link-underline-glow hover:text-accent' : 'link-underline hover:text-accent'}
                            style={{ transition: 'color 700ms cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
                        >
                            {locale === 'de' ? 'Impressum' : locale === 'es' ? 'Aviso Legal' : 'Legal Notice'}
                        </Link>
                        <span className="text-muted-foreground/40">•</span>
                        <Link
                            href={`/${locale}/datenschutz`}
                            className={showActive ? 'link-underline-glow hover:text-accent' : 'link-underline hover:text-accent'}
                            style={{ transition: 'color 700ms cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
                        >
                            {locale === 'de' ? 'Datenschutz' : locale === 'es' ? 'Privacidad' : 'Privacy'}
                        </Link>
                    </div>
                    <p>
                        {t('copyright').split(currentYear.toString())[0]}
                        <span
                            onClick={() => router.push('/admin')}
                            className="cursor-default hover:text-primary transition-colors"
                            title=""
                        >
                            {currentYear}
                        </span>
                        {t('copyright').split(currentYear.toString())[1] || ` Niklas Hoffmann. ${t('copyright').includes('All rights reserved') ? 'All rights reserved.' : 'Alle Rechte vorbehalten.'}`}
                    </p>
                    <p className="text-muted-foreground/60 flex items-center justify-center gap-1">
                        {t('madeWith').split('❤️')[0]}
                        <Icon icon="mdi:heart" className="text-red-500 w-4 h-4 animate-pulse" ssr={true} />
                        {t('madeWith').split('❤️')[1]}
                    </p>
                </div>
            </div>
        </footer>
    );
}

export const Footer = memo(FooterComponent);
