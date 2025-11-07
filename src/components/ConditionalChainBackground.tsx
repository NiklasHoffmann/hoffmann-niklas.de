'use client';

import { usePathname } from 'next/navigation';
import { ChainBackground } from './ChainBackground';

export function ConditionalChainBackground() {
    const pathname = usePathname();

    // Don't render ChainBackground on admin, api, or chain-preview routes
    if (pathname?.startsWith('/admin') ||
        pathname?.startsWith('/api') ||
        pathname?.startsWith('/chain-preview')) {
        return null;
    }

    return <ChainBackground />;
}
