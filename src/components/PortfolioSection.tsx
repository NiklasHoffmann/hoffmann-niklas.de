'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { projects } from '@/data/portfolio';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectCard } from '@/components/ui/ProjectCard';

export function PortfolioSection() {
    const t = useTranslations('portfolio');
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    const itemsPerPage = 3;
    const totalPages = Math.ceil(projects.length / itemsPerPage);

    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

            const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 20;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(!isAtEnd);

            // If we're at the end (can't scroll right anymore), show last page
            if (isAtEnd) {
                setCurrentPage(totalPages - 1);
                return;
            }

            // Find the third visible card (index 2 of visible cards)
            // This represents which "page" of 3 we're showing
            const cards = scrollContainerRef.current.children;
            const visibleCards: number[] = [];

            for (let i = 0; i < cards.length; i++) {
                const card = cards[i] as HTMLElement;
                const cardLeft = card.offsetLeft - scrollContainerRef.current.offsetLeft;
                const cardRight = cardLeft + card.offsetWidth;

                // Card is visible if it's in the viewport
                if (cardRight > scrollLeft && cardLeft < scrollLeft + clientWidth) {
                    visibleCards.push(i);
                }
            }

            // Take the third visible card (index 2), or the last if less than 3 visible
            const referenceIndex = visibleCards.length >= 3
                ? visibleCards[2]  // Third card
                : visibleCards[visibleCards.length - 1] || 0;  // Last visible card

            // Calculate page based on reference card
            const page = Math.floor(referenceIndex / itemsPerPage);
            setCurrentPage(page);
        }
    }; const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % projects.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const pageWidth = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollBy({ left: -pageWidth, behavior: 'smooth' });
            setTimeout(checkScrollPosition, 300);
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const pageWidth = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollBy({ left: pageWidth, behavior: 'smooth' });
            setTimeout(checkScrollPosition, 300);
        }
    };

    const scrollToPage = (pageIndex: number) => {
        if (scrollContainerRef.current) {
            const pageWidth = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollTo({
                left: pageWidth * pageIndex,
                behavior: 'smooth'
            });
            setTimeout(checkScrollPosition, 300);
        }
    };

    const showDesktopSlider = projects.length > 3;

    return (
        <section
            id="portfolio"
            className="scroll-snap-section w-full h-screen flex items-center justify-center bg-secondary/30 pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-12 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto w-full h-full flex flex-col justify-center">
                {/* Header */}
                <SectionHeader
                    title={t('title')}
                    subtitle={t('subtitle')}
                    className="mb-4 sm:mb-6 lg:mb-8"
                />

                {/* Mobile: Slider */}
                <div className="sm:hidden relative">
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-300 ease-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {projects.map((project, index) => (
                                <div key={project.id} className="w-full flex-shrink-0 px-4">
                                    <ProjectCard
                                        project={project}
                                        titleText={t(`projects.${project.title}.title`)}
                                        descriptionText={t(`projects.${project.title}.description`)}
                                        demoText={t('demo')}
                                        codeText={t('code')}
                                        maxTags={3}
                                        priority={true}
                                        sizes="100vw"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    {currentSlide > 0 && (
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm border border-border rounded-full p-2 hover:bg-accent hover:text-accent-foreground transition-all z-10"
                            aria-label="Previous project"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    {currentSlide < projects.length - 1 && (
                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm border border-border rounded-full p-2 hover:bg-accent hover:text-accent-foreground transition-all z-10"
                            aria-label="Next project"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}

                    {/* Project Indicator Dots */}
                    <div className="mt-6">
                        <div className="flex justify-center gap-3">
                            {projects.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-3 rounded-full transition-all border ${index === currentSlide
                                        ? 'bg-accent border-accent w-12'
                                        : 'bg-secondary border-border w-3 hover:border-accent/50'
                                        }`}
                                    aria-label={`Go to project ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desktop: Slider (wenn > 3 Projekte) oder Grid (wenn <= 3 Projekte) */}
                {showDesktopSlider ? (
                    <div className="hidden sm:block relative">
                        {/* Scroll Container */}
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onScroll={checkScrollPosition}
                        >
                            {projects.map((project) => (
                                <div key={project.id} className="flex-shrink-0 w-[calc(33.333%-12px)] snap-start">
                                    <ProjectCard
                                        project={project}
                                        titleText={t(`projects.${project.title}.title`)}
                                        descriptionText={t(`projects.${project.title}.description`)}
                                        demoText={t('demo')}
                                        codeText={t('code')}
                                        maxTags={2}
                                        priority={true}
                                        sizes="33vw"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        {canScrollLeft && (
                            <button
                                onClick={scrollLeft}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-card/90 backdrop-blur-sm border border-border rounded-full p-3 hover:bg-accent hover:text-accent-foreground transition-all shadow-lg z-10"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}
                        {canScrollRight && (
                            <button
                                onClick={scrollRight}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-card/90 backdrop-blur-sm border border-border rounded-full p-3 hover:bg-accent hover:text-accent-foreground transition-all shadow-lg z-10"
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}

                        {/* Page Indicator Dots */}
                        <div className="mt-6">
                            <div className="flex justify-center gap-3">
                                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                                    <button
                                        key={pageIndex}
                                        onClick={() => scrollToPage(pageIndex)}
                                        className={`h-3 rounded-full transition-all border ${pageIndex === currentPage
                                                ? 'bg-accent border-accent w-12'
                                                : 'bg-secondary border-border w-3 hover:border-accent/50'
                                            }`}
                                        aria-label={`Go to page ${pageIndex + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                titleText={t(`projects.${project.title}.title`)}
                                descriptionText={t(`projects.${project.title}.description`)}
                                demoText={t('demo')}
                                codeText={t('code')}
                                maxTags={2}
                                priority={true}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
