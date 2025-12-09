'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { scrollToSectionById } from '@/hooks/useSectionScroll';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const { theme } = useTheme();
    const { showActive, mounted } = useInteractiveMode();
    const isDark = theme === 'dark';

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button after scrolling 300px
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        // Use the section scroll system to properly update hash and state
        scrollToSectionById('hero');
    };

    // Don't render on server or when not visible
    if (!mounted || !isVisible) {
        return null;
    }

    // Neon color for interactive mode (same orange as footer section)
    const neonColor = '#ff8000';

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-[104px] z-50 group"
            style={{
                right: 'calc(1.5rem + 8px)', // Centered above chat button (chat is w-16, this is w-12, difference is 16px / 2 = 8px)
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
            }}
            aria-label="Scroll to top"
        >
            <div
                className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg border-2 group-hover:scale-105"
                style={{
                    backgroundColor: isDark ? '#090909' : '#ffffff',
                    borderColor: showActive ? neonColor : (isDark ? '#1a1a1a' : '#d1d5db'),
                    boxShadow: showActive 
                        ? `0 0 12px 2px ${neonColor}80, 0 4px 6px -1px rgba(0, 0, 0, 0.1)` 
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
                }}
            >
                {/* Arrow Up Icon - using CSS instead of Iconify for instant render */}
                <svg 
                    className="w-5 h-5"
                    fill="none" 
                    stroke={showActive ? neonColor : (isDark ? '#a1a1aa' : '#71717a')}
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
