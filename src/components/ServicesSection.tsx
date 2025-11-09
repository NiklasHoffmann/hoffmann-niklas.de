'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ServicesCube } from '@/components/ServicesCube';
import { Icon } from '@iconify/react';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import {
    ReactIcon,
    NextJsIcon,
    ExpressIcon,
    MongoDBIcon,
    TailwindIcon,
    TypeScriptIcon,
    NodeIcon,
    GitIcon,
    FigmaIcon,
    EthereumIcon,
    ViemIcon,
    WalletConnectIcon,
    WagmiIcon,
    MetaMaskIcon,
    IPFSIcon,
    GraphQLIcon,
} from '@/components/icons/TechIcons';

interface TechItem {
    name: string;
    category: 'frontend' | 'backend' | 'web3' | 'database' | 'tools';
    icon: React.ComponentType<{ className?: string }>;
}

interface ServiceCategory {
    title: string;
    icon: string;
    description: string;
    color: string;
    techStack: TechItem[];
}

const techStack: TechItem[] = [
    // Frontend
    { name: 'React', category: 'frontend', icon: ReactIcon },
    { name: 'Next.js', category: 'frontend', icon: NextJsIcon },
    { name: 'TypeScript', category: 'frontend', icon: TypeScriptIcon },
    { name: 'Tailwind CSS', category: 'frontend', icon: TailwindIcon },

    // Web3 Frontend & Integration
    { name: 'Ethereum', category: 'web3', icon: EthereumIcon },
    { name: 'Wagmi', category: 'web3', icon: WagmiIcon },
    { name: 'MetaMask', category: 'web3', icon: MetaMaskIcon },
    { name: 'Viem', category: 'web3', icon: ViemIcon },
    { name: 'WalletConnect', category: 'web3', icon: WalletConnectIcon },
    { name: 'IPFS', category: 'web3', icon: IPFSIcon },

    // Backend
    { name: 'Node.js', category: 'backend', icon: NodeIcon },
    { name: 'Express.js', category: 'backend', icon: ExpressIcon },
    { name: 'GraphQL', category: 'backend', icon: GraphQLIcon },

    // Database
    { name: 'MongoDB', category: 'database', icon: MongoDBIcon },

    // Tools
    { name: 'Git', category: 'tools', icon: GitIcon },
    { name: 'Figma', category: 'tools', icon: FigmaIcon },
];

