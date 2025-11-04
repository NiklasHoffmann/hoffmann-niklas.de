'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

export function Header() {
    const t = useTranslations('header.nav');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const sections = [
        { id: "hero", label: t('start') },
        { id: "about", label: t('about') },
        { id: "services", label: t('services') },
        { id: "portfolio", label: t('portfolio') },
        { id: "videos", label: t('videos') },
        { id: "contact", label: t('contact') },
    ];

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
            setIsMenuOpen(false);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
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
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className="text-xs lg:text-sm font-medium hover:text-accent transition-colors whitespace-nowrap"
                                aria-label={`Navigate to ${section.label}`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </nav>

                    {/* Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
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
                        aria-label="Mobile navigation"
                    >
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                                aria-label={`Navigate to ${section.label}`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    );
}
