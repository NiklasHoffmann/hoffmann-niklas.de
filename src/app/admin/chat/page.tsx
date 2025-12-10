'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/icons/LocalIcon';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useAdminChat } from '@/hooks/useAdminChat';
import { SessionList } from './_components/SessionList';
import { SessionStats } from './_components/SessionStats';
import { ConnectionStatus } from './_components/ConnectionStatus';
import { ChatHeader } from './_components/ChatHeader';
import { MessageList } from './_components/MessageList';
import { MessageInput } from './_components/MessageInput';
import { ConfirmationModal } from './_components/ConfirmationModal';

export default function AdminChatPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const isDark = theme === 'dark';

    // Confirmation states
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [confirmBlock, setConfirmBlock] = useState<string | null>(null);
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

    // Use admin chat hook
    const {
        sessions,
        loading,
        socket,
        isConnected,
        selectedSessionId,
        setSelectedSessionId,
        messages,
        inputMessage,
        isTyping,
        loadingMessages,
        sendMessage,
        handleInputChange,
        handleInputFocus,
        deleteSession,
        blockUser,
    } = useAdminChat();

    // Auth check
    useEffect(() => {
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

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Get selected session
    const selectedSession = sessions?.find(s => s.sessionId === selectedSessionId);

    // Delete confirmation handler
    const handleConfirmDelete = () => {
        if (confirmDelete) {
            deleteSession(confirmDelete);
            setConfirmDelete(null);
        }
    };

    // Block confirmation handler
    const handleConfirmBlock = () => {
        if (confirmBlock) {
            blockUser(confirmBlock);
            setConfirmBlock(null);
        }
    };

    // Delete all sessions handler
    const handleDeleteAllSessions = async () => {
        try {
            const response = await fetch('/api/chat/sessions', {
                method: 'DELETE',
            });

            if (response.ok) {
                // Optionally reload sessions or clear local state
                window.location.reload();
            } else {
                console.error('Failed to delete all sessions');
            }
        } catch (error) {
            console.error('Error deleting all sessions:', error);
        } finally {
            setConfirmDeleteAll(false);
        }
    };

    // Prevent flash during hydration
    if (!mounted || isChecking) {
        return null;
    }

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: isDark ? '#090909' : '#ffffff' }}
            >
                <div className="text-center space-y-4">
                    <Icon icon="mdi:loading" className="w-12 h-12 animate-spin text-accent mx-auto" />
                    <p style={{ color: isDark ? '#ffffff' : '#111827' }}>Loading chat sessions...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: isDark ? '#090909' : '#f9fafb' }}
        >
            <div className="h-screen flex">
                {/* LEFT PANEL - Sessions List */}
                <div
                    className={`w-full md:w-96 border-r flex flex-col ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}
                    style={{ borderColor: isDark ? '#262626' : '#d1d5db' }}
                >
                    {/* Header */}
                    <div
                        className="p-4 border-b"
                        style={{ borderColor: isDark ? '#262626' : '#d1d5db' }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    title="Zurück zum Dashboard"
                                >
                                    <Icon icon="mdi:arrow-left" className="w-5 h-5 text-accent" />
                                </button>
                                <h1
                                    className="text-2xl font-bold flex items-center gap-2"
                                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                                >
                                    <Icon icon="mdi:chat-processing" className="text-accent" />
                                    Admin Chat
                                </h1>
                            </div>

                            <div className="flex items-center gap-2">
                                {sessions.length > 0 && (
                                    <button
                                        onClick={() => setConfirmDeleteAll(true)}
                                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                        title="Alle Chats löschen"
                                    >
                                        <Icon icon="mdi:delete-sweep" className="w-5 h-5 text-red-600" />
                                    </button>
                                )}
                                <ConnectionStatus isConnected={isConnected} isDark={isDark} />
                            </div>
                        </div>

                        <SessionStats sessions={sessions} isDark={isDark} />
                    </div>

                    {/* Sessions List */}
                    <div className="flex-1 overflow-y-auto">
                        <SessionList
                            sessions={sessions}
                            selectedSessionId={selectedSessionId}
                            onSelectSession={setSelectedSessionId}
                            isDark={isDark}
                        />
                    </div>
                </div>

                {/* RIGHT PANEL - Chat View */}
                <div className={`flex-1 flex flex-col ${selectedSessionId ? 'flex' : 'hidden md:flex'}`}>
                    {!selectedSessionId ? (
                        /* No session selected */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Icon icon="mdi:chat-outline" className="w-20 h-20 mx-auto text-accent/40 mb-4" />
                                <h3
                                    className="text-xl font-semibold mb-2"
                                    style={{ color: isDark ? '#ffffff' : '#111827' }}
                                >
                                    Select a chat to start
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                                >
                                    Choose a conversation from the list
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Chat view */
                        <>
                            <ChatHeader
                                session={selectedSession}
                                onBack={() => setSelectedSessionId(null)}
                                onDelete={() => setConfirmDelete(selectedSessionId)}
                                onBlock={() => setConfirmBlock(selectedSessionId)}
                                isDark={isDark}
                                isMobile={true}
                            />

                            <MessageList
                                messages={messages}
                                isTyping={isTyping}
                                isLoading={loadingMessages}
                                isDark={isDark}
                                onAreaClick={handleInputFocus}
                            />

                            <MessageInput
                                value={inputMessage}
                                onChange={handleInputChange}
                                onSubmit={sendMessage}
                                onFocus={handleInputFocus}
                                isConnected={isConnected}
                                isDark={isDark}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Chat?"
                message="This will permanently delete this chat session and all messages. This action cannot be undone."
                confirmText="Delete"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
                icon="mdi:delete-alert"
                iconBgClass="bg-red-100 dark:bg-red-900/20 text-red-600"
                isDark={isDark}
            />

            {/* Block Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!confirmBlock}
                onClose={() => setConfirmBlock(null)}
                onConfirm={handleConfirmBlock}
                title="Block User?"
                message="This user will be blocked from creating new chat sessions. Existing messages will remain visible."
                confirmText="Block User"
                confirmButtonClass="bg-yellow-600 hover:bg-yellow-700"
                icon="mdi:block-helper"
                iconBgClass="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600"
                isDark={isDark}
            />

            {/* Delete All Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmDeleteAll}
                onClose={() => setConfirmDeleteAll(false)}
                onConfirm={handleDeleteAllSessions}
                title="Alle Chats löschen?"
                message="Dies wird ALLE Chat-Sessions und Nachrichten unwiderruflich löschen. Diese Aktion kann nicht rückgängig gemacht werden!"
                confirmText="Alle löschen"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
                icon="mdi:delete-sweep"
                iconBgClass="bg-red-100 dark:bg-red-900/20 text-red-600"
                isDark={isDark}
            />
        </div>
    );
}
