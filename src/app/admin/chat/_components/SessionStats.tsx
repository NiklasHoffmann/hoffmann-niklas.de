'use client';

import type { ChatSession } from '@/types/chat';

interface SessionStatsProps {
    sessions: ChatSession[];
    isDark: boolean;
}

export function SessionStats({ sessions, isDark }: SessionStatsProps) {
    const activeCount = sessions?.filter(s => s.isActive).length || 0;
    const unreadCount = sessions?.reduce((sum, s) => sum + (s.unreadCount || 0), 0) || 0;

    return (
        <div className="grid grid-cols-2 gap-2 mt-3">
            <div
                className="flex-1 px-3 py-2 rounded-lg border text-center"
                style={{
                    backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                    borderColor: isDark ? '#262626' : '#d1d5db'
                }}
            >
                <p className="text-lg font-bold text-accent">{activeCount}</p>
                <p
                    className="text-xs"
                    style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                >
                    Active
                </p>
            </div>
            <div
                className="flex-1 px-3 py-2 rounded-lg border text-center"
                style={{
                    backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                    borderColor: isDark ? '#262626' : '#d1d5db'
                }}
            >
                <p className="text-lg font-bold text-accent">{unreadCount}</p>
                <p
                    className="text-xs"
                    style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                >
                    Unread
                </p>
            </div>
        </div>
    );
}
