import Image from 'next/image';
import { Icon } from '@/components/icons/LocalIcon';
import { Project } from '@/types';

interface ProjectCardProps {
    project: Project;
    titleText: string;
    descriptionText: string;
    demoText: string;
    codeText: string;
    maxTags?: number;
    priority?: boolean;
    sizes?: string;
}

export function ProjectCard({
    project,
    titleText,
    descriptionText,
    demoText,
    codeText,
    maxTags = 3,
    priority = false,
    sizes = '(max-width: 768px) 45vw, (max-width: 1536px) 330px, 384px',
}: ProjectCardProps) {
    return (
        <div className="group rounded-lg overflow-hidden border border-border hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 bg-card h-full flex flex-col" style={{ transition: 'border-color 700ms ease-in-out, box-shadow 700ms ease-in-out' }}>
            {/* Image */}
            <div className="relative aspect-[4/3] bg-muted overflow-hidden flex-shrink-0">
                <Image
                    src={project.image}
                    alt={titleText}
                    fill
                    sizes={sizes}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading={priority ? "eager" : "lazy"}
                    quality={60}
                    priority={priority}
                />
            </div>

            {/* Content */}
            <div className="p-2.5 sm:p-4 flex flex-col flex-grow">
                {/* Tags */}
                <div className="mb-1.5 sm:mb-2 flex flex-wrap gap-1">
                    {project.tags.slice(0, maxTags).map((tag) => (
                        <span
                            key={tag}
                            className="px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-semibold bg-accent/10 text-accent rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-bold mb-1 group-hover:text-accent" style={{ transition: 'color 700ms ease-in-out' }}>
                    {titleText}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 flex-grow">
                    {descriptionText}
                </p>

                {/* Links */}
                <div className="flex gap-1.5 sm:gap-2 mt-auto">
                    {project.link && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs bg-accent/10 text-accent rounded hover:bg-accent hover:text-accent-foreground font-semibold"
                            style={{
                                transition: 'background-color 700ms ease-in-out, color 0ms'
                            }}
                            aria-label={`View ${titleText} demo`}
                        >
                            <Icon icon="lucide:external-link" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {demoText}
                        </a>
                    )}
                    {project.github && (
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs border border-border rounded hover:bg-secondary font-semibold"
                            style={{ transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out' }}
                            aria-label={`View ${titleText} source code`}
                        >
                            <Icon icon="lucide:github" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {codeText}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
