/**
 * Transition Utilities
 * 
 * Centralized transition styles to avoid duplication and ensure consistency.
 * All transitions use 700ms for theme-related changes (colors, backgrounds, borders)
 * and 300ms for interactive feedback (hover, active states).
 */

/**
 * Standard 700ms transition for theme-aware properties
 */
const theme = (props: string[]) => props.map(p => `${p} 700ms ease-in-out`).join(', ');

/**
 * Standard 300ms transition for interactive feedback
 */
const interactive = (props: string[]) => props.map(p => `${p} 300ms ease-in-out`).join(', ');

/**
 * Pre-defined common transitions for consistent usage
 */
export const TRANSITIONS = {
    // Single property transitions (700ms)
    background: 'background-color 700ms ease-in-out',
    border: 'border-color 700ms ease-in-out',
    text: 'color 700ms ease-in-out',
    opacity: 'opacity 700ms ease-in-out',

    // Combined theme transitions (700ms)
    colors: theme(['background-color', 'border-color', 'color']),
    backgroundAndBorder: theme(['background-color', 'border-color']),
    borderAndShadow: theme(['border-color', 'box-shadow']),
    card: theme(['background-color', 'border-color', 'box-shadow']),
    backgroundAndText: theme(['background-color', 'color']),

    // Mixed transitions (theme + interactive)
    button: 'all 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out',
    buttonColors: 'all 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out, color 700ms ease-in-out',

    // Special cases
    none: 'none',
    colorInstant: 'color 0ms', // For special cases where color should change instantly
} as const;

