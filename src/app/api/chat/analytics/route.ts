import { NextRequest, NextResponse } from 'next/server';
import { ChatSession, ChatMessage } from '@/models/Chat';
import mongoose from 'mongoose';

// MongoDB connection helper
async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(MONGODB_URI);
}

/**
 * GET /api/chat/analytics
 * Returns detailed analytics data for the admin dashboard
 * 
 * Query Parameters:
 * - range: '7d' | '30d' | '90d' (default: '7d')
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '7d';

        // Calculate date ranges
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90;
        const rangeStart = new Date(today);
        rangeStart.setDate(rangeStart.getDate() - daysBack);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(thisWeekStart.getDate() - 7);

        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        // Overview Stats
        const totalSessions = await ChatSession.countDocuments();
        const totalMessages = await ChatMessage.countDocuments();
        
        // Count unique users (by unique emails, or sessions if no email)
        const uniqueEmails = await ChatSession.distinct('email', { 
            email: { $exists: true, $nin: [null, ''] } 
        });
        const sessionsWithoutEmail = await ChatSession.countDocuments({ 
            $or: [{ email: null }, { email: '' }, { email: { $exists: false } }] 
        });
        const totalUsers = uniqueEmails.length + sessionsWithoutEmail;

        // Average response time (simplified - time between user message and next admin message)
        const avgResponseTime = '< 5m'; // TODO: Calculate from actual data

        // Trends
        const sessionsToday = await ChatSession.countDocuments({
            createdAt: { $gte: today }
        });

        const sessionsYesterday = await ChatSession.countDocuments({
            createdAt: { $gte: yesterday, $lt: today }
        });

        const messagesThisWeek = await ChatMessage.countDocuments({
            timestamp: { $gte: thisWeekStart }
        });

        const messagesLastWeek = await ChatMessage.countDocuments({
            timestamp: { $gte: lastWeekStart, $lt: thisWeekStart }
        });

        // Message Stats
        const userMessages = await ChatMessage.countDocuments({ sender: 'user' });
        const adminMessages = await ChatMessage.countDocuments({ sender: 'admin' });
        const avgMessagesPerSession = totalSessions > 0 
            ? totalMessages / totalSessions 
            : 0;

        // Time Stats
        // Calculate average session duration
        const sessionsWithDuration = await ChatSession.aggregate([
            {
                $match: {
                    lastActivity: { $exists: true },
                    createdAt: { $exists: true }
                }
            },
            {
                $project: {
                    duration: {
                        $subtract: ['$lastActivity', '$createdAt']
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: '$duration' }
                }
            }
        ]);

        const avgDurationMs = sessionsWithDuration[0]?.avgDuration || 0;
        const avgDurationMinutes = Math.round(avgDurationMs / 1000 / 60);
        const avgSessionDuration = avgDurationMinutes > 60 
            ? `${Math.floor(avgDurationMinutes / 60)}h ${avgDurationMinutes % 60}m`
            : `${avgDurationMinutes}m`;

        // Peak hours - find the hour with most messages
        const hourlyActivity = await ChatMessage.aggregate([
            {
                $match: {
                    timestamp: { $gte: rangeStart }
                }
            },
            {
                $project: {
                    hour: { $hour: '$timestamp' }
                }
            },
            {
                $group: {
                    _id: '$hour',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 3
            }
        ]);

        const peakHours = hourlyActivity.length > 0
            ? hourlyActivity.map(h => `${h._id}:00`).join(', ')
            : 'N/A';

        // Busiest days of week
        const dailyActivity = await ChatMessage.aggregate([
            {
                $match: {
                    timestamp: { $gte: rangeStart }
                }
            },
            {
                $project: {
                    dayOfWeek: { $dayOfWeek: '$timestamp' }
                }
            },
            {
                $group: {
                    _id: '$dayOfWeek',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 3
            }
        ]);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const busyDays = dailyActivity.map(d => dayNames[d._id - 1]);

        // Recent Activity (last 7-30 days, day by day)
        const activityDays = Math.min(daysBack, 14); // Show max 14 days in chart
        const recentActivity = [];

        for (let i = activityDays - 1; i >= 0; i--) {
            const dayStart = new Date(today);
            dayStart.setDate(dayStart.getDate() - i);
            
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const sessions = await ChatSession.countDocuments({
                createdAt: { $gte: dayStart, $lt: dayEnd }
            });

            const messages = await ChatMessage.countDocuments({
                timestamp: { $gte: dayStart, $lt: dayEnd }
            });

            recentActivity.push({
                date: dayStart.toISOString(),
                sessions,
                messages
            });
        }

        const analyticsData = {
            overview: {
                totalSessions,
                totalMessages,
                totalUsers,
                avgResponseTime
            },
            trends: {
                sessionsToday,
                sessionsYesterday,
                messagesThisWeek,
                messagesLastWeek
            },
            timeStats: {
                avgSessionDuration,
                peakHours,
                busyDays
            },
            messageStats: {
                userMessages,
                adminMessages,
                avgMessagesPerSession
            },
            recentActivity
        };

        return NextResponse.json({
            success: true,
            data: analyticsData
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}
