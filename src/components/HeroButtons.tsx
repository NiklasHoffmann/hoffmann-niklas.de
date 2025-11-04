'use client';

import { ArrowRight } from 'lucide-react';

interface HeroButtonsProps {
    cta: string;
    viewPortfolio: string;
    onCTAClick?: () => void;
}

export function HeroButtons({ cta, viewPortfolio, onCTAClick }: HeroButtonsProps) {
    const scrollToPortfolio = () => {
        const element = document.getElementById('portfolio');
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
                onClick={onCTAClick}
                className="group px-6 sm:px-8 py-3 sm:py-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-accent/20 text-sm sm:text-base"
                aria-label={cta}
            >
                {cta}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>

            <button
                onClick={scrollToPortfolio}
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-border hover:bg-secondary/50 text-foreground rounded-lg font-semibold transition-colors text-sm sm:text-base"
                aria-label={viewPortfolio}
            >
                {viewPortfolio}
            </button>
        </div>
    );
}
