'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy-load ChainBackground to reduce initial script evaluation
const ChainBackground = dynamic(
    () => import('./ChainBackground').then(mod => ({ default: mod.ChainBackground })),
    { ssr: false } // Canvas doesn't need SSR
);

export function ConditionalChainBackground() {
    const pathname = usePathname();

    // Don't render ChainBackground on admin, api, chain-preview, impressum, or datenschutz routes
    if (pathname?.startsWith('/admin') ||
        pathname?.startsWith('/api') ||
        pathname?.startsWith('/chain-preview') ||
        pathname?.includes('/impressum') ||
        pathname?.includes('/datenschutz')) {
        return null;
    }

    return <ChainBackground />;
}
