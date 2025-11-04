# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Geplant
- [ ] Toast Notifications statt Browser Alerts
- [ ] Hook-Optimierung (useSocket.ts)
- [ ] Admin-Authentifizierung (NextAuth.js)
- [ ] File-Upload im Chat
- [ ] Voice Messages
- [ ] Chatbot-Integration (OpenAI)
- [ ] Email-Benachrichtigungen
- [ ] Virtual Scrolling für lange Message-Listen
- [ ] Rate Limiting
- [ ] Error Boundary Components

---

## [1.0.0] - 2025-01-04

### ✨ Added

#### Dokumentation
- **README.md**: Umfassende Projekt-Dokumentation mit Features, Installation, Deployment
- **docs/ARCHITECTURE.md**: Vollständige System-Architektur mit Diagrammen und Datenfluss
- **docs/API_REFERENCE.md**: Detaillierte API-Dokumentation für alle Endpoints und Socket.io Events
- **docs/COMPONENTS.md**: Component-Guide mit Props, Usage-Examples und Best Practices
- **docs/DEVELOPMENT.md**: Entwickler-Guide mit Workflows, Conventions und Troubleshooting
- **JSDoc Comments**: Ausführliche Kommentare in `chatApi.ts` und `chatUtils.ts`

#### Admin Dashboard
- Admin-Landingpage unter `/admin` (ohne Sprach-Prefix)
- 4 Quick-Stats-Cards (Total Sessions, Messages Today, Active Now, Response Time)
- 4 Module-Karten (Chat Management, Contact Messages, Analytics, Settings)
- Real-time Statistiken mit Auto-Refresh alle 30 Sekunden
- API-Endpoint `/api/chat/stats` für Dashboard-Daten

#### Admin Chat Management
- Dedizierte Chat-Seite unter `/admin/chat`
- Session-Liste mit Unread-Counts und Status-Indikatoren
- Real-time Message-Updates via Socket.io
- Typing-Indicators für User
- Sound-Benachrichtigungen für neue Nachrichten
- Quick-Reply-Templates (DE/EN)
- Delete/Block-Funktionen mit Confirmation-Modals
- Connection-Status-Anzeige
- Back-Button zur Dashboard-Navigation

#### Admin Components (Modular)
- **SessionList.tsx**: Session-Übersicht mit Sorting und Filtering
- **SessionStats.tsx**: Session-Statistiken-Badges
- **ConnectionStatus.tsx**: Socket.io Verbindungs-Indikator
- **ChatHeader.tsx**: Chat-Header mit User-Info und Actions
- **MessageList.tsx**: Nachrichten-Display mit Unread-Divider
- **MessageInput.tsx**: Nachrichten-Eingabe mit Quick-Replies
- **ConfirmationModal.tsx**: Wiederverwendbare Bestätigungs-Dialoge

#### Custom Hooks
- **useAdminChat.ts**: Kompletter Admin-Chat-State-Management-Hook
  - Session Management (fetch, select, delete)
  - Message Management (fetch, send, markAsRead)
  - Socket.io Event Handling
  - Audio Notifications mit Web Audio API
  - User Actions (block, delete)

#### Centralized Libraries
- **lib/chatApi.ts**: API-Helper-Funktionen für alle Chat-Operations
  - `fetchChatSessions`, `fetchChatMessages`, `createChatSession`
  - `sendChatMessage`, `updateChatSession`, `deleteChatSession`
  - `markMessagesAsRead`, `validateChatSession`
  
- **lib/chatUtils.ts**: Utility-Funktionen für Chat-Features
  - Zeit-Formatierung (formatChatTime, formatSessionDate, formatTime)
  - LocalStorage Management (getChatSession, saveChatSession, clearChatSession)
  - Audio Notifications (createNotificationSound mit Web Audio API)
  - Validierung (validateMessage, truncateText)
  - UI Helpers (getUnreadBadgeText, smoothScrollTo)

- **config/chat.constants.ts**: Zentralisierte Konstanten
  - CHAT_CONFIG (Timeouts, Sound-Settings, UI-Limits)
  - QUICK_REPLIES_DE / QUICK_REPLIES_EN
  - SOCKET_EVENTS (Event-Namen als Konstanten)
  - STORAGE_KEYS, CHAT_COLORS

#### API Routes
- **POST /api/chat/session**: Session erstellen/laden
- **GET /api/chat/sessions**: Alle Sessions abrufen (Admin)
- **GET /api/chat/[sessionId]**: Chat-Historie laden
- **POST /api/chat/message**: Nachricht senden
- **POST /api/chat/mark-read**: Messages als gelesen markieren
- **GET /api/chat/stats**: Dashboard-Statistiken
- **PATCH /api/chat/session**: Session-Updates (block, userName)
- **DELETE /api/chat/session**: Session löschen

#### Socket.io Events
- **admin:new-message**: Universal-Notification für neue User-Nachrichten
- **admin:new-session**: Benachrichtigung über neue Sessions
- **admin:join**: Admin betritt Panel
- **admin:message**: Admin sendet Nachricht
- **admin:typing**: Admin tippt
- **new-message**: Message-Display-Event (für beide Seiten)
- **user-typing**: User tippt
- **join-session**: Session beitreten
- **send-message**: Nachricht senden

