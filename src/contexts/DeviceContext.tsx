'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

/**
 * Device/Layout Types:
 * - desktop: Large screens (width >= 1024px)
 * - tablet-landscape: Medium screens in landscape (width 768-1023px, landscape)
 * - tablet-portrait: Medium screens in portrait (width 768-1023px, portrait)
 * - mobile-landscape: Small screens in landscape (width < 768px OR height <= 500px, landscape)
 * - mobile-portrait: Small screens in portrait (width < 768px, portrait)
 */
export type DeviceLayout =
    | 'desktop'
    | 'tablet-landscape'
    | 'tablet-portrait'
    | 'mobile-landscape'
    | 'mobile-portrait';

export interface DeviceInfo {
    layout: DeviceLayout;
    isDesktop: boolean;
    isTablet: boolean;
    isMobile: boolean;
    isLandscape: boolean;
    isPortrait: boolean;
    // Convenience flags for common checks
    isMobileLandscape: boolean;
    isCompact: boolean; // mobile-landscape or mobile-portrait
    width: number;
    height: number;
}

function getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
        // SSR fallback - assume desktop
        return {
            layout: 'desktop',
            isDesktop: true,
            isTablet: false,
            isMobile: false,
            isLandscape: true,
            isPortrait: false,
            isMobileLandscape: false,
            isCompact: false,
            width: 1920,
            height: 1080,
        };
    }

    // Force a layout read to ensure fresh values
    void document.body.offsetHeight;

    // Get width from most reliable source for mobile devices
    // visualViewport is null on some older browsers or during initial load
    let width = (typeof window.visualViewport !== 'undefined' && window.visualViewport?.width)
        || window.innerWidth
        || document.documentElement.clientWidth;

    // For height, window.innerHeight can be wrong on mobile during orientation change
    // Use visualViewport first, then try screen.availHeight for portrait
    let height = (typeof window.visualViewport !== 'undefined' && window.visualViewport?.height)
        || window.innerHeight;

    // CRITICAL FIX: Check actual screen orientation and swap dimensions if needed
    // On real devices, visualViewport can return landscape dimensions even after rotating to portrait
    const actualOrientation = window.screen?.orientation?.type ||
        (window.matchMedia('(orientation: portrait)').matches ? 'portrait-primary' : 'landscape-primary');

    const isActuallyPortrait = actualOrientation.includes('portrait');
    const isActuallyLandscape = actualOrientation.includes('landscape');

    // If dimensions don't match actual orientation, swap them (only log in dev)
    if (isActuallyPortrait && width > height) {
        if (process.env.NODE_ENV !== 'production') {
            console.log('⚠️ Swapping dimensions for portrait orientation:', { before: `${width}x${height}`, after: `${height}x${width}` });
        }
        [width, height] = [height, width];
    } else if (isActuallyLandscape && height > width) {
        if (process.env.NODE_ENV !== 'production') {
            console.log('⚠️ Swapping dimensions for landscape orientation:', { before: `${width}x${height}`, after: `${height}x${width}` });
        }
        [width, height] = [height, width];
    }

    // Sanity check: if height seems wrong (e.g., too large compared to typical mobile screens)
    // and we're clearly in portrait (width < height), use screen dimensions
    if (height > 2000 && width < 1200) {
        // Likely a bug - use screen height or window.screen.availHeight
        height = window.screen.availHeight || window.screen.height || height;
        console.log('⚠️ Height correction applied:', height);
    }

    console.log('🔍 getDeviceInfo sources:', {
        visualViewport: window.visualViewport ? `${window.visualViewport.width}x${window.visualViewport.height}` : 'null',
        window: `${window.innerWidth}x${window.innerHeight}`,
        screen: `${window.screen.width}x${window.screen.height}`,
        screenAvail: `${window.screen.availWidth}x${window.screen.availHeight}`,
        orientation: actualOrientation,
        chosen: `${width}x${height}`
    });

    const isLandscape = width > height;
    const isPortrait = !isLandscape;

    let layout: DeviceLayout;
    let isDesktop = false;
    let isTablet = false;
    let isMobile = false;

    // Desktop: width >= 1024px
    if (width >= 1024) {
        layout = 'desktop';
        isDesktop = true;
    }
    // Tablet: width 768-1023px
    else if (width >= 768) {
        layout = isLandscape ? 'tablet-landscape' : 'tablet-portrait';
        isTablet = true;
    }
    // Mobile: width < 768px OR (landscape with height <= 500px - phone in landscape)
    else {
        // Special case: landscape with very small height = definitely mobile landscape
        if (isLandscape && height <= 500) {
            layout = 'mobile-landscape';
        } else {
            layout = isLandscape ? 'mobile-landscape' : 'mobile-portrait';
        }
        isMobile = true;
    }

    // Extra check: even "tablet" in landscape with small height is effectively mobile-landscape
    if (isTablet && isLandscape && height <= 500) {
        layout = 'mobile-landscape';
        isTablet = false;
        isMobile = true;
    }

    const isMobileLandscape = layout === 'mobile-landscape';
    const isCompact = isMobile;

    return {
        layout,
        isDesktop,
        isTablet,
        isMobile,
        isLandscape,
        isPortrait,
        isMobileLandscape,
        isCompact,
        width,
        height,
    };
}

