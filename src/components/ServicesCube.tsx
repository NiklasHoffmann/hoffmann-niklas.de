'use client';

import { useTheme } from 'next-themes';
import { useCubeDrag } from '@/hooks/useCubeDrag';
import { Icon } from '@iconify/react';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useMemo, memo } from 'react';
import { TRANSITIONS } from '@/lib/transitions';

interface TechItem {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface ServiceCategory {
    title: string;
    icon: string;
    description: string;
    color: string;
    techStack: TechItem[];
}

interface ServicesCubeProps {
    services: ServiceCategory[];
    t: (key: string) => string;
}

export function ServicesCube({ services, t }: ServicesCubeProps) {
    const { theme } = useTheme();
    const { mounted } = useInteractiveMode();
    const { rotation, containerRef, cubeRef } = useCubeDrag({
        autoRotate: true,
        autoRotateSpeed: 0.3,
        initialRotation: { x: -10, y: 15 },
    });

    // Use first 6 services for cube faces - memoize to prevent re-creation
    const cubeServices = useMemo(() => services.slice(0, 6), [services]);

    return (
        <div className="flex items-center justify-center relative">
            {/* Dynamic floating shadow/glow - changes based on theme */}
            {mounted && (
                <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 pointer-events-none"
                    style={{
                        width: 'min(55vw, 280px)',
                        height: 'min(55vw, 280px)',
                        background:
                            theme === 'dark'
                                ? 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 80%)'
                                : 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 80%)',
                        marginTop: '160px',
                        borderRadius: '10%',
                        filter: 'blur(30px)',
                        opacity: '0.9',
                        transform: `translate3d(0, 0, 0) rotateX(70deg) rotateZ(${-rotation.y}deg) scaleX(1.2)`,
                        transformStyle: 'preserve-3d',
                        willChange: 'transform',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        zIndex: -1,
                        transition: 'none', // No transition for transform - move with cube
                    }}
                />
            )}

            {/* Perspective container */}
            <div
                ref={containerRef}
                style={{ perspective: '1200px' }}
                className="relative z-10 cursor-grab active:cursor-grabbing w-[min(55vw,280px)] aspect-square"
            >
                {/* Cube wrapper */}
                <div
                    ref={cubeRef}
                    className="relative w-full h-full select-none"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: `translate3d(0, 0, 0) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        willChange: 'transform',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                    }}
                >
                    {/* Front Face - Service 0 */}
                    <CubeFace service={cubeServices[0]} transform="rotateY(0deg) translateZ(140px)" t={t} />

                    {/* Back Face - Service 1 */}
                    <CubeFace service={cubeServices[1]} transform="rotateY(180deg) translateZ(140px)" t={t} />

                    {/* Top Face - Service 2 */}
                    <CubeFace service={cubeServices[2]} transform="rotateX(90deg) translateZ(140px)" t={t} />

                    {/* Bottom Face - Service 3 */}
                    <CubeFace service={cubeServices[3]} transform="rotateX(-90deg) translateZ(140px)" t={t} />

                    {/* Left Face - Service 4 */}
                    <CubeFace service={cubeServices[4]} transform="rotateY(-90deg) translateZ(140px)" t={t} />

                    {/* Right Face - Service 5 */}
                    <CubeFace service={cubeServices[5]} transform="rotateY(90deg) translateZ(140px)" t={t} />
                </div>
            </div>
        </div>
    );
}

interface CubeFaceProps {
    service: ServiceCategory;
    transform: string;
    t: (key: string) => string;
}

const CubeFace = memo(function CubeFace({ service, transform, t }: CubeFaceProps) {
    return (
        <div
            className="absolute inset-0 p-3.5 md:p-4 bg-card rounded-sm border-2 border-border select-none overflow-hidden"
            style={{
                transform,
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transition: TRANSITIONS.colors,
            }}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-10 rounded-sm`}
                style={{
                    transition: TRANSITIONS.opacity,
                }}
            />
            <div className="relative z-10 h-full flex flex-col">
                <Icon
                    icon={service.icon}
                    className="text-4xl md:text-5xl mb-2 flex-shrink-0"
                    ssr={true}
                    key={service.icon}
                />
                <h3 className="text-base md:text-lg font-bold mb-1.5 leading-tight">{service.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2.5 leading-tight flex-shrink-0">{service.description}</p>
                {service.techStack.length > 0 && (
                    <div className="mt-auto overflow-y-auto flex-shrink min-h-0 scrollbar-thin">
                        <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex-shrink-0">{t('techStack')}:</p>
                        <div className="flex flex-wrap gap-1.5">{service.techStack.map((tech) => {
                                const TechIcon = tech.icon;
                                return (
                                    <div
                                        key={tech.name}
                                        className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-md flex-shrink-0"
                                    >
                                        <TechIcon className="w-4 h-4" />
                                        <span className="text-xs">{tech.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
