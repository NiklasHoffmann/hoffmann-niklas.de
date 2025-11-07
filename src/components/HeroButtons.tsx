'use client';

interface HeroButtonsProps {
    viewPortfolio: string;
    viewContact: string;
}

export function HeroButtons({ viewPortfolio, viewContact }: HeroButtonsProps) {
    const scrollToPortfolio = () => {
        const element = document.getElementById('portfolio');
        element?.scrollIntoView({ behavior: 'smooth' });
    };
    const scrollToContact = () => {
        const element = document.getElementById('contact');
        element?.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
                onClick={scrollToPortfolio}
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-border hover:bg-secondary/50 text-foreground rounded-lg font-semibold text-sm sm:text-base"
                style={{
                    transition: 'all 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out, color 700ms ease-in-out'
                }}
                aria-label={viewPortfolio}
            >
                {viewPortfolio}
            </button>
            <button
                onClick={scrollToContact}
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-border hover:bg-secondary/50 text-foreground rounded-lg font-semibold text-sm sm:text-base"
                style={{
                    transition: 'all 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out, color 700ms ease-in-out'
                }}
                aria-label={viewContact}
            >
                {viewContact}
            </button>
        </div>
    );
}
