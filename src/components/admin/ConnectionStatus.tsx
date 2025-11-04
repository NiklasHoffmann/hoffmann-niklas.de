'use client';

interface ConnectionStatusProps {
    isConnected: boolean;
    isDark: boolean;
}

export function ConnectionStatus({ isConnected, isDark }: ConnectionStatusProps) {
    return (
        <div
            className="px-3 py-1.5 rounded-lg border-2 shadow-sm"
            style={{
                backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                borderColor: isConnected ? '#10b981' : '#ef4444'
            }}
        >
            <div className="flex items-center gap-2">
                <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isConnected ? '#10b981' : '#ef4444' }}
                ></span>
                <p
                    className="text-xs font-medium"
                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                >
                    {isConnected ? 'Connected' : 'Disconnected'}
                </p>
            </div>
        </div>
    );
}
