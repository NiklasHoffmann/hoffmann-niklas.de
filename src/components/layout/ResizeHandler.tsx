'use client';

import { useEffect } from 'react';

/**
 * Handles resize and orientation change events to keep user in current section
 */
export function ResizeHandler() {
    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;

        const handleResizeOrOrientation = () => {
            // Clear any pending resize handler
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            // Get current section before resize
            const currentHash = window.location.hash.substring(1); // Remove #
            const currentSection = currentHash || 'hero';

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
