interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

export function SectionHeader({ title, subtitle, className = '' }: SectionHeaderProps) {
    return (
        <div className={`text-center ${className}`}>
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4">
                {title}
            </h2>
            {subtitle && (
                <>
                    <p className="text-xs xs:text-sm sm:text-base md:text-lg text-muted-foreground max-w-xs xs:max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-3 xs:px-4 mb-2 sm:mb-3 md:mb-4">
                        {subtitle}
                    </p>
                    <div className="w-12 xs:w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-accent to-transparent mx-auto" />
                </>
            )}
        </div>
    );
}
