'use client';

import { useEffect } from 'react';

/**
 * Enhances smooth scroll behavior with custom easing
 * Prevents scroll-snap interference during smooth scroll animation
 */
export function SmoothScrollEnhancer() {
    useEffect(() => {
        const mainContainer = document.getElementById('main-scroll-container');
        if (!mainContainer) return;

        let isScrolling = false;
        let animationFrameId: number | null = null;
        let sections: HTMLElement[] = [];

        // Temporarily disable scroll-snap during animation
        const disableScrollSnap = () => {
            mainContainer.style.scrollSnapType = 'none';
        };

        const enableScrollSnap = () => {
            mainContainer.style.scrollSnapType = 'y mandatory';
        };

        // Custom smooth scroll function with easing
        const smoothScrollTo = (targetPosition: number) => {
            if (isScrolling && animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            const startPosition = mainContainer.scrollTop;
            const distance = targetPosition - startPosition;
            const duration = 700;
            let startTime: number | null = null;

            isScrolling = true;
            disableScrollSnap();

            // Easing function: easeInOutCubic for smooth acceleration/deceleration
            const easeInOutCubic = (t: number): number => {
                return t < 0.5
                    ? 4 * t * t * t
                    : 1 - Math.pow(-2 * t + 2, 3) / 2;
            };

            const animation = (currentTime: number) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);

                const easedProgress = easeInOutCubic(progress);
                mainContainer.scrollTop = startPosition + distance * easedProgress;

                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(animation);
                } else {
                    isScrolling = false;
                    animationFrameId = null;

                    // Re-enable scroll-snap after animation completes
                    setTimeout(() => {
                        enableScrollSnap();
                    }, 50);
                }
            };

            animationFrameId = requestAnimationFrame(animation);
        };

        // Prevent wheel scrolling during animation - SOFORT reagieren mit URL hash
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Block komplett während Animation läuft
            if (isScrolling) {
                return false;
            }

            // SOFORT: Direction bestimmen und nächste Section finden
            const direction = e.deltaY > 0 ? 1 : -1;

            // Nutze URL hash um aktuelle Section zu finden - instant!
            const currentHash = window.location.hash.slice(1) || 'hero';
            const currentIndex = sections.findIndex(s => s.id === currentHash);

            // Falls hash nicht gefunden, fallback auf scroll position
            let targetIndex;
            if (currentIndex === -1) {
                const scrollTop = mainContainer.scrollTop;
                const containerTop = mainContainer.getBoundingClientRect().top;

                let fallbackIndex = 0;
                for (let i = 0; i < sections.length; i++) {
                    const sectionTop = sections[i].getBoundingClientRect().top - containerTop + scrollTop;
                    if (scrollTop >= sectionTop - 50) {
                        fallbackIndex = i;
                    }
                }
                targetIndex = Math.max(0, Math.min(sections.length - 1, fallbackIndex + direction));
            } else {
                targetIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + direction));
            }

            if (sections[targetIndex]) {
                const scrollTop = mainContainer.scrollTop;
                const containerTop = mainContainer.getBoundingClientRect().top;
                const targetPosition = sections[targetIndex].getBoundingClientRect().top - containerTop + scrollTop;
                smoothScrollTo(targetPosition);
            }

            return false;
        };

        // Prevent touch scrolling during animation
        const handleTouchMove = (e: TouchEvent) => {
            if (isScrolling) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        // Intercept anchor link clicks
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a[href^="#"]');

            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;

            const targetId = href.slice(1);
            const targetElement = document.getElementById(targetId);

            if (!targetElement) return;

            e.preventDefault();

            // Calculate target position relative to main container
            const containerRect = mainContainer.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const targetPosition = mainContainer.scrollTop + (targetRect.top - containerRect.top);

            // Apply smooth scroll
            smoothScrollTo(targetPosition);

            // Update URL hash
            if (targetId === 'hero') {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            } else {
                window.history.replaceState(null, '', `#${targetId}`);
            }
        };

        // Cache sections at start
        sections = Array.from(document.querySelectorAll('.scroll-snap-section')) as HTMLElement[];

        mainContainer.addEventListener('wheel', handleWheel, { passive: false });
        mainContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('click', handleAnchorClick);

        return () => {
            mainContainer.removeEventListener('wheel', handleWheel);
            mainContainer.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('click', handleAnchorClick);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            enableScrollSnap();
        };
    }, []);

    return null;
}
