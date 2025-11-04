'use client';

import { useTranslations } from 'next-intl';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@iconify/react';
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

    const serviceCategories: ServiceCategory[] = [
        {
            title: t('webDev'),
            icon: 'vscode-icons:file-type-reactjs',
            description: 'Modern Web Applications',
            color: 'from-blue-500 to-cyan-500',
            techStack: techStack.filter((tech) => tech.category === 'frontend'),
        },
        {
            title: t('web3Service'),
            icon: 'cryptocurrency:eth',
            description: 'Blockchain Integration',
            color: 'from-purple-500 to-pink-500',
            techStack: techStack.filter((tech) => tech.category === 'web3'),
        },
        {
            title: t('backendService'),
            icon: 'vscode-icons:file-type-node',
            description: 'Server & APIs',
            color: 'from-green-500 to-emerald-500',
            techStack: techStack.filter((tech) => tech.category === 'backend'),
        },
        {
            title: t('uiux'),
            icon: 'logos:figma',
            description: 'Design Systems',
            color: 'from-orange-500 to-red-500',
            techStack: techStack.filter((tech) => tech.category === 'tools'),
        },
        {
            title: t('databaseService'),
            icon: 'vscode-icons:file-type-mongo',
            description: 'Data Management',
            color: 'from-yellow-500 to-orange-500',
            techStack: techStack.filter((tech) => tech.category === 'database'),
        },
        {
            title: t('photo'),
            icon: 'mdi:camera-outline',
            description: 'Product & Event Photography',
            color: 'from-pink-500 to-rose-500',
            techStack: [],
        },
        {
            title: t('video'),
            icon: 'mdi:video-outline',
            description: 'Video Production & Editing',
            color: 'from-indigo-500 to-purple-500',
            techStack: [],
        },
    ];

    return (
        <section
            id="services"
            className="scroll-snap-section w-full min-h-screen flex items-center justify-center bg-background pt-20 sm:pt-24 pb-8 sm:pb-12 px-6 sm:px-8 lg:px-12 overflow-y-auto"
        >
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <SectionHeader title={t('title')} subtitle={t('subtitle')} className="mb-8 sm:mb-12" />

                {/* Service Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {serviceCategories.map((service, i) => (
                        <div
                            key={i}
                            className="group relative p-6 bg-card rounded-xl border border-border hover:border-accent/50 transition-all duration-500 hover:shadow-xl hover:shadow-accent/10 overflow-hidden cursor-pointer hover:scale-[1.02] hover:z-10"
                        >
                            {/* Gradient Background on Hover */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
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
            </div>
        </section>
    );
}
