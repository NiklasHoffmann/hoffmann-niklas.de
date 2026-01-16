'use client';

import { useEffect, useRef } from 'react';

/**
 * Optimized resize handler with ResizeObserver and requestAnimationFrame
 * Provides smooth transitions during window resize and orientation changes
 */
export function ResizeHandler() {
    const rafIdRef = useRef<number>();
    const resizeTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Disable on mobile - native behavior is better
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) return;

        const mainContainer = document.getElementById('main-scroll-container');
        if (!mainContainer) return;

        let lastWidth = window.innerWidth;
        let lastHeight = window.innerHeight;
        let isResizing = false;

        const restorePosition = () => {
            const currentHash = window.location.hash.substring(1);
            const currentSection = currentHash || 'hero';
            const element = document.getElementById(currentSection);

            if (element && mainContainer) {
                // Use requestAnimationFrame for smooth scroll positioning
                if (rafIdRef.current) {
                    cancelAnimationFrame(rafIdRef.current);
                }

                rafIdRef.current = requestAnimationFrame(() => {
                    const rect = element.getBoundingClientRect();
                    const containerRect = mainContainer.getBoundingClientRect();
                    const elementTop = rect.top - containerRect.top + mainContainer.scrollTop;

                    mainContainer.scrollTo({
                        top: elementTop,
                        behavior: 'auto'
                    });
                });
            }
        };

        const handleResize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;

            // Only handle significant size changes (ignores URL bar hide/show)
            const widthChange = Math.abs(newWidth - lastWidth);
            const heightChange = Math.abs(newHeight - lastHeight);

            if (widthChange > 50 || heightChange > 100) {
                isResizing = true;
                document.documentElement.style.setProperty('--is-resizing', '1');

                // Clear existing timeout
                if (resizeTimeoutRef.current) {
                    clearTimeout(resizeTimeoutRef.current);
                }

                // Debounce: restore position after resize stops
                resizeTimeoutRef.current = setTimeout(() => {
                    restorePosition();
                    isResizing = false;
                    document.documentElement.style.setProperty('--is-resizing', '0');
                    lastWidth = newWidth;
                    lastHeight = newHeight;
                }, 150);
            }
        };

        const handleOrientation = () => {
            // Orientation change always triggers repositioning
            document.documentElement.style.setProperty('--is-resizing', '1');

            setTimeout(() => {
                restorePosition();
                lastWidth = window.innerWidth;
                lastHeight = window.innerHeight;
                document.documentElement.style.setProperty('--is-resizing', '0');
            }, 300); // Allow time for orientation animation
        };

        // Modern ResizeObserver for container
        let resizeObserver: ResizeObserver | null = null;
        if ('ResizeObserver' in window) {
            resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target === mainContainer) {
                        handleResize();
                    }
                }
            });
            resizeObserver.observe(mainContainer);
        }

        // Fallback to window resize for older browsers
        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('orientationchange', handleOrientation, { passive: true });

        // Visual Viewport API for better mobile handling
        if ('visualViewport' in window && window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize, { passive: true });
        }

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientation);
            if ('visualViewport' in window && window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, []);

    return null;
}
