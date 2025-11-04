/**
 * Chat Utility Functions
 * 
 * @module chatUtils
 * @description Collection of utility functions for chat functionality including
 * time formatting, localStorage management, audio notifications, and validation.
 */

/**
 * Formats a timestamp to HH:MM format (24-hour, German locale)
 * 
 * @param date - Date object or ISO string to format
 * @returns Formatted time string (e.g., "14:30")
 * 
 * @example
 * ```typescript
 * formatChatTime(new Date()); // "14:30"
 * formatChatTime("2025-01-04T14:30:00Z"); // "14:30"
 * ```
 */
export function formatChatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

/**
 * Formats a date for session list display with relative time labels
 * 
 * @param date - Date object or ISO string to format
 * @returns Relative time string (e.g., "5m", "2h", "3d") or absolute time
 * 
 * @description Returns:
 * - "Now" if less than 1 minute ago
 * - "{n}m" if less than 60 minutes ago
 * - "{n}h" if less than 24 hours ago
 * - "{n}d" if less than 7 days ago
 * - HH:MM format for older dates
 * 
 * @example
 * ```typescript
 * formatSessionDate(new Date(Date.now() - 300000)); // "5m"
 * formatSessionDate(new Date(Date.now() - 7200000)); // "2h"
 * ```
 */
export function formatSessionDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return formatChatTime(dateObj);
}

/**
 * Formats a timestamp to relative time with "ago" suffix (Admin panel style)
 * 
 * @param date - Date object or ISO string to format
 * @returns Relative time string (e.g., "5m ago", "2h ago") or localized date
 * 
 * @description Similar to formatSessionDate but with "ago" suffix and
 * falls back to toLocaleDateString() for dates older than 7 days.
 * 
 * @example
 * ```typescript
 * formatTime(new Date(Date.now() - 300000)); // "5m ago"
 * formatTime(new Date(Date.now() - 7200000)); // "2h ago"
 * formatTime(new Date('2024-01-01')); // "1/1/2024"
 * ```
 */
export function formatTime(date: Date | string): string {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
}

/**
 * Truncates long text and adds ellipsis if exceeds max length
 * 
 * @param text - Text string to truncate
 * @param maxLength - Maximum character length (default: 50)
 * @returns Truncated string with "..." suffix if needed
 * 
 * @example
 * ```typescript
 * truncateText("This is a very long message", 10); // "This is a ..."
 * truncateText("Short", 10); // "Short"
 * ```
 */
export function truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Clears all chat session data from browser localStorage
 * 
 * @description Removes chatSessionId and chatUserName from localStorage.
 * Safe to call in SSR context (checks for window object).
 * 
 * @example
 * ```typescript
 * clearChatSession();
 * console.log(getChatSession()); // { sessionId: null, userName: null }
 * ```
 */
export function clearChatSession(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('chatSessionId');
    localStorage.removeItem('chatUserName');
}

/**
 * Retrieves stored chat session data from browser localStorage
 * 
 * @returns Object containing sessionId and userName (null if not found)
 * 
 * @description Safe to call in SSR context - returns null values if
 * window is undefined (server-side).
 * 
 * @example
 * ```typescript
 * const { sessionId, userName } = getChatSession();
 * if (sessionId) {
 *   console.log(`Resuming session for ${userName}`);
 * }
 * ```
 */
export function getChatSession(): { sessionId: string | null; userName: string | null } {
    if (typeof window === 'undefined') {
        return { sessionId: null, userName: null };
    }

    return {
        sessionId: localStorage.getItem('chatSessionId'),
        userName: localStorage.getItem('chatUserName'),
    };
}

/**
 * Saves chat session data to browser localStorage for persistence
 * 
 * @param sessionId - Unique session identifier to store
 * @param userName - Optional user name to store
 * 
 * @description Safe to call in SSR context (checks for window object).
 * Session data persists across page reloads.
 * 
 * @example
 * ```typescript
 * saveChatSession('abc123xyz', 'Max Mustermann');
 * // Later...
 * const { sessionId } = getChatSession(); // 'abc123xyz'
 * ```
 */
export function saveChatSession(sessionId: string, userName?: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('chatSessionId', sessionId);
    if (userName) {
        localStorage.setItem('chatUserName', userName);
    }
}

