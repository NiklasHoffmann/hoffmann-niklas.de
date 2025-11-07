'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
    ArrowLeft, TrendingUp, Users, Clock, Eye, MousePointerClick,
    Monitor, Smartphone, Globe, BarChart3, Activity, Tablet, Moon, Sun
} from 'lucide-react';

interface AnalyticsData {
    overview: {
        totalSessions: number;
        totalPageViews: number;
        uniqueVisitors: number;
        avgSessionDuration: number; // in seconds
        bounceRate: number; // percentage
        avgPageViewsPerSession: number;
    };
    deviceStats: {
        mobile: number;
        tablet: number;
        desktop: number;
        unknown: number;
    };
    browserStats: Array<{
        browser: string;
        count: number;
    }>;
    themeStats: Array<{
        theme: string;
        count: number;
    }>;
    trafficSources: Array<{
        source: string;
        count: number;
    }>;
    hourlyActivity: Array<{
        hour: number;
        pageViews: number;
    }>;
    dailyActivity: Array<{
        date: string;
        sessions: number;
        pageViews: number;
        visitors: number;
    }>;
    topClicks: Array<{
        element: string;
        elementText: string;
        count: number;
    }>;
}

export default function AnalyticsPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isChecking, setIsChecking] = useState(true);
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

    useEffect(() => {
        setMounted(true);
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();

            if (!data.authenticated) {
                router.push('/admin/login');
                return;
            }

            setIsChecking(false);
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/admin/login');
        }
    };

    useEffect(() => {
        if (!isChecking) {
            loadAnalytics();
        }
    }, [timeRange, isChecking]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/analytics/stats?range=${timeRange}`);
            const data = await response.json();

            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number): string => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}m ${secs}s`;
    };

    if (!mounted || isChecking || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-96">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">Failed to load analytics data</p>
                    </div>
                </div>
            </div>
        );
    }

    const totalDevices = analytics.deviceStats.mobile + analytics.deviceStats.tablet +
        analytics.deviceStats.desktop + analytics.deviceStats.unknown;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Website Analytics
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Visitor insights and behavior tracking
                            </p>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
                            {(['24h', '7d', '30d', '90d'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === range
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7 Days' :
                                        range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Total Sessions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {analytics.overview.totalSessions.toLocaleString()}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Total Sessions</p>
                    </div>

                    {/* Total Page Views */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {analytics.overview.totalPageViews.toLocaleString()}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Page Views</p>
                    </div>

                    {/* Unique Visitors */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {analytics.overview.uniqueVisitors.toLocaleString()}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Unique Visitors</p>
                    </div>

                    {/* Avg Session Duration */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {formatDuration(analytics.overview.avgSessionDuration)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Session Duration</p>
                    </div>

                    {/* Bounce Rate */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {analytics.overview.bounceRate.toFixed(1)}%
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Bounce Rate</p>
                    </div>

                    {/* Avg Pages per Session */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {analytics.overview.avgPageViewsPerSession.toFixed(1)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Pages / Session</p>
                    </div>
                </div>

                {/* Device Statistics - Full Width */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Monitor className="w-5 h-5" />
                        Device Breakdown
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Mobile */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Mobile</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {analytics.deviceStats.mobile} ({totalDevices > 0 ? ((analytics.deviceStats.mobile / totalDevices) * 100).toFixed(1) : 0}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${totalDevices > 0 ? (analytics.deviceStats.mobile / totalDevices) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Tablet */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Tablet className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Tablet</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {analytics.deviceStats.tablet} ({totalDevices > 0 ? ((analytics.deviceStats.tablet / totalDevices) * 100).toFixed(1) : 0}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${totalDevices > 0 ? (analytics.deviceStats.tablet / totalDevices) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Desktop */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Desktop</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {analytics.deviceStats.desktop} ({totalDevices > 0 ? ((analytics.deviceStats.desktop / totalDevices) * 100).toFixed(1) : 0}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${totalDevices > 0 ? (analytics.deviceStats.desktop / totalDevices) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Browsers, Theme & Traffic Sources */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Browser Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Top Browsers
                        </h3>

                        <div className="space-y-3">
                            {analytics.browserStats.slice(0, 5).map((browser, index) => {
                                const total = analytics.browserStats.reduce((sum, b) => sum + b.count, 0);
                                const percentage = total > 0 ? (browser.count / total) * 100 : 0;

                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{browser.browser}</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {browser.count} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}

                            {analytics.browserStats.length === 0 && (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No browser data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Theme Preference */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Sun className="w-5 h-5" />
                            Theme Preference
                        </h3>

                        <div className="space-y-3">
                            {analytics.themeStats.map((theme, index) => {
                                const total = analytics.themeStats.reduce((sum, t) => sum + t.count, 0);
                                const percentage = total > 0 ? (theme.count / total) * 100 : 0;
                                const themeColor = theme.theme === 'dark' ? 'bg-gray-900 dark:bg-gray-600' :
                                    theme.theme === 'light' ? 'bg-yellow-500' : 'bg-purple-600';

                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {theme.theme === 'dark' ? <Moon className="w-4 h-4" /> :
                                                    theme.theme === 'light' ? <Sun className="w-4 h-4" /> :
                                                        <Monitor className="w-4 h-4" />}
                                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                    {theme.theme || 'Unknown'}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {theme.count} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`${themeColor} h-2 rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}

                            {analytics.themeStats.length === 0 && (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No theme data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Traffic Sources */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Traffic Sources
                        </h3>

                        <div className="space-y-3">
                            {analytics.trafficSources.map((source, index) => {
                                const total = analytics.trafficSources.reduce((sum, s) => sum + s.count, 0);
                                const percentage = total > 0 ? (source.count / total) * 100 : 0;

                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{source.source}</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {source.count} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}

                            {analytics.trafficSources.length === 0 && (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No traffic source data yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Clicks */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MousePointerClick className="w-5 h-5" />
                        Top Clicks
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analytics.topClicks.slice(0, 9).map((click, index) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                            {click.element}
                                        </p>
                                        {click.elementText && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                {click.elementText}
                                            </p>
                                        )}
                                    </div>
                                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                                        {click.count}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {analytics.topClicks.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                                No click data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily Activity Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Daily Activity
                    </h3>

                    <div className="space-y-4">
                        {analytics.dailyActivity.map((activity, index) => {
                            const maxSessions = Math.max(...analytics.dailyActivity.map(a => a.sessions), 1);
                            const maxPageViews = Math.max(...analytics.dailyActivity.map(a => a.pageViews), 1);

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[100px]">
                                            {new Date(activity.date).toLocaleDateString('de-DE', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                {activity.sessions} sessions
                                            </span>
                                            <span className="text-green-600 dark:text-green-400">
                                                {activity.pageViews} views
                                            </span>
                                            <span className="text-purple-600 dark:text-purple-400">
                                                {activity.visitors} visitors
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Sessions Bar */}
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${(activity.sessions / maxSessions) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Page Views Bar */}
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${(activity.pageViews / maxPageViews) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {analytics.dailyActivity.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No activity data available yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
