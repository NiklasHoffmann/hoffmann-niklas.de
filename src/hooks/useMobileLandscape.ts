'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile landscape mode
 * Returns true only when:
 * - Device is in landscape orientation
 * - Screen height is 500px or less (typical for mobile in landscape)
 */
export function useMobileLandscape() {
    const [isMobileLandscape, setIsMobileLandscape] = useState(false);

    useEffect(() => {
        const checkMobileLandscape = () => {
            const isLandscape = window.matchMedia('(orientation: landscape)').matches;
            const isSmallHeight = window.innerHeight <= 500;
            setIsMobileLandscape(isLandscape && isSmallHeight);
        };

        // Initial check
        checkMobileLandscape();

        // Listen for resize and orientation changes
        window.addEventListener('resize', checkMobileLandscape);
        window.addEventListener('orientationchange', checkMobileLandscape);

        return () => {
            window.removeEventListener('resize', checkMobileLandscape);
            window.removeEventListener('orientationchange', checkMobileLandscape);
        };
    }, []);

    return isMobileLandscape;
}
