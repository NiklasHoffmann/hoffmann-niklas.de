import { ChainColorConfig, ChainPathConfig } from '@/types/chain';

interface LinkRenderParams {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    angle: number;
    linkIndex: number;
    config: ChainPathConfig;
    colors: ChainColorConfig;
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
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;
    } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 0.5;
        ctx.shadowOffsetY = 1;
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
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

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
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

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
        default:
            return renderPanzerLink;
    }
}
