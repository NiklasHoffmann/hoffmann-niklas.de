import mongoose, { Schema, Model } from 'mongoose';
import type { IChatSession, IChatMessage } from '@/types/chat';

// ChatSession Schema
const chatSessionSchema = new Schema<IChatSession>({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: false
    },
    userName: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'archived'],
        default: 'active',
        index: true
    },
    blocked: {
        type: Boolean,
        default: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastMessageAt: {
        type: Date,
        required: false
    }
});

// Auto-update updatedAt bei Änderungen
chatSessionSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// ChatMessage Schema
const chatMessageSchema = new Schema<IChatMessage>({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    read: {
        type: Boolean,
        default: false
    }
});

// Indexes für Performance
chatMessageSchema.index({ sessionId: 1, timestamp: -1 });

// Models exportieren
export const ChatSession: Model<IChatSession> =
    mongoose.models.ChatSession || mongoose.model<IChatSession>('ChatSession', chatSessionSchema);

export const ChatMessage: Model<IChatMessage> =
    mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
