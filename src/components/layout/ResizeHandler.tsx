'use client';

import { useEffect } from 'react';

/**
 * Handles resize and orientation change events to keep user in current section
 * Disabled on mobile - native behavior is better
 */
export function ResizeHandler() {
    useEffect(() => {
        // Disable on mobile - let browser handle orientation changes natively
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) return;

        let resizeTimeout: NodeJS.Timeout;

        const handleResizeOrOrientation = () => {
            // Clear any pending resize handler
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            // Get current section from hash (desktop only)
            const currentHash = window.location.hash.substring(1);
            const currentSection = currentHash || 'hero';

            // Debounce to avoid multiple rapid scrolls during resize
            resizeTimeout = setTimeout(() => {
                const element = document.getElementById(currentSection);
                const mainContainer = document.getElementById('main-scroll-container');

                if (element && mainContainer) {
                    // Scroll to the current section after resize/orientation change
                    const rect = element.getBoundingClientRect();
                    const containerRect = mainContainer.getBoundingClientRect();
                    const elementTop = rect.top - containerRect.top + mainContainer.scrollTop;

                    mainContainer.scrollTo({
                        top: elementTop,
                        behavior: 'auto'
                    });

                    console.log('🔄 ResizeHandler: Restored position to section:', currentSection);
                }
            }, 100);
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