const DeviceContext = createContext<DeviceInfo | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;
        let orientationTimeouts: NodeJS.Timeout[] = [];
        let isHandlingOrientation = false;
        let lastOrientation = window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';

        const handleResize = () => {
            // On mobile, ignore resize events from browser UI changes
            // Only handle real orientation changes (detected via visualViewport listener)
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                return;
            }

            // Debounce resize events (desktop only)
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                setDeviceInfo(getDeviceInfo());
            }, 50);
        };

        const handleOrientationChange = () => {
            // Check if this is a real orientation change (portrait ↔ landscape)
            // or just browser UI appearing/disappearing
            const currentOrientation = window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';

            if (currentOrientation === lastOrientation) {
                // Same orientation = just browser UI change, not a real rotation
                return;
            }

            lastOrientation = currentOrientation;

            // Prevent duplicate calls
            if (isHandlingOrientation) {
                return;
            }

            isHandlingOrientation = true;
            if (process.env.NODE_ENV !== 'production') {
                console.log('📱 DeviceContext: Real orientation change detected:', currentOrientation);
            }

            // Clear any pending timeouts
            orientationTimeouts.forEach(t => clearTimeout(t));
            orientationTimeouts = [];

            // Force browser reflow - critical for mobile landscape->portrait
            // OPTIMIZATION: Single forced reflow instead of multiple
            document.documentElement.style.width = '';
            document.body.style.width = '';
            void document.body.offsetHeight; // Single intentional reflow to reset layout
            document.documentElement.style.width = '100vw';
            document.body.style.width = '100vw';

            // Force viewport meta tag re-evaluation (helps on real devices)
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                const content = viewport.getAttribute('content');
                viewport.setAttribute('content', 'width=1');
                // Reuse same reflow - no need for another offsetHeight read
                if (content) viewport.setAttribute('content', content);
            }

            // Use requestAnimationFrame to wait for browser to finish orientation UI
            requestAnimationFrame(() => {
                // Wave 1: After first animation frame
                const info1 = getDeviceInfo();
                console.log('📱 DeviceContext: Wave 1 (RAF) -', info1.layout, `${info1.width}x${info1.height}`);
                setDeviceInfo(info1);
                window.dispatchEvent(new Event('resize'));

                // Nested RAF for extra safety
                requestAnimationFrame(() => {
                    const info2 = getDeviceInfo();
                    console.log('📱 DeviceContext: Wave 2 (RAF2) -', info2.layout, `${info2.width}x${info2.height}`);
                    setDeviceInfo(info2);
                    window.dispatchEvent(new Event('resize'));
                });
            });

            // Wave 3: After 300ms (browser viewport update - increased for real devices)
            orientationTimeouts.push(setTimeout(() => {
                const info = getDeviceInfo();
                console.log('📱 DeviceContext: Wave 3 (300ms) -', info.layout, `${info.width}x${info.height}`);
                setDeviceInfo(info);
                window.dispatchEvent(new Event('resize'));
            }, 300));

            // Wave 4: After 600ms (slow devices - increased for real devices)
            orientationTimeouts.push(setTimeout(() => {
                const info = getDeviceInfo();
                console.log('📱 DeviceContext: Wave 4 (600ms) -', info.layout, `${info.width}x${info.height}`);
                setDeviceInfo(info);
                window.dispatchEvent(new Event('resize'));

                // Reset flag after all waves complete
                isHandlingOrientation = false;
            }, 400));
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);

        // Listen to visualViewport changes (mobile-specific)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleOrientationChange);
        }

        // Also use matchMedia for more reliable orientation detection
        const mediaQuery = window.matchMedia('(orientation: landscape)');
        const handleMediaChange = () => {
            handleOrientationChange();
        };
        mediaQuery.addEventListener('change', handleMediaChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChange);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleOrientationChange);
            }
            mediaQuery.removeEventListener('change', handleMediaChange);
            clearTimeout(resizeTimeout);
            orientationTimeouts.forEach(t => clearTimeout(t));
        };
    }, []);

    return (
        <DeviceContext.Provider value={deviceInfo}>
            {children}
        </DeviceContext.Provider>
    );
}

