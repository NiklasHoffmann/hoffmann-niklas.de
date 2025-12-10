'use client';

import { useEffect, useRef } from 'react';
import { Icon } from '@/components/icons/LocalIcon';
import type { ChatMessage } from '@/types/chat';

interface MessageListProps {
    messages: ChatMessage[];
    isTyping: boolean;
    isLoading: boolean;
    isDark: boolean;
    onAreaClick: () => void;
}

export function MessageList({ messages, isTyping, isLoading, isDark, onAreaClick }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const unreadDividerRef = useRef<HTMLDivElement>(null);

    // Find the first unread message index (user messages that admin hasn't read)
    const firstUnreadIndex = messages.findIndex(msg => !msg.read && msg.sender === 'user');

    // Auto-scroll to unread divider or bottom
    useEffect(() => {
        if (firstUnreadIndex >= 0 && unreadDividerRef.current) {
            // Scroll to unread divider
            unreadDividerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Scroll to bottom
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, firstUnreadIndex]);

    if (isLoading) {
        return (
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ backgroundColor: isDark ? '#090909' : '#ffffff' }}
            >
                <div className="flex items-center justify-center h-full">
                    <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-accent" />
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ backgroundColor: isDark ? '#090909' : '#ffffff' }}
            >
                <div className="flex items-center justify-center h-full text-center">
                    <div>
                        <Icon icon="mdi:message-outline" className="w-12 h-12 mx-auto text-accent/40 mb-2" />
                        <p
                            className="text-sm"
                            style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                        >
                            No messages yet
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: isDark ? '#090909' : '#ffffff' }}
            onClick={onAreaClick}
        >
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
                                    color: '#3b82f6'
                                }}
                            >
                                New Messages
                            </span>
                            <div className="flex-1 h-px bg-accent/30"></div>
                        </div>
                    )}

                    {/* Message */}
                    <div
                        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-md ${message.sender === 'admin'
                                ? 'rounded-br-sm'
                                : 'rounded-bl-sm border-2'
                                }`}
                            style={message.sender === 'admin' ? {
                                backgroundColor: isDark ? '#e5e7eb' : '#4b5563',
                                color: isDark ? '#111827' : '#ffffff'
                            } : {
                                backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                                borderColor: isDark ? '#262626' : '#d1d5db',
                                color: isDark ? '#ffffff' : '#111827'
                            }}
                        >
                            <p className="text-sm whitespace-pre-wrap break-words">
                                {message.message}
                            </p>
                            <p
                                className="text-xs mt-1.5"
                                style={{
                                    color: message.sender === 'admin'
                                        ? (isDark ? 'rgba(17, 24, 39, 0.6)' : 'rgba(255, 255, 255, 0.8)')
                                        : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(17, 24, 39, 0.6)')
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
                <div className="flex justify-start mb-2">
                    <div
                        className="px-4 py-2.5 rounded-2xl rounded-bl-sm border-2 shadow-md"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#d1d5db'
                        }}
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-xs ml-1" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                                User is typing...
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}
