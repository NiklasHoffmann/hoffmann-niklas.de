'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { INTERACTIVE_MODE } from '@/config/ui.constants';

interface InteractiveModeContextType {
    isInteractive: boolean;
    setIsInteractive: (value: boolean) => void;
    mounted: boolean;
    /** Helper to determine if active effects should be shown */
    showActive: boolean;
}

const InteractiveModeContext = createContext<InteractiveModeContextType | undefined>(undefined);

export function InteractiveModeProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    // Disable interactive mode on mobile devices for better performance
    const isMobileDevice = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const [isInteractive, setIsInteractive] = useState<boolean>(isMobileDevice ? false : INTERACTIVE_MODE.SSR_DEFAULT);

    // Load from localStorage on mount (but only on desktop)
    useEffect(() => {
        if (isMobileDevice) {
            // Force off on mobile, don't load from storage
            setIsInteractive(false);
            setMounted(true);
            return;
        }

        const saved = localStorage.getItem(INTERACTIVE_MODE.STORAGE_KEY);
        if (saved !== null) {
            setIsInteractive(saved === 'true');
        }
        setMounted(true);
    }, [isMobileDevice]);

    // Save to localStorage when changed (after initial mount, desktop only)
    useEffect(() => {
        if (!mounted || isMobileDevice) return;
        localStorage.setItem(INTERACTIVE_MODE.STORAGE_KEY, String(isInteractive));
    }, [isInteractive, mounted, isMobileDevice]);

    const showActive = mounted && isInteractive;

    return (
        <InteractiveModeContext.Provider value={{ isInteractive, setIsInteractive, mounted, showActive }}>
            {children}
        </InteractiveModeContext.Provider>
    );
}

export function useInteractiveMode() {
    const context = useContext(InteractiveModeContext);
    if (context === undefined) {
        throw new Error('useInteractiveMode must be used within InteractiveModeProvider');
    }
    return context;
}
