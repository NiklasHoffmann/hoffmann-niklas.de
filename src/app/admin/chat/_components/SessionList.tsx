'use client';

import { Icon } from '@/components/icons/LocalIcon';
import type { ChatSession } from '@/types/chat';
import { formatTime } from '@/lib/chatUtils';

interface SessionListProps {
    sessions: ChatSession[];
    selectedSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    isDark: boolean;
}

export function SessionList({ sessions, selectedSessionId, onSelectSession, isDark }: SessionListProps) {
    if (!sessions || sessions.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <Icon icon="mdi:chat-outline" className="w-12 h-12 mx-auto text-accent/40 mb-3" />
                <h3
                    className="font-semibold mb-1"
                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                >
                    No chat sessions
                </h3>
                <p
                    className="text-sm"
                    style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                >
                    New chats will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="p-2 space-y-1">
            {sessions.map((session) => (
                <div
                    key={session._id}
                    onClick={() => onSelectSession(session.sessionId)}
                    className="p-3 rounded-lg cursor-pointer transition-all"
                    style={{
                        backgroundColor: selectedSessionId === session.sessionId
                            ? isDark ? '#1a1a1a' : '#f3f4f6'
                            : 'transparent',
                        borderLeft: selectedSessionId === session.sessionId
                            ? '3px solid #3b82f6'
                            : '3px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                        if (selectedSessionId !== session.sessionId) {
                            e.currentTarget.style.backgroundColor = isDark ? '#0d0d0d' : '#f9fafb';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (selectedSessionId !== session.sessionId) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                            <Icon icon="mdi:account-circle" className="w-8 h-8 text-accent flex-shrink-0 mt-0.5" />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3
                                        className="font-semibold truncate"
                                        style={{ color: isDark ? '#ffffff' : '#111827' }}
                                    >
                                        {session.userName}
                                    </h3>
                                    {session.isActive && (
                                        <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                                    )}
                                    {(session as any).blocked && (
                                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-600 dark:text-red-400 text-xs rounded flex-shrink-0 flex items-center gap-1">
                                            <Icon icon="mdi:block-helper" className="w-3 h-3" />
                                            Blocked
                                        </span>
                                    )}
                                </div>

                                {session.lastMessage && (
                                    <p
                                        className="text-xs truncate"
                                        style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                                    >
                                        {session.lastMessage.sender === 'admin' && 'You: '}
                                        {session.lastMessage.message}
                                    </p>
                                )}

                                {session.totalMessages && session.totalMessages > 0 && (
                                    <p
                                        className="text-xs mt-0.5"
                                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                                    >
                                        {session.totalMessages} {session.totalMessages === 1 ? 'message' : 'messages'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 ml-2">
                            <p
                                className="text-xs whitespace-nowrap"
                                style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                            >
                                {session.lastMessage
                                    ? formatTime(session.lastMessage.timestamp)
                                    : formatTime(session.createdAt)
                                }
                            </p>

                            {(session.unreadCount || 0) > 0 && (
                                <div className="bg-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {(session.unreadCount || 0) > 9 ? '9+' : session.unreadCount}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
