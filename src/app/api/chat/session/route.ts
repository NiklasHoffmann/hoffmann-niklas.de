import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { ChatSession } from '@/models/Chat';
import { nanoid } from 'nanoid';

// Validation Schema für neue Chat Session
const sessionSchema = z.object({
    userName: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    userId: z.string().optional(),
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

// POST - Neue Chat Session erstellen
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = sessionSchema.parse(body);

        // Connect to MongoDB
        await connectDB();

        // Generiere eindeutige sessionId (12 Zeichen)
        const sessionId = nanoid(12);

        // Erstelle neue Session
        const session = new ChatSession({
            sessionId,
            userName: validatedData.userName,
            email: validatedData.email,
            userId: validatedData.userId,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await session.save();

        console.log('✅ Neue Chat Session erstellt:', sessionId);

        return NextResponse.json(
            {
                success: true,
                message: 'Chat session created successfully',
                data: {
                    sessionId: session.sessionId,
                    status: session.status,
                    createdAt: session.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ Chat Session API Error:', error);

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

// GET - Session Info abrufen (optional, für existierende Session)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

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

        const session = await ChatSession.findOne({ sessionId });

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Session not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                sessionId: session.sessionId,
                userName: session.userName,
                email: session.email,
                status: session.status,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                lastMessageAt: session.lastMessageAt,
            },
        });
    } catch (error) {
        console.error('❌ Get Session Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch session',
            },
            { status: 500 }
        );
    }
}

// PATCH - Update Session (z.B. userName, blocked status)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, userName, email, blocked } = body;

        if (!sessionId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'sessionId is required',
                },
                { status: 400 }
            );
        }

        await connectDB();

        const updateData: any = { updatedAt: new Date() };

        // Wenn userName aktualisiert wird, prüfe auf Duplikate
        if (userName) {
            let uniqueName = userName;
            let counter = 2;

            // Prüfe ob der Name bereits existiert (außer für die aktuelle Session)
            while (true) {
                const existingSession = await ChatSession.findOne({
                    userName: uniqueName,
                    sessionId: { $ne: sessionId }, // Nicht die aktuelle Session
                    status: 'active' // Nur aktive Sessions
                });

                if (!existingSession) {
                    break; // Name ist eindeutig
                }

                // Name existiert, füge Nummer hinzu
                uniqueName = `${userName} (${counter})`;
                counter++;
            }

            updateData.userName = uniqueName;
        }

        if (email) updateData.email = email;
        if (typeof blocked === 'boolean') updateData.blocked = blocked;

        const session = await ChatSession.findOneAndUpdate(
            { sessionId },
            updateData,
            { new: true }
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

        console.log(`✅ Session updated: ${sessionId} - userName: ${updateData.userName}${blocked ? ' - BLOCKED' : ''}`);

        return NextResponse.json({
            success: true,
            message: 'Session updated successfully',
            data: {
                sessionId: session.sessionId,
                userName: session.userName,
                email: session.email,
                blocked: session.blocked,
                updatedAt: session.updatedAt,
            },
        });
    } catch (error) {
        console.error('❌ Update Session Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update session',
            },
            { status: 500 }
        );
    }
}

// DELETE - Session und alle Nachrichten löschen
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

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

        // Importiere ChatMessage für cascade delete
        const { ChatMessage } = await import('@/models/Chat');

        // Lösche Session
        const session = await ChatSession.findOneAndDelete({ sessionId });

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Session not found',
                },
                { status: 404 }
            );
        }

        // Lösche alle zugehörigen Nachrichten
        await ChatMessage.deleteMany({ sessionId });

        console.log(`🗑️ Session deleted: ${sessionId} (and all messages)`);

        return NextResponse.json({
            success: true,
            message: 'Session and all messages deleted successfully',
            data: {
                sessionId,
                deletedAt: new Date(),
            },
        });
    } catch (error) {
        console.error('❌ Delete Session Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete session',
            },
            { status: 500 }
        );
    }
}
