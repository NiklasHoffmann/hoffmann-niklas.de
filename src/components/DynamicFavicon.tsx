'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

// Map section IDs to color names
const SECTION_COLOR_MAP: Record<string, string> = {
    'hero': 'cyan',
    'about': 'magenta',
    'services': 'limegreen',
    'portfolio': 'yellow',
    'videos': 'hotpink',
    'contact': 'blue',
    'footer': 'orange',
};

export function DynamicFavicon() {
    const { resolvedTheme } = useTheme();
    const { isInteractive } = useInteractiveMode();
    const [currentSection, setCurrentSection] = useState<string>('hero');

    // Track current section via scroll position
    useEffect(() => {
        const updateCurrentSection = () => {
            const sections = ['hero', 'about', 'services', 'portfolio', 'videos', 'contact', 'footer'];
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

        // Initial check
        updateCurrentSection();

        // Listen to scroll events
        window.addEventListener('scroll', updateCurrentSection, { passive: true });
        return () => window.removeEventListener('scroll', updateCurrentSection);
    }, []);

    useEffect(() => {
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

        // Update favicon
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = faviconPath;

        // Also update apple-touch-icon
        let appleLink = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
        if (!appleLink) {
            appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            document.head.appendChild(appleLink);
        }
        appleLink.href = faviconPath;

    }, [resolvedTheme, isInteractive, currentSection]);

    return null; // This component doesn't render anything
}
