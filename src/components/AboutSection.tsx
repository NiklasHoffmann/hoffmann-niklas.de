'use client';

import { useTranslations } from 'next-intl';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@iconify/react';
import { useOrientationResize } from '@/hooks/useOrientationResize';
import { useState } from 'react';

export function AboutSection() {
    const t = useTranslations('about');
    const { key } = useOrientationResize();
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const services = [
        {
            id: 'webdev',
            icon: 'logos:react',
            label: t('services.webdev'),
            color: 'from-blue-500 to-cyan-500',
            tech: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB']
        },
        {
            id: 'design',
            icon: 'logos:figma',
            label: t('services.design'),
            color: 'from-purple-500 to-pink-500',
            tech: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator']
        },
        {
            id: 'photo',
            icon: 'mdi:camera',
            label: t('services.fotografie'),
            color: 'from-orange-500 to-red-500',
            tech: ['Canon EOS', 'Lightroom', 'Photoshop', 'DaVinci']
        },
    ];

    return (
        <section
            id="about"
            key={key}
            className="scroll-snap-section section-padding w-full h-screen max-h-screen overflow-y-auto bg-secondary/30 flex items-center justify-center"
        >
            <div className="max-w-7xl mx-auto w-full flex-shrink-0">
                {/* Header */}
                <SectionHeader
                    title={t('title')}
                    className="mb-3 sm:mb-4 md:mb-6 flex-shrink-0"
                />

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 items-start mb-3 sm:mb-4 md:mb-6">
                    {/* Left: Avatar & Bio */}
                    <div className="flex flex-col items-center lg:items-start flex-shrink-0">
                        {/* Avatar */}
                        <div className="mb-2 sm:mb-3 relative">
                            <div
                                className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border-2 border-accent/30"
                                style={{ transition: 'border-color 700ms ease-in-out' }}
                            >
                                <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-accent via-primary to-secondary/50 flex items-center justify-center text-2xl sm:text-4xl md:text-5xl font-bold">
                                    NH
                                </div>
                            </div>
                            {/* Badge */}
                            <div className="absolute bottom-0 right-0 bg-accent text-accent-foreground px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-semibold text-[10px] sm:text-xs">
                                Full-Stack
                            </div>
                        </div>

                        {/* Bio Text */}
                        <p className="text-xs sm:text-sm text-muted-foreground text-center lg:text-left leading-snug sm:leading-relaxed px-2 sm:px-0 line-clamp-4 sm:line-clamp-none">
                            {t('description')}
                        </p>
                    </div>

                    {/* Right: Services Grid - Responsive Cards */}
                    <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                        {services.map((service) => {
                            const isFlipped = expandedCard === service.id;
                            return (
                                <div key={service.id}>
                                    {/* Desktop: Normal hover cards that expand down */}
                                    <div className="hidden lg:block">
                                        <div
                                            className="group p-2 sm:p-3 md:p-4 bg-card hover:bg-secondary/50 rounded-lg border border-border hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10 cursor-pointer"
                                            style={{ transition: 'all 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out' }}
                                        >
                                            <div className={`mb-1.5 sm:mb-2 p-1 sm:p-1.5 rounded-lg bg-gradient-to-br ${service.color} w-fit flex-shrink-0`}>
                                                <Icon icon={service.icon} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" key={service.icon} ssr={true} />
                                            </div>
                                            <h3 className="font-semibold text-[11px] sm:text-xs md:text-sm text-foreground group-hover:text-accent transition-colors leading-tight mb-1">
                                                {service.label}
                                            </h3>

                                            {/* Tech Stack - hidden, appears on hover */}
                                            <div className="max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-300">
                                                <div className="pt-2 mt-2 border-t border-border/50">
                                                    <h4 className="font-semibold text-[10px] sm:text-xs text-accent mb-1.5">Tech Stack:</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {service.tech.map((tech, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-1.5 py-0.5 bg-accent/10 text-accent rounded text-[9px] sm:text-[10px] font-medium"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile/Tablet: Flip cards */}
                                    <div className="lg:hidden h-[80px] sm:h-[96px] md:h-[112px] perspective-1000">
                                        <div
                                            onClick={() => setExpandedCard(isFlipped ? null : service.id)}
                                            onMouseEnter={() => setExpandedCard(service.id)}
                                            onMouseLeave={() => setExpandedCard(null)}
                                            className="relative w-full h-full cursor-pointer transition-transform duration-500 preserve-3d"
                                            style={{
                                                transformStyle: 'preserve-3d',
                                                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                            }}
                                        >
                                            {/* Front Side */}
                                            <div
                                                className="absolute inset-0 w-full h-full p-2 sm:p-3 md:p-4 bg-card rounded-lg border border-border flex flex-col justify-start backface-hidden"
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    transition: 'border-color 700ms ease-in-out'
                                                }}
                                            >
                                                <div className={`mb-1.5 sm:mb-2 p-1 sm:p-1.5 rounded-lg bg-gradient-to-br ${service.color} w-fit flex-shrink-0`}>
                                                    <Icon icon={service.icon} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" key={service.icon} ssr={true} />
                                                </div>
                                                <h3 className="font-semibold text-[11px] sm:text-xs md:text-sm text-foreground transition-colors leading-tight">
                                                    {service.label}
                                                </h3>
                                            </div>

                                            {/* Back Side */}
                                            <div
                                                className="absolute inset-0 w-full h-full p-2 sm:p-3 md:p-4 bg-secondary/50 rounded-lg border border-accent/50 shadow-lg shadow-accent/10 flex flex-col justify-center backface-hidden"
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    transform: 'rotateY(180deg)',
                                                    transition: 'border-color 700ms ease-in-out'
                                                }}
                                            >
                                                <h4 className="font-semibold text-[10px] sm:text-xs text-accent mb-1 sm:mb-1.5">Tech Stack:</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {service.tech.map((tech, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-1 sm:px-1.5 py-0.5 bg-accent/10 text-accent rounded text-[8px] sm:text-[9px] font-medium"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>                {/* Stats */}
                <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 sm:pt-4 md:pt-6 border-t border-border flex-shrink-0"
                    style={{ transition: 'border-color 700ms ease-in-out' }}
                >
                    {[
                        { label: t('stats.projects'), value: '15+' },
                        { label: t('stats.clients'), value: '20+' },
                        { label: t('stats.experience'), value: '5+' },
                        { label: t('stats.passion'), value: '∞' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-1.5 sm:p-2">
                            <div className="text-lg sm:text-xl md:text-2xl font-bold text-accent mb-0.5 sm:mb-1">{stat.value}</div>
                            <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground leading-tight">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
