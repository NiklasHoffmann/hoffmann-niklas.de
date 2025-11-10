import { ChainColorConfig, ChainPathConfig } from '@/types/chain';

interface LinkRenderParams {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    angle: number;
    linkIndex: number;
    config: ChainPathConfig;
    colors: ChainColorConfig;
    isDark?: boolean;
    sectionIndex?: number; // Section-Index für Neon-Farben
    isInteractive?: boolean; // Interaktiver Modus an/aus
}

// Hilfsfunktion für Bounce-Easing
function easeOutBounce(x: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

// Panzer-Stil (aktuell)
export function renderPanzerLink({ ctx, x, y, angle, linkIndex, config, colors }: LinkRenderParams) {
    const { linkWidth, linkHeight } = config;
    const isEven = linkIndex % 2 === 0;
    const sideOffset = isEven ? -1.5 : 1.5;

    const offsetX = sideOffset * Math.sin(angle);
    const offsetY = sideOffset * -Math.cos(angle);

    ctx.save();
    ctx.translate(x + offsetX, y + offsetY);
    ctx.rotate(angle);

    const zOrder = isEven ? 0 : 1;

    // Shadow
    if (zOrder === 0) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;
    } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;
    }

    // Outer stroke
    ctx.strokeStyle = colors.panzer.outerStroke;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, linkHeight / 2, linkWidth / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, -linkWidth / 2, 0, linkWidth / 2);
    const gradientColors = zOrder === 1 ? colors.panzer.gradientLight : colors.panzer.gradientDark;
    gradientColors.forEach((color, i) => {
        gradient.addColorStop(i / (gradientColors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.ellipse(0, 0, linkHeight / 2 - 1.5, linkWidth / 2 - 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gloss effects
    ctx.fillStyle = colors.panzer.gloss[zOrder === 1 ? 0 : 1];
    ctx.beginPath();
    ctx.ellipse(-0.5, -1, linkHeight / 2 - 2.5, linkWidth / 2 - 2.5, 0, Math.PI * 0.6, Math.PI * 1.4);
    ctx.fill();

    ctx.fillStyle = colors.panzer.gloss[2];
    ctx.beginPath();
    ctx.ellipse(0, -0.5, linkHeight / 2 - 2, linkWidth / 2 - 2, 0, Math.PI * 0.8, Math.PI * 1.2);
    ctx.fill();

    // Inner shadow
    ctx.fillStyle = colors.panzer.innerShadow;
    ctx.beginPath();
    ctx.ellipse(0.3, 1, linkHeight / 2 - 2.5, linkWidth / 2 - 2.5, 0, Math.PI * 1.6, Math.PI * 2.4);
    ctx.fill();

    // Accent stroke
    ctx.strokeStyle = colors.panzer.accentStroke;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, linkHeight / 2 - 1.5, linkWidth / 2 - 1.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

// Classic-Stil (einfache Kettenglieder)
export function renderClassicLink({ ctx, x, y, angle, linkIndex, config, colors }: LinkRenderParams) {
    const { linkWidth, linkHeight } = config;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Shadow
    ctx.shadowColor = colors.classic.shadow;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    // Outline
    ctx.strokeStyle = colors.classic.stroke;
    ctx.lineWidth = 2;
    ctx.fillStyle = colors.classic.fill;

    ctx.beginPath();
    ctx.ellipse(0, 0, linkHeight / 2, linkWidth / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

// Minimal-Stil (sehr schlicht)
export function renderMinimalLink({ ctx, x, y, angle, linkIndex, config, colors }: LinkRenderParams) {
    const { linkWidth, linkHeight } = config;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.strokeStyle = colors.minimal.stroke;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = colors.minimal.fill;

    ctx.beginPath();
    ctx.ellipse(0, 0, linkHeight / 2, linkWidth / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

// Bold-Stil (kräftig und auffällig)
export function renderBoldLink({ ctx, x, y, angle, linkIndex, config, colors }: LinkRenderParams) {
    const { linkWidth, linkHeight } = config;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Strong shadow
    ctx.shadowColor = colors.bold.shadow;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    // Gradient fill
    const gradient = ctx.createRadialGradient(0, -linkWidth / 3, 0, 0, 0, linkHeight / 2);
    colors.bold.gradient.forEach((color, i) => {
        gradient.addColorStop(i / (colors.bold.gradient.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, linkHeight / 2, linkWidth / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thick outline
    ctx.strokeStyle = colors.bold.stroke;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}

// Line-Stil (einfacher durchgehender Strich)
export function renderLineLink({ ctx, x, y, angle, linkIndex, config, colors }: LinkRenderParams) {
    // Für Line-Stil zeichnen wir nichts einzeln - wird als Pfad gerendert
    // Diese Funktion wird nicht aufgerufen, aber muss existieren
}

// Cubic-Stil (Coole 3D-Würfel mit Licht und Schatten)
export function renderCubicLink({ ctx, x, y, angle, linkIndex, config, colors, isDark = true, sectionIndex = 0, isInteractive = true }: LinkRenderParams) {
    const { linkWidth, linkHeight } = config;
    const cubeSize = linkHeight || 20;

    // Neon-Farben für den Glow-Effekt
    const neonColors = [
        '#00ffff', // Cyan - Section 0 (Hero)
        '#ff00ff', // Magenta - Section 1 (About)
        '#00ff00', // Lime - Section 2 (Services)
        '#ffff00', // Yellow - Section 3 (Portfolio)
        '#ff0080', // Hot Pink - Section 4 (Videos)
        '#0080ff', // Blue - Section 5 (Contact)
        '#ff8000', // Orange - Section 6 (Footer)
    ];

    // Jede Section hat ihre eigene Farbe
    const neonColor = neonColors[sectionIndex % neonColors.length];

    // In jeder Section: 10 Würfel nebeneinander, aber mit 15 Würfeln Abstand von oben
    // Würfel 15-24 sind Neon (statt 0-9)
    // Nur wenn Interactive Mode aktiv ist
    const hasNeonGlow = isInteractive && linkIndex >= 15 && linkIndex < 25;

    // Chain-Würfel sind statisch - kein Hover, kein Tilt
    const hoverOffset = 0;
    const hoverRotation = 0;
    const hoverScale = 1;

    // Isometrische Projektion - alle 3 Seiten gleich groß
    // Verwende 30° Winkel (cos(30°) und sin(30°))
    const cos30 = Math.sqrt(3) / 2;  // ≈ 0.866
    const sin30 = 0.5;

    // Für perfekte Isometrie
    const w = cubeSize * cos30 * hoverScale;  // Horizontale Ausdehnung mit Scale
    const h = cubeSize * sin30 * hoverScale;  // Vertikale Ausdehnung mit Scale

    ctx.save();
    ctx.translate(x, y - hoverOffset); // Würfel bewegt sich nach oben bei Hover
    ctx.rotate(angle);

    // Perspektivische Rotation - jeder Würfel etwas anders + Hover
    // Verwendet linkIndex für konsistente aber unterschiedliche Rotation
    const baseRotation = Math.sin(linkIndex * 0.8) * 0.2; // Stärkere Basis-Variation (±11.5°)
    const wobble = Math.sin(linkIndex * 2.1) * 0.1; // Extra Wobble für Organik
    ctx.rotate(Math.PI / 2 + baseRotation + wobble + hoverRotation);

    // Scale anwenden
    if (hoverScale !== 1) {
        ctx.scale(hoverScale, hoverScale);
    }

    // Theme-abhängige Basisfarben - lebendig und mit Kontrast
    const baseHue = isDark ? 200 : 220; // Blau-Ton
    const saturation = isDark ? '40%' : '50%';

    // Schatten - für Neon-Würfel: leuchtender Neon-Schatten
    if (hasNeonGlow) {
        // Pulsierender Neon-Schatten - EXTREM VERSTÄRKT
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 2 + linkIndex * 0.3) * 0.5 + 0.5; // 0 bis 1
        const glowIntensity = 0.8 + pulse * 0.2; // 0.8 bis 1.0

        // Mehrfacher Glow für intensiveren Effekt
        ctx.shadowColor = neonColor;
        ctx.shadowBlur = 150 + pulse * 100; // 150-250px pulsierender Glow (ultra stark)
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    } else {
        // Normale Würfel: Standard-Schatten
        const shadowIntensity = 1 + (hoverOffset / 15) * 1.2; // Bis zu 120% stärker
        ctx.shadowColor = isDark ? `rgba(255, 255, 255, ${0.3 * shadowIntensity})` : `rgba(0, 0, 0, ${0.5 * shadowIntensity})`;
        ctx.shadowBlur = 15 + hoverOffset * 1.2;
        ctx.shadowOffsetX = 8 + hoverOffset * 0.6;
        ctx.shadowOffsetY = 10 + hoverOffset * 1.2;
    }

    // LINKE SEITE - dunkelste Seite (von Licht abgewandt)
    // Parallelogramm: gleiche Breite und Höhe wie die anderen Seiten
    const leftGradient = ctx.createLinearGradient(-w, -h, 0, -h - cubeSize * hoverScale);
    if (hasNeonGlow) {
        // Neon-Würfel: Hellere, kräftigere Farben
        leftGradient.addColorStop(0, `${neonColor}99`); // 60% Opazität
        leftGradient.addColorStop(0.5, `${neonColor}cc`); // 80% Opazität
        leftGradient.addColorStop(1, neonColor); // 100% volle Farbe
    } else if (isDark) {
        leftGradient.addColorStop(0, '#52525b');
        leftGradient.addColorStop(0.5, '#71717a');
        leftGradient.addColorStop(1, '#a1a1aa');
    } else {
        leftGradient.addColorStop(0, '#18181b');
        leftGradient.addColorStop(0.5, '#27272a');
        leftGradient.addColorStop(1, '#3f3f46');
    }

    ctx.fillStyle = leftGradient;
    ctx.beginPath();
    ctx.moveTo(0, -cubeSize);           // Oben
    ctx.lineTo(-w, -h - cubeSize);      // Links-Oben
    ctx.lineTo(-w, -h);                 // Links-Unten
    ctx.lineTo(0, 0);                   // Unten
    ctx.closePath();
    ctx.fill();

    // RECHTE SEITE - mittlere Helligkeit (seitliches Licht)
    ctx.shadowColor = 'transparent'; // Kein Schatten für die anderen Seiten

    const rightGradient = ctx.createLinearGradient(0, -h - cubeSize * hoverScale, w, -h);
    if (hasNeonGlow) {
        // Neon-Würfel: Volle Helligkeit
        rightGradient.addColorStop(0, neonColor); // 100%
        rightGradient.addColorStop(0.5, neonColor); // 100%
        rightGradient.addColorStop(1, `${neonColor}cc`); // 80%
    } else if (isDark) {
        rightGradient.addColorStop(0, '#a1a1aa');
        rightGradient.addColorStop(0.5, '#d4d4d8');
        rightGradient.addColorStop(1, '#71717a');
    } else {
        rightGradient.addColorStop(0, '#3f3f46');
        rightGradient.addColorStop(0.5, '#71717a');
        rightGradient.addColorStop(1, '#27272a');
    }

    ctx.fillStyle = rightGradient;
    ctx.beginPath();
    ctx.moveTo(0, -cubeSize);           // Oben
    ctx.lineTo(w, -h - cubeSize);       // Rechts-Oben
    ctx.lineTo(w, -h);                  // Rechts-Unten
    ctx.lineTo(0, 0);                   // Unten
    ctx.closePath();
    ctx.fill();

    // OBERE SEITE - hellste Seite (Licht von oben)
    // Raute (Diamant) - exakt gleiche Proportionen wie die Seiten
    const topGradient = ctx.createLinearGradient(0, -cubeSize * hoverScale - 2 * h, 0, -cubeSize);
    if (hasNeonGlow) {
        // Neon-Würfel: Hellste Seite mit voller Neon-Farbe
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 2 + linkIndex * 0.5) * 0.5 + 0.5;
        const brightness = 0.8 + pulse * 0.2; // Leichtes Pulsieren
        topGradient.addColorStop(0, `${neonColor}${Math.floor(brightness * 255).toString(16).padStart(2, '0')}`);
        topGradient.addColorStop(0.5, neonColor);
        topGradient.addColorStop(1, `${neonColor}cc`);
    } else if (isDark) {
        topGradient.addColorStop(0, '#e4e4e7');
        topGradient.addColorStop(0.5, '#a1a1aa');
        topGradient.addColorStop(1, '#71717a');
    } else {
        topGradient.addColorStop(0, '#52525b');
        topGradient.addColorStop(0.5, '#3f3f46');
        topGradient.addColorStop(1, '#27272a');
    }

    ctx.fillStyle = topGradient;
    ctx.beginPath();
    ctx.moveTo(0, -cubeSize);           // Vorne
    ctx.lineTo(-w, -h - cubeSize);      // Links
    ctx.lineTo(0, -cubeSize - 2 * h);   // Hinten
    ctx.lineTo(w, -h - cubeSize);       // Rechts
    ctx.closePath();
    ctx.fill();

    // Schwarze Konturen für alle drei Seiten - NACH dem Füllen
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)'; // Etwas transparenter
    ctx.lineWidth = 0.5; // Dünner
    ctx.lineJoin = 'miter'; // Scharfe Ecken
    ctx.lineCap = 'square';

    // Linke Seite Kontur
    ctx.beginPath();
    ctx.moveTo(0, -cubeSize);
    ctx.lineTo(-w, -h - cubeSize);
    ctx.lineTo(-w, -h);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.stroke();

    // Rechte Seite Kontur
    ctx.beginPath();
    ctx.moveTo(0, -cubeSize);
    ctx.lineTo(w, -h - cubeSize);
    ctx.lineTo(w, -h);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.stroke();

    // Obere Seite Kontur
    ctx.beginPath();
    ctx.moveTo(0, -cubeSize);
    ctx.lineTo(-w, -h - cubeSize);
    ctx.lineTo(0, -cubeSize - 2 * h);
    ctx.lineTo(w, -h - cubeSize);
    ctx.closePath();
    ctx.stroke();

    // Akzent-Linie an der vorderen Kante
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -cubeSize);
    ctx.stroke();

    // Extra Glow-Layer für Neon-Würfel (ähnlich wie bei den Links)
    if (hasNeonGlow) {
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 2 + linkIndex * 0.3) * 0.5 + 0.5;

        // Zweiter Glow-Layer für noch intensiveren Effekt
        ctx.shadowColor = neonColor;
        ctx.shadowBlur = 180 + pulse * 120; // 180-300px für ultra starken Glow
        ctx.globalAlpha = 0.8 + pulse * 0.2; // Sehr stark sichtbar (0.8-1.0)

        // Zeichne eine transparente Kopie für den zusätzlichen Glow
        ctx.fillStyle = 'transparent';

        // Linke Seite
        ctx.beginPath();
        ctx.moveTo(0, -cubeSize);
        ctx.lineTo(-w, -h - cubeSize);
        ctx.lineTo(-w, -h);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Rechte Seite
        ctx.beginPath();
        ctx.moveTo(0, -cubeSize);
        ctx.lineTo(w, -h - cubeSize);
        ctx.lineTo(w, -h);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Obere Seite
        ctx.beginPath();
        ctx.moveTo(0, -cubeSize);
        ctx.lineTo(-w, -h - cubeSize);
        ctx.lineTo(0, -cubeSize - 2 * h);
        ctx.lineTo(w, -h - cubeSize);
        ctx.closePath();
        ctx.fill();

        // DRITTER Glow-Layer für maximale Strahlkraft
        ctx.shadowBlur = 250 + pulse * 150; // 250-400px für extremen Hintergrund-Glow
        ctx.globalAlpha = 0.5 + pulse * 0.3; // 0.5-0.8

        // Nochmal alle Seiten für dritten Layer
        ctx.beginPath();
        ctx.moveTo(0, -cubeSize);
        ctx.lineTo(-w, -h - cubeSize);
        ctx.lineTo(-w, -h);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -cubeSize);
        ctx.lineTo(w, -h - cubeSize);
        ctx.lineTo(w, -h);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -cubeSize);
        ctx.lineTo(-w, -h - cubeSize);
        ctx.lineTo(0, -cubeSize - 2 * h);
        ctx.lineTo(w, -h - cubeSize);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    ctx.restore();
}

// Render-Funktion auswählen basierend auf Style
export function getLinkRenderer(style: string) {
    switch (style) {
        case 'panzer':
            return renderPanzerLink;
        case 'classic':
            return renderClassicLink;
        case 'minimal':
            return renderMinimalLink;
        case 'bold':
            return renderBoldLink;
        case 'line':
            return renderLineLink;
        case 'cubic':
            return renderCubicLink;
        default:
            return renderPanzerLink;
    }
}