export function useDevice(): DeviceInfo {
    const context = useContext(DeviceContext);
    if (!context) {
        // Fallback if used outside provider (shouldn't happen but safe)
        return getDeviceInfo();
    }
    return context;
}

/**
 * Hook that just returns the layout string
 */
export function useDeviceLayout(): DeviceLayout {
    return useDevice().layout;
}

/**
 * Utility component for conditional rendering based on device
 */
interface ShowOnProps {
    children: ReactNode;
    desktop?: boolean;
    tablet?: boolean;
    tabletLandscape?: boolean;
    tabletPortrait?: boolean;
    mobile?: boolean;
    mobileLandscape?: boolean;
    mobilePortrait?: boolean;
    landscape?: boolean;
    portrait?: boolean;
}

export function ShowOn({
    children,
    desktop,
    tablet,
    tabletLandscape,
    tabletPortrait,
    mobile,
    mobileLandscape,
    mobilePortrait,
    landscape,
    portrait,
}: ShowOnProps) {
    const device = useDevice();

    let show = false;

    // Check specific layouts
    if (desktop && device.isDesktop) show = true;
    if (tablet && device.isTablet) show = true;
    if (tabletLandscape && device.layout === 'tablet-landscape') show = true;
    if (tabletPortrait && device.layout === 'tablet-portrait') show = true;
    if (mobile && device.isMobile) show = true;
    if (mobileLandscape && device.layout === 'mobile-landscape') show = true;
    if (mobilePortrait && device.layout === 'mobile-portrait') show = true;

    // Check orientation across all devices
    if (landscape && device.isLandscape) show = true;
    if (portrait && device.isPortrait) show = true;

    if (!show) return null;
    return <>{children}</>;
}

/**
 * Utility component to hide on specific devices
 */
interface HideOnProps {
    children: ReactNode;
    desktop?: boolean;
    tablet?: boolean;
    tabletLandscape?: boolean;
    tabletPortrait?: boolean;
    mobile?: boolean;
    mobileLandscape?: boolean;
    mobilePortrait?: boolean;
    landscape?: boolean;
    portrait?: boolean;
}

export function HideOn({
    children,
    desktop,
    tablet,
    tabletLandscape,
    tabletPortrait,
    mobile,
    mobileLandscape,
    mobilePortrait,
    landscape,
    portrait,
}: HideOnProps) {
    const device = useDevice();

    let hide = false;

    // Check specific layouts
    if (desktop && device.isDesktop) hide = true;
    if (tablet && device.isTablet) hide = true;
    if (tabletLandscape && device.layout === 'tablet-landscape') hide = true;
    if (tabletPortrait && device.layout === 'tablet-portrait') hide = true;
    if (mobile && device.isMobile) hide = true;
    if (mobileLandscape && device.layout === 'mobile-landscape') hide = true;
    if (mobilePortrait && device.layout === 'mobile-portrait') hide = true;

    // Check orientation across all devices
    if (landscape && device.isLandscape) hide = true;
    if (portrait && device.isPortrait) hide = true;

    if (hide) return null;
    return <>{children}</>;
}
