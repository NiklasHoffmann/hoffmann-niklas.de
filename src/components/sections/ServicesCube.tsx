'use client';

import { useTheme } from 'next-themes';
import { useCubeDrag } from '@/hooks/useCubeDrag';
import { Icon } from '@/components/icons/LocalIcon';
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
        autoRotateSpeed: 0.09,
        initialRotation: { x: 0, y: 15 },
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
                        width: 'clamp(180px, 22vw, 380px)',
                        height: 'clamp(180px, 22vw, 380px)',
                        background:
                            theme === 'dark'
                                ? 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 80%)'
                                : 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 80%)',
                        marginTop: 'clamp(110px, 14vw, 220px)',
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
                style={{ perspective: 'clamp(900px, 110vw, 1700px)' }}
                className="relative z-10 cursor-grab active:cursor-grabbing w-[clamp(180px,22vw,380px)] aspect-square"
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
                    <CubeFace service={cubeServices[0]} transform="rotateY(0deg) translateZ(clamp(90px, 11vw, 190px))" t={t} />

                    {/* Back Face - Service 1 */}
                    <CubeFace service={cubeServices[1]} transform="rotateY(180deg) translateZ(clamp(90px, 11vw, 190px))" t={t} />

                    {/* Top Face - Service 2 */}
                    <CubeFace service={cubeServices[2]} transform="rotateX(90deg) translateZ(clamp(90px, 11vw, 190px))" t={t} />

                    {/* Bottom Face - Service 3 */}
                    <CubeFace service={cubeServices[3]} transform="rotateX(-90deg) translateZ(clamp(90px, 11vw, 190px))" t={t} />

                    {/* Left Face - Service 4 */}
                    <CubeFace service={cubeServices[4]} transform="rotateY(-90deg) translateZ(clamp(90px, 11vw, 190px))" t={t} />

                    {/* Right Face - Service 5 */}
                    <CubeFace service={cubeServices[5]} transform="rotateY(90deg) translateZ(clamp(90px, 11vw, 190px))" t={t} />
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
            className="absolute inset-0 bg-card rounded-sm border-2 border-border select-none overflow-hidden"
            style={{
                transform,
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transition: TRANSITIONS.colors,
                padding: 'clamp(8px, 1.2vw, 20px)',
            }}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-10 rounded-sm`}
                style={{
                    transition: TRANSITIONS.opacity,
                }}
            />
            <div className="relative z-10 h-full flex flex-col">
                {/* Top Half - Service Info (centered) */}
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Icon
                        icon={service.icon}
                        style={{
                            width: 'clamp(24px, 2.8vw, 48px)',
                            height: 'clamp(24px, 2.8vw, 48px)',
                            marginBottom: 'clamp(4px, 0.5vw, 10px)',
                        }}
                        className="flex-shrink-0"
                    />
                    <h3
                        className="font-bold leading-tight"
                        style={{
                            fontSize: 'clamp(11px, 1.3vw, 20px)',
                            marginBottom: 'clamp(4px, 0.5vw, 10px)',
                        }}
                    >
                        {service.title}
                    </h3>
                    <p
                        className="text-muted-foreground leading-tight flex-shrink-0 line-clamp-3"
                        style={{
                            fontSize: 'clamp(9px, 1vw, 15px)',
                        }}
                    >
                        {service.description}
                    </p>
                </div>

                {/* Bottom Half - Tech Stack (centered) */}
                {service.techStack.length > 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <p
                            className="font-semibold text-muted-foreground flex-shrink-0"
                            style={{
                                fontSize: 'clamp(8px, 0.9vw, 13px)',
                                marginBottom: 'clamp(3px, 0.4vw, 7px)',
                            }}
                        >
                            {t('techStack')}:
                        </p>
                        <div
                            className="flex flex-wrap justify-center"
                            style={{
                                gap: 'clamp(2px, 0.3vw, 5px)',
                                maxWidth: '100%',
                            }}
                        >
                            {service.techStack.slice(0, 6).map((tech) => {
                                const TechIcon = tech.icon;
                                return (
                                    <div
                                        key={tech.name}
                                        className="flex items-center bg-secondary/50 rounded-md flex-shrink-0"
                                        style={{
                                            gap: 'clamp(4px, 0.5vw, 8px)',
                                            padding: 'clamp(4px, 0.6vw, 9px) clamp(7px, 0.9vw, 13px)',
                                        }}
                                    >
                                        <div
                                            className="flex items-center justify-center flex-shrink-0"
                                            style={{
                                                width: 'clamp(14px, 1.7vw, 22px)',
                                                height: 'clamp(14px, 1.7vw, 22px)',
                                            }}
                                        >
                                            <TechIcon className="w-full h-full" />
                                        </div>
                                        <span style={{ fontSize: 'clamp(10px, 1.2vw, 16px)', lineHeight: 1 }}>{tech.name}</span>
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
