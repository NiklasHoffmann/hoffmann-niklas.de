interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

export function SectionHeader({ title, subtitle, className = '' }: SectionHeaderProps) {
    return (
        <div className={`text-center ${className}`}>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
                {title}
            </h2>
            {subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-2">
                    {subtitle}
                </p>
            )}
            <div className="w-16 h-1 bg-gradient-to-r from-accent to-transparent mx-auto mt-2 sm:mt-3" />
        </div>
    );
}
