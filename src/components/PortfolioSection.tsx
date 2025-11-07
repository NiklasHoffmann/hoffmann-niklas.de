'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { projects } from '@/data/portfolio';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { useOrientationResize } from '@/hooks/useOrientationResize';

export function PortfolioSection() {
    const t = useTranslations('portfolio');
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const { key } = useOrientationResize();

    const itemsPerPage = 3;
    const totalPages = Math.ceil(projects.length / itemsPerPage);

    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            // OPTIMIZATION: Batch all layout reads together to avoid forced reflow
            const container = scrollContainerRef.current;
            const { scrollLeft, scrollWidth, clientWidth } = container;

            // Cache offset values once
            const containerOffset = container.offsetLeft;
            const cards = Array.from(container.children) as HTMLElement[];
            const cardMetrics = cards.map(card => ({
                left: card.offsetLeft - containerOffset,
                width: card.offsetWidth
            }));

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
            const visibleCards: number[] = [];

            cardMetrics.forEach((metric, i) => {
                const cardRight = metric.left + metric.width;
                // Card is visible if it's in the viewport
                if (cardRight > scrollLeft && metric.left < scrollLeft + clientWidth) {
                    visibleCards.push(i);
                }
            });

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
            // OPTIMIZATION: Cache clientWidth before scroll operation
            const pageWidth = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollBy({ left: -pageWidth, behavior: 'smooth' });
            // Use requestAnimationFrame to check position after smooth scroll finishes
            requestAnimationFrame(() => {
                setTimeout(checkScrollPosition, 300);
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            // OPTIMIZATION: Cache clientWidth before scroll operation
            const pageWidth = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollBy({ left: pageWidth, behavior: 'smooth' });
            // Use requestAnimationFrame to check position after smooth scroll finishes
            requestAnimationFrame(() => {
                setTimeout(checkScrollPosition, 300);
            });
        }
    };

    const scrollToPage = (pageIndex: number) => {
        if (scrollContainerRef.current) {
            // OPTIMIZATION: Cache clientWidth before scroll operation
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
            key={key}
            className="scroll-snap-section w-full min-h-screen max-h-screen overflow-y-auto flex items-center justify-center bg-secondary/30 pt-20 md:pt-24 pb-12 md:pb-16 px-6 sm:px-12 lg:px-16 xl:px-20"
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
                                        priority={index === 0}
                                        sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 768px) 80vw, 50vw"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    {currentSlide > 0 && (
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm border border-border rounded-full p-2 hover:bg-accent hover:text-accent-foreground transition-all duration-700 ease-in-out z-10"
                            aria-label="Previous project"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    {currentSlide < projects.length - 1 && (
                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm border border-border rounded-full p-2 hover:bg-accent hover:text-accent-foreground transition-all duration-700 ease-in-out z-10"
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
                                    className={`h-3 rounded-full border ${index === currentSlide
                                        ? 'bg-accent border-accent w-12'
                                        : 'bg-secondary border-border w-3 hover:border-accent/50'
                                        }`}
                                    style={{ transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out, width 700ms ease-in-out' }}
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
                            {projects.map((project, index) => (
                                <div key={project.id} className="flex-shrink-0 w-[calc(50%-8px)] xl:w-[calc(33.333%-11px)] snap-start">
                                    <ProjectCard
                                        project={project}
                                        titleText={t(`projects.${project.title}.title`)}
                                        descriptionText={t(`projects.${project.title}.description`)}
                                        demoText={t('demo')}
                                        codeText={t('code')}
                                        maxTags={2}
                                        priority={index < 3}
                                        sizes="(max-width: 768px) 45vw, (max-width: 1536px) 330px, 384px"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        {canScrollLeft && (
                            <button
                                onClick={scrollLeft}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-card/90 backdrop-blur-sm border border-border rounded-full p-3 hover:bg-accent hover:text-accent-foreground transition-all duration-700 ease-in-out shadow-lg z-10"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}
                        {canScrollRight && (
                            <button
                                onClick={scrollRight}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-card/90 backdrop-blur-sm border border-border rounded-full p-3 hover:bg-accent hover:text-accent-foreground transition-all duration-700 ease-in-out shadow-lg z-10"
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
                                        className={`h-3 rounded-full border ${pageIndex === currentPage
                                            ? 'bg-accent border-accent w-12'
                                            : 'bg-secondary border-border w-3 hover:border-accent/50'
                                            }`}
                                        style={{ transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out, width 700ms ease-in-out' }}
                                        aria-label={`Go to page ${pageIndex + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="hidden sm:grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
                        {projects.map((project, index) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                titleText={t(`projects.${project.title}.title`)}
                                descriptionText={t(`projects.${project.title}.description`)}
                                demoText={t('demo')}
                                codeText={t('code')}
                                maxTags={2}
                                priority={index < 3}
                                sizes="(max-width: 768px) 45vw, (max-width: 1536px) 330px, 384px"
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
