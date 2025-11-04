/**
 * Chat API Helper Functions
 * Centralized API calls for chat functionality
 * 
 * @module chatApi
 * @description Provides type-safe API functions for chat operations including
 * session management, message handling, and admin operations.
 */

import type { ChatMessage, ChatSession } from '@/types/chat';

/**
 * Standard API response format used by all endpoints
 * 
 * @template T - Type of the data payload
 */
export interface ApiResponse<T = any> {
    /** Indicates if the request was successful */
    success: boolean;
    /** Optional error or success message */
    message?: string;
    /** Response payload data */
    data?: T;
    /** Array of validation or processing errors */
    errors?: any[];
}

/**
 * Fetches all chat sessions from the server (Admin only)
 * 
 * @returns Promise resolving to an array of chat sessions
 * @throws Returns empty array on error (errors are logged)
 * 
 * @example
 * ```typescript
 * const sessions = await fetchChatSessions();
 * console.log(`Total sessions: ${sessions.length}`);
 * ```
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
 * Fetches all messages for a specific chat session
 * 
 * @param sessionId - Unique identifier of the chat session
 * @returns Promise resolving to an array of chat messages sorted by timestamp
 * @throws Returns empty array on error (errors are logged)
 * 
 * @example
 * ```typescript
 * const messages = await fetchChatMessages('abc123xyz');
 * messages.forEach(msg => console.log(`${msg.sender}: ${msg.message}`));
 * ```
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
 * Creates a new chat session or retrieves an existing one
 * 
 * @param userName - Display name of the user (optional, defaults to "Anonymous")
 * @param email - Email address of the user (optional)
 * @returns Promise resolving to the session ID, or null on error
 * @throws Returns null on error (errors are logged)
 * 
 * @example
 * ```typescript
 * const sessionId = await createChatSession('Max Mustermann', 'max@example.com');
 * if (sessionId) {
 *   console.log(`Session created: ${sessionId}`);
 * }
 * ```
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
 * Sends a new message in a chat session
 * 
 * @param sessionId - Unique identifier of the chat session
 * @param message - Message content (1-5000 characters)
 * @param sender - Message sender type ('user' or 'admin')
 * @returns Promise resolving to success status with message data or error
 * 
 * @example
 * ```typescript
 * const result = await sendChatMessage('abc123', 'Hello!', 'user');
 * if (result.success) {
 *   console.log('Message sent:', result.message);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
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
 * Updates session metadata (username or blocked status)
 * 
 * @param sessionId - Unique identifier of the chat session
 * @param updates - Object containing fields to update (userName and/or blocked)
 * @returns Promise resolving to success status with updated data or error
 * 
 * @example
 * ```typescript
 * // Block a user
 * await updateChatSession('abc123', { blocked: true });
 * 
 * // Update username
 * await updateChatSession('abc123', { userName: 'John Doe' });
 * ```
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
 * Deletes a chat session and all associated messages permanently
 * 
 * @param sessionId - Unique identifier of the chat session to delete
 * @returns Promise resolving to true if successful, false otherwise
 * 
 * @warning This action cannot be undone. All messages will be permanently deleted.
 * 
 * @example
 * ```typescript
 * const deleted = await deleteChatSession('abc123xyz');
 * if (deleted) {
 *   console.log('Session deleted successfully');
 * }
 * ```
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
 * Marks all messages in a session as read
 * 
 * @param sessionId - Unique identifier of the chat session
 * @returns Promise resolving to true if successful, false otherwise
 * 
 * @description This updates the isRead flag for all messages and resets
 * the unread counter for the session.
 * 
 * @example
 * ```typescript
 * await markMessagesAsRead('abc123xyz');
 * ```
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
 * Validates if a chat session exists and checks its blocked status
 * 
 * @param sessionId - Unique identifier of the chat session to validate
 * @returns Promise resolving to validation result with exists and blocked flags
 * 
 * @example
 * ```typescript
 * const validation = await validateChatSession('abc123xyz');
 * if (validation.exists && !validation.blocked) {
 *   console.log('Session is valid and active');
 * } else if (validation.blocked) {
 *   console.log('Session is blocked');
 * }
 * ```
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
