import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ChatSession, ChatMessage } from '@/models/Chat';

// MongoDB Connection Helper
async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
}

// GET - Alle Chat Sessions auflisten (für Admin Panel)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // Optional: Filter nach Status

        await connectDB();

        // Query Builder
        const query: any = {};
        if (status && ['active', 'closed', 'archived'].includes(status)) {
            query.status = status;
        }

        // Lade alle Sessions, sortiert nach letzter Nachricht (neueste zuerst)
        const sessions = await ChatSession.find(query)
            .sort({ lastMessageAt: -1, createdAt: -1 }) // Sessions mit neuesten Nachrichten zuerst
            .lean();

        // Für jede Session: Zähle ungelesene User-Nachrichten
        const sessionsWithUnread = await Promise.all(
            sessions.map(async (session) => {
                // Zähle ungelesene User-Nachrichten (Admin hat sie noch nicht gelesen)
                const unreadCount = await ChatMessage.countDocuments({
                    sessionId: session.sessionId,
                    sender: 'user',
                    read: false,
                });

                // Hole letzte Nachricht
                const lastMessage = await ChatMessage.findOne({
                    sessionId: session.sessionId,
                })
                    .sort({ timestamp: -1 })
                    .lean();

                // Zähle Gesamtanzahl Nachrichten
                const totalMessages = await ChatMessage.countDocuments({
                    sessionId: session.sessionId,
                });

                return {
                    _id: session._id.toString(),
                    sessionId: session.sessionId,
                    userName: session.userName || 'Anonymous',
                    email: session.email,
                    status: session.status,
                    createdAt: session.createdAt,
                    updatedAt: session.updatedAt,
                    lastMessageAt: session.lastMessageAt,
                    unreadCount,
                    totalMessages,
                    lastMessage: lastMessage
                        ? {
                            sender: lastMessage.sender,
                            message: lastMessage.message,
                            timestamp: lastMessage.timestamp,
                        }
                        : null,
                };
            })
        );

        console.log(`📋 Admin: ${sessionsWithUnread.length} Sessions geladen (Filter: ${status || 'alle'})`);

        return NextResponse.json({
            success: true,
            data: {
                sessions: sessionsWithUnread,
                total: sessionsWithUnread.length,
                unreadTotal: sessionsWithUnread.reduce((sum, s) => sum + s.unreadCount, 0),
            },
        });
    } catch (error) {
        console.error('❌ Get Sessions Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch sessions',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// PATCH - Session Status ändern (z.B. von active → closed)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, status } = body;

        if (!sessionId || !status) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'sessionId and status are required',
                },
                { status: 400 }
            );
        }

        if (!['active', 'closed', 'archived'].includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid status. Must be: active, closed, or archived',
                },
                { status: 400 }
            );
        }

        await connectDB();

        const session = await ChatSession.findOneAndUpdate(
            { sessionId },
            { status, updatedAt: new Date() },
            { new: true } // Return updated document
        );

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Session not found',
                },
                { status: 404 }
            );
        }

        console.log(`✅ Session Status geändert: ${sessionId} → ${status}`);

        return NextResponse.json({
            success: true,
            message: 'Session status updated',
            data: {
                sessionId: session.sessionId,
                status: session.status,
                updatedAt: session.updatedAt,
            },
        });
    } catch (error) {
        console.error('❌ Update Session Status Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update session status',
            },
            { status: 500 }
        );
    }
}
