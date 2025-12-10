'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/icons/LocalIcon';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        messagesToday: 0,
        activeNow: 0,
        avgResponseTime: '-'
    });
    const isDark = theme === 'dark';

    useEffect(() => {
        setMounted(true);
        checkAuth();
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
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
            fetchStats();

            const interval = setInterval(fetchStats, 30000);
            return () => clearInterval(interval);
        }
    }, [isChecking]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/chat/stats');
            const data = await response.json();

            if (data.success && data.data) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const adminModules = [
        {
            title: 'Chat Management',
            description: 'Verwalte Chat-Sessions, beantworte Nachrichten und überwache Konversationen.',
            icon: 'mdi:chat-processing',
            href: '/admin/chat',
            color: '#3b82f6',
            stats: { label: 'Active Chats', value: stats.activeNow }
        },
        {
            title: 'Contact Messages',
            description: 'Zeige und verwalte Kontaktanfragen von der Website.',
            icon: 'mdi:email-outline',
            href: '/admin/contacts',
            color: '#10b981',
            stats: { label: 'Unread', value: '-' }
        },
        {
            title: 'Analytics',
            description: 'Statistiken und Insights über Website-Besucher und Interaktionen.',
            icon: 'mdi:chart-line',
            href: '/admin/analytics',
            color: '#f59e0b',
            stats: { label: 'Today', value: '-' }
        },
        {
            title: 'Settings',
            description: 'Konfiguriere Website-Einstellungen, Benachrichtigungen und Integrationen.',
            icon: 'mdi:cog',
            href: '/admin/settings',
            color: '#6366f1',
            stats: { label: 'Status', value: 'OK' }
        }
    ];

    if (!mounted || isChecking) {
        return null;
    }

    return (
        <div
            className="min-h-[400px]"
            style={{ backgroundColor: isDark ? '#090909' : '#f9fafb' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <Icon icon="mdi:shield-account" className="w-10 h-10 text-accent" />
                            <h1
                                className="text-4xl font-bold"
                                style={{ color: isDark ? '#ffffff' : '#111827' }}
                            >
                                Admin Dashboard
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 hover:bg-red-500/10 transition-all"
                            style={{
                                borderColor: isDark ? '#262626' : '#e5e7eb',
                                color: isDark ? '#ef4444' : '#dc2626'
                            }}
                        >
                            <Icon icon="mdi:logout" className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                    <p
                        className="text-lg"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                    >
                        Willkommen zurück! Verwalte deine Website und Kommunikation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div
                        className="p-4 rounded-xl border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                                >
                                    Total Sessions
                                </p>
                                <p
                                    className="text-3xl font-bold mt-1"
                                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                                >
                                    {stats.totalSessions}
                                </p>
                            </div>
                            <Icon icon="mdi:account-group" className="w-12 h-12 opacity-30" style={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />
                        </div>
                    </div>

                    <div
                        className="p-4 rounded-xl border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                                >
                                    Messages Today
                                </p>
                                <p
                                    className="text-3xl font-bold mt-1"
                                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                                >
                                    {stats.messagesToday}
                                </p>
                            </div>
                            <Icon icon="mdi:message-text" className="w-12 h-12 opacity-30" style={{ color: isDark ? '#34d399' : '#10b981' }} />
                        </div>
                    </div>

                    <div
                        className="p-4 rounded-xl border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                                >
                                    Active Now
                                </p>
                                <p
                                    className="text-3xl font-bold mt-1"
                                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                                >
                                    {stats.activeNow}
                                </p>
                            </div>
                            <Icon icon="mdi:circle" className="w-12 h-12" style={{ color: isDark ? '#34d399' : '#10b981' }} />
                        </div>
                    </div>

                    <div
                        className="p-4 rounded-xl border-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#262626' : '#e5e7eb'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                                >
                                    Response Time
                                </p>
                                <p
                                    className="text-3xl font-bold mt-1"
                                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                                >
                                    {stats.avgResponseTime}
                                </p>
                            </div>
                            <Icon icon="mdi:clock-fast" className="w-12 h-12 opacity-30" style={{ color: isDark ? '#fbbf24' : '#f59e0b' }} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminModules.map((module) => (
                        <Link
                            key={module.href}
                            href={module.href}
                            className="group"
                        >
                            <div
                                className="p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                                style={{
                                    backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                                    borderColor: isDark ? '#262626' : '#e5e7eb'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = module.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = isDark ? '#262626' : '#e5e7eb';
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="p-4 rounded-xl"
                                        style={{ backgroundColor: `${module.color}20` }}
                                    >
                                        <Icon
                                            icon={module.icon}
                                            className="w-8 h-8"
                                            style={{ color: module.color }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3
                                            className="text-xl font-bold mb-2 group-hover:text-accent transition-colors"
                                            style={{ color: isDark ? '#ffffff' : '#111827' }}
                                        >
                                            {module.title}
                                        </h3>
                                        <p
                                            className="text-sm mb-4"
                                            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                                        >
                                            {module.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-xs font-medium"
                                                    style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                                                >
                                                    {module.stats.label}:
                                                </span>
                                                <span
                                                    className="text-sm font-bold"
                                                    style={{ color: module.color }}
                                                >
                                                    {module.stats.value}
                                                </span>
                                            </div>
                                            <Icon
                                                icon="mdi:arrow-right"
                                                className="w-5 h-5 transition-transform group-hover:translate-x-2"
                                                style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p
                        className="text-sm"
                        style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
                    >
                        Last updated: {new Date().toLocaleString('de-DE')}
                    </p>
                </div>
            </div>
        </div>
    );
}
