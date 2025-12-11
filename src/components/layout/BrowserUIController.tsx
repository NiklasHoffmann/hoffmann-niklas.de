'use client';

import { useEffect } from 'react';

/**
 * BrowserUIController - Disabled on mobile
 * 
 * Mobile now uses scroll-snap-stop: always in CSS to prevent multi-section jumps
 * No hash updates on mobile to prevent scroll jumps when browser UI appears
 */
export function BrowserUIController() {
    // Component disabled - scroll behavior handled via CSS
    return null;
}
