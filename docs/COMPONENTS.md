# 📦 Component Documentation

Vollständige Dokumentation aller React-Komponenten mit Usage-Examples und Props-Beschreibungen.

## Inhaltsverzeichnis
- [Page Components](#page-components)
- [Admin Components](#admin-components)
- [User-Facing Components](#user-facing-components)
- [UI Components](#ui-components)
- [Custom Hooks](#custom-hooks)

---

## Page Components

### `/app/[locale]/page.tsx`

Haupt-Portfolio-Seite mit allen Sektionen.

**Props:** None (Server Component mit locale-Params)

**Features:**
- Server-Side Rendering
- Internationalisierung (DE/EN)
- One-Page-Design mit Scroll-Snap

**Sections:**
```tsx
<HeroSection />
<AboutSection />
<ServicesSection />
<PortfolioSection />
<YouTubeSlider />
<ContactSection />
<Footer />
```

**Verwendung:**
```tsx
// Automatisch gerendert via Next.js App Router
// URL: /de oder /en
```

---

### `/app/admin/page.tsx`

Admin-Dashboard mit Statistiken und Navigation.

**Props:** None

**Features:**
- Real-time Statistiken
- Auto-Refresh alle 30s
- 4 Quick-Stats Cards
- 4 Navigation-Module

**Stats-Karten:**
1. **Total Sessions** - Gesamtanzahl Chat-Sessions
2. **Messages Today** - Nachrichten seit 00:00 Uhr
3. **Active Now** - Sessions aktiv in letzten 30min
4. **Response Time** - Durchschnittliche Antwortzeit

**Module-Navigation:**
1. **Chat Management** → `/admin/chat`
2. **Contact Messages** (Coming Soon)
3. **Analytics** (Coming Soon)
4. **Settings** (Coming Soon)

**Code-Beispiel:**
```tsx
'use client';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const response = await fetch('/api/chat/stats');
      const data = await response.json();
      if (data.success) setStats(data.data);
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stats Cards */}
    </div>
  );
}
```

---

### `/app/admin/chat/page.tsx`

Admin-Chat-Management-Interface.

**Props:** None

**Features:**
- Session-Liste mit Unread-Counts
- Real-time Message-Updates
- Typing Indicators
- Sound-Benachrichtigungen
- Delete/Block-Funktionen

**Verwendete Komponenten:**
```tsx
<SessionList />
<SessionStats />
<ConnectionStatus />
<ChatHeader />
<MessageList />
<MessageInput />
<ConfirmationModal />
```

**Custom Hook:**
```tsx
const {
  sessions,
  messages,
  selectedSession,
  isConnected,
  isTyping,
  selectSession,
  sendMessage,
  deleteSession,
  blockUser
} = useAdminChat();
```

---

## Admin Components

### `<SessionList />`

**Location:** `src/components/admin/SessionList.tsx`

Zeigt alle Chat-Sessions in einer scrollbaren Liste.

**Props:**
```typescript
interface SessionListProps {
  sessions: ChatSession[];
  selectedSession: ChatSession | null;
  onSelectSession: (session: ChatSession) => void;
}
```

**Features:**
- Sortierung nach `lastActivity` (neueste zuerst)
- Unread-Badge-Anzeige
- Hover-Effekte
- Active-State-Highlighting
- Responsive Design

**Usage:**
```tsx
<SessionList
  sessions={allSessions}
  selectedSession={currentSession}
  onSelectSession={(session) => setSelectedSession(session)}
/>
```

**UI-Elemente:**
- Avatar mit Initialen
- Name & Email
- Letzte Nachricht (truncated)
- Timestamp (relativ)
- Unread Count Badge

---

### `<SessionStats />`

**Location:** `src/components/admin/SessionStats.tsx`

Zeigt Session-Statistiken im Header.

**Props:**
```typescript
interface SessionStatsProps {
  totalSessions: number;
  activeSessions: number;
  unreadSessions: number;
}
```

**Features:**
- Kompakte Badge-Anzeige
- Farbcodierung (Grün/Gelb/Rot)
- Responsive Layout

**Usage:**
```tsx
<SessionStats
  totalSessions={42}
  activeSessions={5}
  unreadSessions={12}
/>
```

**Output:**
```
Total: 42 | Active: 5 | Unread: 12
```

---

### `<ConnectionStatus />`

**Location:** `src/components/admin/ConnectionStatus.tsx`

Zeigt Socket.io Verbindungsstatus.

**Props:**
```typescript
interface ConnectionStatusProps {
  isConnected: boolean;
}
```

**Features:**
- Animated Dot (pulsing when connected)
- Color-coded (Grün/Rot)
- Tooltip mit Details

**Usage:**
```tsx
<ConnectionStatus isConnected={socket.connected} />
```

**Varianten:**
- ✅ **Connected** - Grüner pulsierender Dot
- ❌ **Disconnected** - Roter statischer Dot

---

### `<ChatHeader />`

**Location:** `src/components/admin/ChatHeader.tsx`

Header für die Chat-Ansicht mit User-Info und Actions.

**Props:**
```typescript
interface ChatHeaderProps {
  session: ChatSession | null;
  onDelete: () => void;
  onBlock: () => void;
}
```

**Features:**
- User-Avatar & Name
- Status-Badge (Active/Blocked)
- Delete-Button
- Block/Unblock-Button

**Usage:**
```tsx
<ChatHeader
  session={selectedSession}
  onDelete={() => handleDeleteSession()}
  onBlock={() => handleBlockUser()}
/>
```

**Actions:**
- 🗑️ **Delete** - Löscht Session + Messages
- 🚫 **Block** - Blockiert User (toggleable)

---

### `<MessageList />`

**Location:** `src/components/admin/MessageList.tsx`

Zeigt alle Nachrichten einer Session.

**Props:**
```typescript
interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}
```

**Features:**
- Auto-Scroll zu neuesten Messages
- Unread-Divider ("Unread Messages")
- Typing-Indicator-Animation
- Sender-basiertes Styling (User/Admin)
- Timestamps

**Usage:**
```tsx
const messagesEndRef = useRef<HTMLDivElement>(null);

<MessageList
  messages={chatMessages}
  isTyping={userIsTyping}
  messagesEndRef={messagesEndRef}
/>
```

**Message-Typen:**
- **User-Message** - Links ausgerichtet, blaue Bubble
- **Admin-Message** - Rechts ausgerichtet, grüne Bubble

**Typing Indicator:**
```tsx
{isTyping && (
  <div className="flex gap-1">
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
  </div>
)}
```

---

### `<MessageInput />`

**Location:** `src/components/admin/MessageInput.tsx`

Input-Feld für Admin-Nachrichten mit Quick-Replies.

**Props:**
```typescript
interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}
```

**Features:**
- Textarea mit Auto-Resize
- Quick-Reply-Buttons (DE/EN)
- Typing-Detection (debounced)
- Enter-to-Send (Shift+Enter für neue Zeile)
- Character Counter (optional)

**Usage:**
```tsx
<MessageInput
  onSendMessage={(msg) => sendMessage(msg)}
  onTyping={(typing) => emitTypingEvent(typing)}
  disabled={!selectedSession}
/>
```

**Quick Replies:**
```typescript
// Deutsch
[
  "Danke für Ihre Nachricht!",
  "Ich schaue mir das an und melde mich.",
  "Könnten Sie mehr Details geben?"
]

// Englisch
[
  "Thanks for your message!",
  "I'll look into this and get back to you.",
  "Could you provide more details?"
]
```

**Typing-Detection:**
```typescript
const handleTyping = debounce(() => {
  onTyping(true);
  setTimeout(() => onTyping(false), 1000);
}, 500);
```

---

### `<ConfirmationModal />`

**Location:** `src/components/admin/ConfirmationModal.tsx`

Wiederverwendbare Bestätigungs-Dialog-Komponente.

**Props:**
```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}
```

**Features:**
- Backdrop mit Click-to-Close
- Keyboard-Support (ESC zum Schließen)
- Farbvarianten (danger/warning/info)
- Fokus-Management

**Usage:**
```tsx
<ConfirmationModal
  isOpen={showDeleteModal}
  title="Delete Session"
  message="Are you sure? This cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  onConfirm={() => deleteSession(sessionId)}
  onCancel={() => setShowDeleteModal(false)}
/>
```

**Varianten:**
- **danger** - Rot (Delete, Block)
- **warning** - Gelb (Wichtige Aktionen)
- **info** - Blau (Informationen)

---

## User-Facing Components

### `<ChatWidget />`

**Location:** `src/components/ChatWidget.tsx`

Floating Chat-Button mit Unread-Badge.

**Props:** None (verwendet ChatContext)

**Features:**
- Fixed Position (bottom-right)
- Unread-Badge-Anzeige
- Click-to-Open Chat
- Pulsing-Animation bei neuen Messages

**Usage:**
```tsx
<ChatWidget />
```

**Automatische Integration:**
```tsx
// layout.tsx
<ChatProvider>
  <ChatWidget />
  <ChatWindow />
</ChatProvider>
```

---

### `<ChatWindow />`

**Location:** `src/components/ChatWindow.tsx`

Haupt-Chat-Interface für User.

**Props:** None (verwendet ChatContext)

**Features:**
- Sliding-Drawer-Animation
- Willkommens-Screen (wenn keine Session)
- Message-Liste
- Input mit Send-Button
- Close-Button

**States:**
1. **Geschlossen** - Nur Widget sichtbar
2. **Willkommen** - Name-Input-Formular
3. **Chat** - Aktive Chat-Session

**Willkommens-Formular:**
```tsx
<form onSubmit={handleCreateSession}>
  <input
    type="text"
    placeholder="Your Name"
    value={userName}
    onChange={(e) => setUserName(e.target.value)}
  />
  <button type="submit">Start Chat</button>
</form>
```

---

### `<HeroSection />`

**Location:** `src/components/HeroSection.tsx`

Hero-Bereich mit Typing-Animation.

**Props:** None (nutzt next-intl)

**Features:**
- Typing-Animation für Schlagworte
- Call-to-Action-Buttons
- Responsive Layout
- Dark/Light-Mode-Support

**Typing-Texte:**
```typescript
// DE
['Full-Stack', 'Web Development', 'KI-Lösungen']

// EN
['Full-Stack', 'Web Development', 'AI Solutions']
```

---

### `<PortfolioSection />`

**Location:** `src/components/PortfolioSection.tsx`

Portfolio-Showcase mit Projekt-Cards.

**Props:** None (verwendet `portfolio.ts` Data)

**Features:**
- Grid-Layout (responsive)
- ProjectCard-Komponenten
- Hover-Effekte
- Filter (Coming Soon)

**Usage:**
```tsx
<PortfolioSection />
```

**Datenquelle:**
```typescript
// src/data/portfolio.ts
export const projects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: '...',
    image: '/projects/ecommerce.jpg',
    tags: ['Next.js', 'Stripe', 'MongoDB'],
    liveUrl: 'https://...',
    githubUrl: 'https://github.com/...'
  }
];
```

---

### `<ContactSection />`

**Location:** `src/components/ContactSection.tsx`

Kontaktformular mit Validation.

**Props:** None

**Features:**
- Client-Side Validation
- Server-Side Submission
- Success/Error Messages
- Rate Limiting (geplant)

**Felder:**
- Name (required, 1-100 chars)
- Email (required, valid format)
- Subject (required, 1-200 chars)
- Message (required, 1-5000 chars)

**Submit-Handler:**
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccessMessage();
      resetForm();
    } else {
      showErrorMessage(data.error);
    }
  } catch (error) {
    showErrorMessage('Network error');
  }
};
```

---

## UI Components

### `<ProjectCard />`

**Location:** `src/components/ui/ProjectCard.tsx`

Karte für Portfolio-Projekte.

**Props:**
```typescript
interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
}
```

**Features:**
- Responsive Image
- Tag-Badges
- Hover-Overlay mit Links
- Smooth Transitions

**Usage:**
```tsx
<ProjectCard
  title="Portfolio Website"
  description="Modern portfolio with chat system"
  image="/projects/portfolio.jpg"
  tags={['Next.js', 'Socket.io', 'MongoDB']}
  liveUrl="https://hoffmann-niklas.de"
  githubUrl="https://github.com/..."
/>
```

---

### `<SectionHeader />`

**Location:** `src/components/ui/SectionHeader.tsx`

Wiederverwendbarer Section-Header.

**Props:**
```typescript
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
}
```

**Usage:**
```tsx
<SectionHeader
  title="My Projects"
  subtitle="Recent work and case studies"
  align="center"
