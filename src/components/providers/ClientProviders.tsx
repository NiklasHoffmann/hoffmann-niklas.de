'use client';

import { ReactNode, useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { InteractiveModeProvider } from '@/contexts/InteractiveModeContext';
import { DeviceProvider } from '@/contexts/DeviceContext';

// Suppress console.log in production (keep warn and error)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.log = () => { };
    console.debug = () => { };
    console.info = () => { };
}

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <DeviceProvider>
                <InteractiveModeProvider>
                    {children}
                </InteractiveModeProvider>
            </DeviceProvider>
        </NextThemesProvider>
    );
}
