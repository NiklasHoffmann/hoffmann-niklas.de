'use client';

import { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { InteractiveModeProvider } from '@/contexts/InteractiveModeContext';

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            <InteractiveModeProvider>
                {children}
            </InteractiveModeProvider>
        </NextThemesProvider>
    );
}
