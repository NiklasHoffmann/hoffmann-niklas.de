'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/LocalIcon';
import { useChat } from '@/contexts/ChatContext';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useDevice } from '@/contexts/DeviceContext';
import { Section, SectionLeft, SectionRight, SectionDefault } from '@/components/ui';

// Define tech icons outside component to prevent re-mounting
// Icons are deferred to avoid blocking main thread on initial load
// Container has fixed height to prevent CLS (Cumulative Layout Shift)
const TechIcons = ({ compact = false, visible = true }: { compact?: boolean; visible?: boolean }) => (
    <div
        className={`flex items-center justify-center gap-responsive-sm ${compact ? 'mb-0' : 'mb-6 xs:mb-8 sm:mb-10'} transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ minHeight: compact ? '16px' : '24px' }}
        role="list"
        aria-label="Technology stack"
    >
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 text-xs text-muted-foreground">
            {visible && (
                <>
                    <Icon icon="logos:react" className={`${compact ? 'w-3.5 h-3.5 xs:w-4 xs:h-4' : 'w-5 h-5 xs:w-6 xs:h-6'}`} />
                    <Icon icon="logos:nextjs-icon" className={`${compact ? 'w-3.5 h-3.5 xs:w-4 xs:h-4' : 'w-5 h-5 xs:w-6 xs:h-6'}`} />
                    <Icon icon="logos:typescript-icon" className={`${compact ? 'w-3.5 h-3.5 xs:w-4 xs:h-4' : 'w-5 h-5 xs:w-6 xs:h-6'}`} />
                    <Icon icon="logos:tailwindcss-icon" className={`${compact ? 'w-3.5 h-3.5 xs:w-4 xs:h-4' : 'w-5 h-5 xs:w-6 xs:h-6'}`} />
                    <Icon icon="logos:nodejs-icon" className={`${compact ? 'w-3.5 h-3.5 xs:w-4 xs:h-4' : 'w-5 h-5 xs:w-6 xs:h-6'}`} />
                    <Icon icon="logos:ethereum" className={`${compact ? 'w-3.5 h-3.5 xs:w-4 xs:h-4' : 'w-5 h-5 xs:w-6 xs:h-6'}`} />
                </>
            )}
        </div>
    </div>
);

export function HeroSection() {
    const t = useTranslations('hero');
    const { openChat } = useChat();
    const { theme } = useTheme();
    const { mounted } = useInteractiveMode();
    const device = useDevice();
    const { isMobileLandscape } = device;
    const [isHovered, setIsHovered] = useState(false);
    // Defer icon loading to not block main thread
    const [showIcons, setShowIcons] = useState(false);

    useEffect(() => {
        // Use requestIdleCallback to load icons after critical content
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(() => setShowIcons(true), { timeout: 1000 });
            return () => window.cancelIdleCallback(id);
        } else {
            const timeout = setTimeout(() => setShowIcons(true), 50);
            return () => clearTimeout(timeout);
        }
    }, []);

    // Use client translations for proper language toggle support
    const title = t('title');
    const subtitle = t('subtitle');
    const priceNote = t('priceNote');

    // Theme-adaptive shadow
    const getBaseShadow = () => {
        if (!mounted) return '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
        return theme === 'dark'
            ? '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -4px rgba(255, 255, 255, 0.1)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
    };

    const getHoverShadow = () => {
        if (!mounted) return '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
        return theme === 'dark'
            ? '0 20px 25px -5px rgba(255, 255, 255, 0.15), 0 8px 10px -6px rgba(255, 255, 255, 0.15)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
    };

    return (
        <Section id="hero" sectionKey={`${device.layout}-${device.width}`} animatedBackground>
            {/* Mobile Landscape Layout */}
            <SectionLeft className="w-2/3">
                <h1 className="text-xl xs:text-2xl font-bold mb-2 leading-tight text-foreground">
                    {title}
                </h1>
                <p className="text-[11px] xs:text-xs text-muted-foreground mb-2 max-w-sm leading-relaxed">
                    {subtitle}
                </p>
                <p className="text-[11px] xs:text-xs text-accent font-medium">
                    {priceNote}
                </p>
            </SectionLeft>

            <SectionRight className="w-1/3 gap-2 xs:gap-3">
                <button
                    onClick={openChat}
                    className="touch-target inline-flex items-center gap-1.5 xs:gap-2 px-3 py-2 rounded-full bg-background border border-border group"
                    style={{
                        boxShadow: getBaseShadow(),
                        transition: 'all 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
                    }}
                    aria-label={t('cta')}
                >
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-2 h-2 bg-green-500/30 rounded-full gpu-ping" />
                        <div className="relative w-1.5 h-1.5 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-[11px] xs:text-xs font-semibold text-foreground" style={{ transition: 'color 700ms ease-in-out' }}>{t('cta')}</span>
                    <Icon
                        icon="mdi:chevron-right"
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: 'hsl(var(--accent))', transition: 'color 700ms ease-in-out' }}
                    />
                </button>
                <TechIcons compact visible={showIcons} />
            </SectionRight>

            {/* Default Layout (Desktop, Tablet, Mobile Portrait) */}
            <SectionDefault>
                {/* Professional Badge */}
                <button
                    onClick={openChat}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="touch-target mb-5 xs:mb-6 sm:mb-8 inline-flex items-center gap-2 px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 sm:py-3 rounded-full bg-background border border-border group"
                    style={{
                        boxShadow: isHovered ? getHoverShadow() : getBaseShadow(),
                        transition: 'all 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
                    }}
                    aria-label={t('cta')}
                >
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-2.5 xs:w-3 h-2.5 xs:h-3 bg-green-500/30 rounded-full gpu-ping" />
                        <div className="relative w-1.5 xs:w-2 h-1.5 xs:h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground" style={{ transition: 'color 700ms ease-in-out' }}>
                        {t('cta')}
                    </span>
                    <Icon
                        icon="mdi:chevron-right"
                        className="w-3.5 xs:w-4 h-3.5 xs:h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200"
                        style={{ color: 'hsl(var(--accent))', transition: 'color 700ms ease-in-out, transform 200ms ease-in-out' }}
                    />
                </button>

                {/* Title - text-balance ensures consistent line breaks regardless of font loading */}
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 xs:mb-4 sm:mb-6 leading-tight text-foreground text-balance">
                    {title}
                </h1>

                {/* Subtitle with icon */}
                <div className="flex items-center justify-center gap-2 xs:gap-3 mb-3 xs:mb-4 sm:mb-5">
                    <div className="hidden sm:block w-8 md:w-12 h-[2px] bg-gradient-to-r from-transparent to-accent/50" />
                    <p className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xs xs:max-w-sm sm:max-w-2xl">
                        {subtitle}
                    </p>
                    <div className="hidden sm:block w-8 md:w-12 h-[2px] bg-gradient-to-l from-transparent to-accent/50" />
                </div>

                {/* Price Note */}
                <p className="text-sm xs:text-base sm:text-lg md:text-xl text-accent font-medium mb-6 xs:mb-8 sm:mb-10">
                    {priceNote}
                </p>

                {/* Tech Stack Icons - deferred loading */}
                <TechIcons visible={showIcons} />
            </SectionDefault>
        </Section>
    );
}
