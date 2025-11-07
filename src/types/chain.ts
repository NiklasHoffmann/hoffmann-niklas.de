// Chain-Konfigurationstypen

export type ChainStyle = 'panzer' | 'classic' | 'minimal' | 'bold' | 'line' | 'cubic';

export interface ChainPathConfig {
    // Layout
    horizontalOffset: number;  // Abstand vom Rand
    curveSize: number;         // Größe der Kurven
    sectionPadding: number;    // Abstand vom Section-Ende

    // Link Eigenschaften
    linkWidth: number;         // Breite der Kettenglieder
    linkHeight: number;        // Höhe der Kettenglieder
    spacing: number;           // Abstand zwischen Gliedern

    // Visual Style
    style: ChainStyle;
}

export interface ChainColorConfig {
    // Panzer Style
    panzer: {
        outerStroke: string;
        gradientLight: string[];
        gradientDark: string[];
        gloss: string[];
        innerShadow: string;
        accentStroke: string;
    };

    // Classic Style
    classic: {
        stroke: string;
        fill: string;
        shadow: string;
    };

    // Minimal Style
    minimal: {
        stroke: string;
        fill: string;
    };

    // Bold Style
    bold: {
        stroke: string;
        fill: string;
        shadow: string;
        gradient: string[];
    };

    // Line Style
    line: {
        stroke: string;
        width: number;
        shadow?: string;
    };

    // Cubic Style (3D Würfel)
    cubic: {
        sideDark: string;       // Dunkelste Seite (links)
        sideMedium: string;     // Mittlere Seite (rechts)
        sideLight: string;      // Helle Seite
        topLight: string;       // Oberseite hell
        topHighlight: string;   // Oberseite Glanz
        outline: string;        // Umriss
        string: string;         // Schnur-Farbe
    };
}

// Preset Konfigurationen
export const CHAIN_PRESETS: Record<string, ChainPathConfig> = {
    // Aktuelle Konfiguration (Default)
    default: {
        horizontalOffset: 200,
        curveSize: 125,
        sectionPadding: 80,
        linkWidth: 5,
        linkHeight: 11,
        spacing: 7,
        style: 'panzer',
    },

    // Kompakte Version
    compact: {
        horizontalOffset: 150,
        curveSize: 80,
        sectionPadding: 60,
        linkWidth: 4,
        linkHeight: 9,
        spacing: 6,
        style: 'panzer',
    },

    // Große, auffällige Chain
    bold: {
        horizontalOffset: 250,
        curveSize: 150,
        sectionPadding: 100,
        linkWidth: 7,
        linkHeight: 14,
        spacing: 9,
        style: 'bold',
    },

    // Minimalistisch
    minimal: {
        horizontalOffset: 100,
        curveSize: 60,
        sectionPadding: 40,
        linkWidth: 3,
        linkHeight: 7,
        spacing: 5,
        style: 'minimal',
    },

    // Klassischer Stil
    classic: {
        horizontalOffset: 180,
        curveSize: 100,
        sectionPadding: 70,
        linkWidth: 6,
        linkHeight: 12,
        spacing: 8,
        style: 'classic',
    },

    // Feiner Strich
    line: {
        horizontalOffset: 150,  // Desktop: Normale Abstände vom Rand
        curveSize: 100,
        sectionPadding: 60,
        linkWidth: 2,
        linkHeight: 0,  // Wird nicht verwendet bei line
        spacing: 0,     // Durchgehende Linie
        style: 'line',
    },

    // 3D Würfel an Schnur
    cubic: {
        horizontalOffset: 200,
        curveSize: 125,
        sectionPadding: 80,
        linkWidth: 7,    // Breite (für spacing)
        linkHeight: 7,   // Würfelgröße
        spacing: 16,     // Kleinerer Abstand zwischen Würfeln
        style: 'cubic',
    },
};

// Farb-Konfigurationen
export const CHAIN_COLORS: ChainColorConfig = {
    panzer: {
        outerStroke: '#52525b',
        gradientLight: ['#ffffff', '#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#c4c4c9'],
        gradientDark: ['#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#8a8a94'],
        gloss: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)', 'rgba(250, 250, 250, 0.6)'],
        innerShadow: 'rgba(82, 82, 91, 0.25)',
        accentStroke: 'rgba(228, 228, 231, 0.95)',
    },

    classic: {
        stroke: '#71717a',
        fill: '#a1a1aa',
        shadow: 'rgba(0, 0, 0, 0.3)',
    },

    minimal: {
        stroke: '#d4d4d8',
        fill: '#fafafa',
    },

    bold: {
        stroke: '#27272a',
        fill: '#71717a',
        shadow: 'rgba(0, 0, 0, 0.4)',
        gradient: ['#a1a1aa', '#71717a', '#52525b', '#3f3f46'],
    },

    line: {
        stroke: '#d4d4d8',
        width: 2,
        shadow: 'rgba(0, 0, 0, 0.05)',
    },

    cubic: {
        sideDark: '#52525b',        // Linke Seite (dunkel)
        sideMedium: '#71717a',      // Rechte Seite (medium)
        sideLight: '#a1a1aa',       // Rechte Seite hell
        topLight: '#d4d4d8',        // Oberseite
        topHighlight: '#e4e4e7',    // Glanz auf Oberseite
        outline: '#27272a',         // Schwarzer Umriss
        string: '#7c3aed',          // Dunkleres Lila für Light-Theme (mehr Kontrast)
    },
};
