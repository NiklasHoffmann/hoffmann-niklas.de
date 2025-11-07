'use client';

import { Sparkles, SparklesIcon } from 'lucide-react';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useTheme } from 'next-themes';

export function InteractiveToggle() {
    const { isInteractive, setIsInteractive, showActive, mounted } = useInteractiveMode();
    const { theme } = useTheme();

    // Shadow color based on theme - only after mount to avoid hydration mismatch
    const getBaseShadow = () => {
        if (!mounted) return '0 2px 8px rgba(0, 0, 0, 0.15)';
        return theme === 'dark'
            ? '0 2px 8px rgba(255, 255, 255, 0.15)'
            : '0 2px 8px rgba(0, 0, 0, 0.15)';
    };

    return (
        <button
            onClick={() => setIsInteractive(!isInteractive)}
            style={{
                backgroundColor: showActive ? '#06b6d4' : 'transparent',
                boxShadow: showActive
                    ? '0 10px 15px -3px rgba(6, 182, 212, 0.5), 0 4px 6px -4px rgba(6, 182, 212, 0.5)'
                    : getBaseShadow(),
                transition: 'all 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
            }}
            className={`
                p-2 rounded-lg relative
                w-[36px] h-[36px] flex items-center justify-center
                hover:brightness-110 hover:transition-all hover:duration-500
            `}
            aria-label="Toggle Interactive Mode"
            title={isInteractive ? "Interaktiven Modus ausschalten" : "Interaktiven Modus einschalten"}
        >
            {/* Filled sparkles - shown when active */}
            <Sparkles className={`h-5 w-5 text-foreground absolute transition-all duration-700 ease-in-out ${isInteractive ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-0'
                }`} />

            {/* Outline sparkles - shown when inactive */}
            <SparklesIcon className={`h-5 w-5 text-foreground absolute transition-all duration-700 ease-in-out ${!isInteractive ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'
                }`} />

            {/* Glow effect when active */}
            {showActive && (
                <span className="absolute inset-0 rounded-lg blur-sm transition-opacity duration-700 ease-in-out bg-white/15" />
            )}
        </button>
    );
}
