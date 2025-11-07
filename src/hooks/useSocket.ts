'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '@/types/chat';

interface UseSocketOptions {
    sessionId?: string;
    userName?: string;
    isAdmin?: boolean;
    onMessage?: (message: ChatMessage) => void;
    onTyping?: (data: { isTyping: boolean; userName?: string }) => void;
    onUserJoined?: (data: { userName: string; activeUsers: number }) => void;
    onUserLeft?: (data: { activeUsers: number }) => void;
    onAdminStatus?: (data: { online: boolean }) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
    const {
        sessionId,
        userName,
        isAdmin = false,
        onMessage,
        onTyping,
        onUserJoined,
        onUserLeft,
        onAdminStatus,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState(0);
    const socketRef = useRef<Socket | null>(null);

    // Use refs for callbacks to avoid recreating socket on callback changes
    const callbacksRef = useRef({
        onMessage,
        onTyping,
        onUserJoined,
        onUserLeft,
        onAdminStatus,
    });

    // Update callbacks ref
    useEffect(() => {
        callbacksRef.current = {
            onMessage,
            onTyping,
            onUserJoined,
            onUserLeft,
            onAdminStatus,
        };
    }, [onMessage, onTyping, onUserJoined, onUserLeft, onAdminStatus]);

    // Initialize Socket.io connection
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;

        const socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        // Connection events
        socket.on('connect', () => {
            console.log('✅ Socket.io connected:', socket.id);
            setIsConnected(true);

            // Auto-join session only if sessionId provided
            if (sessionId) {
                socket.emit('join-session', { sessionId, userName });

                // Notify if admin
                if (isAdmin) {
                    socket.emit('admin-online', sessionId);
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket.io disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket.io connection error:', error);
        });

        // Session events
        socket.on('session-joined', (data) => {
            console.log('👤 Joined session:', data.sessionId);
            setActiveUsers(data.activeUsers);
        });

        socket.on('user-joined', (data) => {
            console.log('👤 User joined:', data.userName);
            setActiveUsers(data.activeUsers);
            callbacksRef.current.onUserJoined?.(data);
        });

        socket.on('user-left', (data) => {
            console.log('👋 User left');
            setActiveUsers(data.activeUsers);
            callbacksRef.current.onUserLeft?.(data);
        });

        // Message events
        socket.on('new-message', (message: ChatMessage) => {
            console.log('💬 New message:', message);
            callbacksRef.current.onMessage?.(message);
        });

        // Typing events
        socket.on('user-typing', (data) => {
            callbacksRef.current.onTyping?.(data);
        });

        // Admin typing (for user chat)
        socket.on('admin-typing', (data) => {
            console.log('👨‍💼 Admin typing:', data);
            callbacksRef.current.onTyping?.(data);
        });

        // Admin status
        socket.on('admin-status', (data) => {
            console.log('👨‍💼 Admin status:', data.online ? 'online' : 'offline');
            callbacksRef.current.onAdminStatus?.(data);
        });

        // Session deleted
        socket.on('session-deleted', (data) => {
            console.log('🗑️ Session deleted:', data.sessionId);
            // Close chat for user
            if (window.location.pathname.includes('/admin')) {
                // Admin will refresh via fetchSessions
                return;
            }
            // User gets kicked out - clear session AND username
            localStorage.removeItem('chatSessionId');
            localStorage.removeItem('chatUserName');
            alert('This chat session has been closed by the administrator.');
            window.location.reload();
        });

        // User blocked
        socket.on('user-blocked', (data) => {
            console.log('🚫 User blocked:', data.message);
            // Show message to user
            alert(data.message || 'You have been blocked from this chat.');
            // Clear session and reload
            localStorage.removeItem('chatSessionId');
            localStorage.removeItem('chatUserName');
            window.location.reload();
        });

        // Cleanup
        return () => {
            if (isAdmin && sessionId) {
                socket.emit('admin-offline', sessionId);
            }
            socket.disconnect();
        };
    }, [sessionId, userName, isAdmin]); // Removed callback dependencies!

    // bfcache optimization: Disconnect on pagehide, reconnect on pageshow
    useEffect(() => {
        const handlePageHide = (event: PageTransitionEvent) => {
            if (event.persisted && socketRef.current) {
                console.log('📦 Page going into bfcache, disconnecting socket');
                socketRef.current.disconnect();
            }
        };

        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted && socketRef.current) {
                console.log('📦 Page restored from bfcache, reconnecting socket');
                socketRef.current.connect();

                // Rejoin session if we have one
                if (sessionId) {
                    socketRef.current.emit('join-session', { sessionId, userName });
                    if (isAdmin) {
                        socketRef.current.emit('admin-online', sessionId);
                    }
                }
            }
        };

        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [sessionId, userName, isAdmin]);

    // Send message
    const sendMessage = (message: string, sender: 'user' | 'admin' = 'user') => {
        if (!socketRef.current || !sessionId) {
            console.error('Cannot send message: Socket not connected or no sessionId');
            return;
        }

        const messageData = {
            sessionId,
            message,
            sender,
            timestamp: new Date().toISOString(),
        };

        socketRef.current.emit('send-message', messageData);
    };

    // Send typing indicator
    const sendTyping = (isTyping: boolean) => {
        if (!socketRef.current || !sessionId) return;

        socketRef.current.emit('typing', {
            sessionId,
            isTyping,
            userName: userName || (isAdmin ? 'Admin' : 'User'),
        });
    };

    // Mark messages as read
    const markAsRead = (sender: 'user' | 'admin') => {
        if (!socketRef.current || !sessionId) return;

        socketRef.current.emit('mark-read', {
            sessionId,
            sender,
        });
    };

    // Join a different session
    const joinSession = (newSessionId: string, newUserName?: string) => {
        if (!socketRef.current) return;

        socketRef.current.emit('join-session', {
            sessionId: newSessionId,
            userName: newUserName || userName,
        });

        if (isAdmin) {
            socketRef.current.emit('admin-online', newSessionId);
        }
    };

    // Leave current session
    const leaveSession = () => {
        if (!socketRef.current || !sessionId) return;

        if (isAdmin) {
            socketRef.current.emit('admin-offline', sessionId);
        }

        socketRef.current.disconnect();
    };

    return {
        socket: socketRef.current,
        isConnected,
        activeUsers,
        sendMessage,
        sendTyping,
        markAsRead,
        joinSession,
        leaveSession,
    };
}
