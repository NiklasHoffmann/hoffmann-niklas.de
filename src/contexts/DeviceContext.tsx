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

    const width = window.innerWidth;
    const height = window.innerHeight;
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
        let orientationTimeout: NodeJS.Timeout;

        const handleResize = () => {
            // Debounce resize events
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                setDeviceInfo(getDeviceInfo());
            }, 50);
        };

        const handleOrientationChange = () => {
            // Clear any pending resize timeout
            clearTimeout(orientationTimeout);
            
            // Multiple checks for reliable orientation change detection
            // Wave 1: Immediate
            setDeviceInfo(getDeviceInfo());
            
            // Wave 2: After 100ms (browser may not have updated dimensions yet)
            orientationTimeout = setTimeout(() => {
                setDeviceInfo(getDeviceInfo());
            }, 100);
            
            // Wave 3: After 300ms (some devices are slow)
            setTimeout(() => {
                setDeviceInfo(getDeviceInfo());
            }, 300);
            
            // Wave 4: After 500ms (final catch)
            setTimeout(() => {
                setDeviceInfo(getDeviceInfo());
            }, 500);
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);

        // Also use matchMedia for more reliable orientation detection
        const mediaQuery = window.matchMedia('(orientation: landscape)');
        const handleMediaChange = () => {
            handleOrientationChange();
        };
        mediaQuery.addEventListener('change', handleMediaChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChange);
            mediaQuery.removeEventListener('change', handleMediaChange);
            clearTimeout(resizeTimeout);
            clearTimeout(orientationTimeout);
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
