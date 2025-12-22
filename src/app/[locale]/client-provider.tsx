'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { useDevice } from '@/contexts/DeviceContext';

export function ClientProvider({
    children,
    locale,
}: {
    children: ReactNode;
    locale: string;
}) {
    // Use device context to force re-render on orientation/layout change
    const device = useDevice();

    // Only remount on device layout changes, not on locale changes
    // This keeps the Chain background persistent across language switches
    return (
        <NextIntlClientProvider locale={locale}>
            {/* Key forces re-mount ONLY on layout change (portrait<->landscape), not on locale */}
            <div
                key={`${device.layout}`}
                style={{
                    width: '100%',
                    maxWidth: '100vw',
                    minWidth: '100vw',
                    position: 'relative'
                }}
            >
                {children}
            </div>
        </NextIntlClientProvider>
    );
}
