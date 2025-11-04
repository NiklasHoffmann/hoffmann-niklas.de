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
    desktop: {
        horizontalOffset: number;
        curveSize: number;
        sectionPadding: number;
        opacity: number;
    };
}

export const defaultChainConfig: ResponsiveChainConfig = {
    mobile: {
        horizontalOffset: 10,
        curveSize: 40,
        sectionPadding: 30,
        opacity: 0.3,
    },
    desktop: {
        horizontalOffset: 150,
        curveSize: 100,
        sectionPadding: 60,
        opacity: 0.6,
    },
};

/**
 * Get chain configuration based on screen width
 */
export function getChainConfig(isMobile: boolean, config: ResponsiveChainConfig = defaultChainConfig) {
    return isMobile ? config.mobile : config.desktop;
}
