'use client';

import { useEffect, useRef, useState } from 'react';

export function ChainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Track window size and scroll
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: document.documentElement.scrollHeight,
      });
    };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Draw chain background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const horizontalOffset = 200;
      const curveSize = 125;

      // Alle Sections inkl. Footer
      const mainSections = Array.from(document.querySelectorAll('main > *')) as HTMLElement[];
      const footer = document.querySelector('footer') as HTMLElement;
      const sections = footer ? [...mainSections, footer] : mainSections;

      // Erstelle Pfad als Array von Punkten
      const pathPoints: { x: number; y: number }[] = [];

      // Startpunkt
      pathPoints.push({ x: horizontalOffset, y: 0 });

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (i % 2 === 0) {
          // LINKS
          if (i < sections.length - 1) {
            const targetX = width - horizontalOffset;
            const padding = 80;
            const horizontalY = sectionBottom - padding;

            // Vertikale Linie - viele Punkte für feine Kettenglieder
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            const verticalEnd = horizontalY - curveSize;
            for (let y = verticalStart; y <= verticalEnd; y += 10) {
              pathPoints.push({ x: horizontalOffset, y });
            }
            pathPoints.push({ x: horizontalOffset, y: verticalEnd });

            // Kurve 1 - sehr fein aufgelöst
            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = horizontalOffset + curveSize - curveSize * Math.cos(rad);
              const y = horizontalY - curveSize + curveSize * Math.sin(rad);
              pathPoints.push({ x, y });
            }

            // Horizontale Linie
            const horizontalStart = horizontalOffset + curveSize;
            const horizontalEnd = targetX - curveSize;
            for (let x = horizontalStart; x <= horizontalEnd; x += 10) {
              pathPoints.push({ x, y: horizontalY });
            }
            pathPoints.push({ x: horizontalEnd, y: horizontalY });

            // Kurve 2
            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = targetX - curveSize + curveSize * Math.sin(rad);
              const y = horizontalY + curveSize - curveSize * Math.cos(rad);
              pathPoints.push({ x, y });
            }
          } else {
            // Letzte Section
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            for (let y = verticalStart; y <= sectionBottom; y += 10) {
              pathPoints.push({ x: horizontalOffset, y });
            }
            pathPoints.push({ x: horizontalOffset, y: sectionBottom });
          }
        } else {
          // RECHTS
          if (i < sections.length - 1) {
            const targetX = horizontalOffset;
            const padding = 80;
            const horizontalY = sectionBottom - padding;

            // Vertikale Linie
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            const verticalEnd = horizontalY - curveSize;
            for (let y = verticalStart; y <= verticalEnd; y += 10) {
              pathPoints.push({ x: width - horizontalOffset, y });
            }
            pathPoints.push({ x: width - horizontalOffset, y: verticalEnd });

            // Kurve 1
            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = width - horizontalOffset - curveSize + curveSize * Math.cos(rad);
              const y = horizontalY - curveSize + curveSize * Math.sin(rad);
              pathPoints.push({ x, y });
            }

            // Horizontale Linie
            const horizontalStart = width - horizontalOffset - curveSize;
            const horizontalEnd = targetX + curveSize;
            for (let x = horizontalStart; x >= horizontalEnd; x -= 10) {
              pathPoints.push({ x, y: horizontalY });
            }
            pathPoints.push({ x: horizontalEnd, y: horizontalY });

            // Kurve 2
            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = targetX + curveSize - curveSize * Math.sin(rad);
              const y = horizontalY + curveSize - curveSize * Math.cos(rad);
              pathPoints.push({ x, y });
            }
          } else {
            // Letzte Section
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            for (let y = verticalStart; y <= sectionBottom; y += 10) {
              pathPoints.push({ x: width - horizontalOffset, y });
            }
            pathPoints.push({ x: width - horizontalOffset, y: sectionBottom });
          }
        }
      }

      // Zeichne Panzerkette - flache, seitlich versetzte Glieder
      const linkWidth = 5;  // Feiner: 5px (war 6px)
      const linkHeight = 11; // Feiner: 11px (war 14px)
      const spacing = 7; // Enger für feinere Optik

      let distance = 0;
      let linkIndex = 0;

      for (let i = 0; i < pathPoints.length - 1; i++) {
        const p1 = pathPoints[i];
        const p2 = pathPoints[i + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        let currentDist = distance;

        while (currentDist < segmentLength) {
          const t = currentDist / segmentLength;
          const x = p1.x + dx * t;
          const y = p1.y + dy * t;

          // Alternierender seitlicher Versatz (nicht Rotation!)
          const isEven = linkIndex % 2 === 0;
          const sideOffset = isEven ? -1.5 : 1.5; // Kleinerer Versatz für feinere Kette

          // Berechne seitlichen Versatz relativ zur Pfadrichtung
          const offsetX = sideOffset * Math.sin(angle);
          const offsetY = sideOffset * -Math.cos(angle);

          ctx.save();
          ctx.translate(x + offsetX, y + offsetY);
          ctx.rotate(angle); // ALLE Glieder gleiche Rotation (entlang Pfad)

          // Z-Order Effekt: ungerade Glieder im Vordergrund
          const zOrder = isEven ? 0 : 1;

          if (zOrder === 0) {
            // Hintere Glieder - stärkerer Schatten
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 2;
          } else {
            // Vordere Glieder - leichterer Schatten
            ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 0.5;
            ctx.shadowOffsetY = 1;
          }

          // Äußere dunkle Kontur (feiner)
          ctx.strokeStyle = '#52525b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, linkHeight / 2, linkWidth / 2, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Basis-Füllung mit Gradient-Effekt (sehr silbern)
          const gradient = ctx.createLinearGradient(0, -linkWidth / 2, 0, linkWidth / 2);
          if (zOrder === 1) {
            // Vordere Glieder - sehr hell/silbern
            gradient.addColorStop(0, '#ffffff');    // Weiß oben
            gradient.addColorStop(0.2, '#fafafa');  // Fast weiß
            gradient.addColorStop(0.4, '#f4f4f5');  // Sehr hell
            gradient.addColorStop(0.6, '#e4e4e7');  // Hell
            gradient.addColorStop(0.8, '#d4d4d8');  // Mittel
            gradient.addColorStop(1, '#c4c4c9');    // Etwas dunkler unten
          } else {
            // Hintere Glieder - etwas dunkler aber noch silbern
            gradient.addColorStop(0, '#fafafa');
            gradient.addColorStop(0.2, '#f4f4f5');
            gradient.addColorStop(0.4, '#e4e4e7');
            gradient.addColorStop(0.6, '#d4d4d8');
            gradient.addColorStop(0.8, '#a1a1aa');
            gradient.addColorStop(1, '#8a8a94');
          }

          ctx.fillStyle = gradient;
          ctx.shadowColor = 'transparent';
          ctx.beginPath();
          ctx.ellipse(0, 0, linkHeight / 2 - 1.5, linkWidth / 2 - 1.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Starker heller Glanz oben (Lichtreflektion) - noch stärker
          ctx.fillStyle = zOrder === 1 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.ellipse(-0.5, -1, linkHeight / 2 - 2.5, linkWidth / 2 - 2.5, 0, Math.PI * 0.6, Math.PI * 1.4);
          ctx.fill();

          // Mittlerer Glanz (sehr silbrig)
          ctx.fillStyle = 'rgba(250, 250, 250, 0.6)';
          ctx.beginPath();
          ctx.ellipse(0, -0.5, linkHeight / 2 - 2, linkWidth / 2 - 2, 0, Math.PI * 0.8, Math.PI * 1.2);
          ctx.fill();

          // Innerer Schatten unten (feiner)
          ctx.fillStyle = 'rgba(82, 82, 91, 0.25)';
          ctx.beginPath();
          ctx.ellipse(0.3, 1, linkHeight / 2 - 2.5, linkWidth / 2 - 2.5, 0, Math.PI * 1.6, Math.PI * 2.4);
          ctx.fill();

          // Zusätzliche silberne Kontur für Schärfe (heller)
          ctx.strokeStyle = 'rgba(228, 228, 231, 0.95)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(0, 0, linkHeight / 2 - 1.5, linkWidth / 2 - 1.5, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();

          currentDist += spacing;
          linkIndex++;
        }

        distance = currentDist - segmentLength;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute top-0 left-0 pointer-events-none z-0"
      suppressHydrationWarning
    />
  );
}