export function ServicesSection() {
    const t = useTranslations('services');
    const { isInteractive, mounted } = useInteractiveMode();

    // Initialize from localStorage immediately to prevent flash on language change
    // Default to true if no saved value (cube is default in interactive mode)
    const [showCube, setShowCube] = useState(() => {
        if (typeof window === 'undefined') return false;
        const saved = localStorage.getItem('services-show-cube');
        // Default to true if nothing saved, otherwise use saved value
        return saved === null ? true : saved === 'true';
    });

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [opacity, setOpacity] = useState(1);
    const [displayContent, setDisplayContent] = useState(showCube); // What to actually render
    const previousInteractiveRef = useRef(isInteractive);

    // Handle interactive mode changes with transition
    useEffect(() => {
        if (!mounted) return;

        const interactiveChanged = previousInteractiveRef.current !== isInteractive;
        previousInteractiveRef.current = isInteractive;

        if (!interactiveChanged) return;

        // Trigger transition when interactive mode changes
        setIsTransitioning(true);
        setOpacity(0);

        setTimeout(() => {
            if (!isInteractive) {
                setShowCube(false);
                setDisplayContent(false);
            } else {
                // When interactive mode turns on, always show cube
                setShowCube(true);
                setDisplayContent(true);
            }

            setTimeout(() => {
                setOpacity(1);
                setIsTransitioning(false);
            }, 50);
        }, 350);
    }, [isInteractive, mounted]);

    // Save showCube to localStorage when it changes
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('services-show-cube', String(showCube));
    }, [showCube, mounted]);

    // Handle transition with toggle button
    const toggleView = () => {
        setIsTransitioning(true);

        // Fade out (350ms)
        setOpacity(0);

        // After fade out, switch view
        setTimeout(() => {
            const newShowCube = !showCube;
            setShowCube(newShowCube);
            setDisplayContent(newShowCube);

            // Fade in (350ms)
            setTimeout(() => {
                setOpacity(1);
                setIsTransitioning(false);
            }, 50); // Small delay to ensure state change is applied
        }, 350);
    };

    const serviceCategories: ServiceCategory[] = useMemo(() => [
        {
            title: t('webDev'),
            icon: 'vscode-icons:file-type-reactjs',
            description: t('descriptions.webDev'),
            color: 'from-blue-500 to-cyan-500',
            techStack: techStack.filter((tech) => tech.category === 'frontend'),
        },
        {
            title: t('web3Service'),
            icon: 'cryptocurrency:eth',
            description: t('descriptions.web3Service'),
            color: 'from-purple-500 to-pink-500',
            techStack: techStack.filter((tech) => tech.category === 'web3'),
        },
        {
            title: t('uiux'),
            icon: 'logos:figma',
            description: t('descriptions.uiux'),
            color: 'from-orange-500 to-red-500',
            techStack: techStack.filter((tech) => tech.category === 'tools'),
        },
        {
            title: t('photo'),
            icon: 'mdi:camera-outline',
            description: t('descriptions.photo'),
            color: 'from-pink-500 to-rose-500',
            techStack: [],
        },
        {
            title: t('databaseService'),
            icon: 'vscode-icons:file-type-mongo',
            description: t('descriptions.databaseService'),
            color: 'from-yellow-500 to-orange-500',
            techStack: techStack.filter((tech) => tech.category === 'database'),
        },
        {
            title: t('backendService'),
            icon: 'vscode-icons:file-type-node',
            description: t('descriptions.backendService'),
            color: 'from-green-500 to-emerald-500',
            techStack: techStack.filter((tech) => tech.category === 'backend'),
        },
    ], [t]);

    return (
        <section
            id="services"
            className="scroll-snap-section w-full min-h-screen flex items-center justify-center bg-background pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8 lg:px-12"
        >
            <div className="max-w-7xl mx-auto w-full relative">
                {/* Mode Toggle - Only visible in interactive mode */}
                {isInteractive && (
                    <div className="absolute top-0 right-0 z-20">
                        <button
                            onClick={toggleView}
                            disabled={isTransitioning}
                            className="px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg transition-all duration-700 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            title={showCube ? 'Show Grid View' : 'Show 3D Cube'}
                            suppressHydrationWarning
                        >
                            <Icon
                                icon={showCube ? 'mdi:grid' : 'mdi:cube-outline'}
                                className="w-5 h-5 text-accent"
                                ssr={true}
                                key={showCube ? 'mdi:grid' : 'mdi:cube-outline'}
                            />
                        </button>
                    </div>
                )}

                <div
                    suppressHydrationWarning
                    style={{
                        opacity: opacity,
                        transition: 'opacity 350ms ease-in-out'
                    }}
                >
                    {displayContent && isInteractive ? (
                        /* 3D Cube Mode - Centered layout with text on sides */
                        <div className="relative min-h-[500px] sm:min-h-[600px] flex flex-col lg:flex-row items-center justify-center gap-12 sm:gap-20 lg:gap-0 py-12 sm:py-16 lg:py-24">
                            {/* Header - Top center on mobile, left top on desktop */}
                            <div className="lg:absolute lg:left-0 lg:top-28 space-y-2 sm:space-y-3 text-center lg:text-left max-w-xs order-1 lg:order-none">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-foreground">
                                    {t('title')}
                                </h2>
                                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                                    {t('subtitle')}
                                </p>
                            </div>

                            {/* Center - 3D Cube with extra bottom spacing on mobile */}
                            <div className="flex items-center justify-center order-2 mb-8 sm:mb-12 lg:mb-0">
                                <ServicesCube key="services-cube-stable" services={serviceCategories} t={t} />
                            </div>

                            {/* Hint - Bottom center on mobile, right bottom on desktop */}
                            <div className="lg:absolute lg:right-8 xl:right-12 lg:bottom-24 text-center lg:text-right max-w-xs order-3">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-l from-accent/20 via-accent/40 to-accent/20 blur-sm" />
                                    <div className="relative h-px bg-gradient-to-l from-accent via-accent to-transparent" />
                                </div>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                    {t('cubeHint')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Classic Grid Mode */
                        <>
                            {/* Header */}
                            <SectionHeader title={t('title')} subtitle={t('subtitle')} className="mb-8 sm:mb-12" />

                            {/* Service Categories Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                {serviceCategories.map((service, i) => (
                                    <div
                                        key={i}
                                        className="group relative p-6 bg-card rounded-xl border border-border hover:border-accent/50 overflow-hidden cursor-pointer"
                                        style={{
                                            transition: 'all 0.7s ease-in-out, background-color 700ms ease-in-out, border-color 700ms ease-in-out, box-shadow 0.7s ease-in-out',
                                        }}
                                    >
                                        {/* Gradient Background on Hover */}
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10`}
                                            style={{
                                                transition: 'opacity 700ms ease-in-out',
                                            }}
                                        />

                                        {/* Hover Indicator - Pulsing Dot */}
                                        {service.techStack.length > 0 && (
                                            <div className="absolute bottom-4 right-4 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none z-20">
                                                <div className="relative flex items-center justify-center w-5 h-5">
                                                    {/* Outer pulsing ring */}
                                                    <div className="absolute inset-0 bg-blue-500/50 rounded-full animate-ping" />
                                                    {/* Inner solid dot */}
                                                    <div className="relative w-3 h-3 bg-blue-500 rounded-full" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="relative z-10">
                                            {/* Icon */}
                                            <div className="mb-4">
                                                <Icon
                                                    icon={service.icon}
                                                    className="text-5xl group-hover:scale-110 transition-transform duration-500"
                                                    key={service.icon}
                                                    ssr={true}
                                                />
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                                                {service.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-muted-foreground mb-4">{service.description}</p>

                                            {/* Tech Stack - Appears on Hover */}
                                            {service.techStack.length > 0 && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 max-h-0 group-hover:max-h-40 overflow-hidden">
                                                    <div className="pt-4 border-t border-border/50">
                                                        <p className="text-xs font-semibold text-muted-foreground mb-2">Tech Stack:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {service.techStack.map((tech) => {
                                                                const TechIcon = tech.icon;
                                                                return (
                                                                    <div
                                                                        key={tech.name}
                                                                        className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-md"
                                                                        title={tech.name}
                                                                    >
                                                                        <TechIcon className="w-4 h-4" />
                                                                        <span className="text-[10px]">{tech.name}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
