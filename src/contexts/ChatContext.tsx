'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '@/types/chat';
import { useSocket } from '@/hooks/useSocket';
import { markMessagesAsRead as apiMarkMessagesAsRead } from '@/lib/chatApi';

interface ChatContextType {
    // State
    isOpen: boolean;
    isMinimized: boolean;
    messages: ChatMessage[];
    sessionId: string | null;
    userName: string | null;
    isTyping: boolean;
    isAdminOnline: boolean;
    unreadCount: number;
    isConnected: boolean;
    activeUsers: number;

    // Actions
    openChat: () => void;
    closeChat: () => void;
    toggleMinimize: () => void;
    sendMessage: (message: string) => Promise<void>;
    setUserName: (name: string) => void;
    markAllAsRead: () => void;
    markMessagesAsRead: (sessionId: string) => Promise<void>;
    sendTypingIndicator: (isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    // Initialize state from localStorage to persist across language changes
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('chatIsOpen');
            return stored === 'true';
        }
        return false;
    });
    const [isMinimized, setIsMinimized] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('chatIsMinimized');
            return stored === 'true';
        }
        return false;
    });
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('chatMessages');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (err) {
                    console.error('Failed to parse stored messages:', err);
                    return [];
                }
            }
        }
        return [];
    });
    const [sessionId, setSessionId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('chatSessionId');
            return stored;
        }
        return null;
    });
    const [userName, setUserName] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('chatUserName');
            return stored;
        }
        return null;
    });
    const [isTyping, setIsTyping] = useState(false);
    const [isAdminOnline, setIsAdminOnline] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined' && messages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }
    }, [messages]);

    // Validate session on mount
    useEffect(() => {
        if (sessionId) {
            // Validate session exists in database
            validateSession(sessionId);
        }
    }, []); // Run only once on mount

    // Validate if session still exists in database
    const validateSession = async (sessionId: string) => {
        try {
            const response = await fetch(`/api/chat/session?sessionId=${sessionId}`);
            const data = await response.json();

            if (data.success) {
                // Session exists - check if blocked
                if (data.data.blocked) {
                    console.log('🚫 Session is blocked - clearing localStorage');
                    localStorage.removeItem('chatSessionId');
                    localStorage.removeItem('chatUserName');
                    setSessionId(null);
                    setUserName(null);
                } else {
                    // Session is valid
                    setSessionId(sessionId);
                }
            } else {
                // Session doesn't exist - clear localStorage
                console.log('🗑️ Session not found - clearing localStorage');
                localStorage.removeItem('chatSessionId');
                localStorage.removeItem('chatUserName');
                setSessionId(null);
                setUserName(null);
            }
        } catch (error) {
            console.error('Failed to validate session:', error);
            // Clear on error to be safe
            localStorage.removeItem('chatSessionId');
            localStorage.removeItem('chatUserName');
            setSessionId(null);
            setUserName(null);
        }
    };

    // Socket.io connection
    const {
        isConnected,
        activeUsers,
        sendMessage: socketSendMessage,
        sendTyping,
        markAsRead,
    } = useSocket({
        sessionId: sessionId || undefined,
        userName: userName || undefined,
        onMessage: (message) => {
            console.log('💬 ChatContext received message:', message);
            setMessages((prev) => {
                const newMessages = [...prev, message];
                console.log('📝 Updated messages array:', newMessages.map(m => ({
                    sender: m.sender,
                    read: m.read,
                    msg: m.message.substring(0, 20)
                })));
                return newMessages;
            });

            // Increment unread if chat is closed or minimized
            if (!isOpen || isMinimized) {
                setUnreadCount((prev) => prev + 1);
            }
        },
        onTyping: (data) => {
            const isCurrentlyTyping = data.isTyping !== false;
            setIsTyping(isCurrentlyTyping);

            // Auto-hide typing indicator after 5 seconds as fallback
            if (isCurrentlyTyping) {
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                }, 5000);
            } else {
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = null;
                }
            }
        },
        onAdminStatus: (data) => {
            setIsAdminOnline(data.online);
        },
    });

    // Load chat history when session is created/loaded
    useEffect(() => {
        if (!sessionId) {
            // Don't clear messages immediately - they might be restored from localStorage
            // Only clear if we're sure there's no session
            if (typeof window !== 'undefined') {
                const hasStoredSession = localStorage.getItem('chatSessionId');
                if (!hasStoredSession) {
                    setMessages([]);
                }
            }
            return;
        }

        const loadHistory = async () => {
            try {
                const response = await fetch(`/api/chat/${sessionId}`);
                const data = await response.json();

                if (data.success && data.data.messages) {
                    // Only update messages if server has messages
                    // This preserves localStorage messages during language toggle
                    if (data.data.messages.length > 0) {
                        setMessages(data.data.messages);
                    }
                } else {
                    // Session not found - only clear if we have no local messages
                    setMessages((prev) => prev.length === 0 ? [] : prev);
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };

        loadHistory();
    }, [sessionId]);

    // Create new session
    const createSession = useCallback(async (name?: string) => {
        try {
            const response = await fetch('/api/chat/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: name || userName || 'Anonymous',
                }),
            });

            const data = await response.json();

            if (data.success) {
                const newSessionId = data.data.sessionId;
                setSessionId(newSessionId);
                localStorage.setItem('chatSessionId', newSessionId);

                if (name) {
                    setUserName(name);
                    localStorage.setItem('chatUserName', name);
                }

                return newSessionId;
            }
        } catch (error) {
            console.error('Failed to create session:', error);
        }
        return null;
    }, [userName]);

    // Open chat
    const openChat = useCallback(async () => {
        setIsOpen(true);
        setIsMinimized(false);
        setUnreadCount(0); // Reset unread when opening

        // Persist to localStorage
        localStorage.setItem('chatIsOpen', 'true');
        localStorage.setItem('chatIsMinimized', 'false');

        // Create session if doesn't exist
        if (!sessionId) {
            await createSession();
        }
    }, [sessionId, createSession]);

    // Close chat
    const closeChat = useCallback(() => {
        setIsOpen(false);
        setIsMinimized(false);

        // Persist to localStorage
        localStorage.setItem('chatIsOpen', 'false');
        localStorage.setItem('chatIsMinimized', 'false');
    }, []);

    // Toggle minimize
    const toggleMinimize = useCallback(() => {
        setIsMinimized((prev) => {
            const newMinimized = !prev;
            // Persist to localStorage
            localStorage.setItem('chatIsMinimized', String(newMinimized));
            return newMinimized;
        });
        if (isMinimized) {
            setUnreadCount(0); // Reset unread when maximizing
        }
    }, [isMinimized]);

    // Send message
    const sendMessage = useCallback(
        async (message: string) => {
            if (!sessionId || !message.trim()) return;

            try {
                // Save to database via API
                const response = await fetch('/api/chat/message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        message: message.trim(),
                        sender: 'user',
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    // Broadcast via Socket.io (will be received by onMessage callback)
                    socketSendMessage(message.trim(), 'user');
                } else {
                    // Handle errors (e.g., blocked user, session not found)
                    console.error('Failed to send message:', data.message);

                    if (response.status === 403) {
                        // User is blocked or session is closed
                        alert(data.message || 'You cannot send messages in this chat.');

                        // Clear session if blocked
                        if (data.message?.includes('blocked')) {
                            localStorage.removeItem('chatSessionId');
                            localStorage.removeItem('chatUserName');
                            window.location.reload();
                        }
                    } else if (response.status === 404) {
                        // Session not found - clear localStorage
                        localStorage.removeItem('chatSessionId');
                        localStorage.removeItem('chatUserName');
                        window.location.reload();
                    }
                }
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        },
        [sessionId, socketSendMessage]
    );

    // Mark all messages as read
    const markAllAsRead = useCallback(() => {
        setUnreadCount(0);
        if (sessionId) {
            markAsRead('user');
        }
    }, [sessionId, markAsRead]);

    // Mark messages as read (wrapper for API call)
    const markMessagesAsReadWrapper = useCallback(async (sid: string) => {
        console.log('🔄 markMessagesAsReadWrapper called for session:', sid);
        const success = await apiMarkMessagesAsRead(sid);
        console.log('✉️ API markMessagesAsRead result:', success);
        if (success) {
            // Update local messages state
            setMessages(prev => {
                const updated = prev.map(msg => ({
                    ...msg,
                    read: true
                }));
                console.log('✅ All messages marked as read locally');
                return updated;
            });
            setUnreadCount(0);
        }
    }, []);

    // Update user name (and update session in DB)
    const updateUserName = useCallback(async (name: string) => {
        // Update session in database
        if (sessionId) {
            try {
                const response = await fetch('/api/chat/session', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        userName: name,
                    }),
                });

                const data = await response.json();

                if (data.success && data.data.userName) {
                    // Verwende den vom Server zurückgegebenen Namen (kann bei Duplikaten angepasst sein)
                    const finalName = data.data.userName;
                    setUserName(finalName);
                    localStorage.setItem('chatUserName', finalName);
                } else {
                    // Fallback
                    setUserName(name);
                    localStorage.setItem('chatUserName', name);
                }
            } catch (error) {
                console.error('Failed to update session:', error);
                // Fallback bei Fehler
                setUserName(name);
                localStorage.setItem('chatUserName', name);
            }
        } else {
            setUserName(name);
            localStorage.setItem('chatUserName', name);
        }
    }, [sessionId]);

    const value: ChatContextType = {
        isOpen,
        isMinimized,
        messages,
        sessionId,
        userName,
        isTyping,
        isAdminOnline,
        unreadCount,
        isConnected,
        activeUsers,
        openChat,
        closeChat,
        toggleMinimize,
        sendMessage,
        setUserName: updateUserName, // Use updateUserName to also update DB
        markAllAsRead,
        markMessagesAsRead: markMessagesAsReadWrapper,
        sendTypingIndicator: sendTyping,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
}
