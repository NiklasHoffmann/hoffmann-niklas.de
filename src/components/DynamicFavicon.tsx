'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { onSectionChange, getCurrentSectionId } from '@/hooks/useSectionScroll';

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

    // Subscribe to section changes from useSectionScroll
    useEffect(() => {
        // Set initial section
        setCurrentSection(getCurrentSectionId());
        
        // Subscribe to section changes (works for desktop JS-based scrolling)
        const unsubscribe = onSectionChange((sectionId) => {
            console.log('🔔 Section change callback:', sectionId);
            setCurrentSection(sectionId);
        });

        // Check if device is desktop (wide screen, not mobile user agent)
        const isWideScreen = window.innerWidth >= 1024;
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isDesktop = isWideScreen && !isMobileUserAgent;

        // Only add scroll listener for mobile/tablet (CSS scroll-snap)
        // Desktop uses the callback from useSectionScroll
        let handleScroll: (() => void) | null = null;
        
        if (!isDesktop) {
            handleScroll = () => {
                const sections = ['hero', 'about', 'services', 'packages', 'portfolio', 'contact', 'footer'];
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;

                let activeSection = 'hero';

                for (const sectionId of sections) {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        const elementTop = rect.top + scrollY;

                        // Section is active if its top is above middle of viewport
                        if (scrollY >= elementTop - windowHeight / 2) {
                            activeSection = sectionId;
                        }
                    }
                }

                setCurrentSection(activeSection);
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
        }
        
        return () => {
            unsubscribe();
            if (handleScroll) {
                window.removeEventListener('scroll', handleScroll);
            }
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
