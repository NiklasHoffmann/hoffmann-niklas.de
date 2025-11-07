import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent, AnalyticsSession } from '@/models/Analytics';
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

// Helper: Device Type Detection
function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
    if (!userAgent) return 'unknown';

    // Bots zuerst checken
    if (/bot|crawler|spider|crawling/i.test(userAgent)) {
        return 'unknown'; // Bots ignorieren
    }

    // Tablet Detection (vor Mobile, da manche Tablets "mobile" im UA haben)
    // iPad (inkl. iPadOS 13+ das sich als Mac ausgibt)
    if (/ipad/i.test(userAgent)) {
        return 'tablet';
    }
    // iPad mit iPadOS 13+ gibt sich als Mac aus - checke Touch-Support via Screen Size
    // Typische iPad Auflösungen: 768x1024, 834x1112, 834x1194, 1024x1366
    if (/Macintosh/i.test(userAgent) && /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
        // Könnte ein iPad sein (Safari on Mac vs iPad ist schwer zu unterscheiden)
        // Wir können das nicht 100% sicher erkennen ohne JavaScript vom Client
        // Für jetzt: als Desktop behandeln, außer es kommt explizit "iPad" vor
    }
    // Android Tablets
    if (/android/i.test(userAgent) && !/mobile/i.test(userAgent)) {
        return 'tablet';
    }
    // Andere Tablets
    if (/tablet|playbook|silk|kindle/i.test(userAgent)) {
        return 'tablet';
    }

    // Mobile Detection
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini|windows phone/i.test(userAgent)) {
        return 'mobile';
    }

    return 'desktop';
}

// Helper: Browser Detection
function getBrowser(userAgent: string): string {
    if (!userAgent) return 'Unknown';

    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Other';
}

// Helper: OS Detection
function getOS(userAgent: string): string {
    if (!userAgent) return 'Unknown';

    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
}

/**
 * POST /api/analytics/track
 * Tracks analytics events (pageviews, clicks, etc.)
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const {
            sessionId,
            visitorId,
            eventType,
            page,
            interaction,
            scrollDepth,
            timeOnPage,
            sessionDuration,
            utm
        } = body;

        // Validierung
        if (!sessionId || !visitorId || !eventType) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // User Agent & Device Info
        const userAgent = request.headers.get('user-agent') || '';

        // Verwende deviceType vom Client (falls vorhanden), sonst Server-Side Detection
        let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';

        if (body.device?.deviceType && ['mobile', 'tablet', 'desktop'].includes(body.device.deviceType)) {
            // Client-Side Detection ist genauer (hat Zugriff auf Touch-Support & Screen-Size)
            deviceType = body.device.deviceType;
        } else {
            // Fallback: Server-Side Detection via User-Agent
            deviceType = getDeviceType(userAgent);
        }

        // Bots ignorieren
        if (deviceType === 'unknown') {
            return NextResponse.json({ success: true, ignored: true });
        }

        const device = {
            userAgent,
            deviceType,
            browser: getBrowser(userAgent),
            os: getOS(userAgent),
            screenResolution: body.device?.screenResolution,
            theme: body.device?.theme || 'unknown'
        };

        // Location (nur Timezone, kein IP-Tracking)
        const location = {
            timezone: body.location?.timezone,
            country: body.location?.country // Optional von Client
        };

        // Event erstellen
        const event = await AnalyticsEvent.create({
            sessionId,
            visitorId,
            eventType,
            page,
            interaction,
            scrollDepth: scrollDepth || 0,
            timeOnPage: timeOnPage || 0,
            sessionDuration: sessionDuration || 0,
            device,
            location,
            utm,
            timestamp: new Date()
        });

        // Session aktualisieren oder erstellen
        if (eventType === 'session_start') {
            await AnalyticsSession.findOneAndUpdate(
                { sessionId },
                {
                    sessionId,
                    visitorId,
                    startTime: new Date(),
                    entryPage: page,
                    referrer: page?.referrer,
                    device,
                    location,
                    utm,
                    locale: page?.locale,
                    isActive: true
                },
                { upsert: true, new: true }
            );
        }
        else if (eventType === 'pageview') {
            await AnalyticsSession.findOneAndUpdate(
                { sessionId },
                {
                    $inc: { pageViews: 1 },
                    $push: {
                        pagesVisited: {
                            path: page?.path,
                            title: page?.title,
                            timeSpent: timeOnPage || 0,
                            visitedAt: new Date()
                        }
                    },
                    $set: {
                        isActive: true,
                        'device.theme': device.theme // Theme bei jedem Pageview aktualisieren
                    }
                }
            );
        }
        else if (eventType === 'theme_change') {
            // Theme-Änderung in Session speichern
            await AnalyticsSession.findOneAndUpdate(
                { sessionId },
                {
                    $set: { 'device.theme': device.theme }
                }
            );
        }
        else if (eventType === 'click') {
            await AnalyticsSession.findOneAndUpdate(
                { sessionId },
                { $inc: { totalClicks: 1 } }
            );
        }
        else if (eventType === 'scroll') {
            await AnalyticsSession.findOneAndUpdate(
                { sessionId },
                { $max: { maxScrollDepth: scrollDepth || 0 } }
            );
        }
        else if (eventType === 'session_end') {
            await AnalyticsSession.findOneAndUpdate(
                { sessionId },
                {
                    endTime: new Date(),
                    duration: sessionDuration || 0,
                    exitPage: page,
                    isActive: false
                }
            );
        }

        return NextResponse.json({
            success: true,
            eventId: event._id
        });

    } catch (error) {
        console.error('Analytics tracking error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to track event' },
            { status: 500 }
        );
    }
}
