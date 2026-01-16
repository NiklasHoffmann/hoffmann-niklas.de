'use client';

import { ReactNode } from 'react';
import { useDevice } from '@/contexts/DeviceContext';

interface SectionProps {
    id: string;
    children: ReactNode;
    className?: string;
    /** Background gradient style - default is the standard gradient */
    background?: 'default' | 'none' | 'secondary';
    /** Whether to include animated background elements */
    animatedBackground?: boolean;
    /** Custom key for forcing re-renders */
    sectionKey?: string | number;
    /** Use semantic <footer> element instead of <section> */
    asFooter?: boolean;
}

export function Section({
    id,
    children,
    className = '',
    background = 'default',
    animatedBackground = false,
    sectionKey,
    asFooter = false
}: SectionProps) {
    const { isMobileLandscape } = useDevice();

    const backgroundClasses = {
        default: 'bg-gradient-to-br from-background via-background to-secondary/20',
        secondary: 'bg-secondary/5',
        none: 'bg-background'
    };

    const Tag = asFooter ? 'footer' : 'section';

    return (
        <Tag
            id={id}
            key={sectionKey}
            className={`
                scroll-snap-section relative w-full @container
                ${asFooter ? 'min-h-screen' : 'h-screen max-h-screen'}
                flex items-center justify-center outline-none
                ${backgroundClasses[background]}
                ${isMobileLandscape ? 'pt-16' : 'pt-14 sm:pt-16'}
                ${className}
            `.trim().replace(/\s+/g, ' ')}
            style={{
                scrollMarginTop: '0px',
                willChange: 'auto',
                contain: 'layout style paint'
            }}
            tabIndex={-1}
        >
            {/* Animated background elements - hidden on mobile landscape for performance */}
            {animatedBackground && !isMobileLandscape && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl gpu-pulse" />
                    <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl gpu-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl" />
                </div>
            )}

            {/* Content Container */}
            <div className={`
                relative z-10 w-full h-full
                ${isMobileLandscape
                    ? 'flex items-center px-20'
                    : 'flex flex-col items-center justify-center px-5 md:px-20 lg:px-[150px]'
                }
            `.trim().replace(/\s+/g, ' ')}>
                {children}
            </div>
        </Tag>
    );
}

/** 
 * Content wrapper for mobile landscape left side (typically text content)
 */
export function SectionLeft({ children, className = '' }: { children: ReactNode; className?: string }) {
    const { isMobileLandscape } = useDevice();

    if (!isMobileLandscape) return null;

    // Check if custom width is provided
    const hasCustomWidth = className.includes('w-');

    return (
        <div className={`${hasCustomWidth ? '' : 'flex-1'} flex flex-col items-center justify-center text-center ${className}`}>
            {children}
        </div>
    );
}

/**
 * Content wrapper for mobile landscape right side (typically media/interactive content)
 */
export function SectionRight({ children, className = '' }: { children: ReactNode; className?: string }) {
    const { isMobileLandscape } = useDevice();

    if (!isMobileLandscape) return null;

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            {children}
        </div>
    );
}

/**
 * Content wrapper for non-mobile-landscape layouts (desktop, tablet, mobile portrait)
 */
export function SectionDefault({ children, className = '' }: { children: ReactNode; className?: string }) {
    const { isMobileLandscape } = useDevice();

    if (isMobileLandscape) return null;

    // Chain-safe max-widths: Ensure content stays within chain boundaries
    // Mobile (320px): 320 - 40 (2×20px) = 280px → max-w-xs (320px) OK
    // Tablet (768px): 768 - 160 (2×80px) = 608px → max-w-2xl (672px) TIGHT
    // Desktop (1920px): 1920 - 300 (2×150px) = 1620px → max-w-6xl (1152px) SAFE
    return (
        <div className={`text-center w-full mx-auto max-w-xs xs:max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl ${className}`}>
            {children}
        </div>
    );
}
