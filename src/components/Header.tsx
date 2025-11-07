'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { NEON_COLORS } from '@/config/ui.constants';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { InteractiveToggle } from './InteractiveToggle';

// Convert neon color objects to arrays for easy indexing
const NEON_COLORS_DARK = Object.values(NEON_COLORS.DARK);
const NEON_COLORS_LIGHT = Object.values(NEON_COLORS.LIGHT);

// Global cache to persist active section across re-renders/language changes
let cachedActiveSection = 'hero';

export function Header() {
    const t = useTranslations('header.nav');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(() => cachedActiveSection);
    const { showActive, mounted } = useInteractiveMode();
    const { theme } = useTheme();

    // Memoize neon colors based on theme (prevent recalculation on every render)
    const neonColors = useMemo(() => {
        return !mounted || theme === 'dark' ? NEON_COLORS_DARK : NEON_COLORS_LIGHT;
    }, [theme, mounted]);

    const sections = useMemo(() => [
        { id: "hero", label: t('start'), color: neonColors[0] },
        { id: "about", label: t('about'), color: neonColors[1] },
        { id: "services", label: t('services'), color: neonColors[2] },
        { id: "portfolio", label: t('portfolio'), color: neonColors[3] },
        { id: "videos", label: t('videos'), color: neonColors[4] },
        { id: "contact", label: t('contact'), color: neonColors[5] },
    ], [neonColors, t]);

    // Track active section
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const newSection = entry.target.id;
                        cachedActiveSection = newSection; // Update global cache
                        setActiveSection(newSection);
                    }
                });
            },
            {
                threshold: 0.5, // Section muss zu 50% sichtbar sein
                rootMargin: '-100px 0px -100px 0px' // Berücksichtigt Header-Höhe
            }
        );

        // Use static section IDs instead of sections array to avoid dependency issues
        const sectionIds = ['hero', 'about', 'services', 'portfolio', 'videos', 'contact'];

        sectionIds.forEach((sectionId) => {
            const element = document.getElementById(sectionId);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, []); // Empty dependencies - only run once on mount

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            // OPTIMIZATION: Use requestAnimationFrame to batch layout read
            requestAnimationFrame(() => {
                const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                setIsMenuOpen(false);
            });
        }
    };

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
            style={{
                transition: 'border-color 700ms ease-in-out, background-color 700ms ease-in-out'
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                    >
                        NH
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-4 lg:gap-6" aria-label="Main navigation">
                        {sections.map((section) => {
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className="text-xs lg:text-sm font-bold whitespace-nowrap"
                                    style={isActive && showActive ? {
                                        color: section.color,
                                        textShadow: `0 0 10px ${section.color}80`,
                                        transform: 'scale(1.1)',
                                        transition: 'all 0.7s ease-out, text-shadow 0.7s ease-out',
                                        animation: 'glow-pulse 0.7s ease-out'
                                    } : {
                                        transition: 'all 0.7s ease-out'
                                    }}
                                    aria-label={`Navigate to ${section.label}`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {section.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <InteractiveToggle />
                        <ThemeToggle />
                        <LanguageToggle />

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5" aria-hidden="true" />
                            ) : (
                                <Menu className="w-5 h-5" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav
                        id="mobile-menu"
                        className="md:hidden pb-4 border-t border-border"
                        style={{
                            transition: 'border-color 700ms ease-in-out'
                        }}
                        aria-label="Mobile navigation"
                    >
                        {sections.map((section) => {
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className="block w-full text-left px-4 py-2 text-sm font-bold transition-all duration-300"
                                    style={isActive && showActive ? {
                                        color: section.color,
                                        textShadow: `0 0 10px ${section.color}80`,
                                        borderLeft: `3px solid ${section.color}`
                                    } : undefined}
                                    aria-label={`Navigate to ${section.label}`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {section.label}
                                </button>
                            );
                        })}
                    </nav>
                )}
            </div>
        </header>
    );
}
