'use client';

import { useChat } from '@/contexts/ChatContext';
import ChatWindow from './ChatWindow';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';

// Global cache for theme to prevent flash on language change
let cachedIsDark = true;
let hasInitializedTheme = false;

export default function ChatWidget() {
    const { isOpen, isMinimized, unreadCount, openChat, closeChat, toggleMinimize } = useChat();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(() => cachedIsDark);
    const pathname = usePathname();
    const t = useTranslations('chat');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && theme) {
            const newIsDark = theme === 'dark';
            cachedIsDark = newIsDark;
            hasInitializedTheme = true;
            setIsDark(newIsDark);
        }
    }, [mounted, theme]);

    // Hide chat widget on admin pages
    if (pathname?.includes('/admin')) {
        return null;
    }

    // Nicht anzeigen wenn komplett geschlossen
    if (!isOpen) {
        return (
            <button
                onClick={openChat}
                className="fixed bottom-6 right-6 z-50 group"
                aria-label="Open chat"
            >
                {/* Floating Chat Button */}
                <div className="relative">
                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                    )}

                    {/* Main Button */}
                    <div
                        className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl border-2 bg-card border-border group-hover:scale-105"
                        style={{
                            transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out, transform 700ms ease-in-out'
                        }}
                    >
                        {/* Icon */}
                        <Icon
                            icon="mdi:chat"
                            className="w-8 h-8 relative z-10 text-foreground"
                            style={{
                                transition: 'color 700ms ease-in-out'
                            }}
                            ssr={true}
                        />
                    </div>
                </div>
            </button>
        );
    }

    // Chat ist offen
    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isMinimized ? (
                // Minimized State - Theme-aware Header
                <div
                    className="w-80 border-2 rounded-lg shadow-2xl overflow-hidden"
                    style={{
                        backgroundColor: isDark ? '#090909' : '#ffffff',
                        borderColor: isDark ? '#1a1a1a' : '#d1d5db',
                        transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out'
                    }}
                >
                    <div
                        className="flex items-center justify-between p-4 cursor-pointer border-b-2"
                        style={{
                            backgroundColor: isDark ? 'rgba(13, 13, 13, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            borderColor: isDark ? '#1a1a1a' : '#d1d5db',
                            transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#1a1a1a' : '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(13, 13, 13, 0.8)' : 'rgba(255, 255, 255, 0.8)';
                        }}
                    >
                        <button
                            onClick={toggleMinimize}
                            className="flex items-center gap-2 flex-1"
                        >
                            <Icon
                                icon="mdi:chat"
                                className="w-5 h-5 text-foreground"
                                style={{
                                    transition: 'color 700ms ease-in-out'
                                }}
                                ssr={true}
                            />
                            <span className="font-medium text-foreground" style={{ transition: 'color 700ms ease-in-out' }}>
                                Chat Support
                            </span>
                            {unreadCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-md">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleMinimize}
                                className="p-1 rounded text-foreground"
                                style={{
                                    transition: 'background-color 700ms ease-in-out, color 700ms ease-in-out'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.2)' : '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                aria-label="Maximize"
                            >
                                <Icon icon="mdi:window-maximize" className="w-5 h-5" ssr={true} />
                            </button>
                            <button
                                onClick={closeChat}
                                className="p-1 rounded text-foreground"
                                style={{
                                    transition: 'background-color 700ms ease-in-out, color 700ms ease-in-out'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.2)' : '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                aria-label="Close"
                            >
                                <Icon icon="mdi:close" className="w-5 h-5" ssr={true} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // Maximized State - Full Chat Window
                <div
                    className="w-80 sm:w-96 h-[600px] max-h-[80vh] border-2 rounded-lg shadow-2xl overflow-hidden flex flex-col"
                    style={{
                        backgroundColor: isDark ? '#090909' : '#ffffff',
                        borderColor: isDark ? '#1a1a1a' : '#d1d5db',
                        transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out'
                    }}
                >
                    {/* Header - Theme-aware */}
                    <div
                        className="flex items-center justify-between p-4 shadow-md border-b-2"
                        style={{
                            backgroundColor: isDark ? 'rgba(13, 13, 13, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            borderColor: isDark ? '#1a1a1a' : '#d1d5db',
                            transition: 'background-color 700ms ease-in-out, border-color 700ms ease-in-out'
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Icon
                                    icon="mdi:chat"
                                    className="w-6 h-6 text-foreground"
                                    style={{
                                        transition: 'color 700ms ease-in-out'
                                    }}
                                    ssr={true}
                                />
                                {/* Online Indicator */}
                                <div
                                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-card"
                                    style={{
                                        transition: 'border-color 700ms ease-in-out'
                                    }}
                                ></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground" style={{ transition: 'color 700ms ease-in-out' }}>
                                    {t('chatSupport')}
                                </h3>
                                <p className="text-xs text-muted-foreground" style={{ transition: 'color 700ms ease-in-out' }}>
                                    {t('replyInstantly')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleMinimize}
                                className="p-1.5 rounded text-foreground"
                                style={{
                                    transition: 'background-color 700ms ease-in-out, color 700ms ease-in-out'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.2)' : '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                aria-label="Minimize"
                            >
                                <Icon icon="mdi:window-minimize" className="w-5 h-5" ssr={true} />
                            </button>
                            <button
                                onClick={closeChat}
                                className="p-1.5 rounded text-foreground"
                                style={{
                                    transition: 'background-color 700ms ease-in-out, color 700ms ease-in-out'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.2)' : '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                aria-label="Close"
                            >
                                <Icon icon="mdi:close" className="w-5 h-5" ssr={true} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Content */}
                    <ChatWindow />
                </div>
            )}
        </div>
    );
}
