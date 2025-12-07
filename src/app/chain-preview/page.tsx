'use client';

import { useEffect, useRef, useState } from 'react';
import { CHAIN_PRESETS, CHAIN_COLORS } from '@/types/chain';
import { getLinkRenderer } from '@/lib/chainRenderers';
import QRCode from 'qrcode';

export default function ChainPreviewPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef2 = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<'line' | 'cubic'>('line');
    const [isDark, setIsDark] = useState(true);
    const [qrCodeImage, setQrCodeImage] = useState<HTMLImageElement | null>(null);

    // Generiere QR-Code
    useEffect(() => {
        QRCode.toDataURL('hoffmann-niklas.de/de', {
            width: 512,
            margin: 0, // KEIN weißer Rand
            errorCorrectionLevel: 'L', // Niedrigste Fehlerkorrektur = weniger, größere Module
            color: {
                dark: '#000000',
                light: '#00000000' // Transparent statt weiß
            }
        }).then(url => {
            const img = new Image();
            img.onload = () => setQrCodeImage(img);
            img.src = url;
        });
    }, []);

    // Funktion zum Rendern einer Section
    const renderSection = (canvas: HTMLCanvasElement, sectionNumber: 1 | 2) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = 1700;
        const height = 1100;
        canvas.width = width;
        canvas.height = height;

        const config = CHAIN_PRESETS[mode];

        ctx.clearRect(0, 0, width, height);

        // Hintergrund
        ctx.fillStyle = isDark ? '#090909' : '#ffffff';
        ctx.fillRect(0, 0, width, height);

        const { curveSize, sectionPadding, spacing } = config;

        const maxContentWidth = 1280;
        const screenWidth = width;
        const contentOffsetLeft = (screenWidth - maxContentWidth) / 2;
        const availableSpace = contentOffsetLeft;

        let horizontalOffset: number;
        if (availableSpace >= 80) {
            horizontalOffset = availableSpace / 2;
        } else if (availableSpace >= 40) {
            horizontalOffset = availableSpace / 2;
        } else if (availableSpace >= 20) {
            horizontalOffset = availableSpace / 3;
        } else {
            horizontalOffset = 10;
        }

        const pathPoints: { x: number; y: number; sectionIndex: number }[] = [];

        if (sectionNumber === 1) {
            // Section 1: Links runter -> Kurve rechts -> horizontal -> Kurve runter -> endet
            pathPoints.push({ x: horizontalOffset, y: 0, sectionIndex: 0 });

            const targetX = width - horizontalOffset;
            const horizontalY = height - sectionPadding;

            const verticalEnd = horizontalY - curveSize;
            for (let y = 0; y <= verticalEnd; y += 10) {
                pathPoints.push({ x: horizontalOffset, y, sectionIndex: 0 });
            }

            for (let angle = 0; angle <= 90; angle += 5) {
                const rad = (angle * Math.PI) / 180;
                const x = horizontalOffset + curveSize - curveSize * Math.cos(rad);
                const y = horizontalY - curveSize + curveSize * Math.sin(rad);
                pathPoints.push({ x, y, sectionIndex: 0 });
            }

            for (let x = horizontalOffset + curveSize; x <= targetX - curveSize; x += 10) {
                pathPoints.push({ x, y: horizontalY, sectionIndex: 0 });
            }

            for (let angle = 0; angle <= 90; angle += 5) {
                const rad = (angle * Math.PI) / 180;
                const x = targetX - curveSize + curveSize * Math.sin(rad);
                const y = horizontalY + curveSize - curveSize * Math.cos(rad);
                pathPoints.push({ x, y, sectionIndex: 0 });
            }

            pathPoints.push({ x: targetX, y: horizontalY + curveSize, sectionIndex: 0 });
        } else {
            // Section 2: Rechts runter -> Kurve links -> horizontal -> Kurve runter -> endet
            const startX = width - horizontalOffset;
            pathPoints.push({ x: startX, y: 0, sectionIndex: 0 });

            const targetX = horizontalOffset;
            const horizontalY = height - sectionPadding;

            const verticalEnd = horizontalY - curveSize;
            for (let y = 0; y <= verticalEnd; y += 10) {
                pathPoints.push({ x: startX, y, sectionIndex: 0 });
            }

            for (let angle = 0; angle <= 90; angle += 5) {
                const rad = (angle * Math.PI) / 180;
                const x = startX - curveSize + curveSize * Math.cos(rad);
                const y = horizontalY - curveSize + curveSize * Math.sin(rad);
                pathPoints.push({ x, y, sectionIndex: 0 });
            }

            for (let x = startX - curveSize; x >= targetX + curveSize; x -= 10) {
                pathPoints.push({ x, y: horizontalY, sectionIndex: 0 });
            }

            for (let angle = 0; angle <= 90; angle += 5) {
                const rad = (angle * Math.PI) / 180;
                const x = targetX + curveSize - curveSize * Math.sin(rad);
                const y = horizontalY + curveSize - curveSize * Math.cos(rad);
                pathPoints.push({ x, y, sectionIndex: 0 });
            }

            pathPoints.push({ x: targetX, y: horizontalY + curveSize, sectionIndex: 0 });
        }

        const renderLink = getLinkRenderer(config.style);

        // Draw chain
        if (config.style === 'line') {
            ctx.beginPath();
            ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
            for (let i = 1; i < pathPoints.length; i++) {
                ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
            }
            ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        } else {
            let distance = 0;
            let sectionLinkIndex = 0;
            let currentSection = 0;

            for (let i = 0; i < pathPoints.length - 1; i++) {
                const p1 = pathPoints[i];
                const p2 = pathPoints[i + 1];

                if (p1.sectionIndex !== currentSection) {
                    currentSection = p1.sectionIndex;
                    sectionLinkIndex = 0;
                }

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const segmentLength = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                let currentDist = distance;

                while (currentDist < segmentLength) {
                    const t = currentDist / segmentLength;
                    const x = p1.x + dx * t;
                    const y = p1.y + dy * t;

                    // Section 1 = Index 0 (Cyan - Hero), Section 2 = Index 5 (Blue - Contact)
                    const colorSectionIndex = sectionNumber === 1 ? 0 : 5;

                    renderLink({
                        ctx, x, y, angle,
                        linkIndex: sectionLinkIndex,
                        config,
                        colors: CHAIN_COLORS,
                        isDark,
                        sectionIndex: colorSectionIndex,
                        isInteractive: true
                    });
                    currentDist += spacing;
                    sectionLinkIndex++;
                }
                distance = currentDist - segmentLength;
            }
        }

        // Text hinzufügen (nur für Section 1)
        if (sectionNumber === 1) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const centerX = width / 2;
            const centerY = height / 2;

            // Name
            ctx.font = 'bold 120px "Geist Sans", sans-serif';
            ctx.fillStyle = isDark ? '#ffffff' : '#000000';
            ctx.fillText('NIKLAS HOFFMANN', centerX, centerY - 100);

            // Titel
            ctx.font = '60px "Geist Sans", sans-serif';
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)';
            ctx.fillText('Full-Stack Web Developer', centerX, centerY + 20);

            // Akzent-Linie in Neon-Farbe der "Über mich" Section (Section 1 = Magenta)
            const neonColor = '#ff00ff'; // Magenta - Section 1 (Über mich)
            ctx.strokeStyle = neonColor;
            ctx.lineWidth = 4;
            ctx.shadowColor = neonColor;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.moveTo(centerX - 200, centerY + 80);
            ctx.lineTo(centerX + 200, centerY + 80);
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow

            // Website
            ctx.font = '45px "Geist Sans", sans-serif';
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
            ctx.fillText('hoffmann-niklas.de', centerX, centerY + 150);
        }

        // 3D QR-Code Würfel für Section 2
        if (sectionNumber === 2 && qrCodeImage) {
            const cubeSize = 400; // Noch größerer Würfel

            // Berechne die tatsächliche Höhe des Würfels in der Isometrie
            const w = cubeSize * 0.866; // cos(30°)
            const h = cubeSize * 0.5;   // sin(30°)
            const totalHeight = cubeSize + 2 * h; // Gesamthöhe des Würfels

            // Zentriere den Würfel komplett (inkl. seiner Höhe)
            const centerX = width / 2;
            const centerY = height / 2 + totalHeight / 2;

            ctx.save();
            ctx.translate(centerX, centerY);

            // Schwebeshatten unter dem Würfel (wie beim Services Cube)
            // MUSS VOR allen Würfel-Pfaden gezeichnet werden
            ctx.save();
            ctx.translate(0, -15); // Position unter dem Würfel

            // Blur-Filter für weichen Rand
            ctx.filter = 'blur(30px)';

            // Radialer Gradient für weichen Schatten
            const shadowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 1.2 + 50);
            if (isDark) {
                shadowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)'); // Weniger weiß in der Mitte
                shadowGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
                shadowGradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
            } else {
                shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
                shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
                shadowGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
            }
            ctx.fillStyle = shadowGradient;

            // Leichte perspektivische Verzerrung für nach hinten gekippte Ellipse
            ctx.save();
            ctx.transform(1, 0, 0, 0.75, 0, 0); // Y-Achse stärker gestaucht (0.75 = 25% flacher)

            // Ellipse für den Schatten - deutlich größer
            ctx.beginPath();
            ctx.ellipse(0, 0, w * 1.2 + 50, (w * 0.4) + 20, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            ctx.filter = 'none'; // Filter zurücksetzen
            ctx.restore();

            // Isometrische 3D-Würfel Projektion (w und h bereits oben berechnet)

            // Linke Seite (mit QR-Code)
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, -cubeSize);
            ctx.lineTo(-w, -h - cubeSize);
            ctx.lineTo(-w, -h);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.clip();

            // Grauer Gradient als Hintergrund (BEVOR Transformation)
            // Linke Seite = dunkler für besseren Kontrast zum hellen QR-Schatten
            const leftGradient = ctx.createLinearGradient(0, -cubeSize, -w, -h);
            leftGradient.addColorStop(0, isDark ? '#d1d5db' : '#f3f4f6'); // Mittel hell oben
            leftGradient.addColorStop(0.5, isDark ? '#9ca3af' : '#d1d5db'); // Mittel
            leftGradient.addColorStop(1, isDark ? '#6b7280' : '#9ca3af'); // Dunkler unten
            ctx.fillStyle = leftGradient;
            ctx.fillRect(-w, -h - cubeSize, w, cubeSize + h);

            // Transformiere Canvas für die isometrische linke Seite
            // Mapping: (0,0) -> (0, 0), (1,0) -> (-w, -h), (0,1) -> (0, -cubeSize), (1,1) -> (-w, -h-cubeSize)
            ctx.save();

            // Richtige affine Transformation für die linke Parallelogramm-Seite
            // x' = a*x + c*y + e
            // y' = b*x + d*y + f
            // Vector (1,0) -> (-w, -h)
            // Vector (0,1) -> (0, -cubeSize)
            // Origin (0,0) -> (0, 0)
            ctx.transform(
                -w / 512,        // a: x-Richtung horizontal
                -h / 512,        // b: x-Richtung vertikal
                0,               // c: y-Richtung horizontal
                -cubeSize / 512, // d: y-Richtung vertikal
                0,               // e: x-Offset
                0                // f: y-Offset
            );

            // QR-Code mit weniger Rand
            const qrMargin = 512 * 0.05; // 5% Rand (halb so viel wie vorher)
            const qrSize = 512 - qrMargin * 2;

            // QR-Code um 180 Grad drehen
            ctx.save();
            ctx.translate(256, 256); // Zur Mitte bewegen
            ctx.rotate(Math.PI); // 180 Grad = PI Radiant
            ctx.translate(-256, -256); // Zurück

            // Sehr starker heller Schatten um die schwarzen QR-Code Elemente
            ctx.shadowColor = 'rgba(255, 255, 255, 1.0)'; // Voll deckend
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.drawImage(
                qrCodeImage,
                qrMargin, qrMargin,
                qrSize, qrSize
            );

            // Zweite Schicht mit noch stärkerem, weiterem Schatten
            ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
            ctx.shadowBlur = 12;

            ctx.drawImage(
                qrCodeImage,
                qrMargin, qrMargin,
                qrSize, qrSize
            );

            // Dritte Schicht für maximale Abhebung
            ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
            ctx.shadowBlur = 18;

            ctx.drawImage(
                qrCodeImage,
                qrMargin, qrMargin,
                qrSize, qrSize
            );

            ctx.restore(); // Rotation zurücksetzen

            ctx.restore();
            ctx.restore();

            // Rechte Seite (mit verbessertem Gradient)
            // Rechte Seite = dunkler für besseren Kontrast
            const rightGradient = ctx.createLinearGradient(0, -cubeSize, w, -h);
            rightGradient.addColorStop(0, isDark ? '#d1d5db' : '#f3f4f6'); // Mittel hell oben
            rightGradient.addColorStop(0.5, isDark ? '#9ca3af' : '#d1d5db'); // Mittel
            rightGradient.addColorStop(1, isDark ? '#6b7280' : '#9ca3af'); // Dunkler unten
            ctx.fillStyle = rightGradient;
            ctx.beginPath();
            ctx.moveTo(0, -cubeSize);
            ctx.lineTo(w, -h - cubeSize);
            ctx.lineTo(w, -h);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();

            // Oberseite (mit Gradient und Glanz)
            // Oberseite = dunkler, Gradient von vorne nach hinten
            const topGradient = ctx.createLinearGradient(0, -cubeSize, 0, -2 * h - cubeSize);
            topGradient.addColorStop(0, isDark ? '#d1d5db' : '#f3f4f6'); // Vorne mittel hell
            topGradient.addColorStop(0.5, isDark ? '#9ca3af' : '#d1d5db'); // Mitte
            topGradient.addColorStop(1, isDark ? '#6b7280' : '#9ca3af'); // Hinten dunkler
            ctx.fillStyle = topGradient;
            ctx.beginPath();
            ctx.moveTo(0, -cubeSize);
            ctx.lineTo(w, -h - cubeSize);
            ctx.lineTo(0, -2 * h - cubeSize);
            ctx.lineTo(-w, -h - cubeSize);
            ctx.closePath();
            ctx.fill();

            // Glanz auf Oberseite
            const glossGradient = ctx.createRadialGradient(0, -cubeSize - h, 0, 0, -cubeSize - h, w);
            glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glossGradient;
            ctx.beginPath();
            ctx.moveTo(0, -cubeSize);
            ctx.lineTo(w, -h - cubeSize);
            ctx.lineTo(0, -2 * h - cubeSize);
            ctx.lineTo(-w, -h - cubeSize);
            ctx.closePath();
            ctx.fill();

            // Schwarze Konturen
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.lineWidth = 3;
            ctx.lineJoin = 'miter';

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

            // Oberseite Kontur
            ctx.beginPath();
            ctx.moveTo(0, -cubeSize);
            ctx.lineTo(w, -h - cubeSize);
            ctx.lineTo(0, -2 * h - cubeSize);
            ctx.lineTo(-w, -h - cubeSize);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const canvas2 = canvasRef2.current;
        if (!canvas || !canvas2) return;

        renderSection(canvas, 1);
        renderSection(canvas2, 2);
    }, [mode, isDark, qrCodeImage]);

    const downloadImage = (sectionNumber: 1 | 2) => {
        const canvas = sectionNumber === 1 ? canvasRef.current : canvasRef2.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `chain-section${sectionNumber}-${mode}-${isDark ? 'dark' : 'light'}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-8 gap-8">
            {/* Controls */}
            <div className="flex gap-4 flex-wrap justify-center">
                <button
                    onClick={() => setMode('line')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'line'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                >
                    Line Mode
                </button>
                <button
                    onClick={() => setMode('cubic')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'cubic'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                >
                    Cubic Mode
                </button>
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="px-6 py-3 rounded-lg font-semibold bg-gray-700 text-white hover:bg-gray-600 transition-all"
                >
                    {isDark ? '🌙 Dark' : '☀️ Light'}
                </button>
            </div>

            {/* Section 1 */}
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-white text-xl font-bold">Section 1</h2>
                <div className="border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
                    <canvas
                        ref={canvasRef}
                        style={{
                            width: '850px',
                            height: '550px',
                            display: 'block'
                        }}
                    />
                </div>
                <button
                    onClick={() => downloadImage(1)}
                    className="px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all"
                >
                    📥 Download Section 1 (1700x1100)
                </button>
            </div>

            {/* Section 2 */}
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-white text-xl font-bold">Section 2</h2>
                <div className="border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
                    <canvas
                        ref={canvasRef2}
                        style={{
                            width: '850px',
                            height: '550px',
                            display: 'block'
                        }}
                    />
                </div>
                <button
                    onClick={() => downloadImage(2)}
                    className="px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all"
                >
                    📥 Download Section 2 (1700x1100)
                </button>
            </div>

            {/* Info */}
            <div className="text-white text-sm opacity-70 text-center">
                Preview: 850x550 px (50% scale) • Export: 1700x1100 px (85:55 ratio)
            </div>
        </div>
    );
}
