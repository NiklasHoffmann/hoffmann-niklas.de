'use client';

import { useChat } from '@/contexts/ChatContext';
import { Icon } from '@iconify/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { TRANSITIONS } from '@/lib/transitions';

export default function ChatWindow() {
    const t = useTranslations('chat');
    const {
        messages,
        sendMessage,
        isTyping,
        isAdminOnline,
        isConnected,
        userName,
        setUserName,
        sendTypingIndicator,
        sessionId,
        markMessagesAsRead,
    } = useChat();

    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const isDark = theme === 'dark';

    const [inputMessage, setInputMessage] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);
    const [tempName, setTempName] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const unreadDividerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Find the first unread message index
    const firstUnreadIndex = messages.findIndex(msg => !msg.read && msg.sender === 'admin');

    useEffect(() => {
        console.log('🔍 Messages:', messages.map(m => ({
            sender: m.sender,
            read: m.read,
            msg: m.message.substring(0, 20)
        })));
        console.log('📍 First unread index:', firstUnreadIndex);
    }, [messages, firstUnreadIndex]);

    // Auto-scroll to unread divider or bottom
    useEffect(() => {
        if (firstUnreadIndex >= 0 && unreadDividerRef.current) {
            console.log('📜 Auto-scrolling to unread divider');
            // Scroll to unread divider
            unreadDividerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            console.log('📜 Auto-scrolling to bottom');
            // Scroll to bottom
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, firstUnreadIndex]);

    // Show name input if no name set
    useEffect(() => {
        if (!userName) {
            setShowNameInput(true);
        }
    }, [userName]);

    // Mark messages as read on manual scroll or input
    const handleMarkAsRead = useCallback(async () => {
        console.log('👆 handleMarkAsRead called');
        if (sessionId) {
            const hasUnread = messages.some(msg => !msg.read && msg.sender === 'admin');
            console.log('📧 Has unread messages:', hasUnread);
            if (hasUnread) {
                console.log('✉️ Marking messages as read for session:', sessionId);
                await markMessagesAsRead(sessionId);
            }
        }
    }, [sessionId, messages, markMessagesAsRead]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputMessage.trim()) return;

        // Stop typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        sendTypingIndicator(false);

        await sendMessage(inputMessage);
        setInputMessage('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputMessage(value);

        // Send typing indicator
        if (value.length > 0) {
            sendTypingIndicator(true);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 3 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                sendTypingIndicator(false);
            }, 3000);
        } else {
            // Empty input - stop typing
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            sendTypingIndicator(false);
        }
    };

    const handleInputFocus = () => {
        console.log('🎯 Input focused - marking as read');
        handleMarkAsRead();
    };

    const handleSetName = (e: React.FormEvent) => {
        e.preventDefault();
        if (tempName.trim()) {
            setUserName(tempName.trim());
            setShowNameInput(false);
        }
    };

    // Don't render until mounted to avoid hydration mismatch
    // But don't return null completely - just use safe defaults
    const safeIsDark = mounted ? isDark : false;

    // Name Input Modal
    if (showNameInput) {
        return (
            <div
                className="flex-1 flex flex-col items-center justify-center p-6"
                style={{
                    backgroundColor: safeIsDark ? '#090909' : '#ffffff',
                    transition: TRANSITIONS.background
                }}
            >
                <div className="w-full max-w-sm space-y-4">
                    <div className="text-center space-y-2">
                        <Icon icon="mdi:account-circle" className="w-16 h-16 mx-auto text-accent" ssr={true} />
                        <h3 className="text-xl font-semibold text-foreground">
                            {t('welcome')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('enterName')}
                        </p>
                        <form onSubmit={handleSetName} className="space-y-3">
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                placeholder={t('namePlaceholder')}
                                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent shadow-sm text-foreground placeholder:text-muted-foreground"
                                style={{
                                    backgroundColor: safeIsDark ? '#090909' : '#ffffff',
                                    borderColor: safeIsDark ? '#1a1a1a' : '#d1d5db',
                                    transition: TRANSITIONS.card
                                }}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!tempName.trim()}
                                className="w-full px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-background border border-border"
                                style={{
                                    boxShadow: safeIsDark
                                        ? '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -4px rgba(255, 255, 255, 0.1)'
                                        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                                    transition: TRANSITIONS.button
                                }}
                            >
                                <span className="text-foreground" style={{ transition: TRANSITIONS.text }}>
                                    {t('startChat')}
                                </span>
                            </button>
                            <p className="text-xs text-center text-muted-foreground">
                                {t('privacyNotice')}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Main Chat View
    return (
        <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{
                backgroundColor: isDark ? '#090909' : '#ffffff',
                transition: TRANSITIONS.background
            }}
        >
            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{
                    backgroundColor: isDark ? '#090909' : '#ffffff',
                    transition: TRANSITIONS.background
                }}
                onClick={handleInputFocus}
            >
                {/* Welcome Message */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                        <Icon icon="mdi:chat-outline" className="w-16 h-16 text-accent/40" ssr={true} />
                        <div>
                            <h4 className="text-lg font-medium text-foreground" style={{ transition: TRANSITIONS.text }}>
                                {t('greeting', { userName: userName || '' })}
                            </h4>
                            <p className="text-sm mt-1 text-muted-foreground" style={{ transition: TRANSITIONS.text }}>
                                {t('howCanWeHelp')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.map((message, index) => (
                    <div key={message._id || index}>
                        {/* Unread Divider */}
                        {firstUnreadIndex >= 0 && index === firstUnreadIndex && (
                            <div
                                ref={unreadDividerRef}
                                className="flex items-center gap-3 my-4"
                            >
                                <div className="flex-1 h-px bg-accent/30"></div>
                                <span
                                    className="text-xs font-semibold px-3 py-1 rounded-full"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                        color: '#3b82f6',
                                        transition: TRANSITIONS.backgroundAndText
                                    }}
                                >
                                    New Messages
                                </span>
                                <div className="flex-1 h-px bg-accent/30"></div>
                            </div>
                        )}

                        {/* Message */}
                        <div
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-md ${message.sender === 'user'
                                    ? 'rounded-br-sm'
                                    : 'rounded-bl-sm border-2'
                                    }`}
                                style={message.sender === 'user' ? {
                                    backgroundColor: isDark ? '#e5e7eb' : '#4b5563',
                                    color: isDark ? '#111827' : '#ffffff',
                                    transition: TRANSITIONS.backgroundAndText
                                } : {
                                    backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                                    borderColor: isDark ? '#262626' : '#d1d5db',
                                    color: isDark ? '#ffffff' : '#111827',
                                    transition: TRANSITIONS.colors
                                }}
                            >
                                {/* Admin Name */}
                                {message.sender === 'admin' && (
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Icon icon="mdi:shield-account" className="w-4 h-4 text-accent" ssr={true} />
                                        <span
                                            className="text-xs font-medium text-accent"
                                            style={{ transition: TRANSITIONS.text }}
                                        >
                                            {t('supportTeam')}
                                        </span>
                                    </div>
                                )}

                                {/* Message Text */}
                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                    {message.message}
                                </p>

                                {/* Timestamp */}
                                <p
                                    className="text-xs mt-1.5"
                                    style={{
                                        color: message.sender === 'user'
                                            ? 'rgba(17, 24, 39, 0.7)'
                                            : isDark ? '#9ca3af' : '#6b7280',
                                        transition: TRANSITIONS.text
                                    }}
                                >
                                    {new Date(message.timestamp).toLocaleTimeString('de-DE', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div
                            className="border-2 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-md"
                            style={{
                                backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                                borderColor: isDark ? '#262626' : '#d1d5db',
                                color: isDark ? '#ffffff' : '#111827',
                                transition: TRANSITIONS.colors
                            }}
                        >
                            <div className="flex items-center gap-1.5">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span
                                    className="text-xs ml-1"
                                    style={{
                                        color: isDark ? '#9ca3af' : '#6b7280',
                                        transition: TRANSITIONS.text
                                    }}
                                >
                                    {t('typing')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Connection Status */}
            {!isConnected && (
                <div
                    className="px-4 py-2.5 bg-yellow-500/10 border-t border-yellow-500/30"
                    style={{ transition: TRANSITIONS.backgroundAndBorder }}
                >
                    <p
                        className="text-xs flex items-center gap-2"
                        style={{
                            color: isDark ? '#fcd34d' : '#b45309',
                            transition: TRANSITIONS.text
                        }}
                    >
                        <Icon icon="mdi:wifi-off" className="w-4 h-4" />
                        {t('reconnecting')}
                    </p>
                </div>
            )}

            {/* Admin Online Status */}
            {isAdminOnline && (
                <div
                    className="px-4 py-2.5 bg-green-500/10 border-t border-green-500/30"
                    style={{ transition: TRANSITIONS.backgroundAndBorder }}
                >
                    <p
                        className="text-xs flex items-center gap-2"
                        style={{
                            color: isDark ? '#86efac' : '#15803d',
                            transition: TRANSITIONS.text
                        }}
                    >
                        <Icon icon="mdi:check-circle" className="w-4 h-4" />
                        {t('adminOnline')}
                    </p>
                </div>
            )}

            {/* Input Area */}
            <form
                onSubmit={handleSendMessage}
                className="p-4 border-t"
                style={{
                    borderColor: isDark ? '#1a1a1a' : '#d1d5db',
                    transition: TRANSITIONS.border
                }}
            >
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        placeholder={t('inputPlaceholder')}
                        className="flex-1 px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm shadow-sm text-foreground placeholder:text-muted-foreground"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#d1d5db',
                            transition: TRANSITIONS.card
                        }}
                        disabled={!isConnected}
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || !isConnected}
                        className="px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-background border border-border"
                        style={{
                            boxShadow: isDark
                                ? '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -4px rgba(255, 255, 255, 0.1)'
                                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                            transition: TRANSITIONS.button
                        }}
                    >
                        <Icon icon="mdi:send" className="w-5 h-5 text-foreground" ssr={true} style={{ transition: TRANSITIONS.text }} />
                    </button>
                </div>

                <p
                    className="text-xs mt-2.5 flex items-center gap-1.5"
                    style={{
                        color: isDark ? '#9ca3af' : '#6b7280',
                        transition: TRANSITIONS.text
                    }}
                >
                    <Icon icon="mdi:lock" className="w-3 h-3" ssr={true} />
                    {t('securityNotice')}
                </p>
            </form>
        </div>
    );
}
