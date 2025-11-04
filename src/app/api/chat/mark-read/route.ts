import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ChatMessage } from '@/models/Chat';

// MongoDB Connection Helper
async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
}

// POST - Mark messages as read
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId } = body;

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

        // Mark all user messages in this session as read
        const result = await ChatMessage.updateMany(
            {
                sessionId,
                sender: 'user',
                read: false
            },
            {
                $set: { read: true }
            }
        );

        console.log(`✅ Marked ${result.modifiedCount} messages as read in session ${sessionId}`);

        return NextResponse.json({
            success: true,
            message: 'Messages marked as read',
            data: {
                markedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('❌ Mark Read Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to mark messages as read',
            },
            { status: 500 }
        );
    }
}
