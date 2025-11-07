'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { ChainPathConfig, CHAIN_PRESETS, CHAIN_COLORS } from '@/types/chain';
import { getLinkRenderer } from '@/lib/chainRenderers';
import { throttle, isMobileDevice } from '@/lib/utils';
import { getChainConfig } from '@/config/chain';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

interface ChainBackgroundProps {
  preset?: keyof typeof CHAIN_PRESETS;
  customConfig?: Partial<ChainPathConfig>;
}

export function ChainBackground({ preset, customConfig }: ChainBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { isInteractive, mounted } = useInteractiveMode();
  const mousePosRef = useRef({ x: -1000, y: -1000 }); // Ref statt State für bessere Performance
  const deviceTiltRef = useRef({ x: 0, y: 0 }); // Für Device Orientation
  const animationFrameRef = useRef<number | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();
  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousInteractiveRef = useRef(isInteractive);
  const previousThemeRef = useRef(theme);
  // OPTIMIZATION: Cache scrollHeight to avoid recalculation on every scroll event
  const scrollHeightCache = useRef(0);

  // Get responsive config
  const responsiveConfig = getChainConfig(isMobile);

  // Dynamically select preset based on interactive mode - use useMemo to recalculate when isInteractive changes
  const config: ChainPathConfig = useMemo(() => {
    const activePreset = preset || (isInteractive ? 'cubic' : 'line');
    console.log('🎨 ChainBackground: Config recalculated, preset:', activePreset, 'isInteractive:', isInteractive);

    return {
      ...CHAIN_PRESETS[activePreset],
      ...customConfig,
      horizontalOffset: responsiveConfig.horizontalOffset,
      curveSize: responsiveConfig.curveSize,
      sectionPadding: responsiveConfig.sectionPadding,
    };
  }, [preset, isInteractive, customConfig, responsiveConfig]);

  // Handle smooth transition when interactive mode or theme changes
  useEffect(() => {
    if (!mounted) return;

    const interactiveChanged = previousInteractiveRef.current !== isInteractive;
    const themeChanged = previousThemeRef.current !== theme;

    // Only transition if something actually changed
    if (!interactiveChanged && !themeChanged) {
      return;
    }

    // Update refs
    previousInteractiveRef.current = isInteractive;
    previousThemeRef.current = theme;

    // Clear any existing intervals/timeouts
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    if (transitionIntervalRef.current) {
      clearInterval(transitionIntervalRef.current);
    }

    // Animate opacity: fade to 0.6, then back to 1.0 over 700ms
    const startTime = Date.now();
    const duration = 700;

    transitionIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Fade down to 0.6 in first half, then up to 1.0 in second half
      const opacity = progress < 0.5
        ? 1.0 - (progress * 2 * 0.4) // 1.0 -> 0.6
        : 0.6 + ((progress - 0.5) * 2 * 0.4); // 0.6 -> 1.0

      setTransitionOpacity(opacity);

      if (progress >= 1) {
        setTransitionOpacity(1);
        if (transitionIntervalRef.current) {
          clearInterval(transitionIntervalRef.current);
          transitionIntervalRef.current = null;
        }
      }
    }, 16); // ~60fps

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      if (transitionIntervalRef.current) {
        clearInterval(transitionIntervalRef.current);
      }
    };
  }, [isInteractive, theme, mounted]);

  useEffect(() => {
    const handleResize = () => {
      // Debounce resize events
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        const width = window.innerWidth;
        const height = document.documentElement.scrollHeight;
        setIsMobile(isMobileDevice(width));
        setDimensions({ width, height });
        // OPTIMIZATION: Update scrollHeight cache on resize
        scrollHeightCache.current = height - window.innerHeight;
        // Mark as ready after first dimension update
        setIsReady(true);
      }, 50);
    };

    // Handle visibility change (wichtig für Navigation zurück zur Seite)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page is visible again - force recalculation
        console.log('🎨 ChainBackground: Page visible again, recalculating dimensions');
        handleResize();
      }
    };

    // Handle orientation change on tablets
    const handleOrientationChange = () => {
      // Wait for browser to finish orientation change UI updates
      setTimeout(() => {
        // Force repaint für bessere Rotation-Anpassung
        setIsReady(false);
        requestAnimationFrame(() => {
          handleResize();
          requestAnimationFrame(() => {
            setIsReady(true);
          });
        });
      }, 300);
    };

    // Throttled scroll handler
    const handleScroll = throttle(() => {
      // OPTIMIZATION: Cache scrollHeight calculation to avoid forced reflow
      // Only recalculate on resize, not on every scroll
      const scrollHeight = scrollHeightCache.current;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    }, 16); // ~60fps

    // Mouse move handler - nur für cubic style
    const handleMouseMove = (e: MouseEvent) => {
      if (config.style === 'cubic' && isInteractive) {
        mousePosRef.current = { x: e.clientX, y: e.clientY + window.scrollY };
      }
    };

    // Device orientation handler - für mobile/tablet
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (config.style === 'cubic' && isMobile && isInteractive) {
        // beta: Neigung vorne/hinten (-180 bis 180)
        // gamma: Neigung links/rechts (-90 bis 90)
        const beta = e.beta || 0;
        const gamma = e.gamma || 0;

        // Normalisiere Werte zu -1 bis 1
        const normalizedGamma = Math.max(-1, Math.min(1, gamma / 45)); // -45° bis +45°
        const normalizedBeta = Math.max(-1, Math.min(1, (beta - 90) / 45)); // 45° bis 135° (90° ist aufrecht)

        deviceTiltRef.current = {
          x: normalizedGamma,
          y: normalizedBeta
        };
      }
    };

    // Request permission für iOS 13+
    const requestOrientationPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        } catch (error) {
          console.log('Device orientation permission denied');
        }
      } else {
        // Nicht-iOS oder ältere Versionen
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    };

    // Initial setup
    handleResize();

    // Re-calculate dimensions after a short delay (for language change)
    const timeoutId = setTimeout(handleResize, 100);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Device Orientation nur auf Mobile
    if (isMobile) {
      requestOrientationPermission();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [config.style, isMobile, isInteractive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    console.log('🎨 ChainBackground: Drawing with style:', config.style);

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

      // Dynamisch berechne horizontalOffset basierend auf tatsächlicher Content-Breite
      const mainSections = Array.from(document.querySelectorAll('main > *')) as HTMLElement[];
      const footer = document.querySelector('footer') as HTMLElement;
      const sections = footer ? [...mainSections, footer] : mainSections;

      // Finde die breiteste Content-Box (max-w-* Container) und deren Position
      let maxContentWidth = 0;
      let contentOffsetLeft = 0;

      sections.forEach(section => {
        const contentBox = section.querySelector('[class*="max-w-"]') as HTMLElement;
        if (contentBox) {
          const contentWidth = contentBox.offsetWidth;
          if (contentWidth > maxContentWidth) {
            maxContentWidth = contentWidth;
            // Berechne die tatsächliche Position des Content-Containers vom linken Bildschirmrand
            const rect = contentBox.getBoundingClientRect();
            contentOffsetLeft = rect.left;
          }
        }
      });

      // Fallback falls keine max-w-* Container gefunden wurden
      if (maxContentWidth === 0 || contentOffsetLeft === 0) {
        maxContentWidth = 1280;
        contentOffsetLeft = (width - 1280) / 2;
      }

      const screenWidth = width;
      // Verfügbarer Platz vom Bildschirmrand bis zum Content-Anfang
      const availableSpace = contentOffsetLeft;

      // Chain Position berechnen - in der Mitte des verfügbaren Platzes
      let horizontalOffset: number;

      if (availableSpace >= 80) {
        // Viel Platz (Desktop): Chain genau in der Mitte
        horizontalOffset = availableSpace / 2;
      } else if (availableSpace >= 40) {
        // Mittlerer Platz (Tablet): Chain in der Mitte
        horizontalOffset = availableSpace / 2;
      } else if (availableSpace >= 20) {
        // Wenig Platz: Chain bei 1/3 des verfügbaren Raums
        horizontalOffset = availableSpace / 3;
      } else {
        // Sehr wenig Platz: Chain ganz nah am Rand
        horizontalOffset = 10;
      }

      const pathPoints: { x: number; y: number; sectionIndex: number }[] = [];
      pathPoints.push({ x: horizontalOffset, y: 0, sectionIndex: 0 });

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
              pathPoints.push({ x: horizontalOffset, y, sectionIndex: i });
            }
            pathPoints.push({ x: horizontalOffset, y: verticalEnd, sectionIndex: i });

            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = horizontalOffset + curveSize - curveSize * Math.cos(rad);
              const y = horizontalY - curveSize + curveSize * Math.sin(rad);
              pathPoints.push({ x, y, sectionIndex: i });
            }

            const horizontalStart = horizontalOffset + curveSize;
            const horizontalEnd = targetX - curveSize;
            for (let x = horizontalStart; x <= horizontalEnd; x += 10) {
              pathPoints.push({ x, y: horizontalY, sectionIndex: i });
            }
            pathPoints.push({ x: horizontalEnd, y: horizontalY, sectionIndex: i });

            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = targetX - curveSize + curveSize * Math.sin(rad);
              const y = horizontalY + curveSize - curveSize * Math.cos(rad);
              pathPoints.push({ x, y, sectionIndex: i });
            }
          } else {
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            for (let y = verticalStart; y <= sectionBottom; y += 10) {
              pathPoints.push({ x: horizontalOffset, y, sectionIndex: i });
            }
            pathPoints.push({ x: horizontalOffset, y: sectionBottom, sectionIndex: i });
          }
        } else {
          if (i < sections.length - 1) {
            const targetX = horizontalOffset;
            const horizontalY = sectionBottom - sectionPadding;
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            const verticalEnd = horizontalY - curveSize;

            for (let y = verticalStart; y <= verticalEnd; y += 10) {
              pathPoints.push({ x: width - horizontalOffset, y, sectionIndex: i });
            }
            pathPoints.push({ x: width - horizontalOffset, y: verticalEnd, sectionIndex: i });

            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = width - horizontalOffset - curveSize + curveSize * Math.cos(rad);
              const y = horizontalY - curveSize + curveSize * Math.sin(rad);
              pathPoints.push({ x, y, sectionIndex: i });
            }

            const horizontalStart = width - horizontalOffset - curveSize;
            const horizontalEnd = targetX + curveSize;
            for (let x = horizontalStart; x >= horizontalEnd; x -= 10) {
              pathPoints.push({ x, y: horizontalY, sectionIndex: i });
            }
            pathPoints.push({ x: horizontalEnd, y: horizontalY, sectionIndex: i });

            for (let angle = 0; angle <= 90; angle += 5) {
              const rad = (angle * Math.PI) / 180;
              const x = targetX + curveSize - curveSize * Math.sin(rad);
              const y = horizontalY + curveSize - curveSize * Math.cos(rad);
              pathPoints.push({ x, y, sectionIndex: i });
            }
          } else {
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            for (let y = verticalStart; y <= sectionBottom; y += 10) {
              pathPoints.push({ x: width - horizontalOffset, y, sectionIndex: i });
            }
            pathPoints.push({ x: width - horizontalOffset, y: sectionBottom, sectionIndex: i });
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
        let currentSection = 0;
        let sectionLinkIndex = 0; // Link-Index innerhalb der aktuellen Section

        for (let i = 0; i < pathPoints.length - 1; i++) {
          const p1 = pathPoints[i];
          const p2 = pathPoints[i + 1];

          // Wenn Section wechselt, reset sectionLinkIndex
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

            renderLink({
              ctx, x, y, angle,
              linkIndex: sectionLinkIndex, // Verwende Section-lokalen Index
              config,
              colors: CHAIN_COLORS,
              isDark: theme === 'dark',
              mousePos: isInteractive ? mousePosRef.current : { x: -1000, y: -1000 },
              sectionIndex: p1.sectionIndex,
              deviceTilt: isInteractive ? deviceTiltRef.current : { x: 0, y: 0 },
              isInteractive
            });
            currentDist += spacing;
            linkIndex++;
            sectionLinkIndex++;
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
  }, [dimensions, config, theme]);

  // Don't render chain if not mounted
  if (!mounted) {
    return null;
  }

  const targetOpacity = isReady ? 1.0 : 0;
  const finalOpacity = targetOpacity * transitionOpacity;

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: finalOpacity,
        transition: 'none', // No CSS transition, we handle it in JS
        willChange: 'opacity'
      }}
      suppressHydrationWarning
    />
  );
}