/>
```

---

## Custom Hooks

### `useAdminChat()`

**Location:** `src/hooks/useAdminChat.ts`

Zentraler Hook für Admin-Chat-Funktionalität.

**Return Type:**
```typescript
{
  // State
  sessions: ChatSession[];
  messages: ChatMessage[];
  selectedSession: ChatSession | null;
  isConnected: boolean;
  isTyping: boolean;
  
  // Actions
  selectSession: (session: ChatSession) => void;
  sendMessage: (message: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  blockUser: (sessionId: string, block: boolean) => Promise<void>;
  markMessagesAsRead: () => Promise<void>;
  
  // Helpers
  fetchSessions: () => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;
}
```

**Features:**
- Socket.io Integration
- Audio-Benachrichtigungen
- Auto-Refresh
- Typing-Detection
- Error Handling

**Usage:**
```tsx
const {
  sessions,
  messages,
  selectedSession,
  isConnected,
  selectSession,
  sendMessage
} = useAdminChat();

// Session auswählen
selectSession(sessions[0]);

// Nachricht senden
await sendMessage('Hello!');
```

**Event-Handling:**
```typescript
useEffect(() => {
  if (!socket) return;
  
  // New Message Notification
  socket.on('admin:new-message', ({ sessionId }) => {
    createNotificationSound();
    fetchSessions();
  });
  
  // Typing Indicator
  socket.on('user-typing', ({ isTyping }) => {
    setIsTyping(isTyping);
  });
  
  return () => {
    socket.off('admin:new-message');
    socket.off('user-typing');
  };
}, [socket]);
```

---

### `useSocket()`

**Location:** `src/hooks/useSocket.ts`

Socket.io Connection Management.

**Parameters:**
```typescript
interface UseSocketOptions {
  url: string;
  autoConnect?: boolean;
}
```

**Return Type:**
```typescript
{
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}
```

**Usage:**
```tsx
const { socket, isConnected } = useSocket({
  url: process.env.NEXT_PUBLIC_SOCKET_URL!,
  autoConnect: true
});

useEffect(() => {
  if (!socket) return;
  
  socket.on('custom-event', (data) => {
    console.log(data);
  });
  
  return () => {
    socket.off('custom-event');
  };
}, [socket]);
```

**Connection Lifecycle:**
```typescript
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});
```

---

## Styling Conventions

### Tailwind Classes
Alle Komponenten nutzen Tailwind CSS mit konsistenten Patterns:

**Layout:**
```tsx
// Container
<div className="container mx-auto px-4 py-8">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Flex
<div className="flex items-center justify-between gap-4">
```

**Colors:**
```tsx
// Primary (Brand)
className="bg-primary text-primary-foreground"

