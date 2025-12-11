'use client';

import { useEffect } from 'react';

/**
 * BrowserUIController - Disabled on mobile
 * 
 * Mobile devices use native browser UI behavior (auto-hide on scroll down, show on scroll up)
 * Desktop keeps the custom smooth scroll from SmoothScrollEnhancer
 */
export function BrowserUIController() {
    // Component disabled - native mobile behavior is better
    return null;
}
