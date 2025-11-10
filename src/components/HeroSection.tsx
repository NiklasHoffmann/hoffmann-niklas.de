'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { useChat } from '@/contexts/ChatContext';
import { useOrientationResize } from '@/hooks/useOrientationResize';
import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

// Define tech icons outside component to prevent re-mounting
const TechIcons = () => (
    <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10 opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon icon="logos:react" className="w-6 h-6 transition-opacity duration-200" ssr={true} />
            <Icon icon="logos:nextjs-icon" className="w-6 h-6 transition-opacity duration-200" ssr={true} />
            <Icon icon="logos:typescript-icon" className="w-6 h-6 transition-opacity duration-200" ssr={true} />
            <Icon icon="logos:tailwindcss-icon" className="w-6 h-6 transition-opacity duration-200" ssr={true} />
            <Icon icon="logos:nodejs-icon" className="w-6 h-6 transition-opacity duration-200" ssr={true} />
            <Icon icon="logos:ethereum" className="w-6 h-6 transition-opacity duration-200" ssr={true} />
        </div>
    </div>
);

interface HeroSectionProps {
    onCTAClick?: () => void;
}

export function HeroSection({ }: HeroSectionProps) {
    const t = useTranslations('hero');
    const { openChat } = useChat();
    const { key } = useOrientationResize();
    const { theme } = useTheme();
    const { mounted } = useInteractiveMode();
    const [isHovered, setIsHovered] = useState(false);

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
        <section
            id="hero"
            key={key}
            className="scroll-snap-section section-padding relative w-full h-screen max-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20"
            style={{ scrollMarginTop: '0px' }}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
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
                        <div className="absolute w-3 h-3 bg-green-500/30 rounded-full animate-ping" />
                        <div className="relative w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground" style={{ transition: 'color 700ms ease-in-out' }}>
                        {t('cta')}
                    </span>
                    <Icon icon="mdi:chevron-right" className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform transition-opacity duration-200" ssr={true} />
                </button>

                {/* Title with better gradient */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-foreground">
                    {t('title')}
                </h1>

                {/* Subtitle with icon */}
                <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
                    <div className="hidden sm:block w-12 h-[2px] bg-gradient-to-r from-transparent to-accent/50" />
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                        {t('subtitle')}
                    </p>
                    <div className="hidden sm:block w-12 h-[2px] bg-gradient-to-l from-transparent to-accent/50" />
                </div>

                {/* Tech Stack Icons */}
                <TechIcons />
            </div>
        </section>
    );
}
