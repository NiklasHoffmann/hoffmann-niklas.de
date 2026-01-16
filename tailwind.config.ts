import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            screens: {
                // Extra small devices (large phones)
                'xs': '480px',
                // Small devices (tablets)
                'tablet': '640px',
                // Medium devices (landscape tablets)
                // 'md': '768px', // Already defined by Tailwind
                // Large devices (laptops)
                'laptop': '1024px',
                // Extra large devices (desktops)
                'desktop': '1280px',
                // Mobile landscape: landscape orientation AND max height 500px (typical mobile)
                'mobile-landscape': { 'raw': '(orientation: landscape) and (max-height: 500px)' },
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: "hsl(var(--card))",
                "card-foreground": "hsl(var(--card-foreground))",
                primary: "hsl(var(--primary))",
                "primary-foreground": "hsl(var(--primary-foreground))",
                secondary: "hsl(var(--secondary))",
                "secondary-foreground": "hsl(var(--secondary-foreground))",
                accent: "hsl(var(--accent))",
                "accent-foreground": "hsl(var(--accent-foreground))",
                muted: "hsl(var(--muted))",
                "muted-foreground": "hsl(var(--muted-foreground))",
                destructive: "hsl(var(--destructive))",
                "destructive-foreground": "hsl(var(--destructive-foreground))",
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                // Stelle sicher, dass gray-Farben verfügbar sind
                gray: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                    950: '#030712',
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: {
                        height: "0",
                    },
                    to: {
                        height: "var(--radix-accordion-content-height)",
                    },
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)",
                    },
                    to: {
                        height: "0",
                    },
                },
                "scroll-chain": {
                    "0%": { opacity: "0.3", transform: "scale(0.8)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.3s ease-out",
                "accordion-up": "accordion-up 0.3s ease-out",
                "scroll-chain": "scroll-chain 0.6s ease-out",
            },
            transitionDuration: {
                '700': '700ms',
            },
            transitionTimingFunction: {
                'smooth': 'ease-in-out',
            },
        },
    },
    plugins: [
        require("tailwindcss/plugin"),
        require('@tailwindcss/container-queries'),
    ],
    future: {
        hoverOnlyWhenSupported: true,
    },
};
export default config;
