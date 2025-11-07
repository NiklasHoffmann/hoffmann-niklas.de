import { useEffect, useState } from 'react';

/**
 * Hook that forces component re-render on orientation change and resize
 * Specifically designed to handle tablet rotation issues where content
 * doesn't properly expand from portrait to landscape
 */
export function useOrientationResize() {
    const [key, setKey] = useState(0);
    const [isLandscape, setIsLandscape] = useState(false);

    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;
        let orientationTimeout: NodeJS.Timeout;
        let previousOrientation: boolean | null = null;

        // Check initial orientation
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

            // Detect orientation change
            if (previousOrientation !== null && previousOrientation !== landscape) {
                console.log('📱 Orientation SWITCHED from', previousOrientation ? 'landscape' : 'portrait', 'to', landscape ? 'landscape' : 'portrait');
            }

            previousOrientation = landscape;
            return landscape;
        };

        checkOrientation();

        // Aggressive multi-wave reflow
        const forceMultipleReflows = () => {
            // Wave 1: Immediate
            setKey(prev => prev + 1);

            // Wave 2: After 100ms
            setTimeout(() => {
                setKey(prev => prev + 1);
            }, 100);

            // Wave 3: After 300ms
            setTimeout(() => {
                setKey(prev => prev + 1);
            }, 300);

            // Wave 4: After 500ms (final)
            setTimeout(() => {
                setKey(prev => prev + 1);
            }, 500);
        };

        const handleOrientationChange = () => {
            // Clear any pending timeouts
            clearTimeout(orientationTimeout);

            orientationTimeout = setTimeout(() => {
                const newOrientation = checkOrientation();
                console.log('🔄 Orientation changed to:', newOrientation ? 'landscape' : 'portrait');

                // Trigger multiple reflows
                forceMultipleReflows();

            }, 150);
        };

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newOrientation = checkOrientation();
                console.log('📐 Resize detected, orientation:', newOrientation ? 'landscape' : 'portrait');
                forceMultipleReflows();
            }, 100);
        };

        // Listen to both events
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleResize);

        // Also use matchMedia for more reliable orientation detection
        const mediaQuery = window.matchMedia('(orientation: landscape)');
        const handleMediaChange = (e: MediaQueryListEvent) => {
            console.log('📱 MediaQuery orientation changed to:', e.matches ? 'landscape' : 'portrait');
            setIsLandscape(e.matches);
            forceMultipleReflows();
        };

        mediaQuery.addEventListener('change', handleMediaChange);

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('resize', handleResize);
            mediaQuery.removeEventListener('change', handleMediaChange);
            clearTimeout(resizeTimeout);
            clearTimeout(orientationTimeout);
        };
    }, []);

    return { key, isLandscape };
}
