'use client';

import { useTranslations } from 'next-intl';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@iconify/react';

export function AboutSection() {
    const t = useTranslations('about');

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
        {
            id: 'video',
            icon: 'mdi:video-vintage',
            label: t('services.videografie'),
            color: 'from-green-500 to-emerald-500',
        },
    ];

    return (
        <section
            id="about"
            className="scroll-snap-section w-full min-h-screen bg-secondary/30 pt-20 sm:pt-24 pb-12 sm:pb-20 px-6 sm:px-8 lg:px-12 overflow-y-auto"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <SectionHeader
                    title={t('title')}
                    className="mb-8 sm:mb-12 lg:mb-16"
                />

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center mb-8 sm:mb-12 lg:mb-16">
                    {/* Left: Avatar & Bio */}
                    <div className="flex flex-col items-center lg:items-start">
                        {/* Avatar */}
                        <div className="mb-6 sm:mb-8 relative">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border-2 border-accent/30">
                                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-accent via-primary to-secondary/50 flex items-center justify-center text-5xl sm:text-6xl md:text-7xl font-bold">
                                    NH
                                </div>
                            </div>
                            {/* Badge */}
                            <div className="absolute bottom-0 right-0 bg-accent text-accent-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm">
                                Full-Stack
                            </div>
                        </div>

                        {/* Bio Text */}
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-center lg:text-left leading-relaxed px-4 sm:px-0">
                            {t('description')}
                        </p>
                    </div>

                    {/* Right: Services Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {services.map((service) => {
                            return (
                                <div
                                    key={service.id}
                                    className="group p-4 sm:p-5 md:p-6 bg-card hover:bg-secondary/50 rounded-lg border border-border hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10"
                                >
                                    <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-gradient-to-br ${service.color} w-fit`}>
                                        <Icon icon={service.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-accent transition-colors">
                                        {service.label}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-8 sm:pt-12 border-t border-border">
                    {[
                        { label: t('stats.projects'), value: '15+' },
                        { label: t('stats.clients'), value: '20+' },
                        { label: t('stats.experience'), value: '5+' },
                        { label: t('stats.passion'), value: '∞' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-3 sm:p-4">
                            <div className="text-2xl sm:text-3xl font-bold text-accent mb-1 sm:mb-2">{stat.value}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
