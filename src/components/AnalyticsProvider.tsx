/**
 * Analytics Provider - Client Component
 * Aktiviert automatisches Tracking für die gesamte Website
 */

'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsProvider() {
    useAnalytics();
    return null;
}
