'use client';

import dynamic from 'next/dynamic';

// Lazy-load ChainBackground to reduce initial script evaluation (Canvas doesn't need SSR)
const ChainBackground = dynamic(
    () => import('./ChainBackground').then(mod => ({ default: mod.ChainBackground })),
    { ssr: false }
);

export function ClientChainBackground() {
    return <ChainBackground />;
}
