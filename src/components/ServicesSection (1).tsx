'use client';

import { useTranslations } from 'next-intl';
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
    VsCodeIcon,
} from '@/components/icons/TechIcons';

interface TechItem {
    name: string;
    category: 'frontend' | 'backend' | 'database' | 'tools';
    icon: React.ComponentType<{ className?: string }>;
}

const techStack: TechItem[] = [
    { name: 'React', category: 'frontend', icon: ReactIcon },
    { name: 'Next.js', category: 'frontend', icon: NextJsIcon },
    { name: 'TypeScript', category: 'frontend', icon: TypeScriptIcon },
    { name: 'Tailwind CSS', category: 'frontend', icon: TailwindIcon },

    { name: 'Express.js', category: 'backend', icon: ExpressIcon },
    { name: 'Node.js', category: 'backend', icon: NodeIcon },

    { name: 'MongoDB', category: 'database', icon: MongoDBIcon },

    { name: 'Git', category: 'tools', icon: GitIcon },
    { name: 'Figma', category: 'tools', icon: FigmaIcon },
    { name: 'VS Code', category: 'tools', icon: VsCodeIcon },
];

const categories = {
    frontend: { label: 'Frontend', color: 'from-blue-500 to-cyan-500' },
    backend: { label: 'Backend', color: 'from-purple-500 to-pink-500' },
    database: { label: 'Database', color: 'from-green-500 to-emerald-500' },
    tools: { label: 'Tools & DevOps', color: 'from-orange-500 to-red-500' },
};

export function ServicesSection() {
    const t = useTranslations('services');

    return (
        <section
            id="services"
            className="scroll-snap-section w-full h-screen flex items-center justify-center bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
            <div className="max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-3">{t('title')}</h2>
                    <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-accent to-transparent mx-auto mt-3" />
                </div>

                {/* Compact Tech Stack Grid */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 text-center">{t('techStack')}</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3 max-w-4xl mx-auto">
                        {techStack.map((tech) => {
                            const Icon = tech.icon;
                            return (
                                <div
                                    key={tech.name}
                                    className="group p-3 bg-secondary/30 hover:bg-secondary/60 rounded-lg border border-border hover:border-accent/50 transition-all text-center cursor-pointer"
                                    title={tech.name}
                                >
                                    <Icon className="w-8 h-8 mx-auto group-hover:scale-110 transition-transform" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Compact Service Features */}
                <div>
                    <h3 className="text-xl font-bold mb-4 text-center">{t('servicesTitle')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {[
                            { title: t('webDev'), icon: '💻' },
                            { title: t('backendService'), icon: '⚙️' },
                            { title: t('uiux'), icon: '🎨' },
                            { title: t('databaseService'), icon: '🗄️' },
                            { title: t('photo'), icon: '📸' },
                            { title: t('video'), icon: '🎬' },
                        ].map((service, i) => (
                            <div
                                key={i}
                                className="p-4 bg-card rounded-lg border border-border hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all group text-center"
                            >
                                <div className="text-2xl mb-2">{service.icon}</div>
                                <h4 className="font-semibold text-sm group-hover:text-accent transition-colors">
                                    {service.title}
                                </h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
