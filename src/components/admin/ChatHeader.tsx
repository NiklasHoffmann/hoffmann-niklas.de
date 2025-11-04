'use client';

import { Icon } from '@iconify/react';
import type { ChatSession } from '@/types/chat';

interface ChatHeaderProps {
    session: ChatSession | undefined;
    onBack: () => void;
    onDelete: () => void;
    onBlock: () => void;
    isDark: boolean;
    isMobile?: boolean;
}

export function ChatHeader({ session, onBack, onDelete, onBlock, isDark, isMobile = false }: ChatHeaderProps) {
    return (
        <div
            className="p-4 border-b flex items-center justify-between"
            style={{
                backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                borderColor: isDark ? '#262626' : '#d1d5db'
            }}
        >
            <div className="flex items-center gap-3">
                {/* Back button for mobile */}
                {isMobile && (
                    <button
                        onClick={onBack}
                        className="md:hidden p-2 -ml-2 rounded-lg transition-colors"
                        style={{ color: isDark ? '#ffffff' : '#111827' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1a1a1a' : '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Icon icon="mdi:arrow-left" className="w-6 h-6" />
                    </button>
                )}

                <Icon icon="mdi:account-circle" className="w-10 h-10 text-accent" />
                <div>
                    <h3
                        className="font-semibold"
                        style={{ color: isDark ? '#ffffff' : '#111827' }}
                    >
                        {session?.userName || 'User'}
                    </h3>
                    <p
                        className="text-xs flex items-center gap-1"
                        style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                    >
                        {session?.isActive ? (
                            <>
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Online
                            </>
                        ) : (
                            'Offline'
                        )}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onDelete}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1a1a1a' : '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Delete Chat"
                >
                    <Icon icon="mdi:delete" className="w-5 h-5 text-red-500" />
                </button>
                <button
                    onClick={onBlock}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1a1a1a' : '#fef3c7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Block User"
                >
                    <Icon icon="mdi:block-helper" className="w-5 h-5 text-yellow-600" />
                </button>
            </div>
        </div>
    );
}