/**
 * Creates a notification sound player using Web Audio API
 * 
 * @returns Object containing play function and audioContext reference
 * 
 * @description Generates a 800Hz sine wave beep for 0.5 seconds with
 * fade-out envelope. Handles browser autoplay policy by resuming suspended
 * AudioContext. AudioContext is created lazily on first play.
 * 
 * @example
 * ```typescript
 * const sound = createNotificationSound();
 * 
 * // Play on new message
 * await sound.play();
 * 
 * // Access AudioContext if needed
 * console.log(sound.audioContext?.state); // "running"
 * ```
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API}
 */
export function createNotificationSound(): {
    play: () => Promise<void>;
    audioContext: AudioContext | null;
} {
    let audioContext: AudioContext | null = null;

    const play = async (): Promise<void> => {
        if (typeof window === 'undefined') return;

        try {
            // Create AudioContext on first play (after user interaction)
            if (!audioContext) {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            // Resume context if suspended (Chrome autoplay policy)
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            // Create oscillator (sine wave at 800 Hz)
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Frequency in Hz
            oscillator.type = 'sine';

            // Volume envelope (fade out)
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 0.5
            );

            // Play for 0.5 seconds
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Could not play notification sound:', error);
        }
    };

    return { play, audioContext };
}

/**
 * Checks if the current page is an admin page
 * 
 * @returns True if pathname contains "/admin", false otherwise
 * 
 * @description Safe to call in SSR context (checks for window object).
 * Useful for conditional admin-only features.
 * 
 * @example
 * ```typescript
 * if (isAdminPage()) {
 *   console.log('Admin features enabled');
 * }
 * ```
 */
export function isAdminPage(): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.includes('/admin');
}

/**
 * Scrolls an element into view with smooth animation
 * 
 * @param element - HTML element to scroll to (or null for no-op)
 * @param block - Scroll alignment position (default: 'center')
 * 
 * @description Uses scrollIntoView with smooth behavior. Commonly used
 * to auto-scroll to latest message in chat.
 * 
 * @example
 * ```typescript
 * const messagesEnd = document.getElementById('messages-end');
 * smoothScrollTo(messagesEnd, 'end');
 * ```
 */
export function smoothScrollTo(
    element: HTMLElement | null,
    block: ScrollLogicalPosition = 'center'
): void {
    if (!element) return;

    element.scrollIntoView({
        behavior: 'smooth',
        block,
    });
}

/**
 * Generates a unique identifier for chat messages
 * 
 * @returns Unique ID string in format "msg_{timestamp}_{random}"
 * 
 * @description Combines current timestamp with random alphanumeric string
 * for uniqueness. Suitable for client-side temporary IDs.
 * 
 * @example
 * ```typescript
 * const id = generateMessageId(); // "msg_1704369600123_k3j4h5g6"
 * ```
 */
export function generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates chat message input against constraints
 * 
 * @param message - Message string to validate
 * @param maxLength - Maximum allowed character length (default: 2000)
 * @returns Validation result with valid flag and optional error message
 * 
 * @description Checks for:
 * - Empty or whitespace-only messages
 * - Messages exceeding max length
 * 
 * @example
 * ```typescript
 * const result = validateMessage('Hello!');
 * if (result.valid) {
 *   sendMessage('Hello!');
 * } else {
 *   alert(result.error);
 * }
 * ```
 */
export function validateMessage(message: string, maxLength: number = 2000): {
    valid: boolean;
    error?: string;
} {
    if (!message || !message.trim()) {
        return { valid: false, error: 'Message cannot be empty' };
    }

    if (message.length > maxLength) {
        return { valid: false, error: `Message too long (max ${maxLength} characters)` };
    }

    return { valid: true };
}

/**
 * Formats unread count for badge display with max threshold
 * 
 * @param count - Number of unread items
 * @param max - Maximum number to display before using "+" (default: 9)
 * @returns Formatted count string (e.g., "5", "9+")
 * 
 * @description Prevents badge overflow by capping display at max value.
 * Common pattern: show "9+" instead of "142" to save space.
 * 
 * @example
 * ```typescript
 * getUnreadBadgeText(5); // "5"
 * getUnreadBadgeText(15); // "9+"
 * getUnreadBadgeText(100, 99); // "99+"
 * ```
 */
export function getUnreadBadgeText(count: number, max: number = 9): string {
    return count > max ? `${max}+` : count.toString();
}
