'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { HeroButtons } from './HeroButtons';
import { useChat } from '@/contexts/ChatContext';

interface HeroSectionProps {
    onCTAClick?: () => void;
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
    const t = useTranslations('hero');
    const { openChat } = useChat();

    return (
        <section
            id="hero"
            className="scroll-snap-section relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 overflow-hidden"
            style={{ scrollMarginTop: '0px' }}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 sm:px-8 lg:px-12 max-w-5xl mx-auto">
                {/* Professional Badge */}
                <button
                    onClick={openChat}
                    className="mb-6 sm:mb-8 inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-lg hover:shadow-xl hover:border-accent/50 transition-all duration-300 group"
                >
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-3 h-3 bg-green-500/30 rounded-full animate-ping" />
                        <div className="relative w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                        Available for Projects
                    </span>
                    <Icon icon="mdi:chevron-right" className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
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
                <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon icon="logos:react" className="w-6 h-6" />
                        <Icon icon="logos:nextjs-icon" className="w-6 h-6" />
                        <Icon icon="logos:typescript-icon" className="w-6 h-6" />
                        <Icon icon="logos:tailwindcss-icon" className="w-6 h-6" />
                        <Icon icon="logos:nodejs-icon" className="w-6 h-6" />
                        <Icon icon="logos:ethereum" className="w-6 h-6" />
                    </div>
                </div>

                <HeroButtons cta={t('cta')} viewPortfolio={t('viewPortfolio')} onCTAClick={onCTAClick} />
            </div>
        </section>
    );
}
