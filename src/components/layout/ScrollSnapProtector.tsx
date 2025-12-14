'use client';

import { useEffect } from 'react';

/**
 * Protects scroll position on mobile by temporarily disabling scroll-snap
 * during visualViewport resize events (browser UI appearing/disappearing)
 */
export function ScrollSnapProtector() {
    useEffect(() => {
        // Only run on mobile devices
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) return;

        const mainContainer = document.getElementById('main-scroll-container');
        if (!mainContainer) return;

        let resizeTimeout: NodeJS.Timeout;

        const handleViewportResize = () => {
            // Temporarily disable scroll-snap during resize
            mainContainer.style.scrollSnapType = 'none';

            // Clear previous timeout
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            // Re-enable scroll-snap after resize is complete
            resizeTimeout = setTimeout(() => {
                mainContainer.style.scrollSnapType = 'y mandatory';
                console.log('📱 ScrollSnapProtector: Re-enabled scroll-snap after viewport resize');
            }, 150);
        };

        // Listen to visualViewport resize (browser UI changes)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportResize);
            console.log('📱 ScrollSnapProtector: Active on mobile');
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportResize);
            }
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
        };
    }, []);

    return null;
}
