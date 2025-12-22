'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTransition, useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

type Locale = 'de' | 'en' | 'es' | 'ja' | 'uk' | 'fa';

const LOCALE_NAMES: Record<Locale, string> = {
    de: 'Deutsch',
    en: 'English',
    es: 'Español',
    ja: '日本語',
    uk: 'Українська',
    fa: 'فارسی'
};

const LOCALE_CODES: Record<Locale, string> = {
    de: 'DE',
    en: 'EN',
    es: 'ES',
    ja: 'JA',
    uk: 'UK',
    fa: 'FA'
};

const GRADIENTS: Record<Locale, string> = {
    de: 'linear-gradient(to bottom right, #000000, #dc2626, #eab308)',
    en: 'linear-gradient(to bottom right, #1d4ed8, #ffffff, #dc2626)',
    es: 'linear-gradient(to bottom right, #dc2626, #eab308, #000000)',
    ja: 'radial-gradient(circle at 50% 50%, #dc2626 0%, #dc2626 25%, #ef4444 30%, #f87171 33%, #fca5a5 35%, #fecaca 37%, #ffffff 40%, #ffffff 100%)',
    uk: 'linear-gradient(to bottom, #0057b7 0%, #0057b7 30%, #1a6bb3 40%, #3580b0 45%, #5095ad 48%, #6ba9aa 50%, #87bda7 52%, #a3c9a4 55%, #c4d6a2 60%, #e5e3a0 70%, #ffd700 100%)',
    fa: 'linear-gradient(to bottom, #239f40 0%, #2ba548 5%, #33ab50 10%, #3fb15a 15%, #51b969 18%, #65c17a 21%, #7bc98c 24%, #92d19f 27%, #abd9b3 29%, #c5e1c8 31%, #dfeadd 33%, #f2f2f2 35%, #ffffff 40%, #ffffff 60%, #fff2f2 65%, #ffeaea 67%, #ffdede 69%, #ffc9c9 71%, #ffb0b0 73%, #ff9494 75%, #ff7575 77%, #f55555 79%, #ea3636 81%, #de1d1d 83%, #d00a0a 85%, #c50000 88%, #bb0000 91%, #b10000 94%, #a80000 97%, #da0000 100%)'
};

const ALL_LOCALES: Locale[] = ['de', 'en', 'es', 'ja', 'uk', 'fa'];

