'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { ChainPathConfig, CHAIN_PRESETS, CHAIN_COLORS } from '@/types/chain';
import { getLinkRenderer } from '@/lib/chainRenderers';
import { throttle, isMobileDevice } from '@/lib/utils';
import { getChainConfig } from '@/config/chain';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

// Try to restore from sessionStorage
const getInitialDrawState = () => {
  if (typeof window === 'undefined') return { started: false, complete: false, progress: 0, visible: false };
  try {
    const saved = sessionStorage.getItem('chainDrawState');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only restore if animation was complete
      if (parsed.complete) {
        return { started: true, complete: true, progress: 1, visible: true };
      }
    }
  } catch (e) {
    // Ignore errors
  }
  return { started: false, complete: false, progress: 0, visible: false };
};

const initialState = getInitialDrawState();

// Global animation state - persists across component re-mounts (e.g., language changes)
let globalDrawAnimationStarted = initialState.started;
let globalDrawAnimationComplete = initialState.complete;
let globalDrawProgress = initialState.progress;
let globalAnimationVisible = initialState.visible;
let globalBaseChainCanvas: HTMLCanvasElement | null = null; // Cache base chain across re-mounts

// Save state to sessionStorage
const saveDrawState = () => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('chainDrawState', JSON.stringify({
        started: globalDrawAnimationStarted,
        complete: globalDrawAnimationComplete,
        progress: globalDrawProgress,
        visible: globalAnimationVisible
      }));
    } catch (e) {
      // Ignore errors
    }
  }
};

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

  // Draw animation state - use global state to persist across re-mounts
  const [drawProgress, setDrawProgress] = useState(globalDrawProgress);
  const [animationVisible, setAnimationVisible] = useState(globalAnimationVisible);

  // Use global cached canvas reference - initialize local ref with global value
  const baseChainCanvas = useRef<HTMLCanvasElement | null>(globalBaseChainCanvas);

  // Get responsive config
  const responsiveConfig = getChainConfig(screenSize);

  // Dynamically select preset based on interactive mode - use useMemo to recalculate when isInteractive changes
  // Both modes use 'line' style now, but interactive mode adds a colored highlight segment
  const config: ChainPathConfig = useMemo(() => {
    const activePreset = preset || 'line';

    return {
      ...CHAIN_PRESETS[activePreset],
      ...customConfig,
      // Don't use fixed values - we calculate horizontalOffset, curveSize, sectionPadding dynamically
    };
  }, [preset, isInteractive, customConfig]);

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

    // Clear cached canvas on theme change to force redraw with new colors
    // But DON'T clear global cache - it will be recreated automatically
    if (themeChanged) {
      baseChainCanvas.current = null;
      globalBaseChainCanvas = null;
    }

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
        let width = (typeof window.visualViewport !== 'undefined' && window.visualViewport?.width) || window.innerWidth;
        let height = (typeof window.visualViewport !== 'undefined' && window.visualViewport?.height) || window.innerHeight;

        // Check screen.orientation for dimension swapping
        const actualOrientation = window.screen?.orientation?.type ||
          (window.innerWidth > window.innerHeight ? 'landscape-primary' : 'portrait-primary');
        const isActuallyPortrait = actualOrientation.includes('portrait');

        // If dimensions don't match orientation, swap them
        if (isActuallyPortrait && width > height) {
          [width, height] = [height, width];
        } else if (!isActuallyPortrait && height > width) {
          [width, height] = [height, width];
        }

        const mainContainer = document.getElementById('main-scroll-container');
        const scrollHeight = mainContainer ? mainContainer.scrollHeight : document.documentElement.scrollHeight;

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
        setDimensions({ width, height: scrollHeight });
        scrollHeightCache.current = scrollHeight - height;

        // Clear cached canvas on resize to force redraw with new dimensions
        baseChainCanvas.current = null;
        globalBaseChainCanvas = null;
        needsRedrawRef.current = true;

        // Only mark as ready on first initialization, not on subsequent resizes
        if (!isReady) {
          setIsReady(true);
        }
      }, 50);
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleResize();
      }
    };

    // Handle orientation change on tablets and mobile
    const handleOrientationChange = () => {
      setIsReady(false);

      // Multiple waves to ensure we get correct dimensions
      // Wave 1: requestAnimationFrame (browser may not have updated yet)
      requestAnimationFrame(() => {
        // Use visualViewport for mobile devices (more reliable)
        let width1 = (typeof window.visualViewport !== 'undefined' && window.visualViewport?.width) || window.innerWidth;
        let height1 = (typeof window.visualViewport !== 'undefined' && window.visualViewport?.height) || window.innerHeight;

        // Check screen.orientation for dimension swapping
        const actualOrientation = window.screen?.orientation?.type ||
          (window.innerWidth > window.innerHeight ? 'landscape-primary' : 'portrait-primary');
        const isActuallyPortrait = actualOrientation.includes('portrait');

        // If dimensions don't match orientation, swap them
        if (isActuallyPortrait && width1 > height1) {
          [width1, height1] = [height1, width1];
        } else if (!isActuallyPortrait && height1 > width1) {
          [width1, height1] = [height1, width1];
        }

        const scrollHeight1 = document.documentElement.scrollHeight;

        // Wave 2: nested RAF
        requestAnimationFrame(() => {
          let width2 = (typeof window.visualViewport !== 'undefined' && window.visualViewport?.width) || window.innerWidth;
          let height2 = (typeof window.visualViewport !== 'undefined' && window.visualViewport?.height) || window.innerHeight;

          // Check screen.orientation for dimension swapping
          const actualOrientation2 = window.screen?.orientation?.type ||
            (window.innerWidth > window.innerHeight ? 'landscape-primary' : 'portrait-primary');
          const isActuallyPortrait2 = actualOrientation2.includes('portrait');

          // If dimensions don't match orientation, swap them
          if (isActuallyPortrait2 && width2 > height2) {
            [width2, height2] = [height2, width2];
          } else if (!isActuallyPortrait2 && height2 > width2) {
            [width2, height2] = [height2, width2];
          }

          const scrollHeight2 = document.documentElement.scrollHeight;

          let newScreenSize: 'mobile' | 'tablet' | 'desktop';
          if (width2 < 768) {
            newScreenSize = 'mobile';
          } else if (width2 < 1024) {
            newScreenSize = 'tablet';
          } else {
            newScreenSize = 'desktop';
          }

          setScreenSize(newScreenSize);
          setDimensions({ width: width2, height: scrollHeight2 });
          scrollHeightCache.current = scrollHeight2 - height2;
          setIsReady(true);
        });
      });

      // Wave 3: Backup check after 400ms (increased for real devices)
      setTimeout(() => {
        let width = (typeof window.visualViewport !== 'undefined' && window.visualViewport?.width) || window.innerWidth;
        let height = (typeof window.visualViewport !== 'undefined' && window.visualViewport?.height) || window.innerHeight;

        // Check screen.orientation for dimension swapping
        const actualOrientation = window.screen?.orientation?.type ||
          (window.innerWidth > window.innerHeight ? 'landscape-primary' : 'portrait-primary');
        const isActuallyPortrait = actualOrientation.includes('portrait');

        // If dimensions don't match orientation, swap them
        if (isActuallyPortrait && width > height) {
          [width, height] = [height, width];
        } else if (!isActuallyPortrait && height > width) {
          [width, height] = [height, width];
        }

        const mainContainer = document.getElementById('main-scroll-container');
        const scrollHeight = mainContainer ? mainContainer.scrollHeight : document.documentElement.scrollHeight;

        let newScreenSize: 'mobile' | 'tablet' | 'desktop';
        if (width < 768) {
          newScreenSize = 'mobile';
        } else if (width < 1024) {
          newScreenSize = 'tablet';
        } else {
          newScreenSize = 'desktop';
        }

        setScreenSize(newScreenSize);
        setDimensions({ width, height: scrollHeight });
        scrollHeightCache.current = scrollHeight - height;
        setIsReady(true);
      }, 400);
    };

    // Throttled scroll handler
    const handleScroll = throttle(() => {
      // CRITICAL: Get scroll from main container, not window!
      const mainContainer = document.getElementById('main-scroll-container');
      const scrollY = mainContainer ? mainContainer.scrollTop : window.scrollY;

      // OPTIMIZATION: Cache scrollHeight calculation to avoid forced reflow
      // Only recalculate on resize, not on every scroll
      const scrollHeight = scrollHeightCache.current;
      const progress = scrollHeight > 0 ? scrollY / scrollHeight : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    }, 16); // ~60fps

    // Initial setup
    handleResize();

    // Re-calculate dimensions after a short delay (for language change)
    const timeoutId = setTimeout(handleResize, 100);

    // CRITICAL: Listen to scroll on main-container, not window!
    const mainContainer = document.getElementById('main-scroll-container');
    const scrollElement = mainContainer || window;

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      scrollElement.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [config.style, screenSize, isInteractive]);

  // Sync local baseChainCanvas ref with global cache on mount
  useEffect(() => {
    // Try to restore from sessionStorage first
    if (!baseChainCanvas.current && globalDrawAnimationComplete) {
      try {
        const savedData = sessionStorage.getItem('chainCanvasData');
        if (savedData) {
          const cacheData = JSON.parse(savedData);
          // Validate dimensions match current canvas
          if (cacheData.width === dimensions.width && cacheData.height === dimensions.height) {
            const img = new Image();
            img.onload = () => {
              // Create canvas from saved image
              const canvas = document.createElement('canvas');
              canvas.width = dimensions.width;
              canvas.height = dimensions.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                baseChainCanvas.current = canvas;
                globalBaseChainCanvas = canvas;
                needsRedrawRef.current = true;
              }
            };
            img.src = cacheData.dataUrl;
          } else {
            console.log('🔄 Cached canvas dimensions mismatch, clearing sessionStorage');
            sessionStorage.removeItem('chainCanvasData');
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    if (globalBaseChainCanvas && !baseChainCanvas.current) {
      baseChainCanvas.current = globalBaseChainCanvas;
      needsRedrawRef.current = true;
    }
  }, [dimensions.width, dimensions.height]);

  // Draw animation - chain draws from top to bottom on initial load (20 seconds)
  // On mobile: skip animation and show immediately
  // OPTIMIZATION: Defer to requestIdleCallback to allow critical rendering first
  useEffect(() => {
    if (!isReady) return;
    if (globalDrawAnimationComplete) return;
    if (globalDrawAnimationStarted) return;

    globalDrawAnimationStarted = true;

    // Skip animation on mobile devices - show immediately (but still defer)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Use requestIdleCallback to defer chain drawing until browser is idle
    const idleCallback = () => {
      // PERFORMANCE: Draw chain fully but animate clip-path for visual reveal
      globalDrawAnimationComplete = true;
      globalDrawProgress = 1;
      setDrawProgress(1);
      needsRedrawRef.current = true;
      
      // Show chain immediately, CSS animation will handle the reveal
      globalAnimationVisible = true;
      setAnimationVisible(true);
      saveDrawState(); // Persist state across page reloads
      return;

      /* Original animation code - disabled for performance
      if (isMobile) {
        globalDrawAnimationComplete = true;
        globalDrawProgress = 1;
        globalAnimationVisible = true;
        setDrawProgress(1);
        setAnimationVisible(true);
        needsRedrawRef.current = true;
        return;
      }

      const duration = 3000; // Reduced from 15s to 3s - chain appears quickly without blocking
      const startTime = performance.now();

      globalAnimationVisible = true;
      setAnimationVisible(true);

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        globalDrawProgress = progress;
        setDrawProgress(progress);
        needsRedrawRef.current = true;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          globalDrawAnimationComplete = true;
          globalDrawProgress = 1;
          setDrawProgress(1);
        }
      };

      // Start animation immediately
      requestAnimationFrame(animate);
      */
    };

    // Defer chain animation to idle time
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(idleCallback, { timeout: 2000 });
      return () => cancelIdleCallback(idleId);
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeoutId = setTimeout(idleCallback, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Force initial draw
    needsRedrawRef.current = true;

    // Prevent flickering: keep canvas visible during resize
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear cache when dimensions change to force redraw
    // This ensures the cache is cleared AFTER canvas dimensions are updated
    if (baseChainCanvas.current) {
      if (baseChainCanvas.current.width !== dimensions.width || baseChainCanvas.current.height !== dimensions.height) {
        console.log('🔄 Dimensions changed, clearing cache');
        baseChainCanvas.current = null;
        globalBaseChainCanvas = null;
      }
    }

    let lastScrollProgress = scrollProgress;

    const draw = () => {
      // After animation completes, only redraw on scroll if in interactive mode
      // Otherwise the chain stays static
      const scrollChanged = Math.abs(scrollProgress - lastScrollProgress) > 0.001;

      // If animation is complete and not in interactive mode, don't redraw
      if (globalDrawAnimationComplete && !isInteractive && !needsRedrawRef.current) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // During animation, always redraw. After animation in interactive mode, ALWAYS redraw (for shimmer animation)
      // In non-interactive mode, only redraw on scroll change or forced redraw
      if (globalDrawAnimationComplete && !isInteractive && !needsRedrawRef.current && !scrollChanged) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      needsRedrawRef.current = false;
      lastScrollProgress = scrollProgress;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const { curveSize, sectionPadding, spacing, style } = config;

      // CRITICAL: Get sections from the wrapper div, not main directly!
      // Structure: main > div > div[z-10] > sections
      const sectionsWrapper = document.querySelector('main > div > div[style*="z-index: 10"]');
      const mainSections = sectionsWrapper
        ? Array.from(sectionsWrapper.children) as HTMLElement[]
        : Array.from(document.querySelectorAll('.scroll-snap-section')) as HTMLElement[];

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
          // Berechne den tatsächlichen Abstand vom Bildschirmrand (0) bis zum Content-Start
          // contentRect.left gibt die Position des Contents vom linken Viewport-Rand
          contentOffsetLeft = contentRect.left;

          // Bottom Padding aus der Section selbst
          const computedStyle = window.getComputedStyle(referenceSection);
          const paddingBottom = parseFloat(computedStyle.paddingBottom);
          contentOffsetBottom = paddingBottom || 100;
        }
      } const screenWidth = width;
      // Verfügbarer Platz vom Bildschirmrand bis zum Content-Anfang
      const availableSpace = contentOffsetLeft;

      // Chain Position berechnen - immer genau in der Mitte des verfügbaren Platzes
      const horizontalOffset = availableSpace / 2;

      // Dynamischer Kurvenradius basierend auf verfügbarem Platz
      // Je mehr Platz, desto größer die Kurve (aber maximal 40% des verfügbaren Platzes)
      // Minimum: 15px für sehr enge Räume
      const dynamicCurveSize = Math.max(15, Math.min(availableSpace * 0.4, 120));

      // Für die horizontale Linie: Halber Abstand wie zur Seite, damit sie zwischen Content-Ende und Section-Rand liegt
      // Voller seitlicher Abstand würde die Chain durch den Content führen
      const dynamicSectionPadding = horizontalOffset / 2;

      const pathPoints: { x: number; y: number; sectionIndex: number }[] = [];
      pathPoints.push({ x: horizontalOffset, y: 0, sectionIndex: 0 });

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;

        // Verwende offsetTop und offsetHeight für konsistente Berechnung
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        // Verwende den gleichen Abstand wie seitlich (horizontalOffset) für konsistente Positionierung
        // Die horizontale Linie ist dann genauso weit vom unteren Section-Rand entfernt wie die vertikale vom seitlichen Rand

        if (i % 2 === 0) {
          if (i < sections.length - 1) {
            const targetX = width - horizontalOffset;
            const horizontalY = sectionBottom - dynamicSectionPadding;
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            const verticalEnd = horizontalY - dynamicCurveSize;

            // Vertikale Linie bis zur Kurve
            for (let y = verticalStart; y <= verticalEnd; y += 10) {
              pathPoints.push({ x: horizontalOffset, y, sectionIndex: i });
            }
            pathPoints.push({ x: horizontalOffset, y: verticalEnd, sectionIndex: i });

            // Erste Kurve (von vertikal nach horizontal) - feinere Schritte für smoothere Kurven
            for (let angle = 0; angle <= 90; angle += 2) {
              const rad = (angle * Math.PI) / 180;
              const x = horizontalOffset + dynamicCurveSize - dynamicCurveSize * Math.cos(rad);
              const y = horizontalY - dynamicCurveSize + dynamicCurveSize * Math.sin(rad);
              pathPoints.push({ x, y, sectionIndex: i });
            }

            // Horizontale Linie
            const horizontalStart = horizontalOffset + dynamicCurveSize;
            const horizontalEnd = targetX - dynamicCurveSize;
            for (let x = horizontalStart; x <= horizontalEnd; x += 10) {
              pathPoints.push({ x, y: horizontalY, sectionIndex: i });
            }
            pathPoints.push({ x: horizontalEnd, y: horizontalY, sectionIndex: i });

            // Zweite Kurve (von horizontal nach vertikal) - feinere Schritte
            for (let angle = 0; angle <= 90; angle += 2) {
              const rad = (angle * Math.PI) / 180;
              const x = targetX - dynamicCurveSize + dynamicCurveSize * Math.sin(rad);
              const y = horizontalY + dynamicCurveSize - dynamicCurveSize * Math.cos(rad);
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
            const horizontalY = sectionBottom - dynamicSectionPadding;
            const verticalStart = pathPoints[pathPoints.length - 1].y;
            const verticalEnd = horizontalY - dynamicCurveSize;

            // Vertikale Linie bis zur Kurve
            for (let y = verticalStart; y <= verticalEnd; y += 10) {
              pathPoints.push({ x: width - horizontalOffset, y, sectionIndex: i });
            }
            pathPoints.push({ x: width - horizontalOffset, y: verticalEnd, sectionIndex: i });

            // Erste Kurve (von vertikal nach horizontal) - feinere Schritte
            for (let angle = 0; angle <= 90; angle += 2) {
              const rad = (angle * Math.PI) / 180;
              const x = width - horizontalOffset - dynamicCurveSize + dynamicCurveSize * Math.cos(rad);
              const y = horizontalY - dynamicCurveSize + dynamicCurveSize * Math.sin(rad);
              pathPoints.push({ x, y, sectionIndex: i });
            }

            // Horizontale Linie
            const horizontalStart = width - horizontalOffset - dynamicCurveSize;
            const horizontalEnd = targetX + dynamicCurveSize;
            for (let x = horizontalStart; x >= horizontalEnd; x -= 10) {
              pathPoints.push({ x, y: horizontalY, sectionIndex: i });
            }
            pathPoints.push({ x: horizontalEnd, y: horizontalY, sectionIndex: i });

            // Zweite Kurve (von horizontal nach vertikal) - feinere Schritte
            for (let angle = 0; angle <= 90; angle += 2) {
              const rad = (angle * Math.PI) / 180;
              const x = targetX + dynamicCurveSize - dynamicCurveSize * Math.sin(rad);
              const y = horizontalY + dynamicCurveSize - dynamicCurveSize * Math.cos(rad);
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
      const visiblePoints = globalDrawAnimationComplete ? pathPoints : pathPoints.slice(0, pointsToDraw);

      // Cache base chain after animation completes (only once per resize)
      // We always need to recalculate pathPoints on resize, even if we use cached canvas
      // This ensures visiblePoints is always up-to-date for the highlight rendering
      if (globalDrawAnimationComplete && !baseChainCanvas.current) {
        console.log('💾 Caching base chain to prevent redraw on every scroll');
        baseChainCanvas.current = document.createElement('canvas');
        baseChainCanvas.current.width = width;
        baseChainCanvas.current.height = height;
        const cacheCtx = baseChainCanvas.current.getContext('2d');

        if (cacheCtx && style === 'line' && pathPoints.length >= 2) {
          // Draw base line to cache
          cacheCtx.beginPath();
          cacheCtx.moveTo(pathPoints[0].x, pathPoints[0].y);
          for (let i = 1; i < pathPoints.length; i++) {
            cacheCtx.lineTo(pathPoints[i].x, pathPoints[i].y);
          }
          cacheCtx.strokeStyle = CHAIN_COLORS.line.stroke;
          cacheCtx.lineWidth = config.linkWidth || CHAIN_COLORS.line.width;
          if (CHAIN_COLORS.line.shadow) {
            cacheCtx.shadowColor = CHAIN_COLORS.line.shadow;
            cacheCtx.shadowBlur = 2;
            cacheCtx.shadowOffsetX = 0.5;
            cacheCtx.shadowOffsetY = 0.5;
          }
          cacheCtx.lineCap = 'round';
          cacheCtx.lineJoin = 'round';
          cacheCtx.stroke();

          // Store in global cache
          globalBaseChainCanvas = baseChainCanvas.current;
          
          // Save canvas as data URL to sessionStorage for persistence across page reloads
          try {
            const dataUrl = baseChainCanvas.current.toDataURL('image/png', 0.8);
            const cacheData = {
              dataUrl,
              width,
              height
            };
            sessionStorage.setItem('chainCanvasData', JSON.stringify(cacheData));
          } catch (e) {
            // Ignore if storage fails
          }
        }
      }

      // If animation complete and we have cached canvas, use it instead of redrawing
      // But first validate that cached canvas dimensions match current canvas
      if (globalDrawAnimationComplete && baseChainCanvas.current) {
        // Check if cached canvas dimensions match current dimensions
        if (baseChainCanvas.current.width !== width || baseChainCanvas.current.height !== height) {
          // Dimensions changed (resize), invalidate cache and redraw
          console.log('🔄 Cache dimensions mismatch, clearing cache and redrawing');
          baseChainCanvas.current = null;
          globalBaseChainCanvas = null;
          // Fall through to redraw base chain below
        } else {
          // Draw cached base chain
          ctx.drawImage(baseChainCanvas.current, 0, 0);

          // Only draw highlight if in interactive mode
          if (!isInteractive) {
            animationFrameRef.current = requestAnimationFrame(draw);
            return;
          }

          // Continue to draw interactive highlight below...
        }
      }

      // Line-Stil: Zeichne durchgehenden Pfad (during animation OR after cache invalidation)
      if (style === 'line' && (!globalDrawAnimationComplete || !baseChainCanvas.current)) {
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
      }

      // Interactive mode: Draw colored highlight segment on top (works with both cached and progressive draw)
      if (isInteractive && style === 'line' && visiblePoints.length > 10) {
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
          
          // Check if this is the last section (Footer)
          const isLastSection = section.sectionIndex === 6;

          // Use FIXED highlight length (in points) instead of percentage
          // This ensures consistent visual length across all sections (including curves)
          // For last section, make it much longer
          const fixedHighlightLength = isLastSection 
            ? Math.min(Math.floor(sectionLength * 0.6), 250) // 60% or 250 points for footer
            : Math.min(Math.floor(sectionLength * 0.3), 120); // 30% or 120 points for others
          if (fixedHighlightLength < 5) continue;

          // Position based on GLOBAL scroll progress (same for all sections)
          // For last section, always extend to the very end
          let highlightStart: number;
          let highlightEnd: number;
          
          if (isLastSection) {
            // Last section: always stick to the end
            highlightEnd = section.endIndex;
            highlightStart = Math.max(section.startIndex, section.endIndex - fixedHighlightLength);
          } else {
            // Other sections: scroll normally
            const maxStart = sectionLength - fixedHighlightLength;
            highlightStart = section.startIndex + Math.floor(scrollProgress * maxStart);
            highlightEnd = Math.min(highlightStart + fixedHighlightLength, section.endIndex);
          }

          // Get section neon color
          const neonColor = neonColors[section.sectionIndex % neonColors.length];

          // Fade zones: 5% on each end, 15% solid in middle
          // Total: 5% + 15% + 5% = 25%

          // First pass: Draw smooth base layer with gradient fade at ends (20% each side)
          // Draw in segments to apply gradient
          for (let i = highlightStart; i < highlightEnd - 1; i++) {
            const posInHighlight = i - highlightStart;
            const totalLength = highlightEnd - highlightStart;
            const progress = posInHighlight / totalLength;
            
            // 20% fade in at start, 20% fade out at end (but not for last section)
            let fadeOpacity = 1.0;
            if (progress < 0.2) {
              fadeOpacity = progress / 0.2;
            } else if (progress > 0.8 && !isLastSection) {
              fadeOpacity = (1 - progress) / 0.2;
            }
            
            ctx.beginPath();
            ctx.moveTo(visiblePoints[i].x, visiblePoints[i].y);
            ctx.lineTo(visiblePoints[i + 1].x, visiblePoints[i + 1].y);
            
            ctx.strokeStyle = neonColor;
            ctx.lineWidth = (config.linkWidth || CHAIN_COLORS.line.width) + 1;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 0.7 * fadeOpacity;
            
            ctx.shadowColor = neonColor;
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.stroke();
          }
          
          // Second pass: Add static glow on top
          for (let i = highlightStart; i < highlightEnd - 1; i++) {
            const posInHighlight = i - highlightStart;
            const totalLength = highlightEnd - highlightStart;
            const highlightProgress = posInHighlight / totalLength;

            // Calculate opacity: 20% fade in, 20% fade out (but not for last section)
            let fadeOpacity = 1;
            if (highlightProgress < 0.2) {
              fadeOpacity = highlightProgress / 0.2;
            } else if (highlightProgress > 0.8 && !isLastSection) {
              fadeOpacity = (1 - highlightProgress) / 0.2;
            }

            ctx.beginPath();
            ctx.moveTo(visiblePoints[i].x, visiblePoints[i].y);
            ctx.lineTo(visiblePoints[i + 1].x, visiblePoints[i + 1].y);

            // Static glow effect
            ctx.strokeStyle = neonColor;
            ctx.lineWidth = (config.linkWidth || CHAIN_COLORS.line.width) + 1;
            ctx.shadowColor = neonColor;
            ctx.shadowBlur = 20;
            ctx.globalAlpha = fadeOpacity * 0.8;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
          }

          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        // Reset global alpha
        ctx.globalAlpha = 1;
      }

      // Non-line styles: Draw individual chain links
      if (style !== 'line') {
        let distance = 0;
        let linkIndex = 0;
        let currentSection = 0;
        let sectionLinkIndex = 0; // Link-Index innerhalb der aktuellen Section

        // Use visiblePoints for progressive draw animation
        const pointsToIterate = globalDrawAnimationComplete ? pathPoints : visiblePoints;

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

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, config, theme, drawProgress, scrollProgress, isInteractive]);

  // Don't render chain if not mounted
  // Chain becomes visible when animation starts (animationVisible)
  if (!mounted) {
    return null;
  }

  // Chain becomes visible when animation starts (animationVisible)
  // After animation is complete, use isReady for subsequent visibility
  const shouldShow = animationVisible && isReady;
  const targetOpacity = shouldShow ? 1.0 : 0;
  const finalOpacity = targetOpacity * transitionOpacity;

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 pointer-events-none chain-reveal-animation"
      style={{
        opacity: finalOpacity,
        transition: 'opacity 0.3s ease-out',
        willChange: 'opacity',
        transform: 'translateZ(0)', // Force GPU acceleration
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        animation: shouldShow ? 'chainReveal 5s ease-in-out forwards' : 'none'
      }}
      suppressHydrationWarning
    />
  );
}
