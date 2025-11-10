/**
 * Responsive configuration for chain rendering
 */
export interface ResponsiveChainConfig {
    mobile: {
        horizontalOffset: number;
        curveSize: number;
        sectionPadding: number;
        opacity: number;
    };
    tablet: {
        horizontalOffset: number;
        curveSize: number;
        sectionPadding: number;
        opacity: number;
    };
    desktop: {
        horizontalOffset: number;
        curveSize: number;
        sectionPadding: number;
        opacity: number;
    };
}

export const defaultChainConfig: ResponsiveChainConfig = {
    mobile: {
        horizontalOffset: 20,
        curveSize: 20,
        sectionPadding: 20,
        opacity: 0.3,
    },
    tablet: {
        horizontalOffset: 80,
        curveSize: 60,
        sectionPadding: 80,
        opacity: 0.45,
    },
    desktop: {
        horizontalOffset: 150,
        curveSize: 100,
        sectionPadding: 100,
        opacity: 0.6,
    },
};

/**
 * Get chain configuration based on screen width
 */
export function getChainConfig(screenSize: 'mobile' | 'tablet' | 'desktop', config: ResponsiveChainConfig = defaultChainConfig) {
    return config[screenSize];
}
