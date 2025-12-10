'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useTheme } from 'next-themes';

export function LanguageToggle() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { showActive, mounted } = useInteractiveMode();
    const { theme } = useTheme();

    // Use mounted check to avoid hydration mismatch
    const isActive = mounted && showActive;

    const handleLocaleChange = () => {
        // Cycle through DE -> EN -> ES -> JA -> DE
        const newLocale = locale === 'de' ? 'en' : locale === 'en' ? 'es' : locale === 'es' ? 'ja' : 'de';

        const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
        const newPath = `/${newLocale}${pathnameWithoutLocale}`;

        const currentHash = window.location.hash;
        const currentScrollY = window.scrollY;

        startTransition(() => {
            router.replace(newPath + currentHash, { scroll: false });
            // Force refresh to clear Next.js router cache and reload translations
            router.refresh();
            setTimeout(() => {
                window.scrollTo(0, currentScrollY);
            }, 50);
        });
    };

    // Shadow color based on theme - only after mount to avoid hydration mismatch
    const getBaseShadow = () => {
        if (!mounted) return '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
        return theme === 'dark'
            ? '0 0 8px 1px rgba(255, 255, 255, 0.35), 0 10px 15px -3px rgba(255, 255, 255, 0.2), 0 4px 6px -4px rgba(255, 255, 255, 0.15)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
    };

    // Hover shadow styles - stronger glow effect, theme-aware
    const getHoverShadow = () => {
        if (showActive) {
            if (theme === 'dark') {
                if (locale === 'de') {
                    return '0 0 16px 3px rgba(220, 38, 38, 0.9), 0 12px 18px -3px rgba(220, 38, 38, 0.7), 0 6px 8px -4px rgba(220, 38, 38, 0.6)';
                } else if (locale === 'en') {
                    return '0 0 16px 3px rgba(29, 78, 216, 0.9), 0 12px 18px -3px rgba(29, 78, 216, 0.7), 0 6px 8px -4px rgba(29, 78, 216, 0.6)';
                } else if (locale === 'es') {
                    return '0 0 16px 3px rgba(234, 179, 8, 0.9), 0 12px 18px -3px rgba(234, 179, 8, 0.7), 0 6px 8px -4px rgba(234, 179, 8, 0.6)';
                } else {
                    return '0 0 16px 3px rgba(220, 38, 38, 0.9), 0 12px 18px -3px rgba(220, 38, 38, 0.7), 0 6px 8px -4px rgba(220, 38, 38, 0.6)';
                }
            }
            if (locale === 'de') {
                return '0 0 12px 2px rgba(220, 38, 38, 0.7), 0 12px 18px -3px rgba(220, 38, 38, 0.6), 0 6px 8px -4px rgba(220, 38, 38, 0.5)';
            } else if (locale === 'en') {
                return '0 0 12px 2px rgba(29, 78, 216, 0.7), 0 12px 18px -3px rgba(29, 78, 216, 0.6), 0 6px 8px -4px rgba(29, 78, 216, 0.5)';
            } else if (locale === 'es') {
                return '0 0 12px 2px rgba(234, 179, 8, 0.7), 0 12px 18px -3px rgba(234, 179, 8, 0.6), 0 6px 8px -4px rgba(234, 179, 8, 0.5)';
            } else {
                return '0 0 12px 2px rgba(220, 38, 38, 0.7), 0 12px 18px -3px rgba(220, 38, 38, 0.6), 0 6px 8px -4px rgba(220, 38, 38, 0.5)';
            }
        }
        return 'none';
    };

    // Active shadow based on theme - stronger in dark mode for better visibility
    const getActiveShadow = () => {
        if (theme === 'dark') {
            if (locale === 'de') return '0 0 12px 2px rgba(220, 38, 38, 0.8), 0 10px 15px -3px rgba(220, 38, 38, 0.6), 0 4px 6px -4px rgba(220, 38, 38, 0.5)';
            if (locale === 'en') return '0 0 12px 2px rgba(29, 78, 216, 0.8), 0 10px 15px -3px rgba(29, 78, 216, 0.6), 0 4px 6px -4px rgba(29, 78, 216, 0.5)';
            if (locale === 'es') return '0 0 12px 2px rgba(234, 179, 8, 0.8), 0 10px 15px -3px rgba(234, 179, 8, 0.6), 0 4px 6px -4px rgba(234, 179, 8, 0.5)';
            return '0 0 12px 2px rgba(220, 38, 38, 0.8), 0 10px 15px -3px rgba(220, 38, 38, 0.6), 0 4px 6px -4px rgba(220, 38, 38, 0.5)'; // JA
        }
        if (locale === 'de') return '0 0 8px 1px rgba(220, 38, 38, 0.6), 0 10px 15px -3px rgba(220, 38, 38, 0.5), 0 4px 6px -4px rgba(220, 38, 38, 0.4)';
        if (locale === 'en') return '0 0 8px 1px rgba(29, 78, 216, 0.6), 0 10px 15px -3px rgba(29, 78, 216, 0.5), 0 4px 6px -4px rgba(29, 78, 216, 0.4)';
        if (locale === 'es') return '0 0 8px 1px rgba(234, 179, 8, 0.6), 0 10px 15px -3px rgba(234, 179, 8, 0.5), 0 4px 6px -4px rgba(234, 179, 8, 0.4)';
        return '0 0 8px 1px rgba(220, 38, 38, 0.6), 0 10px 15px -3px rgba(220, 38, 38, 0.5), 0 4px 6px -4px rgba(220, 38, 38, 0.4)'; // JA
    };

    return (
        <button
            onClick={handleLocaleChange}
            disabled={isPending}
            onMouseEnter={(e) => {
                if (showActive) {
                    e.currentTarget.style.boxShadow = getHoverShadow();
                }
            }}
            onMouseLeave={(e) => {
                if (showActive) {
                    e.currentTarget.style.boxShadow = getActiveShadow();
                } else {
                    e.currentTarget.style.boxShadow = getBaseShadow();
                }
            }}
            style={{
                position: 'relative',
                backgroundColor: 'transparent',
                boxShadow: showActive ? getActiveShadow() : getBaseShadow(),
                transition: 'all 700ms ease-in-out, box-shadow 700ms ease-in-out',
            }}
            className={`
                px-3 py-2 rounded-lg font-medium text-sm disabled:opacity-50 relative
                w-[60px] h-[36px] flex items-center justify-center
                overflow-hidden
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
            `}
            aria-label={`Switch to ${locale === 'de' ? 'English' : locale === 'en' ? 'Spanish' : locale === 'es' ? 'Japanese' : 'German'}`}
            title={locale === 'de' ? 'Sprache auf Englisch wechseln' : locale === 'en' ? 'Switch language to Spanish' : locale === 'es' ? 'Cambiar idioma a Japonés' : 'ドイツ語に切り替え'}
        >
            {/* Gradient Background - Always rendered, opacity controlled */}
            <span
                className="absolute inset-0 rounded-lg transition-opacity duration-700 ease-in-out"
                style={{
                    backgroundImage:
                        locale === 'de'
                            ? 'linear-gradient(to bottom right, #000000, #dc2626, #eab308)'
                            : locale === 'en'
                                ? 'linear-gradient(to bottom right, #1d4ed8, #ffffff, #dc2626)'
                                : locale === 'es'
                                    ? 'linear-gradient(to bottom right, #dc2626, #eab308, #000000)'
                                    : 'radial-gradient(circle at center, #dc2626 0%, #dc262680 35%, #ffffff00 50%)', // Japan flag - soft fade
                    opacity: isActive ? 1 : 0,
                }}
            />

            {/* Current language text */}
            <span
                className={`relative z-10 font-bold ${isActive ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-foreground'
                    }`}
            >
                {locale === 'de' ? 'DE' : locale === 'en' ? 'EN' : locale === 'es' ? 'ES' : 'JA'}
            </span>

            {isActive && (
                <span className="absolute inset-0 rounded-lg bg-white/10 blur-sm transition-opacity duration-700 ease-in-out" />
            )}
        </button>
    );
}
