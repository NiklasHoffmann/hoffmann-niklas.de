/**
 * Chat Utility Functions
 */

/**
 * Format timestamp to HH:MM (24h format, German locale)
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
 * Format date for session list (relative or absolute)
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
 * Format timestamp to relative time or date (Admin panel style)
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
 * Truncate long text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Clear chat session from localStorage
 */
export function clearChatSession(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('chatSessionId');
    localStorage.removeItem('chatUserName');
}

/**
 * Get chat session from localStorage
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
 * Save chat session to localStorage
 */
export function saveChatSession(sessionId: string, userName?: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('chatSessionId', sessionId);
    if (userName) {
        localStorage.setItem('chatUserName', userName);
    }
}

/**
 * Play notification sound using Web Audio API
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
 * Check if user is on admin page
 */
export function isAdminPage(): boolean {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.includes('/admin');
}

/**
 * Scroll element into view with smooth behavior
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
 * Generate unique ID for messages
 */
export function generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate message input
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
 * Get unread count badge text
 */
export function getUnreadBadgeText(count: number, max: number = 9): string {
    return count > max ? `${max}+` : count.toString();
}
