/**
 * LocalIcon Component
 * 
 * Drop-in replacement for @iconify/react's Icon component
 * Uses locally cached SVG files instead of external API calls
 * 
 * Benefits:
 * - No CORS issues
 * - Faster loading (local files)
 * - Works offline
 * - Better for production
 */

'use client';

import React from 'react';

interface IconProps {
    icon: string;
    className?: string;
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
}

/**
 * Icon name mapping: Iconify icon names → local cached filenames
 * 
 * Categories:
 * - brands: Brand & tech stack logos (keep original colors)
 * - services: Service category icons
 * - ui: UI elements & navigation (use currentColor)
 * - timeline: About section timeline (use currentColor)
 * - highlights: About section highlights (use currentColor)
 * - chat: Chat widget (use currentColor)
 * - admin: Admin panel (use currentColor)
 * - legal: Legal pages (use currentColor)
 * 
 * colored: true = Icon has original colors, use <img>
 * colored: false/undefined = Icon uses currentColor, use mask
 */
const ICON_MAP: Record<string, { file: string; colored?: boolean }> = {
    // Brand & Tech Stack Icons (keep original colors)
    'logos:react': { file: 'brand-react', colored: true },
    'logos:nextjs-icon': { file: 'brand-nextjs', colored: true },
    'logos:typescript-icon': { file: 'brand-typescript', colored: true },
    'logos:tailwindcss-icon': { file: 'brand-tailwind', colored: true },
    'logos:nodejs-icon': { file: 'brand-nodejs', colored: true },
    'logos:ethereum': { file: 'brand-ethereum', colored: true },
    'logos:figma': { file: 'brand-figma', colored: true },
    'logos:mongodb-icon': { file: 'brand-mongodb', colored: true },
    'logos:git-icon': { file: 'brand-git', colored: true },
    'logos:graphql': { file: 'brand-graphql', colored: true },
    'logos:metamask-icon': { file: 'brand-metamask', colored: true },
    'simple-icons:wagmi': { file: 'brand-wagmi' },
    'simple-icons:ipfs': { file: 'brand-ipfs' },
    'cryptocurrency:grt': { file: 'brand-thegraph' },
    'vscode-icons:file-type-reactjs': { file: 'service-webdev', colored: true },
    'vscode-icons:file-type-mongo': { file: 'service-database', colored: true },
    'vscode-icons:file-type-node': { file: 'service-backend', colored: true },
    'token-branded:wallet-connect': { file: 'service-wallet', colored: true },
    'skill-icons:expressjs-dark': { file: 'brand-express', colored: true },

    // Service Category Icons (use currentColor)
    'mdi:cube-outline': { file: 'ui-cube-outline' },
    'mdi:grid': { file: 'ui-grid' },

    // UI & Navigation Icons (use currentColor)
    'mdi:chevron-right': { file: 'ui-chevron-right' },
    'mdi:chevron-left': { file: 'ui-chevron-left' },
    'mdi:menu': { file: 'ui-menu' },
    'mdi:close': { file: 'ui-close' },
    'mdi:send': { file: 'ui-send' },
    'mdi:lightning-bolt': { file: 'ui-lightning' },
    'mdi:lightbulb-on': { file: 'ui-lightbulb' },

    // Timeline Icons (About Section - use currentColor)
    'mdi:rocket-launch': { file: 'timeline-rocket' },
    'mdi:briefcase': { file: 'timeline-briefcase' },
    'mdi:code-braces': { file: 'timeline-code' },

    // Highlights Icons (About Section - use currentColor)
    'mdi:web': { file: 'highlight-web' },
    'mdi:palette': { file: 'highlight-palette' },
    'mdi:api': { file: 'highlight-api' },
    'mdi:database': { file: 'highlight-database' },
    'mdi:responsive': { file: 'highlight-responsive' },

    // Chat Widget Icons (use currentColor)
    'mdi:chat': { file: 'chat-bubble' },
    'mdi:chat-outline': { file: 'chat-outline' },
    'mdi:window-minimize': { file: 'chat-minimize' },
    'mdi:window-maximize': { file: 'chat-maximize' },

    // Admin Panel Icons (use currentColor)
    'mdi:account-circle': { file: 'admin-user' },
    'mdi:message-text': { file: 'admin-message' },
    'mdi:shield-check': { file: 'admin-shield' },
    'mdi:clock': { file: 'admin-clock' },
    'mdi:delete': { file: 'admin-delete' },
    'mdi:check-circle': { file: 'admin-check' },
    'mdi:alert-circle': { file: 'admin-alert' },
    'mdi:loading': { file: 'admin-loader' },

    // Legal Pages Icons (use currentColor)
    'mdi:file-document': { file: 'legal-document' },
    'mdi:gavel': { file: 'legal-gavel' },
    'mdi:cookie': { file: 'legal-cookie' },
    'mdi:lock': { file: 'legal-lock' },
};

/**
 * Icon component - API-compatible with @iconify/react
 * 
 * Usage:
 * <Icon icon="mdi:chevron-right" className="w-6 h-6" />
 * <Icon icon="logos:react" width={24} height={24} />
 * <Icon icon="mdi:loading" width="1em" height="1em" />
 */
export function Icon({ icon, className = '', width, height, style }: IconProps) {
    // Map Iconify icon name to local filename
    const iconData = ICON_MAP[icon];
    
    if (!iconData) {
        console.warn(`[LocalIcon] Icon not found in cache: ${icon}`);
        // Fallback: return empty span with same dimensions
        return <span className={className} style={style} />;
    }

    const { file: localIcon, colored = false } = iconData;

    // Calculate dimensions - default to 1em if not specified
    const widthValue = width === '1em' ? '1em' : typeof width === 'number' ? `${width}px` : width;
    const heightValue = height === '1em' ? '1em' : typeof height === 'number' ? `${height}px` : height;

    // Inline styles for dimensions
    const inlineStyle: React.CSSProperties = {
        ...style,
        display: 'inline-block',
        verticalAlign: 'middle',
    };

    // Only set explicit width/height if provided
    if (widthValue) inlineStyle.width = widthValue;
    if (heightValue) inlineStyle.height = heightValue;

    // Brand logos with original colors: use <img> tag
    if (colored) {
        // Next.js logo gets a white border in dark mode for better contrast
        const isNextJs = icon === 'logos:nextjs-icon';
        
        return (
            <img
                src={`/icons/${localIcon}.svg`}
                alt=""
                className={`${className} ${isNextJs ? 'border border-transparent dark:border-white/20 rounded-full' : ''}`}
                style={{
                    ...inlineStyle,
                    ...(isNextJs && {
                        transition: 'border-color 700ms ease-in-out',
                    })
                }}
                draggable={false}
            />
        );
    }

    // Monochrome icons: use CSS mask for currentColor support
    // This allows the icon color to inherit from CSS text color
    return (
        <span
            className={className}
            style={{
                ...inlineStyle,
                maskImage: `url(/icons/${localIcon}.svg)`,
                WebkitMaskImage: `url(/icons/${localIcon}.svg)`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                backgroundColor: 'currentColor',
            }}
            aria-hidden="true"
        />
    );
}

// Named export for compatibility
export default Icon;
