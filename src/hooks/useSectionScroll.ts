'use client';

import { useEffect, useRef } from 'react';

// Global state to track current section index across components
let globalCurrentSectionIndex = 0;
let globalIsScrolling = false;
let globalScrollToSection: ((index: number) => void) | null = null;

// Store references to event handlers for cleanup
let globalWheelHandler: ((e: WheelEvent) => void) | null = null;
let globalKeyHandler: ((e: KeyboardEvent) => void) | null = null;

// Callback for section changes (used by DynamicFavicon)
let globalSectionChangeCallback: ((sectionId: string) => void) | null = null;

// Section IDs in order
const SECTION_IDS = ['hero', 'about', 'services', 'packages', 'portfolio', 'contact', 'footer'];

// Export function to subscribe to section changes
export function onSectionChange(callback: (sectionId: string) => void) {
    globalSectionChangeCallback = callback;
    // Return unsubscribe function
    return () => {
        globalSectionChangeCallback = null;
    };
}

// Export function to get current section ID
export function getCurrentSectionId(): string {
    return SECTION_IDS[globalCurrentSectionIndex] || 'hero';
}

// Function to get section index by ID
export function getSectionIndexById(sectionId: string): number {
    const sections = document.querySelectorAll('.scroll-snap-section');
    return Array.from(sections).findIndex(s => s.id === sectionId);
}

// Function to scroll to section by ID (uses the internal scroll mechanism)
export function scrollToSectionById(sectionId: string) {
    const index = getSectionIndexById(sectionId);
    if (index !== -1 && globalScrollToSection) {
        console.log('📍 Header: Scrolling to section:', sectionId, 'at index:', index);
        globalScrollToSection(index);
    } else if (index !== -1) {
        // Fallback für Mobile/Tablet wenn globalScrollToSection noch nicht initialisiert ist
        const section = document.getElementById(sectionId);
        if (section) {
            const targetY = section.offsetTop;
            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        }
    }
}

