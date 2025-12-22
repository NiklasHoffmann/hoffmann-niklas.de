'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo, memo, useRef, useLayoutEffect } from 'react';
import { Icon } from '@/components/icons/LocalIcon';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useDevice } from '@/contexts/DeviceContext';
import { NEON_COLORS } from '@/config/ui.constants';

// Lazy load toggles - they're not critical for initial render
const ThemeToggle = dynamic(() => import('@/components/toggles/ThemeToggle').then(mod => ({ default: mod.ThemeToggle })));
const LanguageToggle = dynamic(() => import('@/components/toggles/LanguageToggle').then(mod => ({ default: mod.LanguageToggle })));
const InteractiveToggle = dynamic(() => import('@/components/toggles/InteractiveToggle').then(mod => ({ default: mod.InteractiveToggle })));

// Convert neon color objects to arrays for easy indexing
const NEON_COLORS_DARK = Object.values(NEON_COLORS.DARK);
const NEON_COLORS_LIGHT = Object.values(NEON_COLORS.LIGHT);

// Global cache to persist active section across re-renders/language changes
let cachedActiveSection = 'hero';

function HeaderComponent() {
    const t = useTranslations('header.nav');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const [activeSection, setActiveSection] = useState(() => cachedActiveSection);
    const { showActive, mounted } = useInteractiveMode();
    const { theme } = useTheme();
    const device = useDevice();
    const navRef = useRef<HTMLElement>(null);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, color: '' });

    // Use mounted check to avoid hydration mismatch
    const isInteractiveActive = mounted && showActive;

    // Memoize neon colors based on theme (prevent recalculation on every render)
    const neonColors = useMemo(() => {
        return !mounted || theme === 'dark' ? NEON_COLORS_DARK : NEON_COLORS_LIGHT;
    }, [theme, mounted]);

    const sections = useMemo(() => [
        { id: "hero", label: t('start'), color: neonColors[0] },
        { id: "about", label: t('about'), color: neonColors[1] },
        { id: "services", label: t('services'), color: neonColors[2] },
        { id: "packages", label: t('packages'), color: neonColors[3] },
        // { id: "portfolio", label: t('portfolio'), color: neonColors[4] }, // Hidden until projects are ready
        // { id: "videos", label: t('videos'), color: neonColors[5] },
        { id: "contact", label: t('contact'), color: neonColors[4] },
    ], [neonColors, t]);

    // Track active section
    useEffect(() => {
        // Disable section tracking ONLY on mobile portrait - prevents issues with browser UI
        // Mobile landscape doesn't have these issues, so we keep tracking enabled
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isMobile && isPortrait) return;

        const updateActiveSection = () => {
            const sections = ['hero', 'about', 'services', 'packages', 'contact', 'footer']; // 'portfolio' removed
            const mainContainer = document.getElementById('main-scroll-container');

            if (!mainContainer) {
                // Fallback for non-homepage or if container not found
                return;
            }

            const scrollTop = mainContainer.scrollTop;
            const viewportHeight = mainContainer.clientHeight;
            const scrollPosition = scrollTop + viewportHeight / 2; // Mitte des Viewports

            let currentSection = 'hero';

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    // Get position relative to main-container
                    const rect = element.getBoundingClientRect();
                    const containerRect = mainContainer.getBoundingClientRect();
                    const sectionTop = rect.top - containerRect.top + scrollTop;
                    const sectionBottom = sectionTop + rect.height;

                    // Section ist aktiv wenn scroll position innerhalb der Section ist
                    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                        currentSection = sectionId;
                        break;
                    }
                }
            }

            if (currentSection !== cachedActiveSection) {
                cachedActiveSection = currentSection;
                setActiveSection(currentSection);

                // Update browser URL hash - ONLY ON DESKTOP
                // On mobile, hash updates can cause scroll jumps when browser UI appears/disappears
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (!isMobile) {
                    // Remove hash when at hero (top of page), otherwise set hash
                    if (currentSection === 'hero') {
                        // Remove hash - clean URL like on initial page load
                        if (window.location.hash) {
                            window.history.replaceState(null, '', window.location.pathname + window.location.search);
                        }
                    } else if (window.location.hash !== `#${currentSection}`) {
                        window.history.replaceState(null, '', `#${currentSection}`);
                    }
                }
            }
        };

        // Delay initial check to allow scroll position restoration after language change
        const initialTimeout = setTimeout(updateActiveSection, 350);

        // Update on scroll
        const mainContainer = document.getElementById('main-scroll-container');
        if (!mainContainer) return;

        let rafId: number;
        const handleScroll = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(updateActiveSection);
        };

        mainContainer.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            clearTimeout(initialTimeout);
            mainContainer.removeEventListener('scroll', handleScroll);
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }, []);

    // Update underline position based on active section and device dimensions
    useLayoutEffect(() => {
        if (!navRef.current) return;

        const activeIndex = sections.findIndex(s => s.id === activeSection);
        if (activeIndex === -1) return;

        const links = navRef.current.querySelectorAll('a');
        const activeLink = links[activeIndex] as HTMLElement;

        if (activeLink) {
            const navRect = navRef.current.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();

            setUnderlineStyle({
                left: linkRect.left - navRect.left,
                width: linkRect.width,
                color: sections[activeIndex].color
            });
        }
    }, [activeSection, sections, device.width, device.height]);

    const handleCloseMenu = () => {
        setIsMenuClosing(true);
        setTimeout(() => {
            setIsMenuOpen(false);
            setIsMenuClosing(false);
        }, 500);
    };

    const handleToggleMenu = () => {
        if (isMenuOpen || isMenuClosing) {
            handleCloseMenu();
        } else {
            setIsMenuOpen(true);
        }
    };

    return (
        <>
            <header
                className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border safe-top"
                style={{
                    transition: 'border-color 700ms ease-in-out, background-color 700ms ease-in-out',
                    maxWidth: '100vw',
                    width: '100%'
                }}
            >
                <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 xs:h-15 sm:h-16 md:h-18">
                        {/* Logo */}
                        <a
                            href="#hero"
                            className="text-base xs:text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text cursor-pointer touch-target flex items-center justify-center"
                            aria-label="Scroll to top"
                        >
                            NH
                        </a>

                        {/* Desktop Navigation */}
                        <nav
                            ref={navRef}
                            className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 relative"
                            style={{ paddingBottom: '3px' }}
                            aria-label="Main navigation"
                        >
                            {sections.map((section) => {
                                const isActive = activeSection === section.id && activeSection !== 'footer';
                                return (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className="text-xs lg:text-sm font-bold whitespace-nowrap relative z-10 rounded px-3 lg:px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent touch-target inline-flex items-center justify-center"
                                        style={isActive && isInteractiveActive ? {
                                            color: section.color,
                                            transition: 'all 0.7s ease-out',
                                        } : {
                                            transition: 'all 0.7s ease-out'
                                        }}
                                        aria-label={`Navigate to ${section.label}`}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        {section.label}
                                    </a>
                                );
                            })}

                            {/* Sliding underline - hidden when on footer */}
                            {underlineStyle.width > 0 && activeSection !== 'footer' && (
                                <div
                                    className="absolute bottom-0 h-[2px] pointer-events-none"
                                    style={{
                                        left: `${underlineStyle.left}px`,
                                        width: `${underlineStyle.width}px`,
                                        backgroundColor: isInteractiveActive ? underlineStyle.color : 'currentColor',
                                        transition: 'all 700ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                        boxShadow: isInteractiveActive ? `0 0 8px ${underlineStyle.color}, 0 0 12px ${underlineStyle.color}` : 'none',
                                    }}
                                />
                            )}
                        </nav>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3">
                            <InteractiveToggle />
                            <ThemeToggle />
                            <LanguageToggle />

                            {/* Mobile Menu Button - Animated Icon */}
                            <button
                                onClick={handleToggleMenu}
                                className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors relative touch-target flex items-center justify-center"
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-menu"
                            >
                                <div className="relative w-5 h-5">
                                    {/* Top line */}
                                    <span
                                        className="absolute left-0 w-5 h-0.5 transition-all duration-300 ease-in-out"
                                        style={{
                                            backgroundColor: !mounted ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#000000'),
                                            top: (isMenuOpen || isMenuClosing) ? '50%' : '20%',
                                            transform: (isMenuOpen || isMenuClosing) ? 'translateY(-50%) rotate(45deg)' : 'translateY(-50%) rotate(0deg)'
                                        }}
                                    />
                                    {/* Middle line */}
                                    <span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-0.5 transition-all duration-300 ease-in-out"
                                        style={{
                                            backgroundColor: !mounted ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#000000'),
                                            opacity: (isMenuOpen || isMenuClosing) ? 0 : 1
                                        }}
                                    />
                                    {/* Bottom line */}
                                    <span
                                        className="absolute left-0 w-5 h-0.5 transition-all duration-300 ease-in-out"
                                        style={{
                                            backgroundColor: !mounted ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#000000'),
                                            top: (isMenuOpen || isMenuClosing) ? '50%' : '80%',
                                            transform: (isMenuOpen || isMenuClosing) ? 'translateY(-50%) rotate(-45deg)' : 'translateY(-50%) rotate(0deg)'
                                        }}
                                    />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Full-Screen Mobile Navigation Overlay - Outside Header */}
            {(isMenuOpen || isMenuClosing) && (
                <div
                    id="mobile-menu"
                    className="fixed left-0 right-0 bottom-0 md:hidden flex flex-col border-t border-border safe-bottom"
                    role="navigation"
                    aria-label="Mobile menu"
                    aria-hidden={mounted && isMenuClosing}
                    style={{
                        top: '56px',
                        zIndex: 9999,
                        backgroundColor: !mounted ? '#0a0a0a' : (theme === 'dark' ? '#0a0a0a' : '#ffffff'),
                        opacity: isMenuClosing ? 0 : 1,
                        transform: isMenuClosing ? 'translateY(20px)' : 'translateY(0)',
                        transition: 'opacity 500ms ease-out, transform 500ms ease-out, background-color 700ms ease-in-out, border-color 700ms ease-in-out',
                        pointerEvents: isMenuClosing ? 'none' : 'auto'
                    }}
                >
                    {/* Centered Navigation */}
                    <nav
                        id="mobile-menu"
                        className="flex-1 flex flex-col items-center justify-center gap-5 xs:gap-6 w-full px-6 xs:px-8"
                        aria-label="Mobile navigation"
                    >
                        {sections.map((section, index) => {
                            const isActive = activeSection === section.id && activeSection !== 'footer';
                            const delay = isMenuClosing ? (sections.length - 1 - index) * 50 : index * 50;
                            return (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    onClick={handleCloseMenu}
                                    className="text-xl xs:text-2xl sm:text-3xl font-bold relative text-foreground touch-target py-2"
                                    style={{
                                        color: isActive && isInteractiveActive ? section.color : undefined,
                                        textShadow: isActive && isInteractiveActive ? `0 0 20px ${section.color}, 0 0 40px ${section.color}` : 'none',
                                        opacity: isMenuClosing ? 0 : 1,
                                        transform: isMenuClosing ? 'translateY(10px)' : 'translateY(0)',
                                        transition: isMenuClosing
                                            ? `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms, color 700ms cubic-bezier(0.68, -0.55, 0.265, 1.55), text-shadow 700ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`
                                            : `color 700ms cubic-bezier(0.68, -0.55, 0.265, 1.55), text-shadow 700ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
                                        animation: !isMenuClosing ? `slideInFromTop 300ms ease-out ${delay}ms backwards` : 'none'
                                    }}
                                    aria-label={`Navigate to ${section.label}`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {section.label}
                                    {/* Active Indicator Dot */}
                                    {isActive && (
                                        <span
                                            className="absolute -left-6 xs:-left-8 top-1/2 -translate-y-1/2 w-2 xs:w-2.5 h-2 xs:h-2.5 rounded-full"
                                            style={{
                                                backgroundColor: isInteractiveActive ? section.color : 'currentColor',
                                                boxShadow: isInteractiveActive ? `0 0 8px ${section.color}, 0 0 16px ${section.color}` : 'none',
                                                animation: 'fadeIn 300ms ease-out'
                                            }}
                                            aria-hidden="true"
                                        />
                                    )}
                                </a>
                            );
                        })}
                    </nav>
                </div>
            )}
        </>
    );
}

// Memoize to prevent unnecessary re-renders on scroll
export const Header = memo(HeaderComponent);
