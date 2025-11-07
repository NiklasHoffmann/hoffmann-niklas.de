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
    mousePos?: { x: number; y: number }; // Mausposition für Hover-Effekt
    time?: number; // Zeit für Animation
    sectionIndex?: number; // Section-Index für Neon-Farben
    deviceTilt?: { x: number; y: number }; // Device Orientation für Mobile
    isInteractive?: boolean; // Interaktiver Modus an/aus
}

// Cache für Würfel-Animationszustände
const cubeStates = new Map<number, {
    currentOffset: number;
    currentRotation: number;
    currentScale: number;
    targetOffset: number;
    targetRotation: number;
    targetScale: number;
    velocity: number; // Für Bounce-Effekt
    randomFactor: number; // Zufälliger Faktor pro Würfel
}>();

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
export function renderCubicLink({ ctx, x, y, angle, linkIndex, config, colors, isDark = true, mousePos, sectionIndex = 0, deviceTilt, isInteractive = true }: LinkRenderParams) {
    const { linkWidth, linkHeight } = config;
    const cubeSize = linkHeight || 20;

    // Neon-Farben für den Glow-Effekt
    const neonColors = [
        '#00ffff', // Cyan - Section 0
        '#ff00ff', // Magenta - Section 1
        '#00ff00', // Lime - Section 2
        '#ffff00', // Yellow - Section 3
        '#ff0080', // Hot Pink - Section 4
        '#0080ff', // Blue - Section 5
    ];

    // Jede Section hat ihre eigene Farbe
    const neonColor = neonColors[sectionIndex % neonColors.length];

    // In jeder Section: 10 Würfel nebeneinander, aber mit 15 Würfeln Abstand von oben
    // Würfel 15-24 sind Neon (statt 0-9)
    // Nur wenn Interactive Mode aktiv ist
    const hasNeonGlow = isInteractive && linkIndex >= 15 && linkIndex < 25;

    // Initialisiere oder hole Zustand für diesen Würfel
    if (!cubeStates.has(linkIndex)) {
        cubeStates.set(linkIndex, {
            currentOffset: 0,
            currentRotation: 0,
            currentScale: 1,
            targetOffset: 0,
            targetRotation: 0,
            targetScale: 1,
            velocity: 0,
            randomFactor: Math.random() * 0.5 + 0.75, // 0.75 - 1.25
        });
    }

    const state = cubeStates.get(linkIndex)!;

    // Berechne Zielwerte basierend auf Mausposition
    let targetOffset = 0;
    let targetRotation = 0;
    let targetScale = 1;

    // Device Tilt für Mobile/Tablet
    if (deviceTilt && (deviceTilt.x !== 0 || deviceTilt.y !== 0)) {
        // Nutze Tilt für subtile Würfelbewegung
        const tiltStrength = Math.sqrt(deviceTilt.x * deviceTilt.x + deviceTilt.y * deviceTilt.y);
        const variation = Math.sin(linkIndex * 1.3) * 0.3 + state.randomFactor;
        const rotationVariation = Math.cos(linkIndex * 0.7) * 0.6 + 0.4;

        targetOffset = tiltStrength * 15 * variation; // Sanfte Bewegung
        targetRotation = deviceTilt.x * 0.5 * rotationVariation; // Rotation basierend auf links/rechts Neigung
        targetScale = 1 + tiltStrength * 0.1 * variation; // Leichte Vergrößerung
    }

    if (mousePos) {
        const dx = x - mousePos.x;
        const dy = y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const hoverRadius = 80; // Präziser Radius - nur direkt um Würfel

        if (distance < hoverRadius) {
            const rawStrength = 1 - (distance / hoverRadius);
            const strength = 1 - Math.pow(1 - rawStrength, 3);

            // Mehr Zufall durch mehrere Faktoren
            const variation = Math.sin(linkIndex * 1.3) * 0.3 + state.randomFactor;
            const rotationVariation = Math.cos(linkIndex * 0.7) * 0.6 + 0.4;

            // Mouse hover überschreibt Device Tilt
            targetOffset = strength * 35 * variation; // Bis zu 35px (statt 25px)
            targetRotation = strength * 1.3 * rotationVariation; // Mehr Rotation (statt 0.9)
            targetScale = 1 + strength * 0.5 * variation; // Bis zu 50% größer (statt 30%)
        }
    }

    // Physics-based animation - kurzer Bounce, dann Stopp
    const stiffness = 0.5;  // Hohe Federkraft = schnelle Reaktion
    const damping = 0.6;    // Dämpfung = Bounce stoppt schnell

    // Berechne Beschleunigung (Feder-Kraft)
    const offsetForce = (targetOffset - state.currentOffset) * stiffness;
    state.velocity = (state.velocity + offsetForce) * damping;
    state.currentOffset += state.velocity;

    // Bei sehr kleiner Velocity -> snap to target (kein endloses Nachschwingen)
    if (Math.abs(state.velocity) < 0.05 && Math.abs(targetOffset - state.currentOffset) < 0.5) {
        state.currentOffset = targetOffset;
        state.velocity = 0;
    }

    // Rotation und Scale mit smooth interpolation
    state.currentRotation += (targetRotation - state.currentRotation) * 0.5;
    state.currentScale += (targetScale - state.currentScale) * 0.5;

    // Wenn sehr nah an 0, snap to 0 für Performance
    if (Math.abs(state.currentOffset) < 0.1) state.currentOffset = 0;
    if (Math.abs(state.currentRotation) < 0.01) state.currentRotation = 0;
    if (Math.abs(state.currentScale - 1) < 0.01) state.currentScale = 1;

    const hoverOffset = state.currentOffset;
    const hoverRotation = state.currentRotation;
    const hoverScale = state.currentScale;

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
        // Pulsierender Neon-Schatten
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 3 + linkIndex * 0.5) * 0.5 + 0.5; // 0 bis 1
        const glowIntensity = 0.8 + pulse * 0.2; // 0.8 bis 1.0

        ctx.shadowColor = neonColor;
        ctx.shadowBlur = 50 + pulse * 30; // 50-80px pulsierender Glow (verstärkt)
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
