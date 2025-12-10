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

    return (
        <NextIntlClientProvider locale={locale}>
            {/* Key forces re-mount on layout change (portrait<->landscape) */}
            <div
                key={`${device.layout}-${device.width}-${device.height}`}
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
