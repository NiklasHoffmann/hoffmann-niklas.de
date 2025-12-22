'use client';

import { useChat } from '@/contexts/ChatContext';
import ChatWindow from './ChatWindow';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/LocalIcon';
import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

// Global cache for theme to prevent flash on language change
let cachedIsDark = true;
let hasInitializedTheme = false;

export default function ChatWidget() {
    const { isOpen, isMinimized, unreadCount, openChat, closeChat, toggleMinimize } = useChat();
    const { theme } = useTheme();
    const { showActive } = useInteractiveMode();
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(() => cachedIsDark);
    const [isMobile, setIsMobile] = useState(false);
    const [viewportHeight, setViewportHeight] = useState<number | null>(null);
    const [viewportOffsetTop, setViewportOffsetTop] = useState(0);
    const pathname = usePathname();
    const t = useTranslations('chat');

    // Green color for interactive mode (online indicator style)
    const greenColor = '#22c55e';

    useEffect(() => {
        setMounted(true);
        // Check if mobile on mount
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Track visual viewport height on mobile for keyboard handling
    useEffect(() => {
        if (!isMobile || !isOpen || isMinimized) return;
        if (typeof window === 'undefined' || !window.visualViewport) return;

        const viewport = window.visualViewport;

        const updateViewport = () => {
            setViewportHeight(viewport.height);
            setViewportOffsetTop(viewport.offsetTop);
        };

        // Set initial values
        updateViewport();

        viewport.addEventListener('resize', updateViewport);
        viewport.addEventListener('scroll', updateViewport);

        return () => {
            viewport.removeEventListener('resize', updateViewport);
            viewport.removeEventListener('scroll', updateViewport);
            setViewportHeight(null);
            setViewportOffsetTop(0);
        };
    }, [isMobile, isOpen, isMinimized]);

    useEffect(() => {
        if (mounted && theme) {
            const newIsDark = theme === 'dark';
            cachedIsDark = newIsDark;
            hasInitializedTheme = true;
            setIsDark(newIsDark);
        }
    }, [mounted, theme]);

    // Lock body scroll when chat is open on mobile
    useEffect(() => {
        if (isOpen && !isMinimized && isMobile) {
            // Store current scroll position
            const scrollY = window.scrollY;

            // Lock body completely
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';

            return () => {
                // Use requestAnimationFrame to batch DOM operations and avoid scroll jank
                requestAnimationFrame(() => {
                    // Restore body styles
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.left = '';
                    document.body.style.right = '';
                    document.body.style.overflow = '';
                    document.body.style.touchAction = '';

                    // Restore scroll position in next frame to avoid layout thrashing
                    requestAnimationFrame(() => {
                        window.scrollTo(0, scrollY);
                    });
                });
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen, isMinimized, isMobile]);

    // Hide chat widget on admin pages
    if (pathname?.includes('/admin')) {
        return null;
    }

    // Nicht anzeigen wenn komplett geschlossen
    if (!isOpen) {
        return (
            <button
                onClick={openChat}
                className="chat-widget-button fixed bottom-6 right-6 z-50 group"
                aria-label="Open chat"
                aria-expanded="false"
                aria-haspopup="dialog"
            >
                {/* Floating Chat Button */}
                <div className="relative">
                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full gpu-pulse shadow-lg">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                    )}

                    {/* Main Button */}
                    <div
                        className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl border-2 group-hover:scale-105"
                        style={{
                            backgroundColor: isDark ? '#090909' : '#ffffff',
                            borderColor: showActive ? greenColor : (isDark ? '#1a1a1a' : '#d1d5db'),
                            boxShadow: showActive
                                ? `0 0 12px 2px ${greenColor}80, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
                                : undefined,
                            transition: 'transform 0.3s ease-in-out, border-color 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
                        }}
                    >
                        {/* Icon */}
                        <Icon
                            icon="mdi:chat-outline"
                            className="w-8 h-8 relative z-10 text-foreground transition-colors"

                        />
                    </div>
                </div>
            </button>
        );
    }

    // Chat ist offen
    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isMinimized ? (
                // Minimized State - Theme-aware Header
                <div
                    className="w-80 border-2 rounded-lg shadow-2xl overflow-hidden"
                    style={{
                        backgroundColor: isDark ? '#090909' : '#ffffff',
                        borderColor: isDark ? '#1a1a1a' : '#d1d5db',
                        transition: 'border-color 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out'
                    }}
                >
                    <div
                        className="flex items-center justify-between p-4 cursor-pointer border-b-2"
                        style={{
                            backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                            borderColor: isDark ? '#1a1a1a' : '#d1d5db',
                            transition: 'border-color 700ms ease-in-out, background-color 700ms ease-in-out'
                        }}
                    >
                        <button
                            onClick={toggleMinimize}
                            className="flex items-center gap-2 flex-1"
                        >
                            <Icon
                                icon="mdi:chat-outline"
                                className="w-5 h-5 text-foreground transition-colors"

                            />
                            <span className="font-medium text-foreground transition-colors">
                                Chat Support
                            </span>
                            {unreadCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-md">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="flex items-center gap-2" style={{ transition: 'none' }}>
                            <button
                                onClick={toggleMinimize}
                                className="p-1 rounded text-foreground transition-colors"
                                aria-label="Maximize"
                            >
                                <Icon icon="mdi:window-maximize" className="w-5 h-5" />
                            </button>
                            <button
                                onClick={closeChat}
                                className="p-1 rounded text-foreground transition-colors"
                                aria-label="Close"
                            >
                                <Icon icon="mdi:close" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // Maximized State - Full Chat Window (Fullscreen on Mobile)
                <>
                    {/* Fullscreen backdrop on mobile to prevent any background interaction */}
                    {isMobile && (
                        <div
                            className="fixed inset-0 z-40"
                            style={{
                                backgroundColor: isDark ? '#090909' : '#ffffff',
                                touchAction: 'none',
                            }}
                            onTouchMove={(e) => e.preventDefault()}
                        />
                    )}
                    <div
                        className={isMobile
                            ? "fixed inset-x-0 z-50 flex flex-col"
                            : "w-80 sm:w-96 h-[600px] max-h-[80vh] border-2 rounded-lg shadow-2xl overflow-hidden flex flex-col"
                        }
                        style={{
                            backgroundColor: isDark ? '#090909' : '#ffffff',
                            borderColor: isMobile ? 'transparent' : (isDark ? '#1a1a1a' : '#d1d5db'),
                            transition: 'border-color 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out',
                            // Position at top of visual viewport and use its height
                            top: isMobile ? `${viewportOffsetTop}px` : undefined,
                            height: isMobile ? (viewportHeight ? `${viewportHeight}px` : '100vh') : undefined,
                            // Prevent the container itself from scrolling
                            overflow: 'hidden',
                            touchAction: isMobile ? 'none' : undefined,
                        }}
                        onTouchMove={(e) => {
                            // Only allow touch move if it originates from a scrollable child
                            const target = e.target as HTMLElement;
                            const isScrollableArea = target.closest('[data-scrollable="true"]');
                            if (isMobile && !isScrollableArea) {
                                e.preventDefault();
                            }
                        }}
                    >
                        {/* Header - Theme-aware */}
                        <div
                            className={`flex items-center justify-between shadow-md border-b-2 flex-shrink-0 ${isMobile ? 'p-3 pt-safe' : 'p-4'}`}
                            style={{
                                backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
                                borderColor: isDark ? '#1a1a1a' : '#d1d5db',
                                transition: 'border-color 700ms ease-in-out, background-color 700ms ease-in-out, box-shadow 700ms ease-in-out',
                                // Safe area for notch
                                paddingTop: isMobile ? 'max(0.75rem, env(safe-area-inset-top))' : undefined
                            }}
                        >
                            <div className="flex items-center gap-3" style={{ transition: 'none' }}>
                                <div className="relative">
                                    <Icon
                                        icon="mdi:chat-outline"
                                        className="w-6 h-6 text-foreground transition-colors"

                                    />
                                    {/* Online Indicator */}
                                    <div
                                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2"
                                        style={{
                                            borderColor: isDark ? '#090909' : '#ffffff',
                                            transition: 'border-color 700ms ease-in-out'
                                        }}
                                    ></div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground transition-colors">
                                        {t('chatSupport')}
                                    </h3>
                                    <p className="text-xs text-muted-foreground transition-colors">
                                        {t('replyInstantly')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2" style={{ transition: 'none' }}>
                                {/* Hide minimize button on mobile */}
                                {!isMobile && (
                                    <button
                                        onClick={toggleMinimize}
                                        className="p-1.5 rounded text-foreground transition-colors"
                                        aria-label="Minimize"
                                    >
                                        <Icon icon="mdi:window-minimize" className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={closeChat}
                                    className="p-1.5 rounded text-foreground transition-colors"
                                    aria-label="Close"
                                >
                                    <Icon icon="mdi:close" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Content */}
                        <ChatWindow />
                    </div>
                </>
            )}
        </div>
    );
}
