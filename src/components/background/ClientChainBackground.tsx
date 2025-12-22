'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

// Lazy-load ChainBackground to reduce initial script evaluation (Canvas doesn't need SSR)
const ChainBackground = dynamic(
    () => import('./ChainBackground').then(mod => ({ default: mod.ChainBackground })),
    { ssr: false }
);

// Memoize to prevent re-rendering on parent updates (e.g., language changes)
export const ClientChainBackground = memo(function ClientChainBackground() {
    return <ChainBackground />;
});
