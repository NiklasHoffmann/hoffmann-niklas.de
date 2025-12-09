/**
 * Analytics Provider - Client Component
 * Aktiviert automatisches Tracking für die gesamte Website
 * Uses requestIdleCallback to avoid blocking main thread
 */

'use client';

import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsProvider() {
    const [shouldTrack, setShouldTrack] = useState(false);

    // Delay analytics initialization to not block main thread
    useEffect(() => {
        // Use requestIdleCallback if available, otherwise setTimeout
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(() => {
                setShouldTrack(true);
            }, { timeout: 2000 }); // Max wait 2 seconds
            return () => window.cancelIdleCallback(id);
        } else {
            const timeout = setTimeout(() => {
                setShouldTrack(true);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, []);

    // Only run analytics after idle
    if (shouldTrack) {
        return <AnalyticsTracker />;
    }

    return null;
}

// Separate component to use the hook
function AnalyticsTracker() {
    useAnalytics();
    return null;
}
