import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsSession, AnalyticsEvent } from '@/models/Analytics';
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
 * GET /api/analytics/stats
 * Returns website analytics statistics
 * 
 * Query Parameters:
 * - range: '24h' | '7d' | '30d' | '90d' (default: '7d')
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '7d';

        // Calculate date ranges
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let rangeStart: Date;
        switch (range) {
            case '24h':
                rangeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                rangeStart = new Date(today);
                rangeStart.setDate(rangeStart.getDate() - 7);
                break;
            case '30d':
                rangeStart = new Date(today);
                rangeStart.setDate(rangeStart.getDate() - 30);
                break;
            case '90d':
                rangeStart = new Date(today);
                rangeStart.setDate(rangeStart.getDate() - 90);
                break;
            default:
                rangeStart = new Date(today);
                rangeStart.setDate(rangeStart.getDate() - 7);
        }

        // 1. Overview Stats
        const totalSessions = await AnalyticsSession.countDocuments({
            startTime: { $gte: rangeStart }
        });

        const totalPageViews = await AnalyticsEvent.countDocuments({
            eventType: 'pageview',
            timestamp: { $gte: rangeStart }
        });

        const uniqueVisitors = await AnalyticsSession.distinct('visitorId', {
            startTime: { $gte: rangeStart }
        });

        // Average Session Duration
        const avgDurationResult = await AnalyticsSession.aggregate([
            { $match: { startTime: { $gte: rangeStart }, duration: { $gt: 0 } } },
            { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
        ]);
        const avgSessionDuration = avgDurationResult[0]?.avgDuration || 0;

        // Bounce Rate (Sessions mit nur 1 Pageview)
        const bouncedSessions = await AnalyticsSession.countDocuments({
            startTime: { $gte: rangeStart },
            pageViews: 1
        });
        const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

        // 2. Top Pages
        const topPages = await AnalyticsEvent.aggregate([
            {
                $match: {
                    eventType: 'pageview',
                    timestamp: { $gte: rangeStart }
                }
            },
            {
                $group: {
                    _id: { path: '$page.path', title: '$page.title' },
                    views: { $sum: 1 },
                    avgTimeOnPage: { $avg: '$timeOnPage' }
                }
            },
            {
                $sort: { views: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    path: '$_id.path',
                    title: '$_id.title',
                    views: 1,
                    avgTimeOnPage: { $round: ['$avgTimeOnPage', 0] }
                }
            }
        ]);

        // 3. Device Stats
        const deviceStatsArray = await AnalyticsSession.aggregate([
            { $match: { startTime: { $gte: rangeStart } } },
            {
                $group: {
                    _id: '$device.deviceType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Transform to expected object format
        const deviceStats = {
            mobile: 0,
            tablet: 0,
            desktop: 0,
            unknown: 0
        };

        deviceStatsArray.forEach(item => {
            const type = item._id?.toLowerCase() || 'unknown';
            if (type in deviceStats) {
                deviceStats[type as keyof typeof deviceStats] = item.count;
            } else {
                deviceStats.unknown += item.count;
            }
        });

        // 4. Browser Stats
        const browserStats = await AnalyticsSession.aggregate([
            { $match: { startTime: { $gte: rangeStart } } },
            {
                $group: {
                    _id: '$device.browser',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    browser: '$_id',
                    count: 1
                }
            }
        ]);

        // 4b. Theme Stats
        const themeStats = await AnalyticsSession.aggregate([
            { $match: { startTime: { $gte: rangeStart } } },
            {
                $group: {
                    _id: {
                        $ifNull: ['$device.theme', 'unknown']
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            {
                $project: {
                    _id: 0,
                    theme: '$_id',
                    count: 1
                }
            }
        ]);

        // 5. Traffic Sources (Referrer)
        const trafficSources = await AnalyticsSession.aggregate([
            { $match: { startTime: { $gte: rangeStart }, referrer: { $ne: null } } },
            {
                $project: {
                    source: {
                        $cond: [
                            { $eq: ['$referrer', ''] },
                            'Direct',
                            {
                                $cond: [
                                    { $regexMatch: { input: '$referrer', regex: /google/i } },
                                    'Google',
                                    {
                                        $cond: [
                                            { $regexMatch: { input: '$referrer', regex: /facebook/i } },
                                            'Facebook',
                                            {
                                                $cond: [
                                                    { $regexMatch: { input: '$referrer', regex: /twitter|x\.com/i } },
                                                    'Twitter/X',
                                                    'Other'
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            {
                $project: {
                    _id: 0,
                    source: '$_id',
                    count: 1
                }
            }
        ]);

        // Direct traffic (kein Referrer)
        const directTraffic = await AnalyticsSession.countDocuments({
            startTime: { $gte: rangeStart },
            $or: [{ referrer: '' }, { referrer: null }]
        });
        trafficSources.push({ source: 'Direct', count: directTraffic });

        // 6. Hourly Activity (für Chart)
        const hourlyActivity = await AnalyticsEvent.aggregate([
            {
                $match: {
                    eventType: 'pageview',
                    timestamp: { $gte: rangeStart }
                }
            },
            {
                $group: {
                    _id: { $hour: '$timestamp' },
                    views: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    hour: '$_id',
                    views: 1
                }
            }
        ]);

        // 7. Daily Activity (letzten X Tage)
        const daysToShow = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
        const dailyActivity = [];

        for (let i = daysToShow - 1; i >= 0; i--) {
            const dayStart = new Date(today);
            dayStart.setDate(dayStart.getDate() - i);

            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const [sessions, pageViews, visitors] = await Promise.all([
                AnalyticsSession.countDocuments({
                    startTime: { $gte: dayStart, $lt: dayEnd }
                }),
                AnalyticsEvent.countDocuments({
                    eventType: 'pageview',
                    timestamp: { $gte: dayStart, $lt: dayEnd }
                }),
                AnalyticsSession.distinct('visitorId', {
                    startTime: { $gte: dayStart, $lt: dayEnd }
                })
            ]);

            dailyActivity.push({
                date: dayStart.toISOString(),
                sessions,
                pageViews,
                visitors: visitors.length
            });
        }

        // 8. Top Click Targets
        const topClicks = await AnalyticsEvent.aggregate([
            {
                $match: {
                    eventType: 'click',
                    timestamp: { $gte: rangeStart },
                    'interaction.elementText': { $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        text: '$interaction.elementText',
                        element: '$interaction.element'
                    },
                    clicks: { $sum: 1 }
                }
            },
            { $sort: { clicks: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 0,
                    element: '$_id.text',
                    type: '$_id.element',
                    clicks: 1
                }
            }
        ]);

        // Response
        const analyticsData = {
            overview: {
                totalSessions,
                totalPageViews,
                uniqueVisitors: uniqueVisitors.length,
                avgSessionDuration: Math.round(avgSessionDuration),
                bounceRate: Math.round(bounceRate * 10) / 10,
                avgPageViewsPerSession: totalSessions > 0
                    ? Math.round((totalPageViews / totalSessions) * 10) / 10
                    : 0
            },
            topPages,
            deviceStats,
            browserStats,
            themeStats,
            trafficSources,
            hourlyActivity,
            dailyActivity,
            topClicks
        };

        return NextResponse.json({
            success: true,
            data: analyticsData
        });

    } catch (error) {
        console.error('Analytics stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