export function LanguageToggle({ showActive = false }: { showActive?: boolean }) {
    const pathname = usePathname();
    const params = useParams();
    const locale = params.locale as Locale;
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const { theme } = useTheme();
    const { isInteractive } = useInteractiveMode();
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (showActive) {
            setTimeout(() => setIsActive(true), 100);
        }
    }, [showActive]);

    // Restore scroll position after locale change
    useEffect(() => {
        const savedScrollPosition = sessionStorage.getItem('scrollPosition');
        if (savedScrollPosition) {
            const mainContainer = document.getElementById('main-scroll-container');
            if (mainContainer) {
                const scrollTop = parseInt(savedScrollPosition, 10);
                const originalScrollSnap = mainContainer.style.scrollSnapType;
                mainContainer.style.scrollSnapType = 'none';
                const intervals = [0, 10, 50, 100, 200];
                intervals.forEach((delay) => {
                    setTimeout(() => {
                        if (mainContainer) {
                            mainContainer.scrollTop = scrollTop;
                        }
                    }, delay);
                });
                setTimeout(() => {
                    if (mainContainer) {
                        mainContainer.style.scrollSnapType = originalScrollSnap;
                    }
                    sessionStorage.removeItem('scrollPosition');
                }, 250);
            }
        }
    }, [locale]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLocaleChange = (newLocale: Locale) => {
        if (newLocale === locale) {
            setIsOpen(false);
            return;
        }

        const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
        const currentHash = window.location.hash;
        const newPath = `/${newLocale}${pathnameWithoutLocale}${currentHash}`;

        const mainContainer = document.getElementById('main-scroll-container');
        if (mainContainer) {
            sessionStorage.setItem('scrollPosition', mainContainer.scrollTop.toString());
        }

        setIsOpen(false);
        startTransition(() => {
            router.replace(newPath, { scroll: false });
            router.refresh();
        });
    };

    const getBaseShadow = () => {
        if (!mounted) return '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
        
        // In Interactive Mode: colored shadow based on entire flag colors
        if (isInteractive) {
            if (theme === 'dark') {
                // Germany: Black, Red, Gold
                if (locale === 'de') return '0 0 6px 1px rgba(0, 0, 0, 0.6), 0 0 10px 2px rgba(220, 38, 38, 0.5), 0 0 14px 3px rgba(234, 179, 8, 0.4), 0 8px 12px -3px rgba(220, 38, 38, 0.3)';
                // UK: Blue, White, Red
                if (locale === 'en') return '0 0 6px 1px rgba(29, 78, 216, 0.6), 0 0 10px 2px rgba(255, 255, 255, 0.4), 0 0 14px 3px rgba(220, 38, 38, 0.5), 0 8px 12px -3px rgba(29, 78, 216, 0.3)';
                // Spain: Red, Gold
                if (locale === 'es') return '0 0 6px 1px rgba(220, 38, 38, 0.6), 0 0 10px 2px rgba(234, 179, 8, 0.6), 0 0 14px 3px rgba(220, 38, 38, 0.5), 0 8px 12px -3px rgba(234, 179, 8, 0.3)';
                // Japan: Red (circle)
                if (locale === 'ja') return '0 0 6px 1px rgba(220, 38, 38, 0.6), 0 0 10px 2px rgba(239, 68, 68, 0.5), 0 0 14px 3px rgba(248, 113, 113, 0.3), 0 8px 12px -3px rgba(220, 38, 38, 0.4)';
                // Ukraine: Blue, Yellow
                if (locale === 'uk') return '0 0 6px 1px rgba(0, 87, 183, 0.6), 0 0 10px 2px rgba(59, 130, 246, 0.5), 0 0 14px 3px rgba(255, 215, 0, 0.6), 0 8px 12px -3px rgba(59, 130, 246, 0.3)';
                // Iran: Green, White, Red
                return '0 0 6px 1px rgba(35, 159, 64, 0.6), 0 0 10px 2px rgba(255, 255, 255, 0.3), 0 0 14px 3px rgba(218, 0, 0, 0.6), 0 8px 12px -3px rgba(35, 159, 64, 0.3)';
            }
            // Light theme
            if (locale === 'de') return '0 0 5px 1px rgba(0, 0, 0, 0.5), 0 0 8px 2px rgba(220, 38, 38, 0.4), 0 0 12px 3px rgba(234, 179, 8, 0.3), 0 6px 10px -3px rgba(220, 38, 38, 0.25)';
            if (locale === 'en') return '0 0 5px 1px rgba(29, 78, 216, 0.5), 0 0 8px 2px rgba(255, 255, 255, 0.3), 0 0 12px 3px rgba(220, 38, 38, 0.4), 0 6px 10px -3px rgba(29, 78, 216, 0.25)';
            if (locale === 'es') return '0 0 5px 1px rgba(220, 38, 38, 0.5), 0 0 8px 2px rgba(234, 179, 8, 0.5), 0 0 12px 3px rgba(220, 38, 38, 0.4), 0 6px 10px -3px rgba(234, 179, 8, 0.25)';
            if (locale === 'ja') return '0 0 5px 1px rgba(220, 38, 38, 0.5), 0 0 8px 2px rgba(239, 68, 68, 0.4), 0 0 12px 3px rgba(248, 113, 113, 0.25), 0 6px 10px -3px rgba(220, 38, 38, 0.3)';
            if (locale === 'uk') return '0 0 5px 1px rgba(0, 87, 183, 0.5), 0 0 8px 2px rgba(59, 130, 246, 0.4), 0 0 12px 3px rgba(255, 215, 0, 0.5), 0 6px 10px -3px rgba(59, 130, 246, 0.25)';
            return '0 0 5px 1px rgba(35, 159, 64, 0.5), 0 0 8px 2px rgba(255, 255, 255, 0.25), 0 0 12px 3px rgba(218, 0, 0, 0.5), 0 6px 10px -3px rgba(35, 159, 64, 0.25)';
        }
        
        // Default: white shadow like other buttons (matching ThemeToggle and InteractiveToggle)
        return theme === 'dark'
            ? '0 0 8px 1px rgba(255, 255, 255, 0.35), 0 10px 15px -3px rgba(255, 255, 255, 0.2), 0 4px 6px -4px rgba(255, 255, 255, 0.15)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
    };

    const otherLocales = ALL_LOCALES.filter(l => l !== locale);
    
    // Get button colors based on theme and interactive mode
    const getButtonColors = () => {
        if (!mounted) return { bg: 'bg-black/20', text: 'text-white' };
        
        if (theme === 'dark') {
            return { bg: 'bg-black/20 hover:bg-black/30', text: 'text-white' };
        } else {
            // Light mode
            return { bg: 'bg-white/90 hover:bg-white', text: 'text-black' };
        }
    };
    
    const buttonColors = getButtonColors();

    return (
        <div ref={dropdownRef} className="relative">
            {/* Current Language Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={`
                    relative flex items-center gap-2 px-3 py-2 rounded-lg
                    transition-all duration-700 ease-in-out
                    disabled:opacity-50
                    ${buttonColors.bg}
                    backdrop-blur-sm border border-white/10
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                `}
                style={{
                    boxShadow: getBaseShadow(),
                    transition: 'all 700ms ease-in-out, box-shadow 700ms ease-in-out',
                }}
                aria-label="Select language"
            >
                {/* Flag */}
                <div className="relative w-8 h-5 rounded overflow-hidden">
                    <div 
                        className="absolute inset-0 transition-all duration-700 ease-in-out"
                        style={{ backgroundImage: GRADIENTS[locale] }}
                    />
                    {locale === 'fa' && (
                        <div
                            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                            style={{
                                backgroundImage: 'radial-gradient(ellipse 40% 25% at 50% 50%, rgba(220, 38, 38, 0.35) 0%, rgba(220, 38, 38, 0.25) 20%, rgba(220, 38, 38, 0.15) 40%, rgba(220, 38, 38, 0.05) 60%, transparent 80%)'
                            }}
                        />
                    )}
                </div>

                {/* Language Code */}
                <span className="font-bold text-sm text-foreground w-6 inline-block text-center transition-colors duration-700">
                    {LOCALE_CODES[locale]}
                </span>

                {/* Chevron */}
                <svg
                    className={`w-4 h-4 text-foreground transition-all duration-700 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute top-full right-0 mt-2 min-w-[180px] rounded-lg overflow-hidden bg-black/90 backdrop-blur-md border border-white/10 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {otherLocales.map((loc) => (
                        <button
                            key={loc}
                            onClick={() => handleLocaleChange(loc)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-white/10 active:bg-white/15 text-left"
                        >
                            {/* Flag */}
                            <div className="relative w-8 h-5 rounded overflow-hidden flex-shrink-0">
                                <div 
                                    className="absolute inset-0"
                                    style={{ backgroundImage: GRADIENTS[loc] }}
                                />
                                {loc === 'fa' && (
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            backgroundImage: 'radial-gradient(ellipse 40% 25% at 50% 50%, rgba(220, 38, 38, 0.35) 0%, rgba(220, 38, 38, 0.25) 20%, rgba(220, 38, 38, 0.15) 40%, rgba(220, 38, 38, 0.05) 60%, transparent 80%)'
                                        }}
                                    />
                                )}
                            </div>

                            {/* Language Name */}
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-white">
                                    {LOCALE_NAMES[loc]}
                                </span>
                                <span className="text-xs text-white/60">
                                    {LOCALE_CODES[loc]}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
