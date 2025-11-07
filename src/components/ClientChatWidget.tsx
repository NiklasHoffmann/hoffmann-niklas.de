'use client';

import dynamic from 'next/dynamic';

// Lazy load ChatWidget (includes socket.io-client)
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
    ssr: false, // Chat widget doesn't need SSR
    loading: () => null, // No loading state needed
});

export default function ClientChatWidget() {
    return <ChatWidget />;
}
