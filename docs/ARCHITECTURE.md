# 🏗️ Architektur-Dokumentation

## Systemübersicht

Das Projekt basiert auf einer modernen Full-Stack-Architektur mit Next.js 16, Socket.io für Real-time-Kommunikation und MongoDB als Datenspeicher.

## Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Portfolio  │  │  Chat Widget │  │ Admin Panel  │      │
│  │     Pages    │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         └────────┬────────┴─────────────────┘              │
│                  │                                          │
│         ┌────────▼─────────────┐                           │
│         │   React Components    │                           │
│         │  - Hooks (useState)   │                           │
│         │  - Context (Chat)     │                           │
│         └────────┬──────────────┘                           │
└──────────────────┼──────────────────────────────────────────┘
                   │
┌──────────────────┼──────────────────────────────────────────┐
│                  │        Next.js Layer                      │
├──────────────────┼──────────────────────────────────────────┤
│  ┌───────────────▼───────────────┐                          │
│  │      App Router (SSR)          │                          │
│  │  - [locale] Pages              │                          │
│  │  - /admin Pages                │                          │
│  └───────────┬────────────────────┘                          │
│              │                                               │
│  ┌───────────▼────────────────┐                             │
│  │     API Routes              │                             │
│  │  - /api/chat/*              │                             │
│  │  - /api/contact             │                             │
│  └───────────┬─────────────────┘                             │
└──────────────┼───────────────────────────────────────────────┘
               │
┌──────────────┼───────────────────────────────────────────────┐
│              │        Server Layer                           │
├──────────────┼───────────────────────────────────────────────┤
│  ┌───────────▼──────────┐   ┌───────────────────────┐       │
│  │   Next.js Server      │   │   Socket.io Server    │       │
│  │  - SSR/SSG            │   │  - WebSocket Handler  │       │
│  │  - Middleware (i18n)  │   │  - Event System       │       │
│  │  - API Handler        │   │  - Room Management    │       │
│  └───────────┬───────────┘   └──────────┬────────────┘       │
└──────────────┼──────────────────────────┼────────────────────┘
               │                          │
┌──────────────┼──────────────────────────┼────────────────────┐
│              │      Data Layer          │                    │
├──────────────┼──────────────────────────┼────────────────────┤
│  ┌───────────▼──────────────────────────▼──────────┐         │
│  │            MongoDB Database                      │         │
│  │  Collections:                                    │         │
│  │  - chatsessions (Session-Daten)                 │         │
│  │  - chatmessages (Nachrichten)                   │         │
│  │  - contacts (Kontaktformular)                   │         │
│  └──────────────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

## Komponenten-Struktur

### Frontend-Architektur

#### 1. Page Components (App Router)
```
app/
├── [locale]/              # Lokalisierte Seiten
│   ├── layout.tsx         # Root Layout mit Providern
│   └── page.tsx           # Hauptseite (Portfolio)
└── admin/                 # Admin-Bereich (ohne i18n)
    ├── layout.tsx         # Admin Layout
    ├── page.tsx           # Dashboard
    └── chat/page.tsx      # Chat-Management
```

**Verantwortlichkeiten:**
- Server-Side Rendering (SSR)
- Layout-Orchestrierung
- Provider-Setup (Theme, i18n, Chat)
- Route-Parameter-Handling

#### 2. Feature Components
```
components/
├── ChatWidget.tsx         # User Chat (floating button)
├── ChatWindow.tsx         # User Chat Window
├── admin/                 # Admin-spezifische Komponenten
│   ├── SessionList.tsx    # Session-Übersicht
│   ├── MessageList.tsx    # Nachrichten-Display
│   ├── MessageInput.tsx   # Nachrichten-Eingabe
│   └── ...
└── ...
```

**Design-Patterns:**
- **Composition**: Kleine, wiederverwendbare Komponenten
- **Container/Presentational**: Logik in Hooks, UI in Components
- **Controlled Components**: State-Management über Props

#### 3. Custom Hooks
```
hooks/
├── useAdminChat.ts        # Admin Chat State & Logic
├── useSocket.ts           # Socket.io Integration
└── ...
```

**Hooks-Architektur:**
- **Separation of Concerns**: Jeder Hook hat eine klare Verantwortlichkeit
- **State Co-location**: State liegt nah am Code, der ihn nutzt
- **Side Effects**: useEffect für Socket-Events, API-Calls

**useAdminChat.ts - Verantwortlichkeiten:**
```typescript
- Session Management (fetch, select, delete)
- Message Management (fetch, send, markAsRead)
- Socket.io Event Handling (new-message, user-typing)
- Audio Notifications (Web Audio API)
- User Actions (block, delete)
```

#### 4. Context Providers
```
contexts/
└── ChatContext.tsx        # Global Chat State (User)
```

**Context-Pattern:**
- Vermeidung von Prop-Drilling
- Nur für wirklich globalen State
- Optimierung mit useMemo

### Backend-Architektur

#### 1. API Routes (Next.js)
```
app/api/
├── chat/
│   ├── session/route.ts       # POST - Session erstellen
│   ├── sessions/route.ts      # GET - Sessions abrufen (Admin)
│   ├── message/route.ts       # POST - Nachricht senden
│   ├── [sessionId]/route.ts   # GET - Chat-Historie
│   ├── mark-read/route.ts     # POST - Messages als gelesen markieren
│   └── stats/route.ts         # GET - Dashboard-Statistiken
└── contact/
    ├── route.ts               # GET/POST - Kontakte
    └── [id]/route.ts          # GET/DELETE - Einzelner Kontakt
```

**API-Design-Prinzipien:**
- RESTful Conventions
- Async/Await für DB-Operationen
- Try/Catch Error Handling
- Consistent Response Format

**Response-Format:**
```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: "Error message"
}
```

#### 2. Socket.io Server (server.js)
```javascript
// Event-Flow:
User → send-message → Server
  ↓
Server validates & saves to DB
  ↓
Server emits:
  - new-message → to session room (für Chat-Display)
  - admin:new-message → to all admins (für Benachrichtigung)
```

**Socket-Events:**

**Client → Server:**
- `join-session` - User tritt Session bei
- `send-message` - User sendet Nachricht
- `typing` - User tippt
- `admin:join` - Admin betritt Panel
- `admin:message` - Admin sendet Nachricht
- `admin:typing` - Admin tippt

**Server → Client:**
- `session-joined` - Bestätigung Session-Beitritt
- `new-message` - Neue Nachricht für Chat-Display
- `user-typing` - User tippt (an andere Teilnehmer)
- `admin:new-message` - Neue Nachricht (für Benachrichtigungs-Sound)
- `admin:new-session` - Neue Session erstellt

**Room-Management:**
```javascript
// User-Session Room
socket.join(`session:${sessionId}`)

// Admin-Tracking
adminSockets.add(socket.id)
```

### Data Layer

#### MongoDB-Schema

**ChatSession:**
```typescript
{
  sessionId: string (indexed, unique)
  userName: string
  email?: string
  status: 'active' | 'closed' | 'archived'
  isBlocked: boolean
  createdAt: Date
  lastActivity: Date (indexed)
  unreadCount: number
  adminUnreadCount: number
  metadata: {
    userAgent?: string
    ip?: string
  }
}
```

**ChatMessage:**
```typescript
{
  sessionId: string (indexed)
  message: string
  sender: 'user' | 'admin'
  timestamp: Date (indexed)
  isRead: boolean
}
```

**Indizes:**
- `sessionId` (unique) - schnelle Session-Lookups
- `lastActivity` - sortierte Session-Liste
- `timestamp` - chronologische Nachrichten
- `sessionId + timestamp` - effiziente Chat-Historie

## Datenfluss

### User-Chat-Nachricht senden

```
1. User tippt in ChatWindow
   └─> MessageInput.tsx
       └─> socket.emit('send-message', { sessionId, message })

2. Socket.io Server empfängt Event
   └─> server.js: io.on('send-message')
       ├─> Validierung (sessionId, message)
       ├─> ChatMessage.create() → MongoDB
       ├─> ChatSession.findOneAndUpdate() → lastActivity, unreadCount++
       ├─> io.to(`session:${sessionId}`).emit('new-message', messageData)
       └─> adminSockets.forEach() → emit('admin:new-message')

3. Client empfängt neue Nachricht
   ├─> ChatWindow (User)
   │   └─> useSocket.ts: socket.on('new-message')
   │       └─> setMessages(prev => [...prev, newMessage])
   │           └─> MessageList rendert neue Nachricht
   │
   └─> Admin Panel
       └─> useAdminChat.ts: socket.on('admin:new-message')
           ├─> createNotificationSound() → Beep
           └─> fetchSessions() → Session-Liste aktualisieren
```

### Admin-Dashboard-Statistiken

```
1. Dashboard-Seite lädt
   └─> admin/page.tsx: useEffect()
       └─> fetch('/api/chat/stats')

2. API Route verarbeitet Request
   └─> api/chat/stats/route.ts: GET
       ├─> ChatSession.countDocuments()
       ├─> ChatMessage.countDocuments({ timestamp: { $gte: today } })
       ├─> ChatSession.countDocuments({ lastActivity: { $gte: thirtyMinAgo } })
       └─> return { totalSessions, messagesToday, activeNow, avgResponseTime }

3. Frontend aktualisiert UI
   └─> setStats(data)
       └─> Stat-Cards rendern
           └─> Auto-Refresh alle 30s
```

## State Management

### Globaler State (Context)
```typescript
// ChatContext.tsx
- sessionId: string | null
- messages: Message[]
- isConnected: boolean
- unreadCount: number
```

**Wann Context verwenden:**
- State wird in vielen Komponenten benötigt
- Vermeidung von Prop-Drilling
- Globale App-Settings (Theme, i18n)

### Lokaler State (useState)
```typescript
// Component-spezifisch
- isModalOpen: boolean
- inputValue: string
- filteredSessions: Session[]
```

**Wann useState verwenden:**
- UI-State innerhalb einer Komponente
- Temporäre Daten (Form-Inputs)
- Ableitbare States (filter, sort)

### Server State (API + Socket.io)
```typescript
// Synchronisiert mit Backend
- sessions: Session[]
- messages: Message[]
- stats: DashboardStats
```

**Synchronisations-Strategie:**
- Initial Load: API-Call (fetch)
- Updates: Socket.io Events
- Optimistic Updates: Sofortige UI-Änderung + Server-Bestätigung

## Performance-Optimierungen

### Frontend
- **Code Splitting**: Automatisch durch Next.js App Router
- **Lazy Loading**: React.lazy() für große Komponenten
- **Memoization**: useMemo für teure Berechnungen
- **Virtual Scrolling**: Für lange Message-Listen (ToDo)
- **Debouncing**: Typing-Indicators mit 500ms Delay

### Backend
- **MongoDB Indizes**: Optimierte Queries
- **Pagination**: Limit bei großen Listen
- **Connection Pooling**: MongoDB Connection Pool
- **Rate Limiting**: Socket.io Event Throttling (ToDo)

### Real-time
- **Room-basierte Events**: Nur relevante Sockets erhalten Events
- **Selective Emitting**: `io.to(room)` statt `io.emit()`
- **Binary Data**: Effiziente WebSocket-Frames

## Sicherheit

### Authentifizierung
- **Admin-Bereich**: Basic Authentication (ToDo: OAuth)
- **Session-Validation**: sessionId-Prüfung in API-Routes

### Eingabe-Validierung
```typescript
// Message-Validierung
if (!message || message.trim().length === 0) {
  throw new Error('Message cannot be empty');
}
if (message.length > 5000) {
  throw new Error('Message too long');
}
```

### CORS & Security Headers
```javascript
// server.js
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_SOCKET_URL,
    methods: ['GET', 'POST']
  }
});
```

### XSS-Schutz
- React escapet automatisch HTML
- Sanitierung von User-Input (ToDo: DOMPurify)

## Fehlerbehandlung

### API-Ebene
```typescript
try {
  const result = await ChatSession.findOne({ sessionId });
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error('Database error:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Socket.io-Ebene
```javascript
socket.on('send-message', async (data) => {
  try {
    // Validierung & Verarbeitung
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
});
```

### Frontend-Ebene
```typescript
// useAdminChat.ts
const sendMessage = async (message: string) => {
  try {
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ sessionId, message, sender: 'admin' })
    });
    if (!response.ok) throw new Error('Failed to send message');
  } catch (error) {
    console.error('Send error:', error);
    // ToDo: Toast Notification statt console.error
  }
};
```

## Testing-Strategie (ToDo)

### Unit Tests
- Utility Functions (chatUtils.ts)
- API Helper Functions (chatApi.ts)
- React Hooks (useAdminChat, useSocket)

### Integration Tests
- API Routes (Next.js API)
- Socket.io Events
- Database-Operationen

### E2E Tests
- User-Chat-Flow
- Admin-Chat-Management
- Message-Synchronisation

**Test-Tools:**
- Jest + React Testing Library
- Playwright (E2E)
- Socket.io Client Mock

## Deployment-Architektur

### Production Setup
```
┌─────────────────┐
│   Nginx Proxy   │  ← SSL/TLS Termination
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼──┐   ┌──▼───┐
│ Next │   │ Socket│  ← PM2 Process Manager
│ .js  │   │  .io  │
└───┬──┘   └──┬───┘
    │         │
    └────┬────┘
         │
    ┌────▼────┐
    │ MongoDB │  ← Persistent Storage
    └─────────┘
```

### Skalierungs-Optionen

**Horizontal Scaling:**
- Load Balancer (nginx)
- Multiple Next.js Instances
- Socket.io Sticky Sessions
- Redis Adapter für Socket.io (Cross-Instance-Events)

**Vertical Scaling:**
- PM2 Cluster Mode
- Node.js Worker Threads
- MongoDB Sharding

## Weiterentwicklung

### Geplante Features
- [ ] Hook-Optimierung (useSocket.ts)
- [ ] Toast Notifications (react-hot-toast)
- [ ] Admin-Authentifizierung (NextAuth.js)
- [ ] File-Upload (Chat)
- [ ] Voice Messages
- [ ] Chatbot-Integration (OpenAI)
- [ ] Analytics Dashboard
- [ ] Email-Benachrichtigungen

### Technische Schulden
- [ ] Error Boundary Components
- [ ] API Rate Limiting
- [ ] Input Sanitization (DOMPurify)
- [ ] Virtual Scrolling für Messages
- [ ] Service Worker (Offline-Support)
- [ ] WebPush Notifications

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** Januar 2025  
**Autor:** Niklas Hoffmann
