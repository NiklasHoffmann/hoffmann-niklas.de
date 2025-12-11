'use client';

import { useEffect } from 'react';

/**
 * Handles resize and orientation change events to keep user in current section
 */
export function ResizeHandler() {
    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        let resizeTimeout: NodeJS.Timeout;

        const handleResizeOrOrientation = () => {
            // Clear any pending resize handler
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            // On mobile: Don't use hash (causes jumps), instead track by scroll position
            // On desktop: Use hash for accurate section tracking
            const getCurrentSection = () => {
                if (isMobile) {
                    // Find section based on current scroll position
                    const mainContainer = document.getElementById('main-scroll-container');
                    if (!mainContainer) return 'hero';
                    
                    const scrollTop = mainContainer.scrollTop;
                    const sections = document.querySelectorAll('.scroll-snap-section');
                    
                    for (let i = sections.length - 1; i >= 0; i--) {
                        const section = sections[i] as HTMLElement;
                        const rect = section.getBoundingClientRect();
                        const containerRect = mainContainer.getBoundingClientRect();
                        const sectionTop = rect.top - containerRect.top + scrollTop;
                        
                        if (scrollTop >= sectionTop - 50) {
                            return section.id || 'hero';
                        }
                    }
                    return 'hero';
                } else {
                    // Desktop: Use hash
                    const currentHash = window.location.hash.substring(1);
                    return currentHash || 'hero';
                }
            };

            const currentSection = getCurrentSection();

            // Debounce to avoid multiple rapid scrolls during resize
            resizeTimeout = setTimeout(() => {
                const element = document.getElementById(currentSection);
                const mainContainer = document.getElementById('main-scroll-container');

                if (element && mainContainer) {
                    // Scroll to the current section after resize/orientation change
                    // Use scrollTop instead of scrollIntoView for better control
                    const rect = element.getBoundingClientRect();
                    const containerRect = mainContainer.getBoundingClientRect();
                    const elementTop = rect.top - containerRect.top + mainContainer.scrollTop;

                    mainContainer.scrollTo({
                        top: elementTop,
                        behavior: 'auto' // Instant scroll, no animation
                    });

                    console.log('🔄 ResizeHandler: Restored position to section:', currentSection);
                }
            }, 100); // Small delay to ensure layout is recalculated
        };

        // Listen to resize and orientation change events
        window.addEventListener('resize', handleResizeOrOrientation);
        window.addEventListener('orientationchange', handleResizeOrOrientation);

        return () => {
            window.removeEventListener('resize', handleResizeOrOrientation);
            window.removeEventListener('orientationchange', handleResizeOrOrientation);
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
        };
    }, []);

    return null; // This component renders nothing
}
