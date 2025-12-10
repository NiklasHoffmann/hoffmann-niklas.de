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
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isReady, setIsReady] = useState(false);
  const { isInteractive, mounted } = useInteractiveMode();
  const animationFrameRef = useRef<number | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();
  const [transitionOpacity, setTransitionOpacity] = useState(1);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousInteractiveRef = useRef(isInteractive);
  const previousThemeRef = useRef(theme);
  const needsRedrawRef = useRef(true); // Flag für Redraw
  // OPTIMIZATION: Cache scrollHeight to avoid recalculation on every scroll event
  const scrollHeightCache = useRef(0);

  // Draw animation state - chain draws from top to bottom on initial load
  const [drawProgress, setDrawProgress] = useState(0); // 0 to 1
  const drawAnimationStarted = useRef(false);
  const drawAnimationComplete = useRef(false);
  const [animationVisible, setAnimationVisible] = useState(false); // Controls when to show the chain

  // Get responsive config
  const responsiveConfig = getChainConfig(screenSize);

  // Dynamically select preset based on interactive mode - use useMemo to recalculate when isInteractive changes
  // Both modes use 'line' style now, but interactive mode adds a colored highlight segment
  const config: ChainPathConfig = useMemo(() => {
    const activePreset = preset || 'line'; // Always use line style
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

    // Force redraw on theme/interactive mode change
    needsRedrawRef.current = true;

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
        // Use visualViewport for mobile devices (more reliable during orientation change)
        const width = window.visualViewport?.width || window.innerWidth;
        const height = document.documentElement.scrollHeight;

        // Determine screen size: mobile < 768px, tablet 768-1024px, desktop > 1024px
        let newScreenSize: 'mobile' | 'tablet' | 'desktop';
        if (width < 768) {
          newScreenSize = 'mobile';
        } else if (width < 1024) {
          newScreenSize = 'tablet';
        } else {
          newScreenSize = 'desktop';
        }

        setScreenSize(newScreenSize);
        setDimensions({ width, height });
        // OPTIMIZATION: Update scrollHeight cache on resize
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        scrollHeightCache.current = height - viewportHeight;
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

    // Handle orientation change on tablets and mobile
    const handleOrientationChange = () => {
      console.log('🎨 ChainBackground: Orientation change detected');
      
      // Immediately set not ready to stop drawing
      setIsReady(false);
      
      // Multiple waves to ensure we get correct dimensions
      // Wave 1: requestAnimationFrame (browser may not have updated yet)
      requestAnimationFrame(() => {
        // Use visualViewport for mobile devices (more reliable)
        const width1 = window.visualViewport?.width || window.innerWidth;
        const height1 = document.documentElement.scrollHeight;
        console.log('🎨 ChainBackground: Wave 1 (RAF) -', `${width1}x${height1}`);
        
        // Wave 2: nested RAF (more reliable)
        requestAnimationFrame(() => {
          const width2 = window.visualViewport?.width || window.innerWidth;
          const height2 = document.documentElement.scrollHeight;
          console.log('🎨 ChainBackground: Wave 2 (RAF2) -', `${width2}x${height2}`);
          
          let newScreenSize: 'mobile' | 'tablet' | 'desktop';
          if (width2 < 768) {
            newScreenSize = 'mobile';
          } else if (width2 < 1024) {
            newScreenSize = 'tablet';
          } else {
            newScreenSize = 'desktop';
          }
          
          setScreenSize(newScreenSize);
          setDimensions({ width: width2, height: height2 });
          scrollHeightCache.current = height2 - (window.visualViewport?.height || window.innerHeight);
          setIsReady(true);
        });
      });
      
      // Wave 3: Backup check after 200ms
      setTimeout(() => {
        const width = window.visualViewport?.width || window.innerWidth;
        const height = document.documentElement.scrollHeight;
        console.log('🎨 ChainBackground: Wave 3 (200ms) -', `${width}x${height}`);
        
        let newScreenSize: 'mobile' | 'tablet' | 'desktop';
        if (width < 768) {
          newScreenSize = 'mobile';
        } else if (width < 1024) {
          newScreenSize = 'tablet';
        } else {
          newScreenSize = 'desktop';
        }
        
        setScreenSize(newScreenSize);
        setDimensions({ width, height });
        scrollHeightCache.current = height - (window.visualViewport?.height || window.innerHeight);
        setIsReady(true);
      }, 200);
    };

    // Throttled scroll handler
    const handleScroll = throttle(() => {
      // OPTIMIZATION: Cache scrollHeight calculation to avoid forced reflow
      // Only recalculate on resize, not on every scroll
      const scrollHeight = scrollHeightCache.current;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    }, 16); // ~60fps

    // Initial setup
    handleResize();

    // Re-calculate dimensions after a short delay (for language change)
    const timeoutId = setTimeout(handleResize, 100);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [config.style, screenSize, isInteractive]);

  // Draw animation - chain draws from top to bottom on initial load
  useEffect(() => {
    if (!isReady) return;
    if (drawAnimationComplete.current) return;
    if (drawAnimationStarted.current) return;

    drawAnimationStarted.current = true;
    const duration = 20000; // 20 seconds for full draw (~3 sec per section)
    const startTime = performance.now();

    console.log('🎬 Chain draw animation started');

    // Make chain visible immediately when animation starts
    setAnimationVisible(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Linear animation - constant speed throughout
      setDrawProgress(progress);
      needsRedrawRef.current = true;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        console.log('🎬 Chain draw animation complete');
        drawAnimationComplete.current = true;
        setDrawProgress(1);
      }
    };

    // Start animation immediately
    requestAnimationFrame(animate);
  }, [isReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    console.log('🎨 ChainBackground: Drawing with style:', config.style);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Force initial draw
    needsRedrawRef.current = true;

    // Prevent flickering: keep canvas visible during resize
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let lastScrollProgress = scrollProgress;

    const draw = () => {
      // Nur neu zeichnen bei Scroll-Änderungen
      // Maus komplett ignoriert für maximale Performance
      const scrollChanged = Math.abs(scrollProgress - lastScrollProgress) > 0.001;

      if (!needsRedrawRef.current && !scrollChanged) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      needsRedrawRef.current = false;
      lastScrollProgress = scrollProgress;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const { curveSize, sectionPadding, spacing, style } = config;

      // Dynamisch berechne horizontalOffset basierend auf tatsächlicher Content-Breite
      const mainSections = Array.from(document.querySelectorAll('main > *')) as HTMLElement[];
      // Footer kann entweder <footer> oder <section id="footer"> sein (nach Section-Komponente Refactor)
      const footer = document.querySelector('footer') as HTMLElement
        || document.querySelector('#footer') as HTMLElement;
      // Nur Footer hinzufügen wenn er nicht bereits in mainSections ist
      const footerInMain = mainSections.some(section => section.id === 'footer' || section.tagName === 'FOOTER');
      const sections = (footer && !footerInMain) ? [...mainSections, footer] : mainSections;

      // Nimm die zweite Section (About) als Referenz, da Hero spezielles Padding hat
      let contentOffsetLeft = 150; // Default Desktop
      let contentOffsetBottom = 100; // Default Desktop bottom

      if (sections.length > 1) {
        const referenceSection = sections[1]; // About Section statt Hero
        const sectionRect = referenceSection.getBoundingClientRect();
        const contentBox = referenceSection.querySelector('[class*="max-w-"]') as HTMLElement;

        if (contentBox) {
          const contentRect = contentBox.getBoundingClientRect();
          // Berechne das tatsächliche Padding der Section (nicht der zentrierte Container)
          const computedStyle = window.getComputedStyle(referenceSection);
          const paddingLeft = parseFloat(computedStyle.paddingLeft);
          const paddingBottom = parseFloat(computedStyle.paddingBottom);
          contentOffsetLeft = paddingLeft || 150;
          contentOffsetBottom = paddingBottom || 100;
        }
      } const screenWidth = width;
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
      } else {
        // Wenig Platz (Mobile): Chain genau in der Mitte
        horizontalOffset = availableSpace / 2;
      }

      // Für die horizontale Linie: Volle Padding-Distanz minus halbe Padding-Distanz = Mitte
      // sectionBottom - (paddingBottom - paddingBottom/2) = sectionBottom - paddingBottom/2
      const dynamicSectionPadding = contentOffsetBottom / 2;

      const pathPoints: { x: number; y: number; sectionIndex: number }[] = [];
      pathPoints.push({ x: horizontalOffset, y: 0, sectionIndex: 0 });

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;

        // Verwende offsetTop und offsetHeight für konsistente Berechnung
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        // Lese bottom-padding für jede Section individuell aus
        const sectionStyle = window.getComputedStyle(section);
        let sectionBottomPadding = parseFloat(sectionStyle.paddingBottom);

        // Fallback wenn paddingBottom nicht ausgelesen werden kann
        if (isNaN(sectionBottomPadding) || sectionBottomPadding === 0) {
          sectionBottomPadding = contentOffsetBottom;
        }

        // Mitte des Bottom-Paddings: halbe Distanz vom unteren Rand nach innen
        const sectionDynamicPadding = sectionBottomPadding / 2;

        if (i % 2 === 0) {
          if (i < sections.length - 1) {
            const targetX = width - horizontalOffset;
            const horizontalY = sectionBottom - sectionDynamicPadding;
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
            const horizontalY = sectionBottom - sectionDynamicPadding;
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

      // Calculate how many points to draw based on drawProgress
      const pointsToDraw = Math.floor(pathPoints.length * drawProgress);
      const visiblePoints = drawAnimationComplete.current ? pathPoints : pathPoints.slice(0, pointsToDraw);

      // Line-Stil: Zeichne durchgehenden Pfad
      if (style === 'line') {
        if (visiblePoints.length < 2) {
          animationFrameRef.current = requestAnimationFrame(draw);
          return;
        }

        // Base line
        ctx.beginPath();
        ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);

        for (let i = 1; i < visiblePoints.length; i++) {
          ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y);
        }

        ctx.strokeStyle = CHAIN_COLORS.line.stroke;
        ctx.lineWidth = config.linkWidth || CHAIN_COLORS.line.width;

        if (CHAIN_COLORS.line.shadow) {
          ctx.shadowColor = CHAIN_COLORS.line.shadow;
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0.5;
          ctx.shadowOffsetY = 0.5;
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Interactive mode: Draw colored highlight segment on top
        if (isInteractive && visiblePoints.length > 10) {
          // Reset shadow for highlight
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Neon colors per section (same as in chainRenderers.ts)
          const neonColors = [
            '#00ffff', // Cyan - Section 0 (Hero)
            '#ff00ff', // Magenta - Section 1 (About)
            '#00ff00', // Lime - Section 2 (Services)
            '#ffff00', // Yellow - Section 3 (Portfolio)
            '#ff0080', // Hot Pink - Section 4 (Videos)
            '#0080ff', // Blue - Section 5 (Contact)
            '#ff8000', // Orange - Section 6 (Footer)
          ];

          // Group points by section
          const sectionGroups: { startIndex: number; endIndex: number; sectionIndex: number }[] = [];
          let currentSectionStart = 0;
          let currentSection = visiblePoints[0]?.sectionIndex ?? 0;

          for (let i = 1; i < visiblePoints.length; i++) {
            if (visiblePoints[i].sectionIndex !== currentSection) {
              sectionGroups.push({
                startIndex: currentSectionStart,
                endIndex: i - 1,
                sectionIndex: currentSection
              });
              currentSectionStart = i;
              currentSection = visiblePoints[i].sectionIndex;
            }
          }
          // Add last section
          sectionGroups.push({
            startIndex: currentSectionStart,
            endIndex: visiblePoints.length - 1,
            sectionIndex: currentSection
          });

          // Draw highlight for each section independently
          for (const section of sectionGroups) {
            const sectionLength = section.endIndex - section.startIndex;
            if (sectionLength < 10) continue; // Skip very short sections

            // Highlight is 25% of this section's length (5% fade + 15% solid + 5% fade)
            const highlightLength = Math.floor(sectionLength * 0.25);
            if (highlightLength < 5) continue;

            // Position based on scroll progress within this section
            const maxStart = sectionLength - highlightLength;
            const highlightStart = section.startIndex + Math.floor(scrollProgress * maxStart);
            const highlightEnd = Math.min(highlightStart + highlightLength, section.endIndex);

            // Get section neon color
            const neonColor = neonColors[section.sectionIndex % neonColors.length];

            // Fade zones: 5% on each end, 15% solid in middle
            // Total: 5% + 15% + 5% = 25%

            // Draw highlight segments
            for (let i = highlightStart; i < highlightEnd - 1; i++) {
              const posInHighlight = i - highlightStart;
              const highlightProgress = posInHighlight / highlightLength;

              // Calculate opacity: 5% fade in (0-0.2), 15% solid (0.2-0.8), 5% fade out (0.8-1.0)
              let opacity = 1;
              if (highlightProgress < 0.2) {
                // Fade in zone (first 5% of 25% = 20% of highlight)
                opacity = highlightProgress / 0.2;
              } else if (highlightProgress > 0.8) {
                // Fade out zone (last 5% of 25% = 20% of highlight)
                opacity = (1 - highlightProgress) / 0.2;
              }

              ctx.beginPath();
              ctx.moveTo(visiblePoints[i].x, visiblePoints[i].y);
              ctx.lineTo(visiblePoints[i + 1].x, visiblePoints[i + 1].y);

              ctx.strokeStyle = neonColor;
              ctx.globalAlpha = opacity * 0.8; // Max 80% opacity
              ctx.lineWidth = (config.linkWidth || CHAIN_COLORS.line.width) + 1;
              ctx.lineCap = 'round';
              ctx.stroke();
            }
          }

          // Reset global alpha
          ctx.globalAlpha = 1;
        }
      } else {
        // Andere Stile: Zeichne einzelne Kettenglieder
        let distance = 0;
        let linkIndex = 0;
        let currentSection = 0;
        let sectionLinkIndex = 0; // Link-Index innerhalb der aktuellen Section

        // Use visiblePoints for progressive draw animation
        const pointsToIterate = drawAnimationComplete.current ? pathPoints : visiblePoints;

        for (let i = 0; i < pointsToIterate.length - 1; i++) {
          const p1 = pointsToIterate[i];
          const p2 = pointsToIterate[i + 1];

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
              sectionIndex: p1.sectionIndex,
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

    // FPS Limiter für bessere Performance (30fps statt 60fps)
    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const limitedDraw = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTime;

      if (elapsed > frameInterval) {
        lastFrameTime = currentTime - (elapsed % frameInterval);
        draw();
      } else {
        animationFrameRef.current = requestAnimationFrame(limitedDraw);
      }
    };

    animationFrameRef.current = requestAnimationFrame(limitedDraw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, config, theme, drawProgress, scrollProgress, isInteractive]);

  // Don't render chain if not mounted
  if (!mounted) {
    return null;
  }

  // Chain becomes visible when animation starts (animationVisible)
  // After animation is complete, use isReady for subsequent visibility
  const shouldShow = drawAnimationComplete.current ? isReady : animationVisible;
  const targetOpacity = shouldShow ? 1.0 : 0;
  const finalOpacity = targetOpacity * transitionOpacity;

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: finalOpacity,
        transition: 'none',
        willChange: 'opacity',
        transform: 'translateZ(0)', // Force GPU acceleration
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
      suppressHydrationWarning
    />
  );
}
