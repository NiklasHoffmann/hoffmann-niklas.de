/**
 * Chat Configuration Constants
 */

export const CHAT_CONFIG = {
    // Timeouts
    INITIAL_LOAD_DELAY: 2000, // Delay before enabling notification sounds
    TYPING_INDICATOR_TIMEOUT: 3000, // Auto-hide typing indicator after 3s

    // Notification Sound
    SOUND_FREQUENCY: 800, // Hz
    SOUND_DURATION: 0.5, // seconds
    SOUND_VOLUME: 0.3,

    // UI Limits
    MAX_UNREAD_BADGE: 9, // Show "9+" for counts > 9
    MAX_MESSAGE_LENGTH: 2000,

    // Auto-scroll
    SCROLL_BEHAVIOR: 'smooth' as ScrollBehavior,
    SCROLL_BLOCK: 'center' as ScrollLogicalPosition,
} as const;

/**
 * Quick Replies - German
 */
export const QUICK_REPLIES_DE = [
    'Hallo! Wie kann ich Ihnen helfen?',
    'Vielen Dank für Ihre Nachricht. Ich melde mich gleich bei Ihnen.',
    'Gerne helfe ich Ihnen weiter. Was genau benötigen Sie?',
    'Können Sie mir bitte mehr Details dazu geben?',
    'Ich schaue mir das an und melde mich in Kürze.',
    'Perfekt, verstanden! Ich kümmere mich darum.',
    'Gibt es sonst noch etwas, wobei ich helfen kann?',
    'Vielen Dank! Schönen Tag noch! 😊',
] as const;

/**
 * Quick Replies - English
 */
export const QUICK_REPLIES_EN = [
    'Hello! How can I help you?',
    'Thank you for your message. I\'ll get back to you shortly.',
    'I\'d be happy to help. What exactly do you need?',
    'Could you please provide more details?',
    'I\'ll look into this and get back to you soon.',
    'Perfect, understood! I\'ll take care of it.',
    'Is there anything else I can help you with?',
    'Thank you! Have a great day! 😊',
] as const;

/**
 * Socket.io Event Names
 */
export const SOCKET_EVENTS = {
    // Client -> Server
    JOIN_SESSION: 'join-session',
    SEND_MESSAGE: 'send-message',
    TYPING: 'typing',
    MARK_READ: 'mark-read',
    ADMIN_ONLINE: 'admin-online',
    ADMIN_OFFLINE: 'admin-offline',
    ADMIN_JOIN: 'admin:join',
    ADMIN_LEAVE: 'admin:leave',
    ADMIN_JOIN_SESSION: 'admin:join-session',
    ADMIN_MESSAGE: 'admin:message',
    ADMIN_TYPING: 'admin:typing',
    USER_TYPING: 'user:typing',
    SESSION_DELETED: 'session-deleted',
    USER_BLOCKED: 'user-blocked',

    // Server -> Client
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    SESSION_JOINED: 'session-joined',
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    NEW_MESSAGE: 'new-message',
    ADMIN_STATUS: 'admin-status',
    MESSAGES_READ: 'messages-read',
    NEW_SESSION_STARTED: 'new-session-started',
    ADMIN_NEW_MESSAGE: 'admin:new-message',
    ADMIN_NEW_SESSION: 'admin:new-session',
} as const;

/**
 * LocalStorage Keys
 */
export const STORAGE_KEYS = {
    CHAT_SESSION_ID: 'chatSessionId',
    CHAT_USER_NAME: 'chatUserName',
} as const;

/**
 * Color Scheme
 */
export const CHAT_COLORS = {
    // User message backgrounds
    USER_MSG_LIGHT: '#4b5563',
    USER_MSG_DARK: '#e5e7eb',

    // User message text
    USER_TEXT_LIGHT: '#ffffff',
    USER_TEXT_DARK: '#111827',

    // Admin message backgrounds
    ADMIN_MSG_LIGHT: '#ffffff',
    ADMIN_MSG_DARK: '#0d0d0d',

    // Borders
    BORDER_LIGHT: '#d1d5db',
    BORDER_DARK: '#262626',

    // Accent
    ACCENT: '#3b82f6',

    // Status indicators
    ONLINE_GREEN: '#10b981',
    BLOCKED_RED: '#ef4444',
    UNREAD_BLUE: '#3b82f6',
} as const;
