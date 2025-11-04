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

// GET - Dashboard Statistiken
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Heute 00:00 Uhr
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 30 Minuten zurück
        const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

        // Zähle total Sessions
        const totalSessions = await ChatSession.countDocuments();

        // Zähle Nachrichten von heute
        const messagesToday = await ChatMessage.countDocuments({
            timestamp: { $gte: today }
        });

        // Zähle aktive Sessions (letzte Nachricht < 30min)
        const activeNow = await ChatSession.countDocuments({
            lastMessageAt: { $gte: thirtyMinAgo }
        });

        // Berechne durchschnittliche Response Time (vereinfacht)
        // TODO: Könnte später auf Basis von tatsächlichen Admin-Antwortzeiten berechnet werden
        const avgResponseTime = '< 5m';

        console.log(`📊 Stats geladen: ${totalSessions} sessions, ${messagesToday} messages today, ${activeNow} active`);

        return NextResponse.json({
            success: true,
            data: {
                totalSessions,
                messagesToday,
                activeNow,
                avgResponseTime
            }
        });
    } catch (error) {
        console.error('❌ Get Stats Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch stats',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
