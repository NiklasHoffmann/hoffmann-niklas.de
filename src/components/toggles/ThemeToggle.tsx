'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const { showActive, mounted } = useInteractiveMode();

    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

    // Shadow color based on theme - only after mount to avoid hydration mismatch
    const getBaseShadow = () => {
        if (!mounted) return '0 2px 8px rgba(0, 0, 0, 0.15)';
        return theme === 'dark'
            ? '0 2px 8px rgba(255, 255, 255, 0.15)'
            : '0 2px 8px rgba(0, 0, 0, 0.15)';
    };

    // Prevent hydration mismatch by not rendering theme-dependent content until mounted
    if (!mounted) {
        return (
            <button
                className="p-2 rounded-lg relative w-[36px] h-[36px] flex items-center justify-center opacity-50"
                style={{
                    backgroundColor: 'transparent',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'all 700ms ease-in-out'
                }}
                aria-label="Toggle theme"
                disabled
            >
                <Moon className="w-5 h-5 text-foreground" />
            </button>
        );
    }

    // Use mounted check to avoid hydration mismatch
    const isActive = mounted && showActive;

    return (
        <button
            onClick={toggleTheme}
            style={{
                backgroundColor: isActive ? '#eab308' : 'transparent',
                boxShadow: isActive
                    ? '0 10px 15px -3px rgba(234, 179, 8, 0.5), 0 4px 6px -4px rgba(234, 179, 8, 0.5)'
                    : getBaseShadow(),
                transition: 'all 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
            }}
            className={`
                p-2 rounded-lg relative
                w-[36px] h-[36px] flex items-center justify-center
                hover:brightness-110 hover:transition-all hover:duration-500
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
            `}
            aria-label="Toggle theme"
            title={theme === 'dark' ? "Wechsel zu hellem Modus" : "Switch to dark mode"}
        >
            <Sun className={`w-5 h-5 text-foreground absolute transition-all duration-700 ease-in-out ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`} />
            <Moon className={`w-5 h-5 text-foreground absolute transition-all duration-700 ease-in-out ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
            {isActive && (
                <span className="absolute inset-0 rounded-lg blur-sm transition-opacity duration-700 ease-in-out bg-white/15" />
            )}
        </button>
    );
}
