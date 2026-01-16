/**
 * Fluid Responsive Utilities
 * Generates clamp() values for smooth scaling between breakpoints
 */

export const fluid = {
    /**
     * Fluid font size that scales between min and max
     * @param min - Minimum size in px
     * @param max - Maximum size in px
     * @param minVw - Viewport width where min applies (default: 320px)
     * @param maxVw - Viewport width where max applies (default: 1920px)
     */
    fontSize: (min: number, max: number, minVw = 320, maxVw = 1920) => {
        const slope = (max - min) / (maxVw - minVw);
        const yAxisIntersection = -minVw * slope + min;
        return `clamp(${min}px, ${yAxisIntersection.toFixed(2)}px + ${(slope * 100).toFixed(2)}vw, ${max}px)`;
    },

    /**
     * Fluid spacing that scales between min and max
     * @param min - Minimum spacing in rem
     * @param max - Maximum spacing in rem
     */
    spacing: (min: number, max: number) => {
        return `clamp(${min}rem, ${min}rem + ${(max - min) * 2}vw, ${max}rem)`;
    },

    /**
     * Fluid gap that scales smoothly
     * @param min - Minimum gap in px
     * @param max - Maximum gap in px
     */
    gap: (min: number, max: number) => {
        const mid = (min + max) / 2;
        return `clamp(${min}px, ${mid}px + 1vw, ${max}px)`;
    },

    /**
     * Predefined fluid typography scales
     */
    text: {
        xs: 'clamp(0.688rem, 0.65rem + 0.19vw, 0.75rem)',        // 11-12px
        sm: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',         // 12-14px
        base: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',         // 14-16px
        lg: 'clamp(1rem, 0.9rem + 0.5vw, 1.25rem)',              // 16-20px
        xl: 'clamp(1.125rem, 1rem + 0.625vw, 1.5rem)',           // 18-24px
        '2xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.875rem)',      // 20-30px
        '3xl': 'clamp(1.5rem, 1.3rem + 1vw, 2.25rem)',           // 24-36px
        '4xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 3rem)',        // 30-48px
        '5xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3.75rem)',       // 36-60px
    },

    /**
     * Predefined fluid spacing scales
     */
    space: {
        xs: 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',           // 4-8px
        sm: 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',               // 8-16px
        md: 'clamp(1rem, 0.8rem + 1vw, 2rem)',                   // 16-32px
        lg: 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',               // 24-48px
        xl: 'clamp(2rem, 1.5rem + 2.5vw, 4rem)',                 // 32-64px
        '2xl': 'clamp(3rem, 2rem + 5vw, 6rem)',                  // 48-96px
    }
};

/**
 * Responsive breakpoint utilities
 */
export const breakpoints = {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

/**
 * Container query sizes (for @container usage)
 */
export const containerSizes = {
    xs: '@xs',
    sm: '@sm',
    md: '@md',
    lg: '@lg',
    xl: '@xl',
} as const;

/**
 * Calculate responsive value based on viewport
 * Useful for inline styles when Tailwind classes aren't sufficient
 */
export function responsiveValue<T>(
    values: Partial<Record<keyof typeof breakpoints | 'default', T>>
): T | undefined {
    if (typeof window === 'undefined') return values.default;

    const width = window.innerWidth;

    if (width >= breakpoints['2xl'] && values['2xl']) return values['2xl'];
    if (width >= breakpoints.xl && values.xl) return values.xl;
    if (width >= breakpoints.lg && values.lg) return values.lg;
    if (width >= breakpoints.md && values.md) return values.md;
    if (width >= breakpoints.sm && values.sm) return values.sm;
    if (width >= breakpoints.xs && values.xs) return values.xs;

    return values.default;
}

/**
 * Smooth transition presets
 */
export const transitions = {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-300 ease-in-out',
    slow: 'transition-all duration-500 ease-in-out',
    smooth: 'transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'transition-all duration-500 cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Performance optimization utilities
 */
export const performance = {
    /**
     * GPU acceleration for transforms
     */
    gpu: 'transform-gpu will-change-transform backface-hidden',

    /**
     * Optimize for animations
     */
    animate: 'will-change-transform will-change-opacity',

    /**
     * Content containment for layout performance
     */
    contain: 'contain-layout contain-style contain-paint',
} as const;
