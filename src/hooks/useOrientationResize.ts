import { useEffect, useState, useRef } from 'react';

/**
 * Hook that forces component re-render on orientation change
 * Specifically designed to handle tablet rotation issues where content
 * doesn't properly expand from portrait to landscape
 */
export function useOrientationResize() {
    const [key, setKey] = useState(0);
    const [isLandscape, setIsLandscape] = useState(false);
    const lastOrientationRef = useRef<boolean | null>(null);

    useEffect(() => {
        let orientationTimeout: NodeJS.Timeout;

        // Check orientation without triggering reflows
        const checkOrientation = () => {
            const landscape = window.matchMedia('(orientation: landscape)').matches;
            setIsLandscape(landscape);

            // Add/remove CSS class to body for orientation-specific styling
            if (landscape) {
                document.body.classList.add('is-landscape');
                document.body.classList.remove('is-portrait');
            } else {
                document.body.classList.add('is-portrait');
                document.body.classList.remove('is-landscape');
            }

            return landscape;
        };

        // Initial check
        const initialOrientation = checkOrientation();
        lastOrientationRef.current = initialOrientation;

        // Only trigger reflow when orientation ACTUALLY changes
        const forceReflowOnOrientationChange = (newOrientation: boolean) => {
            if (lastOrientationRef.current === newOrientation) {
                // No actual orientation change, skip
                return;
            }

            console.log('📱 Orientation SWITCHED from', lastOrientationRef.current ? 'landscape' : 'portrait', 'to', newOrientation ? 'landscape' : 'portrait');
            lastOrientationRef.current = newOrientation;

            // Single key update - DeviceContext handles the multi-wave updates
            setKey(prev => prev + 1);
        };

        const handleOrientationChange = () => {
            clearTimeout(orientationTimeout);

            orientationTimeout = setTimeout(() => {
                const newOrientation = checkOrientation();
                forceReflowOnOrientationChange(newOrientation);
            }, 100);
        };

        // Listen to orientationchange event
        window.addEventListener('orientationchange', handleOrientationChange);

        // Use matchMedia for more reliable orientation detection
        const mediaQuery = window.matchMedia('(orientation: landscape)');
        const handleMediaChange = (e: MediaQueryListEvent) => {
            forceReflowOnOrientationChange(e.matches);
        };

        mediaQuery.addEventListener('change', handleMediaChange);

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            mediaQuery.removeEventListener('change', handleMediaChange);
            clearTimeout(orientationTimeout);
        };
    }, []);

    return { key, isLandscape };
}
