'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

// Map section IDs to color names
const SECTION_COLOR_MAP: Record<string, string> = {
    'hero': 'cyan',
    'about': 'magenta',
    'services': 'limegreen',
    'packages': 'yellow',
    'portfolio': 'hotpink',
    //'videos': 'hotpink',
    'contact': 'blue',
    'footer': 'orange',
};

export function DynamicFavicon() {
    const { resolvedTheme } = useTheme();
    const { isInteractive } = useInteractiveMode();
    const [currentSection, setCurrentSection] = useState<string>('hero');
    const lastFaviconRef = useRef<string | null>(null);
    const hasInitializedRef = useRef(false);

    // Immediately set a default favicon on mount (before theme resolves)
    // This prevents browser from showing cached/wrong favicon
    useEffect(() => {
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        // Remove any existing favicon links and set initial favicon
        const existingIcons = document.querySelectorAll("link[rel*='icon']");
        existingIcons.forEach(icon => icon.remove());

        // Check for dark mode preference immediately
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const storedTheme = localStorage.getItem('theme');
        const isDark = storedTheme === 'dark' || (storedTheme !== 'light' && prefersDark);

        const initialFavicon = isDark ? '/favicons/cube-black-cyan.svg' : '/favicons/cube-white-cyan.svg';

        const link = document.createElement('link');
        link.id = 'dynamic-favicon';
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        link.href = initialFavicon;
        document.head.appendChild(link);

        lastFaviconRef.current = initialFavicon;
    }, []);

    // Pure CSS scroll-snap detection - no JavaScript scroll control
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['hero', 'about', 'services', 'packages', 'portfolio', 'contact', 'footer'];
            const mainContainer = document.getElementById('main-scroll-container');

            if (!mainContainer) {
                // Fallback for non-homepage
                return;
            }

            const scrollTop = mainContainer.scrollTop;
            const containerHeight = mainContainer.clientHeight;

            let activeSection = 'hero';

            // OPTIMIZATION: Batch all getBoundingClientRect calls together
            const sectionElements = sections.map(sectionId => document.getElementById(sectionId));
            const sectionPositions = sectionElements.map((element, index) => {
                if (!element) return null;
                const rect = element.getBoundingClientRect();
                const containerRect = mainContainer.getBoundingClientRect();
                // Calculate position relative to main-container
                const elementTop = rect.top - containerRect.top + scrollTop;
                return {
                    sectionId: sections[index],
                    elementTop
                };
            }).filter(Boolean) as Array<{ sectionId: string; elementTop: number }>;

            // Now iterate over cached positions (no layout reads in loop)
            for (const { sectionId, elementTop } of sectionPositions) {
                // Section is active if its top is above middle of viewport
                if (scrollTop >= elementTop - containerHeight / 2) {
                    activeSection = sectionId;
                }
            }

            setCurrentSection(activeSection);
        };

        // Set initial section after a short delay to ensure DOM is ready
        const initialTimeout = setTimeout(handleScroll, 100);

        // Listen to scroll events on main-container
        const mainContainer = document.getElementById('main-scroll-container');
        if (!mainContainer) return;

        mainContainer.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            clearTimeout(initialTimeout);
            mainContainer.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Update favicon when section, theme, or interactive mode changes
    useEffect(() => {
        // Wait for theme to be resolved (avoid flash of wrong favicon)
        if (!resolvedTheme) return;

        // Determine the color based on interactive mode
        const colorName = isInteractive
            ? SECTION_COLOR_MAP[currentSection] || 'cyan'
            : 'white'; // Default color when interactive mode is off

        // Determine theme prefix (cube-black or cube-white)
        const themePrefix = resolvedTheme === 'dark' ? 'cube-black' : 'cube-white';

        // Special case: in light mode with interactive off, use black cube
        const finalPath = resolvedTheme === 'light' && !isInteractive
            ? 'cube-white-black'
            : `${themePrefix}-${colorName}`;

        const faviconPath = `/favicons/${finalPath}.svg`;

        console.log('🎨 Favicon update:', { currentSection, isInteractive, resolvedTheme, colorName, faviconPath, lastFavicon: lastFaviconRef.current });

        // Skip if favicon hasn't changed
        if (lastFaviconRef.current === faviconPath) {
            return;
        }
        lastFaviconRef.current = faviconPath;

        // Get or create favicon link with specific ID (don't remove and recreate to avoid flashing)
        let link = document.getElementById('dynamic-favicon') as HTMLLinkElement;
        if (!link) {
            // Remove any existing favicon links from SSR first
            const existingIcons = document.querySelectorAll("link[rel*='icon']:not(#dynamic-favicon):not(#dynamic-apple-icon)");
            existingIcons.forEach(icon => icon.remove());

            // Create our controlled favicon link
            link = document.createElement('link');
            link.id = 'dynamic-favicon';
            link.rel = 'icon';
            link.type = 'image/svg+xml';
            document.head.appendChild(link);
        }
        link.href = faviconPath;

        // Get or create apple-touch-icon with specific ID
        let appleLink = document.getElementById('dynamic-apple-icon') as HTMLLinkElement;
        if (!appleLink) {
            appleLink = document.createElement('link');
            appleLink.id = 'dynamic-apple-icon';
            appleLink.rel = 'apple-touch-icon';
            document.head.appendChild(appleLink);
        }
        appleLink.href = faviconPath;
    }, [resolvedTheme, isInteractive, currentSection]);

    return null; // This component doesn't render anything
}
