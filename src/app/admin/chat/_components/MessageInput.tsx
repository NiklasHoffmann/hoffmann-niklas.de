'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { QUICK_REPLIES_DE, QUICK_REPLIES_EN } from '@/config/chat.constants';

interface MessageInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onFocus: () => void;
    isConnected: boolean;
    isDark: boolean;
}

const QUICK_REPLIES = {
    de: QUICK_REPLIES_DE,
    en: QUICK_REPLIES_EN,
};

export function MessageInput({ value, onChange, onSubmit, onFocus, isConnected, isDark }: MessageInputProps) {
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [quickReplyLang, setQuickReplyLang] = useState<'de' | 'en'>('de');

    const handleQuickReply = (reply: string) => {
        // Create synthetic event to update input
        const syntheticEvent = {
            target: { value: reply }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
        setShowQuickReplies(false);
    };

    return (
        <div>
            {/* Quick Replies */}
            {showQuickReplies && (
                <div
                    className="px-4 py-3 border-t"
                    style={{
                        backgroundColor: isDark ? '#0d0d0d' : '#f9fafb',
                        borderColor: isDark ? '#262626' : '#d1d5db'
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:lightning-bolt" className="w-4 h-4 text-accent" />
                            <span className="text-xs font-semibold" style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                                Quick Replies
                            </span>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setQuickReplyLang('de')}
                                className={`px-2 py-1 text-xs rounded transition-colors ${quickReplyLang === 'de'
                                    ? 'bg-accent text-white'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                style={quickReplyLang !== 'de' ? { color: isDark ? '#d1d5db' : '#4b5563' } : undefined}
                            >
                                🇩🇪 DE
                            </button>
                            <button
                                onClick={() => setQuickReplyLang('en')}
                                className={`px-2 py-1 text-xs rounded transition-colors ${quickReplyLang === 'en'
                                    ? 'bg-accent text-white'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                style={quickReplyLang !== 'en' ? { color: isDark ? '#d1d5db' : '#4b5563' } : undefined}
                            >
                                🇬🇧 EN
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {QUICK_REPLIES[quickReplyLang].map((reply, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                className="text-left px-3 py-2 text-sm rounded-lg border transition-all hover:border-accent hover:bg-accent/5"
                                style={{
                                    backgroundColor: isDark ? '#090909' : '#ffffff',
                                    borderColor: isDark ? '#262626' : '#d1d5db',
                                    color: isDark ? '#ffffff' : '#111827'
                                }}
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <form
                onSubmit={onSubmit}
                className="p-4 border-t"
                style={{
                    backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                    borderColor: isDark ? '#262626' : '#d1d5db'
                }}
            >
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowQuickReplies(!showQuickReplies)}
                        className={`p-2.5 rounded-lg transition-all ${showQuickReplies
                            ? 'bg-accent text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        style={!showQuickReplies ? { color: isDark ? '#d1d5db' : '#4b5563' } : undefined}
                        title="Quick Replies"
                    >
                        <Icon icon="mdi:lightning-bolt" className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={value}
                        onChange={onChange}
                        onFocus={onFocus}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm shadow-sm transition-shadow"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#d1d5db',
                            color: isDark ? '#ffffff' : '#111827'
                        }}
                        disabled={!isConnected}
                    />
                    <button
                        type="submit"
                        disabled={!value.trim() || !isConnected}
                        className="px-4 py-2.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                        style={{
                            backgroundColor: isDark ? '#e5e7eb' : '#4b5563',
                            color: isDark ? '#111827' : '#ffffff'
                        }}
                    >
                        <Icon icon="mdi:send" className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
