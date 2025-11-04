// Chat Type Definitions

export type ChatStatus = 'active' | 'closed' | 'archived';
export type MessageSender = 'user' | 'admin';

// TypeScript Interface für Frontend
export interface ChatMessage {
  _id?: string;
  sessionId?: string;
  sender: MessageSender;
  message: string;
  timestamp: Date;
  read?: boolean;
}

export interface ChatSession {
  _id?: string;
  sessionId: string;
  userId?: string; // Optional: für registrierte User
  userName?: string;
  email?: string;
  status: ChatStatus;
  isActive?: boolean; // Runtime status from socket
  blocked?: boolean; // Blockiert vom Admin
  createdAt: Date;
  updatedAt?: Date;
  lastMessageAt?: Date;
  unreadCount?: number; // Anzahl ungelesener Admin-Nachrichten
  totalMessages?: number; // Total number of messages
  lastMessage?: {
    message: string;
    timestamp: Date;
    sender: MessageSender;
  };
}

// Mongoose Schema Interfaces (für Backend/API Routes)
export interface IChatMessage {
  sessionId: string;
  sender: MessageSender;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface IChatSession {
  sessionId: string;
  userId?: string;
  userName?: string;
  email?: string;
  status: ChatStatus;
  blocked?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

// Socket.io Event Types
export interface SocketEvents {
  // Client -> Server
  'join-session': (sessionId: string) => void;
  'send-message': (data: {
    sessionId: string;
    message: string;
    sender: MessageSender;
  }) => void;
  'typing': (data: {
    sessionId: string;
    isTyping: boolean;
    userName?: string;
  }) => void;

  // Server -> Client
  'new-message': (data: {
    message: string;
    sender: MessageSender;
    timestamp: string;
  }) => void;
  'user-typing': (data: {
    isTyping: boolean;
    userName?: string;
  }) => void;
  'session-joined': (data: {
    sessionId: string;
    messageHistory: ChatMessage[];
  }) => void;
}
