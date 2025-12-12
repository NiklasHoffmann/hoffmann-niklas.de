'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { SectionHeader } from '@/components/ui';
import { ServicesCube } from './ServicesCube';
import { Icon } from '@/components/icons/LocalIcon';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useOrientationResize } from '@/hooks/useOrientationResize';
import { Section, SectionLeft, SectionRight, SectionDefault } from '@/components/ui';
import { useDevice } from '@/contexts/DeviceContext';
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
    TheGraphIcon,
} from '@/components/icons';

interface TechItem {
    name: string;
    category:
    | 'frontend'
    | 'backend'
    | 'web3-wallets'
    | 'web3-blockchain'
    | 'database'
    | 'tools';
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

    // Web3 Wallets & Frontend Integration
    { name: 'Wagmi', category: 'web3-wallets', icon: WagmiIcon },
    { name: 'WalletConnect', category: 'web3-wallets', icon: WalletConnectIcon },
    { name: 'MetaMask', category: 'web3-wallets', icon: MetaMaskIcon },
    { name: 'Viem', category: 'web3-wallets', icon: ViemIcon },

    // Blockchain & Data Infrastructure
    { name: 'Ethereum', category: 'web3-blockchain', icon: EthereumIcon },
    { name: 'The Graph', category: 'web3-blockchain', icon: TheGraphIcon },
    { name: 'IPFS', category: 'web3-blockchain', icon: IPFSIcon },

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
    const { key } = useOrientationResize();
    const { isMobileLandscape } = useDevice();
    const [flippedCard, setFlippedCard] = useState<number | null>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [showCube, setShowCube] = useState(() => {
        if (typeof window === 'undefined') return false;
        const saved = localStorage.getItem('services-show-cube');
        return saved === null ? true : saved === 'true';
    });

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [opacity, setOpacity] = useState(1);
    const [displayContent, setDisplayContent] = useState(showCube);
    const previousInteractiveRef = useRef(isInteractive);

