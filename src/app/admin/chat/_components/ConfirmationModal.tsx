'use client';

import { Icon } from '@/components/icons/LocalIcon';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    confirmButtonClass?: string;
    icon: string;
    iconBgClass: string;
    isDark: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    confirmButtonClass = 'bg-red-600 hover:bg-red-700',
    icon,
    iconBgClass,
    isDark
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={onClose}
        >
            <div
                className="rounded-2xl shadow-2xl max-w-md w-full p-6"
                style={{ backgroundColor: isDark ? '#0d0d0d' : '#ffffff' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-full ${iconBgClass}`}>
                        <Icon icon={icon} className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2" style={{ color: isDark ? '#ffffff' : '#111827' }}>
                            {title}
                        </h3>
                        <p className="text-sm" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                            {message}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{
                            backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6',
                            color: isDark ? '#d1d5db' : '#4b5563'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white transition-colors ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
