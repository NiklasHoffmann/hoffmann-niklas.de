'use client';

import { useMemo, useState, useRef, useEffect, memo } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { SectionHeader, Section, SectionLeft, SectionRight, SectionDefault } from '@/components/ui';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useOrientationResize } from '@/hooks/useOrientationResize';
import { NEON_COLORS } from '@/config/ui.constants';
import { useDevice } from '@/contexts/DeviceContext';

const NEON_COLORS_DARK = Object.values(NEON_COLORS.DARK);
const NEON_COLORS_LIGHT = Object.values(NEON_COLORS.LIGHT);

const PACKAGE_KEYS = [
    'websiteStarter',
    'businessWebsite',
    'webAppMvp',
    'web3Integration',
] as const;

export const PackagesSection = memo(function PackagesSection() {
    const t = useTranslations('packages');
    const { showActive, mounted: interactiveMounted } = useInteractiveMode();
    const { theme } = useTheme();
    const { key } = useOrientationResize();
    const { isMobileLandscape, layout, width } = useDevice();
    const [flippedCard, setFlippedCard] = useState<number | null>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Force re-render after hydration to apply correct styles
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);

    // Use compact layout for mobile landscape, tablet landscape, and small desktop (iPad)
    // But only after hydration to avoid SSR mismatch
    const shouldUseCompactLayout = isMobileLandscape || layout === 'tablet-landscape' || (width <= 1024 && layout === 'desktop');
    const useCompactLayout = hydrated && shouldUseCompactLayout;

    useEffect(() => {
        if (hydrated) {
            console.log('PackagesSection:', { layout, width, isMobileLandscape, shouldUseCompactLayout });
        }
    }, [hydrated, layout, width, isMobileLandscape, shouldUseCompactLayout]);

    // Neon colors based on theme
    const neonColors = useMemo(() => {
        return !interactiveMounted || theme === 'dark'
            ? NEON_COLORS_DARK
            : NEON_COLORS_LIGHT;
    }, [theme, interactiveMounted]);

    // Use hydrated state to determine if interactive styles should be shown
    const isActiveAndHydrated = hydrated && showActive;

    return (
        <Section id="packages" sectionKey={key} background="none">
            {/* Compact Layout for tablet/small screens in landscape */}
            {useCompactLayout && (
                <>
                    <SectionLeft className="w-1/3">
                        <h2 className="text-lg xs:text-xl font-bold mb-1">{t('title')}</h2>
                        <p className="text-[11px] xs:text-xs text-muted-foreground mb-2 xs:mb-3">{t('subtitle')}</p>
                    </SectionLeft>

                    <SectionRight className="w-2/3">
                        {/* Compact 2x2 package grid for mobile landscape */}
                        <div className="grid grid-cols-2 gap-2 xs:gap-2.5">
                            {PACKAGE_KEYS.map((pkgKey, index) => {
                                const cardColor = neonColors[index % neonColors.length];
                                const includes = t.raw(`packages.${pkgKey}.includes`) as string[];
                                const isFlipped = flippedCard === index;

                                return (
                                    <div
                                        key={pkgKey}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setFlippedCard(isFlipped ? null : index)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlippedCard(isFlipped ? null : index); } }}
                                        className="relative p-2 xs:p-2.5 rounded-lg border bg-card/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] min-h-[44px]"
                                        style={{
                                            borderColor: isActiveAndHydrated ? `${cardColor}40` : 'hsl(var(--border))',
                                            transition: 'border-color 700ms ease-in-out, transform 300ms ease-out'
                                        }}
                                    >
                                        {!isFlipped ? (
                                            // Front: Title + Price
                                            <>
                                                <h3
                                                    className="text-xs xs:text-sm font-semibold mb-1 xs:mb-1.5 leading-tight"
                                                    style={{
                                                        color: isActiveAndHydrated ? cardColor : 'inherit',
                                                        transition: 'color 700ms ease-in-out'
                                                    }}
                                                >
                                                    {t(`packages.${pkgKey}.label`)}
                                                </h3>
                                                <p className="text-[9px] xs:text-[10px] text-muted-foreground mb-1.5 xs:mb-2 leading-tight">
                                                    {t(`packages.${pkgKey}.target`)}
                                                </p>
                                                <div
                                                    className="text-[11px] xs:text-xs font-semibold mt-auto pt-1.5 xs:pt-2 border-t"
                                                    style={{
                                                        color: isActiveAndHydrated ? cardColor : 'inherit',
                                                        borderColor: isActiveAndHydrated ? `${cardColor}30` : 'hsl(var(--border) / 0.6)',
                                                        transition: 'color 700ms ease-in-out, border-color 700ms ease-in-out'
                                                    }}
                                                >
                                                    {t(`packages.${pkgKey}.priceFrom`)}
                                                </div>
                                                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActiveAndHydrated ? cardColor : '#3b82f6' }} />
                                            </>
                                        ) : (
                                            // Back: Includes
                                            <div className="h-full flex flex-col">
                                                <h4
                                                    className="text-xs font-semibold mb-1.5 text-center"
                                                    style={{
                                                        color: isActiveAndHydrated ? cardColor : 'inherit',
                                                        transition: 'color 700ms ease-in-out'
                                                    }}
                                                >
                                                    {t(`packages.${pkgKey}.label`)}
                                                </h4>
                                                <ul className="space-y-0.5 text-[9px] leading-tight">
                                                    {includes.slice(0, 4).map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-1">
                                                            <span
                                                                className="text-[7px] mt-0.5"
                                                                style={{
                                                                    color: isActiveAndHydrated ? cardColor : 'currentColor',
                                                                    transition: 'color 700ms ease-in-out'
                                                                }}
                                                            >
                                                                ✓
                                                            </span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                    {includes.length > 4 && (
                                                        <li className="text-[8px] text-muted-foreground italic mt-1">
                                                            +{includes.length - 4} weitere...
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </SectionRight>
                </>
            )}

            {/* Default Layout (Desktop, Tablet Portrait, Mobile Portrait) */}
            {!useCompactLayout && (
                <SectionDefault className="h-full flex flex-col justify-center">
                    {/* Header */}
                    <SectionHeader
                        title={t('title')}
                        subtitle={t('subtitle')}
                        className="text-center mb-3 xs:mb-4 sm:mb-6 lg:mb-8"
                    />

                    {/* Cards */}
                    <div className="flex items-center justify-center">
                        <div className="w-full grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4 p-2">
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
                                    <div key={pkgKey} className="perspective-1000 md:perspective-none" style={{ padding: '12px', margin: '-12px' }}>
                                        {/* Mobile: Flip Card */}
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            aria-expanded={isFlipped}
                                            aria-label={`${t(`packages.${pkgKey}.label`)} - ${isFlipped ? 'Details ausblenden' : 'Details anzeigen'}`}
                                            onClick={() => setFlippedCard(isFlipped ? null : index)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlippedCard(isFlipped ? null : index); } }}
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                            className="md:hidden relative w-full aspect-[3/4] cursor-pointer transition-transform duration-500 preserve-3d focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl xs:rounded-2xl touch-target"
                                            style={{
                                                transformStyle: 'preserve-3d',
                                                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                willChange: 'transform',
                                            }}
                                        >
                                            {/* Front Side - Title, Target, Price */}
                                            <div
                                                className={`absolute inset-0 w-full h-full rounded-xl xs:rounded-2xl border bg-card/70 backdrop-blur-sm backface-hidden flex flex-col ${isMobileLandscape ? 'p-2' : 'p-2 xs:p-2.5 sm:p-4'}`}
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    WebkitBackfaceVisibility: 'hidden',
                                                    transform: 'rotateY(0deg)',
                                                    transformStyle: 'preserve-3d',
                                                    borderColor: isActiveAndHydrated ? `${cardColor}40` : 'hsl(var(--border))',
                                                    boxShadow: isActiveAndHydrated ? `0 0 20px ${cardColor}15` : 'none',
                                                    transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out',
                                                }}
                                            >
                                                {/* Flip Indicator */}
                                                <div className={`absolute pointer-events-none z-20 ${isMobileLandscape ? 'bottom-1.5 right-1.5' : 'bottom-2 sm:bottom-3 right-2 sm:right-3'}`}>
                                                    <div className={`relative flex items-center justify-center ${isMobileLandscape ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'}`}>
                                                        <div
                                                            className="absolute inset-0 rounded-full gpu-ping"
                                                            style={{ backgroundColor: isActiveAndHydrated ? `${cardColor}50` : 'rgba(59, 130, 246, 0.5)' }}
                                                        />
                                                        <div
                                                            className={`relative rounded-full ${isMobileLandscape ? 'w-1.5 h-1.5' : 'w-1.5 xs:w-2 h-1.5 xs:h-2 sm:w-3 sm:h-3'}`}
                                                            style={{ backgroundColor: isActiveAndHydrated ? cardColor : '#3b82f6' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex-1 flex flex-col justify-center">
                                                    <h3
                                                        className={`font-semibold ${isMobileLandscape ? 'text-xs mb-0.5' : 'text-xs xs:text-sm sm:text-lg mb-0.5 xs:mb-1 sm:mb-2'}`}
                                                        style={{
                                                            color: isActiveAndHydrated ? cardColor : 'inherit',
                                                            textShadow: isActiveAndHydrated ? `0 0 15px ${cardColor}40` : 'none',
                                                            transition: 'color 700ms ease-in-out, text-shadow 700ms ease-in-out'
                                                        }}
                                                    >
                                                        {t(`packages.${pkgKey}.label`)}
                                                    </h3>
                                                    <p className={`text-muted-foreground ${isMobileLandscape ? 'text-[9px] mb-1' : 'text-[9px] xs:text-[10px] sm:text-xs mb-1.5 xs:mb-2 sm:mb-4'}`}>
                                                        {t(`packages.${pkgKey}.target`)}
                                                    </p>
                                                </div>

                                                <div
                                                    className={`border-t ${isMobileLandscape ? 'pt-1' : 'pt-1.5 sm:pt-2'}`}
                                                    style={{
                                                        borderColor: isActiveAndHydrated ? `${cardColor}30` : 'hsl(var(--border) / 0.6)',
                                                        transition: 'border-color 700ms ease-in-out'
                                                    }}
                                                >
                                                    <div
                                                        className={`font-semibold ${isMobileLandscape ? 'text-[10px]' : 'text-[11px] xs:text-xs sm:text-sm'}`}
                                                        style={{
                                                            color: isActiveAndHydrated ? cardColor : 'inherit',
                                                            textShadow: isActiveAndHydrated ? `0 0 15px ${cardColor}40` : 'none',
                                                            transition: 'color 700ms ease-in-out, text-shadow 700ms ease-in-out'
                                                        }}
                                                    >
                                                        {t(`packages.${pkgKey}.priceFrom`)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Back Side - Includes List */}
                                            <div
                                                className={`absolute inset-0 w-full h-full rounded-xl xs:rounded-2xl border bg-secondary/50 backdrop-blur-sm backface-hidden overflow-hidden flex flex-col ${isMobileLandscape ? 'p-2' : 'p-2 xs:p-2.5 sm:p-4'}`}
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    WebkitBackfaceVisibility: 'hidden',
                                                    transform: 'rotateY(180deg)',
                                                    transformStyle: 'preserve-3d',
                                                    borderColor: isActiveAndHydrated ? `${cardColor}50` : 'hsl(var(--accent) / 0.5)',
                                                    boxShadow: isActiveAndHydrated ? `0 0 20px ${cardColor}20` : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out',
                                                }}
                                            >
                                                <div
                                                    className="absolute inset-0 opacity-5 rounded-xl xs:rounded-2xl"
                                                    style={{ background: `linear-gradient(135deg, ${cardColor}, transparent)` }}
                                                />

                                                <div className="relative z-10 flex flex-col h-full items-center">
                                                    <h4
                                                        className={`font-semibold text-center ${isMobileLandscape ? 'text-[9px] mb-1' : 'text-[9px] xs:text-[10px] sm:text-xs mb-1 xs:mb-1.5 sm:mb-2'}`}
                                                        style={{
                                                            color: isActiveAndHydrated ? cardColor : 'inherit',
                                                            transition: 'color 700ms ease-in-out'
                                                        }}
                                                    >
                                                        {t(`packages.${pkgKey}.label`)}
                                                    </h4>
                                                    <ul className={`flex-1 overflow-y-auto text-left ${isMobileLandscape ? 'space-y-0.5 text-[9px]' : 'space-y-1 xs:space-y-1.5 sm:space-y-2 text-[10px] xs:text-xs sm:text-sm'}`}>
                                                        {includes.map((item, idx) => (
                                                            <li key={idx} className={`flex items-start ${isMobileLandscape ? 'gap-1.5' : 'gap-1.5 lg:gap-2'}`}>
                                                                <span
                                                                    className={`mt-0.5 lg:mt-1 ${isMobileLandscape ? 'text-[8px]' : 'text-[8px] lg:text-[10px]'}`}
                                                                    style={{
                                                                        color: isActiveAndHydrated ? cardColor : 'currentColor',
                                                                        transition: 'color 700ms ease-in-out'
                                                                    }}
                                                                >
                                                                    •
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
                                            className="hidden md:flex flex-col h-full rounded-xl xs:rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-2.5 xs:p-3 lg:p-5"
                                            style={{
                                                borderColor: isActiveAndHydrated ? `${cardColor}40` : 'hsl(var(--border))',
                                                boxShadow: isActiveAndHydrated ? `0 0 20px ${cardColor}15` : 'none',
                                                transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
                                            }}
                                        >
                                            <div className="mb-1.5 xs:mb-2 lg:mb-3">
                                                <h3
                                                    className="text-xs xs:text-sm lg:text-lg font-semibold"
                                                    style={{
                                                        color: isActiveAndHydrated ? cardColor : 'inherit',
                                                        textShadow: isActiveAndHydrated ? `0 0 15px ${cardColor}40` : 'none',
                                                        transition: 'color 700ms ease-in-out, text-shadow 700ms ease-in-out'
                                                    }}
                                                >
                                                    {t(`packages.${pkgKey}.label`)}
                                                </h3>
                                                <p className="text-[10px] lg:text-sm text-muted-foreground mt-0.5 lg:mt-1">
                                                    {t(`packages.${pkgKey}.target`)}
                                                </p>
                                            </div>

                                            <ul className="flex-1 space-y-1 lg:space-y-2 text-[10px] lg:text-sm mb-2 lg:mb-4 text-left">
                                                {includes.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-1.5 lg:gap-2">
                                                        <span
                                                            className="mt-0.5 lg:mt-1 text-[8px] lg:text-[10px]"
                                                            style={{
                                                                color: isActiveAndHydrated ? cardColor : 'currentColor',
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
                                                className="pt-1.5 lg:pt-2 border-t"
                                                style={{
                                                    borderColor: isActiveAndHydrated ? `${cardColor}30` : 'hsl(var(--border) / 0.6)',
                                                    transition: 'border-color 700ms ease-in-out'
                                                }}
                                            >
                                                <div
                                                    className="text-xs lg:text-base font-semibold"
                                                    style={{
                                                        color: isActiveAndHydrated ? cardColor : 'inherit',
                                                        textShadow: isActiveAndHydrated ? `0 0 15px ${cardColor}40` : 'none',
                                                        transition: 'color 700ms ease-in-out, text-shadow 700ms ease-in-out'
                                                    }}
                                                >
                                                    {t(`packages.${pkgKey}.priceFrom`)}
                                                </div>
                                                <p className="text-[9px] lg:text-xs text-muted-foreground mt-0.5">
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
                </SectionDefault>
            )}
        </Section>
    );
});
