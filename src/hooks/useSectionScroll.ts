'use client';

import { useEffect, useRef } from 'react';

// Global state to track current section index across components
let globalCurrentSectionIndex = 0;
let globalIsScrolling = false;
let globalScrollToSection: ((index: number) => void) | null = null;
let hasGloballyInitialized = false; // Prevent duplicate initialization

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
    }
}

export function useSectionScroll() {
    const isScrolling = useRef(false);
    const currentSectionIndex = useRef(globalCurrentSectionIndex);

    useEffect(() => {
        // If already initialized, just sync the current section index
        if (hasGloballyInitialized) {
            // Re-sync current section from URL hash on re-mount (e.g., after language toggle)
            const hash = window.location.hash.slice(1); // Remove '#'

            if (hash) {
                // Wait for sections to render, then scroll to hash
                setTimeout(() => {
                    const targetSection = document.getElementById(hash);

                    if (targetSection && targetSection.classList.contains('scroll-snap-section')) {
                        const sections = document.querySelectorAll('.scroll-snap-section');
                        const targetIndex = Array.from(sections).indexOf(targetSection);

                        if (targetIndex !== -1) {
                            currentSectionIndex.current = targetIndex;
                            globalCurrentSectionIndex = targetIndex;

                            // Actually scroll to the section
                            const targetY = targetSection.offsetTop;
                            window.scrollTo(0, targetY);
                        }
                    }
                }, 100); // Wait for sections to be ready
            } else {
                // No hash - sync based on scroll position
                const resyncTimeout = setTimeout(() => {
                    const sections = document.querySelectorAll('.scroll-snap-section');
                    if (sections.length > 0) {
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
                    }
                }, 100);

                return () => clearTimeout(resyncTimeout);
            }

            return;
        }

        // Warte bis alle Sections geladen sind (wegen dynamic imports)
        const initTimeout = setTimeout(() => {
            const sections = document.querySelectorAll('.scroll-snap-section');
            if (sections.length === 0) {
                return;
            }

            hasGloballyInitialized = true;

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

                // Lock scrolling immediately
                isScrolling.current = true;
                globalIsScrolling = true;

                const section = sections[index] as HTMLElement;
                const targetY = section.offsetTop;
                const startY = window.scrollY;
                const distance = targetY - startY;
                const duration = 700;
                let startTime: number | null = null;

                // Easing mit langsamerem Ende (ease-out)
                const easeOutQuart = (t: number): number => {
                    return 1 - Math.pow(1 - t, 4);
                };

                const animation = (currentTime: number) => {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const progress = Math.min(timeElapsed / duration, 1);

                    const ease = easeOutQuart(progress);
                    const currentY = startY + (distance * ease);

                    window.scrollTo(0, currentY);

                    if (progress < 1) {
                        requestAnimationFrame(animation);
                    } else {
                        // Animation beendet - Update Index und unlock
                        currentSectionIndex.current = index;
                        globalCurrentSectionIndex = index;
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

            const handleWheel = (e: WheelEvent) => {
                e.preventDefault();

                // Sync global state with local ref
                if (globalIsScrolling || isScrolling.current) {
                    return;
                }

                const delta = e.deltaY;

                // Ignoriere zu kleine Bewegungen
                if (Math.abs(delta) < 5) return;

                // Bestimme Richtung
                const direction = delta > 0 ? 1 : -1;
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

            // Passive: false wichtig für preventDefault
            window.addEventListener('wheel', handleWheel, { passive: false });
            window.addEventListener('keydown', handleKeyDown);

            // Cleanup only on unmount - don't remove listeners on re-mount
            // (hasGloballyInitialized prevents re-adding listeners)
            return undefined;
        }, 500); // 500ms Delay für dynamic imports

        return () => {
            clearTimeout(initTimeout);
            // DON'T cleanup listeners here - they should persist across re-mounts
        };
    }, []);
}
