/**
 * UI Constants for consistent styling across the application
 * 
 * Transition durations are also defined as CSS variables in globals.css:
 * --transition-fast: 300ms
 * --transition-standard: 500ms
 * --transition-slow: 700ms
 * 
 * Global CSS overrides ensure all .transition-all and .transition-colors 
 * use --transition-slow (700ms) by default.
 */

// Animation & Transition Durations
export const TRANSITIONS = {
    /** Fast transitions for immediate feedback (buttons, hovers) - 300ms */
    FAST: 300,
    /** Standard transitions for most UI elements - 500ms */
    STANDARD: 500,
    /** Slow transitions for theme/language/interactive toggle changes - 700ms */
    SLOW: 700,
} as const;

// Interactive Mode
export const INTERACTIVE_MODE = {
    /** LocalStorage key for persisting interactive mode state */
    STORAGE_KEY: 'interactive-mode',
    /** Default value for SSR (must match to avoid hydration mismatch) */
    SSR_DEFAULT: false,
} as const;

// Toggle Button Sizes
export const TOGGLE_SIZES = {
    /** Square toggle buttons (Theme, Interactive) */
    SQUARE: { width: 36, height: 36 },
    /** Wide toggle button (Language) */
    WIDE: { width: 60, height: 36 },
} as const;

// Theme Colors
export const NEON_COLORS = {
    /** Bright neon colors for dark theme */
    DARK: {
        CYAN: '#00ffff',
        MAGENTA: '#ff00ff',
        LIME: '#00ff00',
        YELLOW: '#ffff00',
        HOT_PINK: '#ff0080',
        BLUE: '#0080ff',
        ORANGE: '#ff8000',
    },
    /** Darker neon colors for better contrast in light theme */
    LIGHT: {
        CYAN: '#00b8b8',
        MAGENTA: '#cc00cc',
        LIME: '#00cc00',
        YELLOW: '#cccc00',
        HOT_PINK: '#cc0066',
        BLUE: '#0066cc',
        ORANGE: '#cc6600',
    },
} as const;
