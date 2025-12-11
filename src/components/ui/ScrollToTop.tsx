'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const { theme } = useTheme();
    const { showActive, mounted } = useInteractiveMode();
    const isDark = theme === 'dark';

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button after scrolling past hero section
            const mainContainer = document.getElementById('main-scroll-container');
            if (mainContainer) {
                // Lower threshold for mobile - show after first section
                const shouldShow = mainContainer.scrollTop > 100;
                setIsVisible(shouldShow);
            } else {
                // Fallback for non-homepage
                setIsVisible(window.scrollY > 100);
            }
        };

        const mainContainer = document.getElementById('main-scroll-container');
        const scrollElement = mainContainer || window;

        scrollElement.addEventListener('scroll', toggleVisibility, { passive: true });

        // Initial check
        toggleVisibility();

        return () => scrollElement.removeEventListener('scroll', toggleVisibility);
    }, []);

    // Don't render when not visible
    if (!isVisible) {
        return null;
    }

    // Don't show active effects until mounted (prevent hydration mismatch)
    const showActiveEffects = mounted && showActive;

    // Neon color for interactive mode (same orange as footer section)
    const neonColor = '#ff8000';

    return (
        <button
            className="fixed bottom-[104px] z-[51] group"
            style={{
                right: 'calc(1.5rem + 8px)', // Centered above chat button (chat is w-16, this is w-12, difference is 16px / 2 = 8px)
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
            }}
            aria-label="Scroll to top"
            onClick={(e) => {
                const mainContainer = document.getElementById('main-scroll-container');
                if (mainContainer) {
                    mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }}
        >
            <div
                className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg border-2 group-hover:scale-105"
                style={{
                    backgroundColor: isDark ? '#090909' : '#ffffff',
                    borderColor: showActiveEffects ? neonColor : (isDark ? '#1a1a1a' : '#d1d5db'),
                    boxShadow: showActiveEffects
                        ? `0 0 12px 2px ${neonColor}80, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
                }}
            >
                {/* Arrow Up Icon - using CSS instead of Iconify for instant render */}
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke={showActiveEffects ? neonColor : (isDark ? '#ffffff' : '#000000')}
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    style={{ transition: 'stroke 700ms ease-in-out' }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
            </div>
        </button>
    );
}
