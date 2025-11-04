'use client';

import { useEffect, useRef, useState } from 'react';
import { ChainPathConfig, CHAIN_PRESETS, CHAIN_COLORS } from '@/types/chain';
import { getLinkRenderer } from '@/lib/chainRenderers';
import { throttle, isMobileDevice } from '@/lib/utils';
import { getChainConfig } from '@/config/chain';

interface ChainBackgroundProps {
  preset?: keyof typeof CHAIN_PRESETS;
  customConfig?: Partial<ChainPathConfig>;
}

export function ChainBackground({ preset = 'default', customConfig }: ChainBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get responsive config
  const responsiveConfig = getChainConfig(isMobile);

  const config: ChainPathConfig = {
    ...CHAIN_PRESETS[preset],
    ...customConfig,
    horizontalOffset: responsiveConfig.horizontalOffset,
    curveSize: responsiveConfig.curveSize,
    sectionPadding: responsiveConfig.sectionPadding,
  };

  useEffect(() => {
    const handleResize = () => {
      // Debounce resize events
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        const width = window.innerWidth;
        setIsMobile(isMobileDevice(width));
        setDimensions({
          width,
          height: document.documentElement.scrollHeight,
        });
        // Mark as ready after first dimension update
        setIsReady(true);
      }, 50);
    };

    // Throttled scroll handler
    const handleScroll = throttle(() => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    }, 16); // ~60fps

    // Initial setup
    handleResize();

    // Re-calculate dimensions after a short delay (for language change)
    const timeoutId = setTimeout(handleResize, 100);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent flickering: keep canvas visible during resize
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const { curveSize, sectionPadding, spacing, style } = config;

      // Dynamisch berechne horizontalOffset basierend auf Content-Breite
      // Maximale Content-Breite ist typischerweise 1280px (max-w-7xl in Tailwind)
      const maxContentWidth = 1280;
      const screenWidth = width;
      const contentMargin = Math.max(0, (screenWidth - maxContentWidth) / 2);
      // Chain soll in der Mitte zwischen Bildschirm-Rand und Content-Rand sein
      const horizontalOffset = contentMargin > 0 ? contentMargin / 2 : responsiveConfig.horizontalOffset;

      const mainSections = Array.from(document.querySelectorAll('main > *')) as HTMLElement[];
      const footer = document.querySelector('footer') as HTMLElement;
      const sections = footer ? [...mainSections, footer] : mainSections;

      const pathPoints: { x: number; y: number }[] = [];
      pathPoints.push({ x: horizontalOffset, y: 0 });

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (i % 2 === 0) {
          if (i < sections.length - 1) {
            const targetX = width - horizontalOffset;
            const horizontalY = sectionBottom - sectionPadding;
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            const verticalEnd = horizontalY - curveSize;

            for (let y = verticalStart; y <= verticalEnd; y += 10) {
              pathPoints.push({ x: horizontalOffset, y });
            }
            pathPoints.push({ x: horizontalOffset, y: verticalEnd });

            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = horizontalOffset + curveSize - curveSize * Math.cos(rad);
              const y = horizontalY - curveSize + curveSize * Math.sin(rad);
              pathPoints.push({ x, y });
            }

            const horizontalStart = horizontalOffset + curveSize;
            const horizontalEnd = targetX - curveSize;
            for (let x = horizontalStart; x <= horizontalEnd; x += 10) {
              pathPoints.push({ x, y: horizontalY });
            }
            pathPoints.push({ x: horizontalEnd, y: horizontalY });

            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = targetX - curveSize + curveSize * Math.sin(rad);
              const y = horizontalY + curveSize - curveSize * Math.cos(rad);
              pathPoints.push({ x, y });
            }
          } else {
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            for (let y = verticalStart; y <= sectionBottom; y += 10) {
              pathPoints.push({ x: horizontalOffset, y });
            }
            pathPoints.push({ x: horizontalOffset, y: sectionBottom });
          }
        } else {
          if (i < sections.length - 1) {
            const targetX = horizontalOffset;
            const horizontalY = sectionBottom - sectionPadding;
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            const verticalEnd = horizontalY - curveSize;

            for (let y = verticalStart; y <= verticalEnd; y += 10) {
              pathPoints.push({ x: width - horizontalOffset, y });
            }
            pathPoints.push({ x: width - horizontalOffset, y: verticalEnd });

            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = width - horizontalOffset - curveSize + curveSize * Math.cos(rad);
              const y = horizontalY - curveSize + curveSize * Math.sin(rad);
              pathPoints.push({ x, y });
            }

            const horizontalStart = width - horizontalOffset - curveSize;
            const horizontalEnd = targetX + curveSize;
            for (let x = horizontalStart; x >= horizontalEnd; x -= 10) {
              pathPoints.push({ x, y: horizontalY });
            }
            pathPoints.push({ x: horizontalEnd, y: horizontalY });

            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = targetX + curveSize - curveSize * Math.sin(rad);
              const y = horizontalY + curveSize - curveSize * Math.cos(rad);
              pathPoints.push({ x, y });
            }
          } else {
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            for (let y = verticalStart; y <= sectionBottom; y += 10) {
              pathPoints.push({ x: width - horizontalOffset, y });
            }
            pathPoints.push({ x: width - horizontalOffset, y: sectionBottom });
          }
        }
      }

      const renderLink = getLinkRenderer(style);

      // Zeichne Kettenglieder oder Linie
      if (style === 'line') {
        // Line-Stil: Zeichne durchgehenden Pfad
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);

        for (let i = 1; i < pathPoints.length; i++) {
          ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
        }

        ctx.strokeStyle = CHAIN_COLORS.line.stroke;
        // Verwende linkWidth aus config für die Liniendicke
        ctx.lineWidth = config.linkWidth || CHAIN_COLORS.line.width;

        // Sehr subtiler Schatten
        if (CHAIN_COLORS.line.shadow) {
          ctx.shadowColor = CHAIN_COLORS.line.shadow;
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0.5;
          ctx.shadowOffsetY = 0.5;
        }

        // Glattere Linie
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      } else {
        // Andere Stile: Zeichne einzelne Kettenglieder
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

            renderLink({ ctx, x, y, angle, linkIndex, config, colors: CHAIN_COLORS });
            currentDist += spacing;
            linkIndex++;
          }
          distance = currentDist - segmentLength;
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, config]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 transition-opacity duration-700 ease-out pointer-events-none"
      style={{
        opacity: isReady ? (isMobile ? 0.3 : 0.6) : 0,
        willChange: 'transform',
        zIndex: 0
      }}
      suppressHydrationWarning
    />
  );
}
