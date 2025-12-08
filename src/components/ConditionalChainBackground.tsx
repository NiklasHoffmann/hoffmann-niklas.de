'use client';

import { usePathname } from 'next/navigation';
import { ChainBackground } from './ChainBackground';

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