    useEffect(() => {
        if (!mounted) return;

        const interactiveChanged =
            previousInteractiveRef.current !== isInteractive;
        previousInteractiveRef.current = isInteractive;

        if (!interactiveChanged) return;

        setIsTransitioning(true);
        setOpacity(0);

        setTimeout(() => {
            if (!isInteractive) {
                setShowCube(false);
                setDisplayContent(false);
            } else {
                setShowCube(true);
                setDisplayContent(true);
            }

            setTimeout(() => {
                setOpacity(1);
                setIsTransitioning(false);
            }, 50);
        }, 350);
    }, [isInteractive, mounted]);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('services-show-cube', String(showCube));
    }, [showCube, mounted]);

    const toggleView = () => {
        setIsTransitioning(true);
        setOpacity(0);

        setTimeout(() => {
            const newShowCube = !showCube;
            setShowCube(newShowCube);
            setDisplayContent(newShowCube);

            setTimeout(() => {
                setOpacity(1);
                setIsTransitioning(false);
            }, 50);
        }, 350);
    };

    const serviceCategories: ServiceCategory[] = useMemo(
        () => [
            {
                title: t('webDev'),
                icon: 'vscode-icons:file-type-reactjs',
                description: t('descriptions.webDev'),
                color: 'from-blue-500 to-cyan-500',
                techStack: techStack.filter((tech) => tech.category === 'frontend'),
            },
            {
                title: t('web3Wallets'),
                icon: 'token-branded:wallet-connect',
                description: t('descriptions.web3Wallets'),
                color: 'from-purple-500 to-pink-500',
                techStack: techStack.filter(
                    (tech) => tech.category === 'web3-wallets',
                ),
            },
            {
                title: t('web3Blockchain'),
                icon: 'logos:ethereum',
                description: t('descriptions.web3Blockchain'),
                color: 'from-indigo-500 to-purple-500',
                techStack: techStack.filter(
                    (tech) => tech.category === 'web3-blockchain',
                ),
            },
            {
                title: t('uiux'),
                icon: 'logos:figma',
                description: t('descriptions.uiux'),
                color: 'from-orange-500 to-red-500',
                techStack: techStack.filter((tech) => tech.category === 'tools'),
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
        ],
        [t],
    );

    const gridServiceCategories: ServiceCategory[] = serviceCategories;

    // Compact grid for mobile landscape - show 6 small icons in 3x2 grid
    const renderCompactGrid = () => (
        <div className="grid grid-cols-3 gap-2">
            {gridServiceCategories.map((service, i) => (
                <div
                    key={i}
                    className="flex flex-col items-center justify-center p-2 bg-card/50 rounded-lg border border-border"
                    style={{ transition: 'border-color 700ms ease-in-out' }}
                >
                    <div className="h-6 flex items-center mb-1">
                        <Icon
                            icon={service.icon}
                            className="text-2xl"
                            width="1em"
                            height="1em"
                        />
                    </div>
                    <span className="text-[9px] text-center leading-tight text-muted-foreground">
                        {service.title}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <Section id="services" sectionKey={key} background="none">
            {/* Mobile Landscape Layout */}
            <SectionLeft className="w-1/3 pr-4">
                <h2 className="text-xl font-bold mb-1">{t('title')}</h2>
                <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
            </SectionLeft>

            <SectionRight className="w-2/3 pr-4">
                {renderCompactGrid()}
            </SectionRight>

            {/* Default Layout (Desktop, Tablet, Mobile Portrait) */}
            <SectionDefault className="h-full flex flex-col max-w-6xl">
                <div className="w-full min-h-full flex flex-col relative">
                    {isInteractive && (
                        <button
                            onClick={toggleView}
                            disabled={isTransitioning}
                            className="absolute top-0 right-0 z-50 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg transition-all duration-700 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            title={showCube ? 'Show Grid View' : 'Show 3D Cube'}
                            aria-label={showCube ? 'Switch to Grid View' : 'Switch to 3D Cube View'}
                            suppressHydrationWarning
                        >
                            <Icon
                                icon={showCube ? 'mdi:grid' : 'mdi:cube-outline'}
                                className="w-5 h-5 text-accent"

                                key={showCube ? 'mdi:grid' : 'mdi:cube-outline'}
                            />
                        </button>
                    )}

                    <div
                        suppressHydrationWarning
                        style={{
                            opacity: opacity,
                            transition: 'opacity 350ms ease-in-out',
                        }}
                        className={`w-full h-full flex flex-col ${displayContent && isInteractive ? 'justify-around' : 'justify-center'}`}
                    >
                        {displayContent && isInteractive ? (
                            <div className="relative flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-12 lg:gap-0 py-6 sm:py-12 lg:py-16 h-full">
                                <div className="lg:absolute lg:left-0 lg:top-16 xl:top-28 space-y-2 sm:space-y-3 text-center lg:text-left max-w-xs order-1 lg:order-none">
                                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-foreground">
                                        {t('title')}
                                    </h2>
                                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                                        {t('subtitle')}
                                    </p>
                                </div>

                                <div className="flex items-center justify-center order-2 mb-4 sm:mb-8 lg:mb-0">
                                    <ServicesCube
                                        key="services-cube-stable"
                                        services={serviceCategories}
                                        t={t}
                                    />
                                </div>

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
                            <>
                                <SectionHeader
                                    title={t('title')}
                                    subtitle={t('subtitle')}
                                    className="text-center mb-2 sm:mb-3 lg:mb-4"
                                />

                                <div className="flex flex-col justify-center overflow-hidden">
                                    <div className="grid grid-cols-2 md:grid-cols-2 md:portrait:grid-cols-2 md:landscape:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 sm:p-3">
                                        {gridServiceCategories.map((service, i) => {
                                            const isFlipped = flippedCard === i;

                                            const handleMouseEnter = () => {
                                                if (hoverTimeoutRef.current) {
                                                    clearTimeout(hoverTimeoutRef.current);
                                                    hoverTimeoutRef.current = null;
                                                }
                                                // Immediate flip on enter for responsiveness
                                                setFlippedCard(i);
                                            };

                                            const handleMouseLeave = () => {
                                                if (hoverTimeoutRef.current) {
                                                    clearTimeout(hoverTimeoutRef.current);
                                                }
                                                // Delay on leave to prevent flicker when moving between cards
                                                hoverTimeoutRef.current = setTimeout(() => {
                                                    setFlippedCard(null);
                                                    hoverTimeoutRef.current = null;
                                                }, 150);
                                            };

                                            return (
                                                <div key={i} className="perspective-1000">
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-expanded={isFlipped}
                                                        aria-label={`${service.title} - ${isFlipped ? 'Details ausblenden' : 'Details anzeigen'}`}
                                                        onClick={() => setFlippedCard(isFlipped ? null : i)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlippedCard(isFlipped ? null : i); } }}
                                                        onMouseEnter={handleMouseEnter}
                                                        onMouseLeave={handleMouseLeave}
                                                        className="relative w-full aspect-square max-h-48 lg:max-h-52 cursor-pointer transition-transform duration-500 preserve-3d outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
                                                        style={{
                                                            transformStyle: 'preserve-3d',
                                                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                            WebkitTapHighlightColor: 'transparent',
                                                        }}
                                                    >
                                                        <div
                                                            className="absolute inset-0 w-full h-full p-3 sm:p-4 bg-card rounded-xl border border-border backface-hidden flex flex-col"
                                                            style={{
                                                                backfaceVisibility: 'hidden',
                                                                transition: 'border-color 700ms ease-in-out',
                                                            }}
                                                        >
                                                            {service.techStack.length > 0 && (
                                                                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 pointer-events-none z-20">
                                                                    <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
                                                                        <div className="absolute inset-0 bg-blue-500/50 rounded-full gpu-ping" />
                                                                        <div className="relative w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full" />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="mb-2 sm:mb-3 flex-shrink-0 h-[30px] sm:h-[40px] lg:h-[48px] flex items-center">
                                                                <Icon
                                                                    icon={service.icon}
                                                                    className="text-3xl sm:text-4xl lg:text-5xl"
                                                                    width="1em"
                                                                    height="1em"
                                                                />
                                                            </div>

                                                            <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-1 sm:mb-2 leading-tight flex-shrink-0">
                                                                {service.title}
                                                            </h3>

                                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 flex-1">
                                                                {service.description}
                                                            </p>
                                                        </div>

                                                        <div
                                                            className="absolute inset-0 w-full h-full p-3 sm:p-4 bg-secondary/50 rounded-xl border border-accent/50 shadow-lg shadow-accent/10 backface-hidden overflow-hidden flex flex-col"
                                                            style={{
                                                                backfaceVisibility: 'hidden',
                                                                transform: 'rotateY(180deg)',
                                                                transition: 'border-color 700ms ease-in-out',
                                                            }}
                                                        >
                                                            <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5 rounded-xl`} />

                                                            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center overflow-hidden">
                                                                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center max-h-full overflow-y-auto">
                                                                    {service.techStack.map((tech) => {
                                                                        const TechIcon = tech.icon;
                                                                        return (
                                                                            <div
                                                                                key={tech.name}
                                                                                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-accent/10 rounded-md flex-shrink-0"
                                                                            >
                                                                                <TechIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                                                <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">
                                                                                    {tech.name}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </SectionDefault>
        </Section>
    );
}
