'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { useChat } from '@/contexts/ChatContext';
import { useOrientationResize } from '@/hooks/useOrientationResize';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useDevice } from '@/contexts/DeviceContext';
import { Section, SectionLeft, SectionRight, SectionDefault } from '@/components/ui';

// Define tech icons outside component to prevent re-mounting
const TechIcons = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-center justify-center gap-3 ${compact ? 'mb-0' : 'mb-8 sm:mb-10'} opacity-100 transition-opacity duration-300`}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon icon="logos:react" className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} transition-opacity duration-200`} />
            <Icon icon="logos:nextjs-icon" className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} transition-opacity duration-200`} />
            <Icon icon="logos:typescript-icon" className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} transition-opacity duration-200`} />
            <Icon icon="logos:tailwindcss-icon" className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} transition-opacity duration-200`} />
            <Icon icon="logos:nodejs-icon" className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} transition-opacity duration-200`} />
            <Icon icon="logos:ethereum" className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} transition-opacity duration-200`} />
        </div>
    </div>
);

export function HeroSection() {
    const t = useTranslations('hero');
    const { openChat } = useChat();
    const { key } = useOrientationResize();
    const { theme } = useTheme();
    const { mounted } = useInteractiveMode();
    const { isMobileLandscape } = useDevice();
    const [isHovered, setIsHovered] = useState(false);

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
        <Section id="hero" sectionKey={key} animatedBackground>
            {/* Mobile Landscape Layout */}
            <SectionLeft className="w-2/3 pr-4">
                <h1 className="text-2xl font-bold mb-2 leading-tight text-foreground">
                    {title}
                </h1>
                <p className="text-xs text-muted-foreground mb-2 max-w-sm">
                    {subtitle}
                </p>
                <p className="text-xs text-accent font-medium">
                    {priceNote}
                </p>
            </SectionLeft>

            <SectionRight className="w-1/3 gap-3">
                <button
                    onClick={openChat}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border group"
                    style={{
                        boxShadow: getBaseShadow(),
                        transition: 'all 0.3s ease-in-out, border-color 700ms ease-in-out'
                    }}
                >
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-2 h-2 bg-green-500/30 rounded-full gpu-ping" />
                        <div className="relative w-1.5 h-1.5 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{t('cta')}</span>
                    <Icon
                        icon="mdi:chevron-right"
                        className="w-3 h-3"
                        style={{ color: 'hsl(var(--accent))', transition: 'color 700ms ease-in-out' }}

                    />
                </button>
                <TechIcons compact />
            </SectionRight>

            {/* Default Layout (Desktop, Tablet, Mobile Portrait) */}
            <SectionDefault>
                {/* Professional Badge */}
                <button
                    onClick={openChat}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="mb-6 sm:mb-8 inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-background border border-border group"
                    style={{
                        boxShadow: isHovered ? getHoverShadow() : getBaseShadow(),
                        transition: 'all 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
                    }}
                >
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-3 h-3 bg-green-500/30 rounded-full gpu-ping" />
                        <div className="relative w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground" style={{ transition: 'color 700ms ease-in-out' }}>
                        {t('cta')}
                    </span>
                    <Icon
                        icon="mdi:chevron-right"
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                        style={{ color: 'hsl(var(--accent))', transition: 'color 700ms ease-in-out, transform 200ms ease-in-out' }}

                    />
                </button>

                {/* Title with better gradient */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-foreground">
                    {title}
                </h1>

                {/* Subtitle with icon */}
                <div className="flex items-center justify-center gap-3 mb-4 sm:mb-5">
                    <div className="hidden sm:block w-12 h-[2px] bg-gradient-to-r from-transparent to-accent/50" />
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                        {subtitle}
                    </p>
                    <div className="hidden sm:block w-12 h-[2px] bg-gradient-to-l from-transparent to-accent/50" />
                </div>

                {/* Price Note */}
                <p className="text-sm sm:text-base text-accent font-medium mb-6 sm:mb-8">
                    {priceNote}
                </p>

                {/* Tech Stack Icons */}
                <TechIcons />
            </SectionDefault>
        </Section>
    );
}