### 🔄 Changed

#### Refactoring
- Admin Chat von monolithischer Page (1000+ Zeilen) zu modularen Components (~220 Zeilen)
- Code-Organization: API-Calls, Utilities und Konstanten aus Components extrahiert
- Type Definitions zentralisiert in `types/chat.ts`
- Verbesserte Separation of Concerns

#### Routing
- Admin-Pages von `app/[locale]/admin` nach `app/admin` verschoben
- Ermöglicht direkte `/admin` URL ohne Sprach-Prefix
- Vereinfachte Audio-Aktivierung (kein initiales Click erforderlich)

#### Next.js 15 Migration
- API Routes auf async params Pattern aktualisiert
- `const { id } = params` → `const { id } = await params`
- `params: { id: string }` → `params: Promise<{ id: string }>`

### 🐛 Fixed

#### Audio-Benachrichtigungen
- **Problem**: Keine Sound-Benachrichtigungen für Admins bei neuen Nachrichten
- **Lösung**: Server-Side Broadcast `admin:new-message` zu allen Admin-Sockets
- **Problem**: Browser Autoplay Policy blockiert Audio bis User-Interaktion
- **Lösung**: Auto-Aktivierung von AudioContext bei Click/Touch/Keydown

#### Dashboard-Statistiken
- **Problem**: Stats zeigten Platzhalter-Daten (`-`)
- **Lösung**: `/api/chat/stats` Endpoint mit echten MongoDB-Queries
- **Problem**: Messages Today immer 0
- **Lösung**: Server-Side Berechnung seit 00:00 Uhr mit Timestamp-Filter

#### TypeScript-Fehler
- Contact API Route auf Next.js 15 async params Pattern aktualisiert
- Alle Type Errors in Admin Components behoben
- Proper typing für Socket.io Events

### 📦 Dependencies

#### Added
- Keine neuen Dependencies (nur Code-Reorganisation)

#### Updated
- Next.js auf 16.0 (bereits vorhanden)
- React auf 19.0 (bereits vorhanden)

### 🗂️ File Structure Changes

```
Neu erstellt:
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   ├── COMPONENTS.md
│   └── DEVELOPMENT.md
├── src/
│   ├── app/
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── chat/page.tsx
│   ├── components/
│   │   └── admin/
│   │       ├── ChatHeader.tsx
│   │       ├── MessageList.tsx
│   │       ├── MessageInput.tsx
│   │       ├── SessionList.tsx
│   │       ├── SessionStats.tsx
│   │       ├── ConnectionStatus.tsx
│   │       └── ConfirmationModal.tsx
│   ├── config/
│   │   └── chat.constants.ts
│   ├── hooks/
│   │   └── useAdminChat.ts
│   └── lib/
│       ├── chatApi.ts
│       └── chatUtils.ts

Gelöscht:
├── src/app/[locale]/admin/
│   ├── layout.tsx
│   ├── page.tsx
│   └── chat/page.tsx
```

### 📝 Documentation

#### Code Comments
- JSDoc-Kommentare für alle public functions in `chatApi.ts`
- JSDoc-Kommentare für alle utility functions in `chatUtils.ts`
- Inline-Comments für komplexe Logik in Components
- Module-Level Documentation mit @module Tags

#### Guides
- **Architecture Guide**: System-Design, Datenfluss, Performance, Security
- **API Reference**: Vollständige Endpoint- und Event-Dokumentation
- **Component Guide**: Props, Usage-Examples, Best Practices
- **Development Guide**: Workflows, Conventions, Troubleshooting

---

## [0.1.0] - 2025-01-03

### Initial Implementation

#### Core Features
- Next.js 16 Portfolio Website
- Socket.io Real-time Chat
- MongoDB Integration
- Internationalisierung (DE/EN)
- Dark/Light Mode
- Portfolio Section
- Contact Form
- YouTube Slider

#### Chat System (User)
- Floating Chat Widget
- Chat Window mit Slide-Animation
- LocalStorage Session Persistence
- Real-time Messages
- Typing Indicators

#### Admin Panel (Initial)
- Basic Chat Management
- Session List
- Message History
- Delete/Block Functions

---

## Git Commit History

### Recent Commits (Januar 2025)

```
b36b5cb docs: add comprehensive development guide
75baff2 docs: add comprehensive documentation with README, architecture, API reference
649528e chore: add remaining project files and cleanup
64a580e fix: update API routes for Next.js 15 async params
66df8ad refactor(chat): centralize API calls, utilities and constants
45d8320 refactor(admin): split admin chat into modular components
d63a890 feat(admin): move admin pages outside locale routing and add dashboard stats
```

---

## Migration Notes

### Express → Next.js Migration
Siehe [MIGRATION.md](./MIGRATION.md) für Details zur Migration von Express zu Next.js.

### Testing
Siehe [TESTING.md](./TESTING.md) für Testing-Strategien und Checklisten.

### Deployment
Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für Deployment-Anleitung mit PM2 und nginx.

---

## Contributors

- **Niklas Hoffmann** - Initial work and ongoing development

## License

© 2025 Niklas Hoffmann. Alle Rechte vorbehalten.

---

**Note**: Dieses Projekt wird aktiv weiterentwickelt. Für geplante Features siehe [Unreleased](#unreleased) Section.
