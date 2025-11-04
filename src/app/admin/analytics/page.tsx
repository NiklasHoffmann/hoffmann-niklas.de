'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, MessageSquare, Users, Clock, Calendar, Activity } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalSessions: number;
    totalMessages: number;
    totalUsers: number;
    avgResponseTime: string;
  };
  trends: {
    sessionsToday: number;
    sessionsYesterday: number;
    messagesThisWeek: number;
    messagesLastWeek: number;
  };
  timeStats: {
    avgSessionDuration: string;
    peakHours: string;
    busyDays: string[];
  };
  messageStats: {
    userMessages: number;
    adminMessages: number;
    avgMessagesPerSession: number;
  };
  recentActivity: Array<{
    date: string;
    sessions: number;
    messages: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/analytics?range=${timeRange}`);
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

  const calculateTrend = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: 100, isPositive: current > 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  };

  if (loading) {
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

  const sessionsTrend = calculateTrend(analytics.trends.sessionsToday, analytics.trends.sessionsYesterday);
  const messagesTrend = calculateTrend(analytics.trends.messagesThisWeek, analytics.trends.messagesLastWeek);

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
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed insights into your chat system performance
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                sessionsTrend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 ${!sessionsTrend.isPositive && 'rotate-180'}`} />
                {sessionsTrend.value}%
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {analytics.overview.totalSessions}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Sessions</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {analytics.trends.sessionsToday} today vs {analytics.trends.sessionsYesterday} yesterday
            </p>
          </div>

          {/* Total Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                messagesTrend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 ${!messagesTrend.isPositive && 'rotate-180'}`} />
                {messagesTrend.value}%
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {analytics.overview.totalMessages}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Messages</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {analytics.trends.messagesThisWeek} this week vs {analytics.trends.messagesLastWeek} last week
            </p>
          </div>

          {/* Unique Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {analytics.overview.totalUsers}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Unique Users</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              All-time unique visitors
            </p>
          </div>

          {/* Avg Response Time */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {analytics.overview.avgResponseTime}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Response Time</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Admin reply speed
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Message Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Message Distribution
            </h3>
            
            <div className="space-y-4">
              {/* User Messages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">User Messages</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.messageStats.userMessages}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(analytics.messageStats.userMessages / analytics.overview.totalMessages) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Admin Messages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Admin Messages</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analytics.messageStats.adminMessages}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(analytics.messageStats.adminMessages / analytics.overview.totalMessages) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Avg Messages per Session */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Messages / Session</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {analytics.messageStats.avgMessagesPerSession.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Statistics
            </h3>
            
            <div className="space-y-6">
              {/* Avg Session Duration */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.timeStats.avgSessionDuration}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Peak Hours */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peak Hours</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.timeStats.peakHours}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>

              {/* Busiest Days */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Busiest Days</p>
                <div className="flex flex-wrap gap-2">
                  {analytics.timeStats.busyDays.map((day) => (
                    <span 
                      key={day}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => {
              const maxSessions = Math.max(...analytics.recentActivity.map(a => a.sessions));
              const maxMessages = Math.max(...analytics.recentActivity.map(a => a.messages));
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {new Date(activity.date).toLocaleDateString('de-DE', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-blue-600 dark:text-blue-400">
                        {activity.sessions} sessions
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {activity.messages} messages
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
                    
                    {/* Messages Bar */}
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(activity.messages / maxMessages) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {analytics.recentActivity.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No activity data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
