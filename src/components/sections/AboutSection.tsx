'use client';

import { useTranslations } from 'next-intl';
import { SectionHeader, Section, SectionLeft, SectionRight, SectionDefault } from '@/components/ui';
import { Icon } from '@/components/icons/LocalIcon';
import { useMemo, useState, useEffect } from 'react';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useTheme } from 'next-themes';
import { NEON_COLORS } from '@/config/ui.constants';
import { useDevice } from '@/contexts/DeviceContext';

const NEON_COLORS_DARK = Object.values(NEON_COLORS.DARK);
const NEON_COLORS_LIGHT = Object.values(NEON_COLORS.LIGHT);

export function AboutSection() {
    const t = useTranslations('about');
    const device = useDevice();
    const { showActive, mounted: interactiveMounted } = useInteractiveMode();
    const { theme } = useTheme();
    const { isMobileLandscape } = device;

    // Force re-render after hydration to apply correct styles
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);

    // Neon colors based on theme
    const neonColors = useMemo(() => {
        return !interactiveMounted || theme === 'dark'
            ? NEON_COLORS_DARK
            : NEON_COLORS_LIGHT;
    }, [theme, interactiveMounted]);

    // Use hydrated state to determine if interactive styles should be shown
    const isActiveAndHydrated = hydrated && showActive;

    const skills = [
        { name: 'React & Next.js', level: 95, color: neonColors[0] },
        { name: 'TypeScript', level: 90, color: neonColors[1] },
        { name: 'Web3 & Blockchain', level: 85, color: neonColors[2] },
        { name: 'UI/UX Design', level: 80, color: neonColors[3] },
        { name: 'Node.js & APIs', level: 88, color: neonColors[4] }
    ];

    const timeline = [
        {
            year: '2024',
            title: t('timeline.current', { default: 'Full-Stack Developer' }),
            icon: 'mdi:rocket-launch',
            color: neonColors[0]
        },
        {
            year: '2023',
            title: t('timeline.web3', { default: 'Web3 Integration' }),
            icon: 'logos:ethereum',
            color: neonColors[2]
        },
        {
            year: '2022',
            title: t('timeline.freelance', { default: 'Freelance Projects' }),
            icon: 'mdi:briefcase',
            color: neonColors[4]
        },
        {
            year: '2020',
            title: t('timeline.start', { default: 'Started Coding' }),
            icon: 'mdi:code-braces',
            color: neonColors[5]
        }
    ];

    // Highlights jetzt aus der JSON
    const highlights = [
        { icon: 'mdi:web', key: 'highlights.fullstack' },
        { icon: 'logos:ethereum', key: 'highlights.web3' },
        { icon: 'mdi:palette', key: 'highlights.uiux' },
        { icon: 'mdi:api', key: 'highlights.apis' },
        { icon: 'mdi:database', key: 'highlights.database' },
        { icon: 'mdi:responsive', key: 'highlights.responsive' }
    ];

    return (
        <Section id="about" sectionKey={`${device.layout}-${device.width}`} background="none">
            {/* Mobile Landscape Layout */}
            <SectionLeft className="w-1/2 pr-4">
                {/* Compact Profile */}
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center border border-border text-xl font-bold"
                        style={{
                            borderColor: isActiveAndHydrated ? neonColors[0] : 'hsl(var(--border))',
                            transition: 'border-color 700ms ease-in-out'
                        }}
                    >
                        NH
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Niklas Hoffmann</h3>
                        <p className="text-xs text-muted-foreground">{t('role')}</p>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                    {t('description')}
                </p>
            </SectionLeft>

            <SectionRight className="w-1/2 pr-4">
                {/* Stats Grid - 2x2 compact */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: t('stats.projects'), value: '15+', color: neonColors[0] },
                        { label: t('stats.clients'), value: '20+', color: neonColors[1] },
                        { label: t('stats.experience'), value: '5+', color: neonColors[2] },
                        { label: t('stats.passion'), value: '∞', color: neonColors[3] }
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div
                                className="text-xl font-bold"
                                style={{
                                    color: isActiveAndHydrated ? stat.color : 'inherit',
                                    textShadow: isActiveAndHydrated ? `0 0 15px ${stat.color}40` : 'none',
                                    transition: 'color 700ms ease-in-out, text-shadow 700ms ease-in-out'
                                }}
                            >
                                {stat.value}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </SectionRight>

            {/* Default Layout (Desktop, Tablet, Mobile Portrait) */}
            <SectionDefault className="h-full flex flex-col justify-center max-w-6xl">
                {/* Header */}
                <SectionHeader
                    title={t('title')}
                    className="mb-4 sm:mb-6 md:mb-8 flex-shrink-0 text-center"
                />

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-6 md:gap-12 lg:gap-16">
                    {/* Left Column - Profile (full width on mobile portrait, 2/5 on desktop) */}
                    <div className="w-full lg:w-2/5 flex flex-col justify-center">
                        {/* Avatar & Name */}
                        <div className="flex flex-col items-center text-center mb-4 sm:mb-8">
                            <div className="relative mb-4">
                                <div
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-secondary/30 flex items-center justify-center border border-border"
                                    style={{
                                        borderColor: isActiveAndHydrated
                                            ? neonColors[0]
                                            : 'hsl(var(--border))',
                                        transition: 'border-color 700ms ease-in-out',
                                        boxShadow: isActiveAndHydrated
                                            ? `0 0 30px ${neonColors[0]}20`
                                            : 'none'
                                    }}
                                >
                                    <div className="text-4xl md:text-5xl font-bold">NH</div>
                                </div>
                                <div
                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary text-foreground px-4 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap border border-border"
                                    style={{
                                        borderColor: isActiveAndHydrated
                                            ? neonColors[0]
                                            : 'hsl(var(--border))',
                                        transition: 'border-color 700ms ease-in-out'
                                    }}
                                >
                                    {t('role', { default: 'Full-Stack Developer' })}
                                </div>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-bold mb-3">
                                Niklas Hoffmann
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                                {t('description')}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: t('stats.projects'), value: '15+', color: neonColors[0] },
                                { label: t('stats.clients'), value: '20+', color: neonColors[1] },
                                { label: t('stats.experience'), value: '5+', color: neonColors[2] },
                                { label: t('stats.passion'), value: '∞', color: neonColors[3] }
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div
                                        className="text-3xl md:text-4xl font-bold mb-1"
                                        style={{
                                            color: isActiveAndHydrated ? stat.color : 'inherit',
                                            textShadow: isActiveAndHydrated
                                                ? `0 0 15px ${stat.color}40`
                                                : 'none',
                                            transition:
                                                'color 700ms ease-in-out, text-shadow 700ms ease-in-out'
                                        }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - What I Do (hidden on mobile portrait) */}
                    <div className="hidden lg:flex lg:w-3/5 flex-col justify-center">
                        <h3 className="text-xl md:text-2xl font-bold mb-8">
                            {t('whatIDoTitle', { default: 'What I Do' })}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {highlights.map((item, index) => (
                                <div
                                    key={item.key}
                                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-accent/30 transition-all duration-300"
                                    style={{
                                        borderColor: isActiveAndHydrated
                                            ? `${neonColors[index % neonColors.length]}20`
                                            : 'hsl(var(--border))',
                                        transition: 'border-color 700ms ease-in-out'
                                    }}
                                >
                                    <div
                                        className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center"
                                        style={{
                                            backgroundColor: isActiveAndHydrated
                                                ? `${neonColors[index % neonColors.length]}10`
                                                : 'hsl(var(--secondary) / 0.5)',
                                            transition: 'background-color 700ms ease-in-out'
                                        }}
                                    >
                                        <Icon
                                            icon={item.icon}
                                            className="w-5 h-5"
                                            style={{
                                                color: isActiveAndHydrated
                                                    ? neonColors[index % neonColors.length]
                                                    : 'hsl(var(--muted-foreground))',
                                                transition: 'color 700ms ease-in-out'
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm md:text-base font-medium leading-relaxed">
                                            {t(item.key)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionDefault>
        </Section>
    );
}
