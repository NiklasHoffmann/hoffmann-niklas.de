'use client';

import { useEffect, useRef } from 'react';

export function useSectionScroll() {
    const isScrolling = useRef(false);
    const currentSectionIndex = useRef(0);
    const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
    const wheelDirection = useRef(0);

    useEffect(() => {
        // Warte bis alle Sections geladen sind (wegen dynamic imports)
        const initTimeout = setTimeout(() => {
            const sections = document.querySelectorAll('.scroll-snap-section');
            if (sections.length === 0) {
                console.warn('⚠️ No sections found!');
                return;
            }

            console.log(`🎯 Found ${sections.length} sections:`, Array.from(sections).map((s, i) => `${i}: ${s.id || s.className}`));

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
                console.log('🎯 Initial section:', closestIndex);
            };

            // Beim Mount die aktuelle Section ermitteln
            initCurrentSection();

            const scrollToSection = (index: number) => {
                if (index < 0 || index >= sections.length) return;

                const section = sections[index] as HTMLElement;
                const targetY = section.offsetTop;
                const startY = window.scrollY;
                const distance = targetY - startY;
                const duration = 700;
                let startTime: number | null = null;

                console.log(`📜 Scrolling from section ${currentSectionIndex.current} to ${index}`);

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
                        isScrolling.current = false;
                        console.log('✅ Scroll complete, at section:', index);
                    }
                };

                requestAnimationFrame(animation);
            };

            const handleWheel = (e: WheelEvent) => {
                e.preventDefault();

                // Während Animation läuft: komplett ignorieren
                if (isScrolling.current) {
                    return;
                }

                const delta = e.deltaY;

                // Ignoriere zu kleine Bewegungen
                if (Math.abs(delta) < 5) return;

                // Sofort zur nächsten Section scrollen beim ersten Event
                const direction = delta > 0 ? 1 : -1;
                const targetIndex = currentSectionIndex.current + direction;

                if (targetIndex >= 0 && targetIndex < sections.length) {
                    isScrolling.current = true;
                    scrollToSection(targetIndex);
                }
            };

            const handleKeyDown = (e: KeyboardEvent) => {
                if (isScrolling.current) return;

                if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                    e.preventDefault();
                    const targetIndex = currentSectionIndex.current + 1;
                    if (targetIndex < sections.length) {
                        isScrolling.current = true;
                        scrollToSection(targetIndex);
                        // isScrolling wird in scrollToSection zurückgesetzt
                    }
                } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                    e.preventDefault();
                    const targetIndex = currentSectionIndex.current - 1;
                    if (targetIndex >= 0) {
                        isScrolling.current = true;
                        scrollToSection(targetIndex);
                        // isScrolling wird in scrollToSection zurückgesetzt
                    }
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    isScrolling.current = true;
                    scrollToSection(0);
                    // isScrolling wird in scrollToSection zurückgesetzt
                } else if (e.key === 'End') {
                    e.preventDefault();
                    isScrolling.current = true;
                    scrollToSection(sections.length - 1);
                    // isScrolling wird in scrollToSection zurückgesetzt
                }
            };

            // Passive: false wichtig für preventDefault
            window.addEventListener('wheel', handleWheel, { passive: false });
            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('wheel', handleWheel);
                window.removeEventListener('keydown', handleKeyDown);
            };
        }, 500); // 500ms Delay für dynamic imports

        return () => {
            clearTimeout(initTimeout);
        };
    }, []);
}
