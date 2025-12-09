'use client';

import { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { InteractiveModeProvider } from '@/contexts/InteractiveModeContext';
import { DeviceProvider } from '@/contexts/DeviceContext';

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