// Muted (Secondary)
className="bg-muted text-muted-foreground"

// Accent
className="bg-accent text-accent-foreground"

// Destructive (Danger)
className="bg-destructive text-destructive-foreground"
```

**Responsive:**
```tsx
// Mobile First
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"
```

**Dark Mode:**
```tsx
// Automatisch via next-themes
className="bg-white dark:bg-gray-900"
className="text-gray-900 dark:text-gray-100"
```

---

## Best Practices

### Component Guidelines
1. ✅ **Single Responsibility** - Eine Komponente, eine Aufgabe
2. ✅ **Props > State** - Props bevorzugen wenn möglich
3. ✅ **TypeScript** - Alle Props typisieren
4. ✅ **Memoization** - useMemo/useCallback bei teurem Rendering
5. ✅ **Error Boundaries** - Fehler abfangen (Coming Soon)

### Performance
```tsx
// ❌ Schlecht
const Component = ({ data }) => {
  const filtered = data.filter(heavy_computation);
  return <List items={filtered} />;
};

// ✅ Gut
const Component = ({ data }) => {
  const filtered = useMemo(
    () => data.filter(heavy_computation),
    [data]
  );
  return <List items={filtered} />;
};
```

### Accessibility
```tsx
// ARIA Labels
<button aria-label="Close chat">
  <X className="w-4 h-4" />
</button>

// Keyboard Navigation
onKeyDown={(e) => {
  if (e.key === 'Escape') onClose();
}}

// Focus Management
useEffect(() => {
  inputRef.current?.focus();
}, [isOpen]);
```

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** Januar 2025  
**Autor:** Niklas Hoffmann
