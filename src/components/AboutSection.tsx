'use client';

import { useTranslations } from 'next-intl';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@iconify/react';
import { useOrientationResize } from '@/hooks/useOrientationResize';
import { useMemo } from 'react';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useTheme } from 'next-themes';
import { NEON_COLORS } from '@/config/ui.constants';

const NEON_COLORS_DARK = Object.values(NEON_COLORS.DARK);
const NEON_COLORS_LIGHT = Object.values(NEON_COLORS.LIGHT);

export function AboutSection() {
    const t = useTranslations('about');
    const { key } = useOrientationResize();
    const { showActive, mounted: interactiveMounted } = useInteractiveMode();
    const { theme } = useTheme();

    // Neon colors based on theme
    const neonColors = useMemo(() => {
        return !interactiveMounted || theme === 'dark'
            ? NEON_COLORS_DARK
            : NEON_COLORS_LIGHT;
    }, [theme, interactiveMounted]);

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
            icon: 'cryptocurrency:eth',
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
        { icon: 'cryptocurrency:eth', key: 'highlights.web3' },
        { icon: 'mdi:palette', key: 'highlights.uiux' },
        { icon: 'mdi:api', key: 'highlights.apis' },
        { icon: 'mdi:database', key: 'highlights.database' },
        { icon: 'mdi:responsive', key: 'highlights.responsive' }
    ];

    return (
        <section
            id="about"
            key={key}
            className="scroll-snap-section section-padding w-full h-screen max-h-screen overflow-y-auto bg-background flex items-center justify-center"
            style={{
                zIndex: 1,
                transition: 'background-color 700ms ease-in-out'
            }}
        >
            <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
                {/* Header */}
                <SectionHeader
                    title={t('title')}
                    className="mb-4 sm:mb-6 md:mb-8 flex-shrink-0 text-center"
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col lg:flex-row gap-12 md:gap-16 overflow-y-auto pb-4">
                    {/* Left Column - Profile */}
                    <div className="lg:w-2/5 flex flex-col justify-center">
                        {/* Avatar & Name */}
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="relative mb-4">
                                <div
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-secondary/30 flex items-center justify-center border border-border"
                                    style={{
                                        borderColor: showActive
                                            ? neonColors[0]
                                            : 'hsl(var(--border))',
                                        transition: 'border-color 700ms ease-in-out',
                                        boxShadow: showActive
                                            ? `0 0 30px ${neonColors[0]}20`
                                            : 'none'
                                    }}
                                >
                                    <div className="text-4xl md:text-5xl font-bold">NH</div>
                                </div>
                                <div
                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary text-foreground px-4 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap border border-border"
                                    style={{
                                        borderColor: showActive
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
                                            color: showActive ? stat.color : 'hsl(var(--foreground))',
                                            textShadow: showActive
                                                ? `0 0 15px ${stat.color}20`
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

                    {/* Right Column - What I Do */}
                    <div className="lg:w-3/5 flex flex-col justify-center">
                        <h3 className="text-xl md:text-2xl font-bold mb-8">
                            {t('whatIDoTitle', { default: 'What I Do' })}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {highlights.map((item, index) => (
                                <div
                                    key={item.key}
                                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-accent/30 transition-all duration-300"
                                    style={{
                                        borderColor: showActive
                                            ? `${neonColors[index % neonColors.length]}20`
                                            : 'hsl(var(--border))',
                                        transition: 'border-color 700ms ease-in-out'
                                    }}
                                >
                                    <div
                                        className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center"
                                        style={{
                                            backgroundColor: showActive
                                                ? `${neonColors[index % neonColors.length]}10`
                                                : 'hsl(var(--secondary) / 0.5)',
                                            transition: 'background-color 700ms ease-in-out'
                                        }}
                                    >
                                        <Icon
                                            icon={item.icon}
                                            className="text-lg"
                                            style={{
                                                color: showActive
                                                    ? neonColors[index % neonColors.length]
                                                    : 'hsl(var(--muted-foreground))',
                                                transition: 'color 700ms ease-in-out'
                                            }}
                                            key={item.icon}
                                            ssr={true}
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
            </div>
        </section>
    );
}