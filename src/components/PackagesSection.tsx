'use client';

import { useMemo, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useOrientationResize } from '@/hooks/useOrientationResize';
import { NEON_COLORS } from '@/config/ui.constants';

const NEON_COLORS_DARK = Object.values(NEON_COLORS.DARK);
const NEON_COLORS_LIGHT = Object.values(NEON_COLORS.LIGHT);

const PACKAGE_KEYS = [
    'websiteStarter',
    'businessWebsite',
    'webAppMvp',
    'web3Integration',
] as const;

export function PackagesSection() {
    const t = useTranslations('packages');
    const { showActive, mounted: interactiveMounted } = useInteractiveMode();
    const { theme } = useTheme();
    const { key } = useOrientationResize();
    const [flippedCard, setFlippedCard] = useState<number | null>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Neon colors based on theme
    const neonColors = useMemo(() => {
        return !interactiveMounted || theme === 'dark'
            ? NEON_COLORS_DARK
            : NEON_COLORS_LIGHT;
    }, [theme, interactiveMounted]);

    return (
        <section
            id="packages"
            key={key}
            className="scroll-snap-section section-padding w-full h-screen max-h-screen overflow-y-auto overflow-x-hidden flex items-center justify-center bg-background relative"
            style={{ zIndex: 1, transition: 'background-color 700ms ease-in-out' }}
        >
            <div className="max-w-6xl mx-auto w-full min-h-full flex flex-col justify-center">
                {/* Header */}
                <SectionHeader
                    title={t('title')}
                    subtitle={t('subtitle')}
                    className="text-center mb-4 sm:mb-6 lg:mb-8"
                />

                {/* Cards */}
                <div className="flex items-center justify-center">
                    <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {PACKAGE_KEYS.map((pkgKey, index) => {
                            const includes = t.raw(
                                `packages.${pkgKey}.includes`,
                            ) as string[];
                            const cardColor = neonColors[index % neonColors.length];
                            const isFlipped = flippedCard === index;

                            const handleMouseEnter = () => {
                                if (hoverTimeoutRef.current) {
                                    clearTimeout(hoverTimeoutRef.current);
                                }
                                hoverTimeoutRef.current = setTimeout(() => {
                                    setFlippedCard(index);
                                }, 50);
                            };

                            const handleMouseLeave = () => {
                                if (hoverTimeoutRef.current) {
                                    clearTimeout(hoverTimeoutRef.current);
                                }
                                hoverTimeoutRef.current = setTimeout(() => {
                                    setFlippedCard(null);
                                }, 50);
                            };

                            return (
                                <div key={pkgKey} className="perspective-1000 md:perspective-none">
                                    {/* Mobile: Flip Card */}
                                    <div
                                        onClick={() => setFlippedCard(isFlipped ? null : index)}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                        className="md:hidden relative w-full aspect-[3/4] cursor-pointer transition-transform duration-500 preserve-3d"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                        }}
                                    >
                                        {/* Front Side - Title, Target, Price */}
                                        <div
                                            className="absolute inset-0 w-full h-full p-3 sm:p-4 rounded-2xl border bg-card/70 backdrop-blur-sm backface-hidden flex flex-col"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                borderColor: showActive ? `${cardColor}40` : 'hsl(var(--border))',
                                                boxShadow: showActive ? `0 0 20px ${cardColor}15` : 'none',
                                                transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out',
                                            }}
                                        >
                                            {/* Flip Indicator */}
                                            <div className="absolute bottom-3 right-3 pointer-events-none z-20">
                                                <div className="relative flex items-center justify-center w-4 h-4">
                                                    <div
                                                        className="absolute inset-0 rounded-full animate-ping"
                                                        style={{ backgroundColor: showActive ? `${cardColor}50` : 'rgba(59, 130, 246, 0.5)' }}
                                                    />
                                                    <div
                                                        className="relative w-2.5 h-2.5 rounded-full"
                                                        style={{ backgroundColor: showActive ? cardColor : '#3b82f6' }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-center">
                                                <h3
                                                    className="text-base sm:text-lg font-semibold mb-2"
                                                    style={{
                                                        color: showActive ? cardColor : 'inherit',
                                                        textShadow: showActive ? `0 0 15px ${cardColor}40` : 'none',
                                                        transition: 'color 700ms ease-in-out, text-shadow 700ms ease-in-out'
                                                    }}
                                                >
                                                    {t(`packages.${pkgKey}.label`)}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mb-4">
                                                    {t(`packages.${pkgKey}.target`)}
                                                </p>
                                            </div>

                                            <div
                                                className="pt-2 border-t"
                                                style={{
                                                    borderColor: showActive ? `${cardColor}30` : 'hsl(var(--border) / 0.6)',
                                                    transition: 'border-color 700ms ease-in-out'
                                                }}
                                            >
                                                <div
                                                    className="text-sm font-semibold"
                                                    style={{
                                                        color: showActive ? cardColor : 'inherit',
                                                        textShadow: showActive ? `0 0 15px ${cardColor}40` : 'none',
                                                        transition: 'color 700ms ease-in-out, text-shadow 700ms ease-in-out'
                                                    }}
                                                >
                                                    {t(`packages.${pkgKey}.priceFrom`)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Back Side - Includes List */}
                                        <div
                                            className="absolute inset-0 w-full h-full p-3 sm:p-4 rounded-2xl border bg-secondary/50 backdrop-blur-sm backface-hidden overflow-hidden flex flex-col"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)',
                                                borderColor: showActive ? `${cardColor}50` : 'hsl(var(--accent) / 0.5)',
                                                boxShadow: showActive ? `0 0 20px ${cardColor}20` : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out',
                                            }}
                                        >
                                            <div
                                                className="absolute inset-0 opacity-5 rounded-2xl"
                                                style={{ background: `linear-gradient(135deg, ${cardColor}, transparent)` }}
                                            />

                                            <div className="relative z-10 flex flex-col h-full">
                                                <h4
                                                    className="text-xs font-semibold mb-2 text-center"
                                                    style={{
                                                        color: showActive ? cardColor : 'inherit',
                                                        transition: 'color 700ms ease-in-out'
                                                    }}
                                                >
                                                    {t(`packages.${pkgKey}.label`)}
                                                </h4>
                                                <ul className="flex-1 space-y-1.5 text-[11px] overflow-y-auto">
                                                    {includes.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-1.5">
                                                            <span
                                                                className="mt-0.5 text-[8px]"
                                                                style={{
                                                                    color: showActive ? cardColor : 'currentColor',
                                                                    transition: 'color 700ms ease-in-out'
                                                                }}
                                                            >
                                                                ✓
                                                            </span>
                                                            <span className="leading-tight">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop: Normal Card */}
                                    <div
                                        className="hidden md:flex flex-col h-full rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-4 sm:p-5"
                                        style={{
                                            borderColor: showActive ? `${cardColor}40` : 'hsl(var(--border))',
                                            boxShadow: showActive ? `0 0 20px ${cardColor}15` : 'none',
                                            transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
                                        }}
                                    >
                                        <div className="mb-2 sm:mb-3">
                                            <h3
                                                className="text-base sm:text-lg font-semibold"
                                                style={{
                                                    color: showActive ? cardColor : 'inherit',
                                                    textShadow: showActive ? `0 0 15px ${cardColor}40` : 'none',
                                                    transition: 'color 700ms ease-in-out, text-shadow 700ms ease-in-out'
                                                }}
                                            >
                                                {t(`packages.${pkgKey}.label`)}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                                {t(`packages.${pkgKey}.target`)}
                                            </p>
                                        </div>

                                        <ul className="flex-1 space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
                                            {includes.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span
                                                        className="mt-1 text-[10px]"
                                                        style={{
                                                            color: showActive ? cardColor : 'currentColor',
                                                            transition: 'color 700ms ease-in-out'
                                                        }}
                                                    >
                                                        •
                                                    </span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div
                                            className="pt-2 border-t"
                                            style={{
                                                borderColor: showActive ? `${cardColor}30` : 'hsl(var(--border) / 0.6)',
                                                transition: 'border-color 700ms ease-in-out'
                                            }}
                                        >
                                            <div
                                                className="text-sm sm:text-base font-semibold"
                                                style={{
                                                    color: showActive ? cardColor : 'inherit',
                                                    textShadow: showActive ? `0 0 15px ${cardColor}40` : 'none',
                                                    transition: 'color 700ms ease-in-out, text-shadow 700ms ease-in-out'
                                                }}
                                            >
                                                {t(`packages.${pkgKey}.priceFrom`)}
                                            </div>
                                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                                                {t('priceNote', {
                                                    default: 'Der genaue Preis hängt vom Umfang des Projekts ab.',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
