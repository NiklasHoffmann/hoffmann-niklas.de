'use client';

import { memo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Github, Mail, Instagram } from 'lucide-react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { TRANSITIONS } from '@/lib/transitions';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { Section, SectionLeft, SectionRight, SectionDefault } from '@/components/ui';
import { useDevice } from '@/contexts/DeviceContext';

function FooterComponent() {
    const t = useTranslations('footer');
    const tNav = useTranslations('header.nav');
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const currentYear = new Date().getFullYear();
    const { showActive } = useInteractiveMode();
    const { isMobileLandscape } = useDevice();

    // Use mounted state to avoid hydration mismatch with showActive
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const socialLinks = [
        { icon: Github, href: 'https://github.com/NiklasHoffmann', label: 'GitHub' },
        { icon: Instagram, href: 'https://instagram.com/fotolaend', label: 'LinkedIn' },
        { icon: Mail, href: 'mailto:mail@hoffmann-niklas.de', label: 'Email' },
    ];

    return (
        <Section id="footer" background="secondary" asFooter>
            {/* Mobile Landscape Layout */}
            <SectionLeft className='w-1/2'>
                <h3 className="text-lg font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-1">
                    {t('name')}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">{t('brand')}</p>
                <div className="flex gap-2">
                    {socialLinks.map((social) => {
                        const IconComp = social.icon;
                        return (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-secondary/50 border border-border"
                                aria-label={social.label}
                            >
                                <IconComp className="w-4 h-4" />
                            </a>
                        );
                    })}
                </div>
            </SectionLeft>

            <SectionRight className='w-1/2'>
                <div className="text-center text-[10px] text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/${locale}/impressum`}
                            className="link-underline hover:text-accent"
                            data-glow={isMounted && showActive ? 'true' : undefined}
                            style={{ color: 'hsl(var(--muted-foreground))', transition: 'color 700ms ease-in-out' }}
                        >
                            {t('impressum')}
                        </Link>
                        <span>•</span>
                        <Link
                            href={`/${locale}/datenschutz`}
                            className="link-underline hover:text-accent"
                            data-glow={isMounted && showActive ? 'true' : undefined}
                            style={{ color: 'hsl(var(--muted-foreground))', transition: 'color 700ms ease-in-out' }}
                        >
                            {t('datenschutz')}
                        </Link>
                    </div>
                    <p>
                        © <span
                            onClick={() => router.push('/admin')}
                            className="cursor-default hover:text-primary transition-colors"
                        >{currentYear}</span> {t('name')}
                    </p>
                </div>
            </SectionRight>

            {/* Default Layout (Desktop, Tablet, Mobile Portrait) */}
            <SectionDefault className="max-w-4xl">
                {/* Content Stack */}
                <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 mb-8 sm:mb-10">
                    {/* Brand */}
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2 sm:mb-3">
                            {t('name')}
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
                                const IconComp = social.icon;
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
                                        <IconComp className="w-5 h-5" />
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
                            className="link-underline hover:text-accent"
                            data-glow={isMounted && showActive ? 'true' : undefined}
                            style={{ color: 'hsl(var(--muted-foreground))', transition: 'color 700ms ease-in-out' }}
                        >
                            {t('impressum')}
                        </Link>
                        <span className="text-muted-foreground/40">•</span>
                        <Link
                            href={`/${locale}/datenschutz`}
                            className="link-underline hover:text-accent"
                            data-glow={isMounted && showActive ? 'true' : undefined}
                            style={{ color: 'hsl(var(--muted-foreground))', transition: 'color 700ms ease-in-out' }}
                        >
                            {t('datenschutz')}
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
                        <span className="text-red-500 gpu-pulse" aria-label="love">❤️</span>
                        {t('madeWith').split('❤️')[1]}
                    </p>
                </div>
            </SectionDefault>
        </Section>
    );
}

export const Footer = memo(FooterComponent);