export function useSectionScroll() {
    const isScrolling = useRef(false);
    const currentSectionIndex = useRef(globalCurrentSectionIndex);

    useEffect(() => {
        // Clean up any existing listeners first (from previous page)
        if (globalWheelHandler) {
            window.removeEventListener('wheel', globalWheelHandler);
            globalWheelHandler = null;
        }
        if (globalKeyHandler) {
            window.removeEventListener('keydown', globalKeyHandler);
            globalKeyHandler = null;
        }

        // Warte bis alle Sections geladen sind (wegen dynamic imports)
        const initTimeout = setTimeout(() => {
            const sections = document.querySelectorAll('.scroll-snap-section');
            if (sections.length === 0) {
                return;
            }

            // Initialisiere mit der aktuellen Section beim Mount
            const initCurrentSection = () => {
                const scrollY = window.scrollY;
                let closestIndex = 0;
                let minDistance = Infinity;

                sections.forEach((section, i) => {
                    const sectionTop = (section as HTMLElement).offsetTop;
                    const distance = Math.abs(scrollY - sectionTop);

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = i;
                    }
                });

                currentSectionIndex.current = closestIndex;
                globalCurrentSectionIndex = closestIndex;

                // Notify listeners about initial section
                const sectionId = SECTION_IDS[closestIndex];
                if (sectionId && globalSectionChangeCallback) {
                    globalSectionChangeCallback(sectionId);
                }
            };

            // Beim Mount die aktuelle Section ermitteln
            initCurrentSection();

            const scrollToSection = (index: number) => {
                // Always query sections fresh to handle re-renders (e.g., language toggle)
                const sections = document.querySelectorAll('.scroll-snap-section');

                if (index < 0 || index >= sections.length) {
                    console.warn('⚠️ Invalid section index:', index);
                    return;
                }

                // Lock scrolling and UPDATE INDEX IMMEDIATELY to prevent race conditions
                isScrolling.current = true;
                globalIsScrolling = true;
                currentSectionIndex.current = index;
                globalCurrentSectionIndex = index;

                // Notify listeners about section change
                const sectionId = SECTION_IDS[index];
                if (sectionId && globalSectionChangeCallback) {
                    globalSectionChangeCallback(sectionId);
                }

                const section = sections[index] as HTMLElement;
                const targetY = section.offsetTop;
                const startY = window.scrollY;
                const distance = targetY - startY;
                const duration = 700; // Smooth but responsive
                let startTime: number | null = null;

                // Smooth easing function
                const easeOutQuint = (t: number): number => {
                    return 1 - Math.pow(1 - t, 6);
                };

                const animation = (currentTime: number) => {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const progress = Math.min(timeElapsed / duration, 1);

                    const ease = easeOutQuint(progress);
                    const currentY = startY + (distance * ease);

                    window.scrollTo(0, currentY);

                    if (progress < 1) {
                        requestAnimationFrame(animation);
                    } else {
                        // Animation beendet - unlock scrolling
                        isScrolling.current = false;
                        globalIsScrolling = false;

                        // Update URL hash to match current section
                        const sectionId = section.id;
                        if (sectionId && sectionId !== 'hero') {
                            window.history.replaceState(null, '', `#${sectionId}`);
                        } else {
                            // Remove hash for hero section
                            window.history.replaceState(null, '', window.location.pathname + window.location.search);
                        }
                    }
                };

                requestAnimationFrame(animation);
            };

            // Expose scrollToSection globally for Header
            globalScrollToSection = scrollToSection;

            // Detect if device is desktop-sized (wide screen) - touch detection causes issues on touchscreen laptops
            // We check if it's a wide screen AND not a mobile/tablet user agent
            const isWideScreen = window.innerWidth >= 1024;
            const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isDesktop = isWideScreen && !isMobileUserAgent;

            const handleWheel = (e: WheelEvent) => {
                // Only handle wheel on desktop devices
                if (!isDesktop) return;

                e.preventDefault();

                // Skip if already scrolling
                if (globalIsScrolling || isScrolling.current) {
                    return;
                }

                // Simple threshold - ignore tiny movements
                if (Math.abs(e.deltaY) < 10) return;

                // Determine direction and scroll
                const direction = e.deltaY > 0 ? 1 : -1;
                const targetIndex = currentSectionIndex.current + direction;

                // Query sections fresh for validation
                const sections = document.querySelectorAll('.scroll-snap-section');

                if (targetIndex >= 0 && targetIndex < sections.length) {
                    scrollToSection(targetIndex);
                }
            };

            const handleKeyDown = (e: KeyboardEvent) => {
                // Sync global state with local ref
                if (globalIsScrolling || isScrolling.current) return;

                if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                    e.preventDefault();
                    const targetIndex = currentSectionIndex.current + 1;
                    if (targetIndex < sections.length) {
                        scrollToSection(targetIndex);
                    }
                } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                    e.preventDefault();
                    const targetIndex = currentSectionIndex.current - 1;
                    if (targetIndex >= 0) {
                        scrollToSection(targetIndex);
                    }
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    scrollToSection(0);
                } else if (e.key === 'End') {
                    e.preventDefault();
                    scrollToSection(sections.length - 1);
                }
            };

            // Only add wheel listener on desktop (non-touch devices)
            // Touch/mobile devices use native CSS scroll-snap
            if (isDesktop) {
                globalWheelHandler = handleWheel;
                window.addEventListener('wheel', handleWheel, { passive: false });
            }
            globalKeyHandler = handleKeyDown;
            window.addEventListener('keydown', handleKeyDown);

        }, 500); // 500ms Delay für dynamic imports

        return () => {
            clearTimeout(initTimeout);
            // Clean up listeners on unmount (when navigating away from main page)
            if (globalWheelHandler) {
                window.removeEventListener('wheel', globalWheelHandler);
                globalWheelHandler = null;
            }
            if (globalKeyHandler) {
                window.removeEventListener('keydown', globalKeyHandler);
                globalKeyHandler = null;
            }
        };
    }, []);
}
