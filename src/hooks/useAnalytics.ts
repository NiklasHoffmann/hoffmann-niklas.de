/**
 * Analytics Tracking Hook
 * DSGVO-konform - kein IP-Tracking, nur Session-basiert
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

// Helper: Generate unique visitor ID (stored in localStorage)
function getVisitorId(): string {
    if (typeof window === 'undefined') return '';

    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
}

// Helper: Generate session ID (stored in sessionStorage)
function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

// Helper: Get device info
function getDeviceInfo(currentTheme?: string) {
    if (typeof window === 'undefined') return {};

    // Device Type Detection (für iPads die sich als Desktop ausgeben)
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

    const userAgent = navigator.userAgent.toLowerCase();
    const hasTouch = navigator.maxTouchPoints > 0;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const minDimension = Math.min(screenWidth, screenHeight);
    const maxDimension = Math.max(screenWidth, screenHeight);

    // Android Tablet Detection (ZUERST, da Android sehr eindeutig ist)
    // Samsung Galaxy Tab, Pixel Tablet, etc.
    if (/android/i.test(userAgent)) {
        // Android mit Touch und größerem Screen = Tablet
        // Tablets haben typisch mindestens 7" (ca. 600px min dimension)
        // und maximal 15" (ca. 3000px max dimension)
        if (hasTouch && minDimension >= 600) {
            deviceType = 'tablet';
        } else {
            deviceType = 'mobile';
        }
    }
    // iPad Detection (iPadOS 13+ gibt sich als Mac aus)
    // iPad hat Touch-Support und typische iPad-Auflösungen
    else if (/ipad/i.test(userAgent)) {
        deviceType = 'tablet';
    }
    else if (hasTouch && /macintosh/i.test(userAgent)) {
        // MacOS mit Touch = sehr wahrscheinlich iPad
        deviceType = 'tablet';
    }
    else if (hasTouch && (
        (screenWidth === 768 && screenHeight === 1024) ||  // iPad
        (screenWidth === 1024 && screenHeight === 768) ||  // iPad landscape
        (screenWidth === 834 && screenHeight === 1112) ||  // iPad Pro 10.5"
        (screenWidth === 1112 && screenHeight === 834) ||  // iPad Pro 10.5" landscape
        (screenWidth === 834 && screenHeight === 1194) ||  // iPad Pro 11"
        (screenWidth === 1194 && screenHeight === 834) ||  // iPad Pro 11" landscape
        (screenWidth === 1024 && screenHeight === 1366) || // iPad Pro 12.9"
        (screenWidth === 1366 && screenHeight === 1024)    // iPad Pro 12.9" landscape
    )) {
        deviceType = 'tablet';
    }
    // Andere Tablets
    else if (/tablet|playbook|silk|kindle/i.test(userAgent)) {
        deviceType = 'tablet';
    }
    // Mobile Phones
    else if (/mobile|iphone|ipod|blackberry|iemobile|opera mini|windows phone/i.test(userAgent)) {
        deviceType = 'mobile';
    }
    // Touch-Device Detection (für unbekannte Tablets/Phones)
    else if (hasTouch) {
        // Touch + kleiner Screen (< 600px) = Mobile
        if (minDimension < 600) {
            deviceType = 'mobile';
        }
        // Touch + mittlerer/großer Screen (>= 600px) = Tablet
        // Auch große Tablets wie Samsung Galaxy Tab S10 Ultra (2960x1848)
        else if (minDimension >= 600 && maxDimension <= 3200) {
            deviceType = 'tablet';
        }
        // Touch + sehr großer Screen (> 3200px) = könnte Touch-Monitor sein
        else {
            deviceType = 'desktop';
        }
    }

    return {
        deviceType,
        screenResolution: `${screenWidth}x${screenHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        theme: currentTheme || 'unknown'
    };
}

// Helper: Get UTM parameters
function getUTMParams(): Record<string, string> {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
        source: params.get('utm_source') || '',
        medium: params.get('utm_medium') || '',
        campaign: params.get('utm_campaign') || '',
        term: params.get('utm_term') || '',
        content: params.get('utm_content') || ''
    };
}

// Track Event Function
async function trackEvent(eventType: string, data: any = {}, currentTheme?: string) {
    if (typeof window === 'undefined') return;

    // Skip tracking im Admin-Bereich
    if (window.location.pathname.startsWith('/admin')) return;

    const payload = {
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
        eventType,
        page: {
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            locale: window.location.pathname.split('/')[1] || 'de'
        },
        device: getDeviceInfo(currentTheme),
        location: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        utm: getUTMParams(),
        ...data
    };

    try {
        // Fire-and-forget mit 2 Sekunden Timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

    } catch (error) {
        // Silent fail - Analytics sollten die UX nicht beeinträchtigen
        if (error instanceof Error && error.name !== 'AbortError') {
            console.debug('Analytics tracking failed:', error);
        }
    }
}

export function useAnalytics() {
    const pathname = usePathname();
    const { theme, resolvedTheme, systemTheme } = useTheme();
    const pageStartTime = useRef<number>(Date.now());
    const sessionStartTime = useRef<number>(Date.now());
    const scrollDepthTracked = useRef<number>(0);
    const isInitialized = useRef<boolean>(false);
    const lastTrackedTheme = useRef<string>('');
    const [mounted, setMounted] = useState(false);

    // Warte bis Component mounted ist (client-side)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Use resolvedTheme (actual applied theme) - dark or light
    // resolvedTheme ist das tatsächlich angezeigte Theme (berücksichtigt system preference)
    const currentTheme = mounted ? (resolvedTheme || systemTheme || theme || 'unknown') : 'unknown';

    // Track Session Start (einmalig)
    useEffect(() => {
        if (isInitialized.current) return;

        // Starte Session sofort, auch wenn Theme noch nicht geladen ist
        isInitialized.current = true;
        lastTrackedTheme.current = currentTheme;

        trackEvent('session_start', {}, currentTheme);
        sessionStartTime.current = Date.now();

        // Session End beim Verlassen
        // Use 'pagehide' instead of 'beforeunload' for bfcache compatibility
        const handlePageHide = (event: PageTransitionEvent) => {
            // event.persisted = true means page is going into bfcache
            const sessionDuration = Math.round((Date.now() - sessionStartTime.current) / 1000);
            trackEvent('session_end', {
                sessionDuration,
                bfcached: event.persisted // Track if page was bfcached
            }, currentTheme);
        };

        window.addEventListener('pagehide', handlePageHide);
        return () => window.removeEventListener('pagehide', handlePageHide);
    }, []);

    // Track Page View (bei Route-Wechsel)
    useEffect(() => {
        // Skip Admin
        if (pathname?.startsWith('/admin')) return;

        const timeOnPreviousPage = Math.round((Date.now() - pageStartTime.current) / 1000);
        pageStartTime.current = Date.now();

        trackEvent('pageview', {
            timeOnPage: timeOnPreviousPage
        }, currentTheme);

        // Scroll Tracking
        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollDepth = Math.round(
                    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                );

                // Nur tracken wenn neue Milestone erreicht (25%, 50%, 75%, 100%)
                const milestones = [25, 50, 75, 100];
                const currentMilestone = milestones.find(m => scrollDepth >= m && m > scrollDepthTracked.current);

                if (currentMilestone) {
                    scrollDepthTracked.current = currentMilestone;
                    trackEvent('scroll', { scrollDepth: currentMilestone }, currentTheme);
                }
            }, 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [pathname, currentTheme]);

    // Track Clicks (globales Click-Tracking)
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Links tracken
            if (target.tagName === 'A') {
                const href = target.getAttribute('href');
                trackEvent('click', {
                    interaction: {
                        element: 'link',
                        elementText: target.textContent?.trim(),
                        targetUrl: href
                    }
                }, currentTheme);
            }

            // Buttons tracken
            else if (target.tagName === 'BUTTON' || target.closest('button')) {
                const button = target.tagName === 'BUTTON' ? target : target.closest('button');
                trackEvent('click', {
                    interaction: {
                        element: 'button',
                        elementText: button?.textContent?.trim(),
                        elementId: button?.id
                    }
                }, currentTheme);
            }

            // Spezielle Elements mit data-track Attribut
            else if (target.dataset.track) {
                trackEvent('click', {
                    interaction: {
                        element: target.dataset.track,
                        elementText: target.textContent?.trim(),
                        elementId: target.id
                    }
                }, currentTheme);
            }
        };

        document.addEventListener('click', handleClick, { capture: true });
        return () => document.removeEventListener('click', handleClick, { capture: true });
    }, [currentTheme]);

    // Track Theme Changes
    useEffect(() => {
        if (!isInitialized.current) return; // Nur nach Initialisierung tracken
        if (!resolvedTheme) return; // Warte bis resolvedTheme verfügbar ist
        if (lastTrackedTheme.current === resolvedTheme) return; // Keine Änderung

        console.log('Theme detected:', resolvedTheme, 'Previous:', lastTrackedTheme.current);

        // Nur tracken wenn sich das Theme wirklich geändert hat UND es nicht die erste Erkennung ist
        if (lastTrackedTheme.current !== '' && lastTrackedTheme.current !== resolvedTheme) {
            console.log('Tracking theme change event');
            trackEvent('theme_change', {
                interaction: {
                    element: 'theme-toggle',
                    previousTheme: lastTrackedTheme.current,
                    newTheme: resolvedTheme
                }
            }, resolvedTheme);
        }

        lastTrackedTheme.current = resolvedTheme;
    }, [resolvedTheme]);

    // Return tracking functions für manuelles Tracking
    return {
        trackEvent: (eventType: string, data?: any) => trackEvent(eventType, data, currentTheme),
        trackCustomEvent: (eventName: string, data?: any) => {
            trackEvent('custom', {
                interaction: {
                    element: eventName,
                    ...data
                }
            }, currentTheme);
        }
    };
}
