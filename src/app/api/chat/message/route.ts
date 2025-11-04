import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { ChatMessage, ChatSession } from '@/models/Chat';
import type { MessageSender } from '@/types/chat';

// Validation Schema für neue Nachricht
const messageSchema = z.object({
    sessionId: z.string().min(1, 'sessionId is required'),
    message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
    sender: z.enum(['user', 'admin']),
});

// MongoDB Connection Helper
async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
}

// POST - Neue Nachricht senden
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = messageSchema.parse(body);

        // Connect to MongoDB
        await connectDB();

        // Prüfe ob Session existiert
        const session = await ChatSession.findOne({ sessionId: validatedData.sessionId });

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Chat session not found',
                },
                { status: 404 }
            );
        }

        // Prüfe ob User blockiert ist
        if (session.blocked && validatedData.sender === 'user') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You have been blocked from this chat',
                },
                { status: 403 }
            );
        }

        // Prüfe ob Session noch aktiv ist
        if (session.status === 'closed' || session.status === 'archived') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Chat session is closed',
                },
                { status: 403 }
            );
        }

        // Speichere Nachricht
        const message = new ChatMessage({
            sessionId: validatedData.sessionId,
            sender: validatedData.sender as MessageSender,
            message: validatedData.message,
            timestamp: new Date(),
            read: false, // Neue Nachrichten sind immer ungelesen
        });

        await message.save();

        // Update Session lastMessageAt
        session.lastMessageAt = new Date();
        await session.save();

        console.log(`💬 Neue Nachricht in Session ${validatedData.sessionId} von ${validatedData.sender}`);

        // Hier später Socket.io Event emittieren
        // TODO: Emit 'new-message' event via Socket.io

        return NextResponse.json(
            {
                success: true,
                message: 'Message sent successfully',
                data: {
                    _id: message._id,
                    sessionId: message.sessionId,
                    sender: message.sender,
                    message: message.message,
                    timestamp: message.timestamp,
                    read: message.read,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ Send Message API Error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation error',
                    errors: error.issues,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
