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
        // Cycle through DE -> EN -> ES -> DE
        const newLocale = locale === 'de' ? 'en' : locale === 'en' ? 'es' : 'de';

        const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
        const newPath = `/${newLocale}${pathnameWithoutLocale}`;

        const currentHash = window.location.hash;
        const currentScrollY = window.scrollY;

        startTransition(() => {
            router.replace(newPath + currentHash, { scroll: false });
            setTimeout(() => {
                window.scrollTo(0, currentScrollY);
            }, 0);
        });
    };

    // Shadow color based on theme - only after mount to avoid hydration mismatch
    const getBaseShadow = () => {
        if (!mounted) return '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
        return theme === 'dark'
            ? '0 0 8px 1px rgba(255, 255, 255, 0.35), 0 10px 15px -3px rgba(255, 255, 255, 0.2), 0 4px 6px -4px rgba(255, 255, 255, 0.15)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
    };

    // Hover shadow styles
    const getHoverShadow = () => {
        if (showActive) {
            if (locale === 'de') {
                return '0 20px 25px -5px rgba(220, 38, 38, 0.6), 0 8px 10px -6px rgba(220, 38, 38, 0.6)';
            } else if (locale === 'en') {
                return '0 20px 25px -5px rgba(29, 78, 216, 0.6), 0 8px 10px -6px rgba(29, 78, 216, 0.6)';
            } else {
                return '0 20px 25px -5px rgba(234, 179, 8, 0.6), 0 8px 10px -6px rgba(234, 179, 8, 0.6)';
            }
        }
        return 'none';
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
                    const shadow = locale === 'de'
                        ? '0 10px 15px -3px rgba(220, 38, 38, 0.5), 0 4px 6px -4px rgba(220, 38, 38, 0.5)'
                        : locale === 'en'
                            ? '0 10px 15px -3px rgba(29, 78, 216, 0.5), 0 4px 6px -4px rgba(29, 78, 216, 0.5)'
                            : '0 10px 15px -3px rgba(234, 179, 8, 0.5), 0 4px 6px -4px rgba(234, 179, 8, 0.5)';
                    e.currentTarget.style.boxShadow = shadow;
                } else {
                    e.currentTarget.style.boxShadow = getBaseShadow();
                }
            }}
            style={{
                position: 'relative',
                backgroundColor: 'transparent',
                boxShadow: showActive
                    ? locale === 'de'
                        ? '0 10px 15px -3px rgba(220, 38, 38, 0.5), 0 4px 6px -4px rgba(220, 38, 38, 0.5)'
                        : locale === 'en'
                            ? '0 10px 15px -3px rgba(29, 78, 216, 0.5), 0 4px 6px -4px rgba(29, 78, 216, 0.5)'
                            : '0 10px 15px -3px rgba(234, 179, 8, 0.5), 0 4px 6px -4px rgba(234, 179, 8, 0.5)'
                    : getBaseShadow(),
                transition: 'all 700ms ease-in-out, box-shadow 700ms ease-in-out',
            }}
            className={`
                px-3 py-2 rounded-lg font-medium text-sm disabled:opacity-50 relative
                w-[60px] h-[36px] flex items-center justify-center
                overflow-hidden
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
            `}
            aria-label={`Switch to ${locale === 'de' ? 'English' : locale === 'en' ? 'Spanish' : 'German'}`}
            title={locale === 'de' ? 'Sprache auf Englisch wechseln' : locale === 'en' ? 'Switch language to Spanish' : 'Cambiar idioma a Alemán'}
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
                                : 'linear-gradient(to bottom right, #dc2626, #eab308, #000000)',
                    opacity: isActive ? 1 : 0,
                }}
            />

            {/* Current language text */}
            <span
                className={`relative z-10 font-bold ${isActive ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-foreground'
                    }`}
            >
                {locale === 'de' ? 'DE' : locale === 'en' ? 'EN' : 'ES'}
            </span>

            {isActive && (
                <span className="absolute inset-0 rounded-lg bg-white/10 blur-sm transition-opacity duration-700 ease-in-out" />
            )}
        </button>
    );
}
