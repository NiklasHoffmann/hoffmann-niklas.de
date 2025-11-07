import mongoose from 'mongoose';

const AnalyticsEventSchema = new mongoose.Schema({
    // Session Tracking
    sessionId: {
        type: String,
        required: true,
        index: true
    },

    // Visitor Info
    visitorId: {
        type: String,
        required: true,
        index: true
    },

    // Event Type
    eventType: {
        type: String,
        enum: ['pageview', 'click', 'scroll', 'session_start', 'session_end', 'exit', 'theme_change'],
        required: true,
        index: true
    },

    // Page Info
    page: {
        path: String,
        title: String,
        referrer: String,
        locale: String // 'de' or 'en'
    },

    // Click/Interaction Data
    interaction: {
        element: String, // z.B. 'button', 'link', 'nav-item'
        elementId: String,
        elementText: String,
        targetUrl: String
    },

    // Scroll Depth
    scrollDepth: {
        type: Number, // Prozent (0-100)
        default: 0
    },

    // Time Tracking
    timeOnPage: {
        type: Number, // Sekunden
        default: 0
    },

    sessionDuration: {
        type: Number, // Sekunden (nur bei session_end)
        default: 0
    },

    // Device Info
    device: {
        userAgent: String,
        deviceType: {
            type: String,
            enum: ['mobile', 'tablet', 'desktop', 'unknown'],
            default: 'unknown'
        },
        browser: String,
        os: String,
        screenResolution: String,
        theme: String // 'light', 'dark', 'system'
    },

    // Location (optional - nur Land, kein IP-Tracking wegen DSGVO)
    location: {
        country: String,
        timezone: String
    },

    // UTM Parameters (Marketing)
    utm: {
        source: String,
        medium: String,
        campaign: String,
        term: String,
        content: String
    },

    // Timestamp
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound Indexes für Performance
AnalyticsEventSchema.index({ timestamp: -1, eventType: 1 });
AnalyticsEventSchema.index({ sessionId: 1, timestamp: 1 });
AnalyticsEventSchema.index({ visitorId: 1, timestamp: -1 });

// Session Schema (zusammengefasste Sessions)
const AnalyticsSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    visitorId: {
        type: String,
        required: true,
        index: true
    },

    // Session Info
    startTime: {
        type: Date,
        required: true,
        index: true
    },

    endTime: Date,

    duration: {
        type: Number, // Sekunden
        default: 0
    },

    // Page Views
    pageViews: {
        type: Number,
        default: 0
    },

    pagesVisited: [{
        path: String,
        title: String,
        timeSpent: Number, // Sekunden
        visitedAt: Date
    }],

    // Interactions
    totalClicks: {
        type: Number,
        default: 0
    },

    maxScrollDepth: {
        type: Number,
        default: 0
    },

    // Entry & Exit
    entryPage: {
        path: String,
        title: String
    },

    exitPage: {
        path: String,
        title: String
    },

    referrer: String,

    // Device
    device: {
        deviceType: String,
        browser: String,
        os: String,
        theme: String // 'light', 'dark', 'system'
    },

    // Location
    location: {
        country: String,
        timezone: String
    },

    // UTM
    utm: {
        source: String,
        medium: String,
        campaign: String
    },

    // Locale
    locale: String,

    // Status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
AnalyticsSessionSchema.index({ startTime: -1 });
AnalyticsSessionSchema.index({ visitorId: 1, startTime: -1 });

export const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
export const AnalyticsSession = mongoose.models.AnalyticsSession || mongoose.model('AnalyticsSession', AnalyticsSessionSchema);
