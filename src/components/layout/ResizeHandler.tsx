'use client';

import { useEffect } from 'react';

/**
 * Minimal resize handler - only updates viewport height on resize
 * Scroll-snap and positioning handled natively by browser
 */
export function ResizeHandler() {
    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;

        const handleResize = () => {
            // Clear existing timeout
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            // Debounce: wait for resize to finish
            resizeTimeout = setTimeout(() => {
                // Force CSS recalculation by updating a CSS variable
                document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
            }, 150);
        };

        // Initial set
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);

        // Listen to resize events
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
        };
    }, []);

    return null;
}
