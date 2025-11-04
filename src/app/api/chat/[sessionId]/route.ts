import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ChatMessage, ChatSession } from '@/models/Chat';

// MongoDB Connection Helper
async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
}

// GET - Chat History für eine Session laden
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        if (!sessionId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'sessionId parameter is required',
                },
                { status: 400 }
            );
        }

        await connectDB();

        // Prüfe ob Session existiert
        const session = await ChatSession.findOne({ sessionId });

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Chat session not found',
                },
                { status: 404 }
            );
        }

        // Lade alle Nachrichten der Session, sortiert nach Timestamp
        const messages = await ChatMessage.find({ sessionId })
            .sort({ timestamp: 1 }) // Älteste zuerst
            .lean(); // Bessere Performance, nur Plain Objects

        console.log(`📜 Chat History geladen: ${messages.length} Nachrichten für Session ${sessionId}`);

        return NextResponse.json({
            success: true,
            data: {
                sessionId: session.sessionId,
                status: session.status,
                userName: session.userName,
                email: session.email,
                createdAt: session.createdAt,
                lastMessageAt: session.lastMessageAt,
                messages: messages.map(msg => ({
                    _id: msg._id.toString(),
                    sender: msg.sender,
                    message: msg.message,
                    timestamp: msg.timestamp,
                    read: msg.read,
                })),
            },
        });
    } catch (error) {
        console.error('❌ Get Chat History Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch chat history',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// PATCH - Nachrichten als gelesen markieren
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const body = await request.json();
        const { sender } = body; // 'user' oder 'admin' - wessen Nachrichten sollen gelesen werden

        if (!sessionId || !sender) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'sessionId and sender are required',
                },
                { status: 400 }
            );
        }

        await connectDB();

        // Markiere alle ungelesenen Nachrichten des Senders als gelesen
        const result = await ChatMessage.updateMany(
            {
                sessionId,
                sender,
                read: false,
            },
            {
                $set: { read: true },
            }
        );

        console.log(`✅ ${result.modifiedCount} Nachrichten als gelesen markiert (Session: ${sessionId}, Sender: ${sender})`);

        return NextResponse.json({
            success: true,
            message: 'Messages marked as read',
            data: {
                modifiedCount: result.modifiedCount,
            },
        });
    } catch (error) {
        console.error('❌ Mark Messages Read Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to mark messages as read',
            },
            { status: 500 }
        );
    }
}
