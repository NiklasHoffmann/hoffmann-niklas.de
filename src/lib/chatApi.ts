/**
 * Chat API Helper Functions
 * Centralized API calls for chat functionality
 */

import type { ChatMessage, ChatSession } from '@/types/chat';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: any[];
}

/**
 * Fetch all chat sessions (Admin)
 */
export async function fetchChatSessions(): Promise<ChatSession[]> {
    try {
        const response = await fetch('/api/chat/sessions');
        const data: ApiResponse<{ sessions: ChatSession[] }> = await response.json();

        if (data.success && data.data) {
            return data.data.sessions;
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch chat sessions:', error);
        return [];
    }
}

/**
 * Fetch messages for a specific session
 */
export async function fetchChatMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
        const response = await fetch(`/api/chat/${sessionId}`);
        const data: ApiResponse<{ messages: ChatMessage[] }> = await response.json();

        if (data.success && data.data) {
            return data.data.messages;
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch chat messages:', error);
        return [];
    }
}

/**
 * Create a new chat session
 */
export async function createChatSession(userName?: string, email?: string): Promise<string | null> {
    try {
        const response = await fetch('/api/chat/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, email }),
        });

        const data: ApiResponse<{ sessionId: string }> = await response.json();

        if (data.success && data.data) {
            return data.data.sessionId;
        }
        return null;
    } catch (error) {
        console.error('Failed to create chat session:', error);
        return null;
    }
}

/**
 * Send a chat message
 */
export async function sendChatMessage(
    sessionId: string,
    message: string,
    sender: 'user' | 'admin'
): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    try {
        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, message, sender }),
        });

        const data: ApiResponse<ChatMessage> = await response.json();

        if (data.success && data.data) {
            return { success: true, message: data.data };
        }

        return { success: false, error: data.message || 'Failed to send message' };
    } catch (error) {
        console.error('Failed to send message:', error);
        return { success: false, error: 'Network error' };
    }
}

/**
 * Update session (userName or blocked status)
 */
export async function updateChatSession(
    sessionId: string,
    updates: { userName?: string; blocked?: boolean }
): Promise<{ success: boolean; userName?: string; error?: string }> {
    try {
        const response = await fetch('/api/chat/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, ...updates }),
        });

        const data: ApiResponse<{ userName?: string; blocked?: boolean }> = await response.json();

        if (data.success) {
            return { success: true, userName: data.data?.userName };
        }

        return { success: false, error: data.message || 'Failed to update session' };
    } catch (error) {
        console.error('Failed to update session:', error);
        return { success: false, error: 'Network error' };
    }
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/chat/session?sessionId=${sessionId}`, {
            method: 'DELETE',
        });

        const data: ApiResponse = await response.json();
        return data.success;
    } catch (error) {
        console.error('Failed to delete session:', error);
        return false;
    }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(sessionId: string): Promise<boolean> {
    try {
        const response = await fetch('/api/chat/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });

        const data: ApiResponse = await response.json();
        return data.success;
    } catch (error) {
        console.error('Failed to mark messages as read:', error);
        return false;
    }
}

/**
 * Validate if a session exists
 */
export async function validateChatSession(sessionId: string): Promise<{
    exists: boolean;
    blocked?: boolean;
}> {
    try {
        const response = await fetch(`/api/chat/session?sessionId=${sessionId}`);
        const data: ApiResponse<{ blocked?: boolean }> = await response.json();

        if (data.success) {
            return {
                exists: true,
                blocked: data.data?.blocked || false,
            };
        }

        return { exists: false };
    } catch (error) {
        console.error('Failed to validate session:', error);
        return { exists: false };
    }
}
