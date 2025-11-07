'use client';

import { useTranslations } from 'next-intl';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@iconify/react';
import { useOrientationResize } from '@/hooks/useOrientationResize';

export function AboutSection() {
    const t = useTranslations('about');
    const { key } = useOrientationResize();

    const services = [
        {
            id: 'webdev',
            icon: 'logos:react',
            label: t('services.webdev'),
            color: 'from-blue-500 to-cyan-500',
        },
        {
            id: 'design',
            icon: 'logos:figma',
            label: t('services.design'),
            color: 'from-purple-500 to-pink-500',
        },
        {
            id: 'photo',
            icon: 'mdi:camera',
            label: t('services.fotografie'),
            color: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <section
            id="about"
            key={key}
            className="scroll-snap-section w-full h-screen max-h-screen overflow-hidden bg-secondary/30 px-6 sm:px-8 lg:px-12 flex items-center"
        >
            <div className="max-w-7xl mx-auto w-full py-20 md:py-24">
                {/* Header */}
                <SectionHeader
                    title={t('title')}
                    className="mb-6 sm:mb-8 lg:mb-10"
                />

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center mb-6 sm:mb-8 lg:mb-10">
                    {/* Left: Avatar & Bio */}
                    <div className="flex flex-col items-center lg:items-start">
                        {/* Avatar */}
                        <div className="mb-4 sm:mb-6 relative">
                            <div
                                className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border-2 border-accent/30"
                                style={{ transition: 'border-color 700ms ease-in-out' }}
                            >
                                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-accent via-primary to-secondary/50 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl font-bold">
                                    NH
                                </div>
                            </div>
                            {/* Badge */}
                            <div className="absolute bottom-0 right-0 bg-accent text-accent-foreground px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-semibold text-xs">
                                Full-Stack
                            </div>
                        </div>

                        {/* Bio Text */}
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-center lg:text-left leading-relaxed px-4 sm:px-0">
                            {t('description')}
                        </p>
                    </div>

                    {/* Right: Services Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {services.map((service) => {
                            return (
                                <div
                                    key={service.id}
                                    className="group p-3 sm:p-4 md:p-5 bg-card hover:bg-secondary/50 rounded-lg border border-border hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10"
                                    style={{ transition: 'all 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out' }}
                                >
                                    <div className={`mb-2 sm:mb-3 p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${service.color} w-fit`}>
                                        <Icon icon={service.icon} className="w-4 h-4 sm:w-5 sm:h-5 text-white" key={service.icon} ssr={true} />
                                    </div>
                                    <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-accent transition-colors">
                                        {service.label}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stats */}
                <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 pt-6 sm:pt-8 border-t border-border"
                    style={{ transition: 'border-color 700ms ease-in-out' }}
                >
                    {[
                        { label: t('stats.projects'), value: '15+' },
                        { label: t('stats.clients'), value: '20+' },
                        { label: t('stats.experience'), value: '5+' },
                        { label: t('stats.passion'), value: '∞' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-2 sm:p-3">
                            <div className="text-xl sm:text-2xl font-bold text-accent mb-1">{stat.value}</div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
