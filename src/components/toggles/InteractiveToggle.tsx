'use client';

import { Icon } from '@/components/icons/LocalIcon';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';
import { useTheme } from 'next-themes';

export function InteractiveToggle() {
    const { isInteractive, setIsInteractive, showActive, mounted } = useInteractiveMode();
    const { theme } = useTheme();

    // Use mounted check to avoid hydration mismatch
    const isActive = mounted && showActive;

    // Shadow color based on theme - only after mount to avoid hydration mismatch
    const getBaseShadow = () => {
        if (!mounted) return '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
        return theme === 'dark'
            ? '0 0 8px 1px rgba(255, 255, 255, 0.35), 0 10px 15px -3px rgba(255, 255, 255, 0.2), 0 4px 6px -4px rgba(255, 255, 255, 0.15)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
    };

    // Active shadow based on theme - stronger in dark mode for better visibility
    const getActiveShadow = () => {
        return theme === 'dark'
            ? '0 0 12px 2px rgba(6, 182, 212, 0.8), 0 10px 15px -3px rgba(6, 182, 212, 0.6), 0 4px 6px -4px rgba(6, 182, 212, 0.5)'
            : '0 0 8px 1px rgba(6, 182, 212, 0.6), 0 10px 15px -3px rgba(6, 182, 212, 0.5), 0 4px 6px -4px rgba(6, 182, 212, 0.4)';
    };

    return (
        <button
            onClick={() => setIsInteractive(!isInteractive)}
            style={{
                backgroundColor: isActive ? '#06b6d4' : 'transparent',
                boxShadow: isActive
                    ? getActiveShadow()
                    : getBaseShadow(),
                transition: 'all 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
            }}
            className={`
                p-2 rounded-lg relative
                w-[36px] h-[36px] flex items-center justify-center
                hover:brightness-110 hover:transition-all hover:duration-500
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
            `}
            aria-label="Toggle Interactive Mode"
            title={isInteractive ? "Interaktiven Modus ausschalten" : "Interaktiven Modus einschalten"}
        >
            {/* Filled sparkles - shown when active */}
            <Icon icon="lucide:sparkles" className={`h-5 w-5 text-foreground absolute transition-all duration-700 ease-in-out ${isInteractive ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-0'
                }`} />

            {/* Outline sparkles - shown when inactive */}
            <Icon icon="lucide:sparkles" className={`h-5 w-5 text-foreground absolute transition-all duration-700 ease-in-out ${!isInteractive ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'
                }`} />

            {/* Glow effect when active */}
            {isActive && (
                <span className="absolute inset-0 rounded-lg blur-sm transition-opacity duration-700 ease-in-out bg-white/15" />
            )}
        </button>
    );
}
