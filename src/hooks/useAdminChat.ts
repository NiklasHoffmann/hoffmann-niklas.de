'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, ChatSession } from '@/types/chat';
import { createNotificationSound } from '@/lib/chatUtils';

export function useAdminChat() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    // Selected chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Refs
    const notificationSoundRef = useRef<{ play: () => Promise<void>; audioContext: AudioContext | null } | null>(null);
    const isInitialLoadRef = useRef(true);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextInitializedRef = useRef(false);

    // Initialize notification sound
    useEffect(() => {
        if (typeof window !== 'undefined') {
            notificationSoundRef.current = createNotificationSound();

            // Auto-enable audio on first user interaction with the page
            const enableAudio = async () => {
                if (audioContextInitializedRef.current) return;

                if (notificationSoundRef.current?.audioContext) {
                    try {
                        if (notificationSoundRef.current.audioContext.state === 'suspended') {
                            await notificationSoundRef.current.audioContext.resume();
                            console.log('🔊 Audio context activated - notifications ready!');
                            audioContextInitializedRef.current = true;
                        }
                    } catch (err) {
                        console.log('Could not activate audio context:', err);
                    }
                }
            };

            // Listen for ANY user interaction to enable audio
            const events = ['click', 'touchstart', 'keydown'];
            events.forEach(event => {
                document.addEventListener(event, enableAudio, { once: true });
            });

            return () => {
                events.forEach(event => {
                    document.removeEventListener(event, enableAudio);
                });
            };
        }
    }, []);

    // Fetch all chat sessions
    const fetchSessions = useCallback(async () => {
        try {
            const response = await fetch('/api/chat/sessions');
            if (response.ok) {
                const data = await response.json();
                const sessions = data.data?.sessions || [];

                // Map API response to match ChatSession interface
                const mappedSessions = sessions.map((s: any) => ({
                    ...s,
                    isActive: s.status === 'active'
                }));

                console.log('✅ Fetched sessions:', mappedSessions.length);
                setSessions(mappedSessions);
            } else {
                console.error('Failed to fetch sessions:', response.status);
                setSessions([]);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch messages for a specific session
    const fetchMessages = useCallback(async (sessionId: string) => {
        setLoadingMessages(true);
        try {
            const response = await fetch(`/api/chat/${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.data?.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    // Initialize Socket.io
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        const isProduction = process.env.NODE_ENV === 'production';
        
        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: isProduction ? 3 : 5,
        });

        newSocket.on('connect', () => {
            if (!isProduction) console.log('✅ Admin connected to Socket.io');
            newSocket.emit('admin:join');
        });

        // Listen for NEW SESSIONS
        newSocket.on('new-session-started', (data: { sessionId: string; userName: string; timestamp: string }) => {
            console.log('🆕 New session started:', data);
            if (notificationSoundRef.current && !isInitialLoadRef.current) {
                notificationSoundRef.current.play().catch(err => console.log('Could not play sound:', err));
            }
            fetchSessions();
        });

        // Listen for new messages to update unread counts (ALL sessions)
        newSocket.on('admin:new-message', (data: { sessionId: string }) => {
            console.log('💬 New message in session:', data.sessionId);

            // Play sound for ANY new user message (not just in selected chat)
            if (notificationSoundRef.current && !isInitialLoadRef.current) {
                console.log('🔔 Playing notification sound for new message in session:', data.sessionId);
                notificationSoundRef.current.play().catch(err => console.log('Could not play sound:', err));
            }

            fetchSessions();
        });

        // Listen for new sessions
        newSocket.on('admin:new-session', () => {
            console.log('🆕 New chat session created');
            fetchSessions();
        });

        // Listen for new messages in selected chat
        newSocket.on('new-message', (message: ChatMessage) => {
            console.log('📨 Received new-message event:', message);
            fetchSessions();

            // Note: Sound is already played via admin:new-message event
            // This event is just for updating the UI
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('admin:leave');
            newSocket.disconnect();
        };
    }, [fetchSessions]);

    // Handle typing indicator and messages for selected session
    useEffect(() => {
        if (!socket) return;

        const handleTyping = (data: { sessionId?: string; isTyping?: boolean }) => {
            if (data.sessionId) {
                if (data.sessionId === selectedSessionId) {
                    console.log('✍️ User typing in selected session:', data.sessionId);
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 3000);
                }
            } else {
                console.log('✍️ User typing (room event)');
                setIsTyping(data.isTyping !== false);
                if (data.isTyping !== false) {
                    setTimeout(() => setIsTyping(false), 3000);
                }
            }
        };

        const handleMessage = (message: ChatMessage) => {
            if (selectedSessionId && message.sessionId === selectedSessionId) {
                console.log('✅ Adding message to current chat');
                setMessages(prev => [...prev, message]);
                setIsTyping(false);
            }
        };

        socket.on('user:typing', handleTyping);
        socket.on('user-typing', handleTyping);
        socket.on('new-message', handleMessage);

        return () => {
            socket.off('user:typing', handleTyping);
            socket.off('user-typing', handleTyping);
            socket.off('new-message', handleMessage);
        };
    }, [socket, selectedSessionId]);

    // Load sessions on mount
    useEffect(() => {
        fetchSessions();

        const timer = setTimeout(() => {
            isInitialLoadRef.current = false;
            console.log('✅ Initial load complete - sound notifications enabled');
        }, 2000);

        return () => clearTimeout(timer);
    }, [fetchSessions]);

    // Fetch messages when session is selected
    useEffect(() => {
        if (selectedSessionId && socket) {
            socket.emit('admin:join-session', { sessionId: selectedSessionId });
            fetchMessages(selectedSessionId);
        }
    }, [selectedSessionId, socket, fetchMessages]);

    // Mark messages as read
    const markMessagesAsRead = async (sessionId: string) => {
        try {
            await fetch('/api/chat/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
            fetchSessions();
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    };

    // Delete chat session
    const deleteSession = async (sessionId: string) => {
        try {
            const response = await fetch(`/api/chat/session?sessionId=${sessionId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                if (selectedSessionId === sessionId) {
                    setSelectedSessionId(null);
                    setMessages([]);
                }
                fetchSessions();
                if (socket) {
                    socket.emit('session-deleted', { sessionId });
                }
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    // Block user
    const blockUser = async (sessionId: string) => {
        try {
            const response = await fetch('/api/chat/session', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, blocked: true })
            });

            if (response.ok) {
                fetchSessions();
                if (socket) {
                    socket.emit('user-blocked', { sessionId });
                }
            }
        } catch (error) {
            console.error('Failed to block user:', error);
        }
    };

    // Send message
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputMessage.trim() || !selectedSessionId) return;

        // Stop typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        if (socket && selectedSessionId) {
            socket.emit('admin:typing', { sessionId: selectedSessionId, isTyping: false });
        }

        try {
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: selectedSessionId,
                    message: inputMessage,
                    sender: 'admin',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const newMessage = data.data;
                setMessages(prev => [...prev, newMessage]);
                setInputMessage('');

                if (socket) {
                    socket.emit('admin:message', {
                        sessionId: selectedSessionId,
                        message: newMessage,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    // Handle input change with typing indicator
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputMessage(value);

        if (!socket || !selectedSessionId) return;

        if (value.length > 0) {
            socket.emit('admin:typing', { sessionId: selectedSessionId, isTyping: true });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('admin:typing', { sessionId: selectedSessionId, isTyping: false });
            }, 3000);
        } else {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            socket.emit('admin:typing', { sessionId: selectedSessionId, isTyping: false });
        }
    };

    // Handle input focus - mark messages as read
    const handleInputFocus = async () => {
        if (!selectedSessionId) return;

        const hasUnread = messages.some(msg => !msg.read && msg.sender === 'user');
        if (hasUnread) {
            console.log('🎯 Input focused - marking messages as read');
            await markMessagesAsRead(selectedSessionId);
            setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
            fetchSessions();
        }
    };

    return {
        // State
        sessions,
        loading,
        socket,
        selectedSessionId,
        setSelectedSessionId,
        messages,
        setMessages,
        inputMessage,
        isTyping,
        loadingMessages,

        // Actions
        sendMessage,
        handleInputChange,
        handleInputFocus,
        deleteSession,
        blockUser,
        markMessagesAsRead,
    };
}
