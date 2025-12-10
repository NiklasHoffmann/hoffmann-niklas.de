# 🚀 Niklas Hoffmann Portfolio & Business Website

> Modern Full-Stack Web Development Portfolio mit integriertem Real-time Chat-System

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-green)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Projektstruktur](#-projektstruktur)
- [Installation](#-installation)
- [Entwicklung](#-entwicklung)
- [Deployment](#-deployment)
- [Dokumentation](#-dokumentation)
- [API Referenz](#-api-referenz)

## ✨ Features

### 🎨 Portfolio & Präsentation
- **Moderne One-Page-Website** mit Scroll-Snap-Navigation
- **Mehrsprachigkeit** (Deutsch/Englisch/Spanisch) mit next-intl
- **Dark/Light Mode** mit 700ms smooth transitions
- **Responsive Design** für alle Geräte
- **Animierte Chain-Dekoration** als Navigation-Guide
- **Portfolio-Showcase** mit Projekt-Cards
- **YouTube-Integration** für Video-Content
- **Kontaktformular** mit MongoDB-Speicherung
- **Local Icon Caching** - Keine CORS-Probleme, Theme-aware Icons

### 💬 Live-Chat-System
- **Real-time Chat** mit Socket.io
- **Admin-Dashboard** mit Session-Management
- **Unread-Message-Tracking** für beide Seiten
- **Typing-Indicators** für bessere UX
- **Sound-Benachrichtigungen** mit Web Audio API
- **Quick-Reply-Templates** (DE/EN)
- **Session-Persistenz** mit LocalStorage
- **User-Blocking** für Moderation
- **Mobile-optimiert** mit Touch-Gesten

### 🛠️ Admin-Features
- **Dediziertes Admin-Panel** (`/admin`) ohne Sprach-Prefix
- **Live-Dashboard** mit Echtzeit-Statistiken
- **Chat-Management** mit Session-Übersicht
- **Message-History** mit Read/Unread Status
- **Bulk-Operations** (Delete, Block)
- **Auto-Refresh** alle 30 Sekunden
- **Analytics-Dashboard** mit Besucherstatistiken

## 🔧 Tech Stack

### Frontend
- **Next.js 16** - React Framework mit App Router
- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Utility-First Styling
- **next-intl** - Internationalisierung
- **next-themes** - Theme Management
- **Local Icon Caching** - Cached SVG Icons (eliminiert CORS-Probleme)

### Backend & Real-time
- **Socket.io** - WebSocket-Verbindungen
- **MongoDB** - NoSQL Datenbank
- **Mongoose** - ODM für MongoDB
- **Next.js API Routes** - Serverless Functions

### DevOps & Tools
- **PM2** - Process Manager
- **ESLint** - Code Linting
- **Git** - Version Control

## 📁 Projektstruktur

```
hoffmann-niklas.de/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/            # Lokalisierte Seiten (DE/EN)
│   │   │   ├── layout.tsx       # Haupt-Layout
│   │   │   └── page.tsx         # Startseite
│   │   ├── admin/               # Admin-Bereich (ohne Lokalisierung)
│   │   │   ├── layout.tsx       # Admin-Layout
│   │   │   ├── page.tsx         # Dashboard
│   │   │   └── chat/
│   │   │       └── page.tsx     # Chat-Management
│   │   └── api/                 # API Routes
│   │       ├── chat/            # Chat-API-Endpunkte
│   │       │   ├── session/     # Session-Verwaltung
│   │       │   ├── message/     # Nachrichten senden
│   │       │   ├── sessions/    # Session-Liste (Admin)
│   │       │   ├── stats/       # Dashboard-Statistiken
│   │       │   ├── mark-read/   # Messages als gelesen markieren
│   │       │   └── [sessionId]/ # Chat-Historie laden
│   │       └── contact/         # Kontaktformular
│   │
│   ├── components/              # React Components
│   │   ├── admin/              # Admin-spezifische Komponenten
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── SessionList.tsx
│   │   │   ├── SessionStats.tsx
│   │   │   ├── ConnectionStatus.tsx
│   │   │   └── ConfirmationModal.tsx
│   │   ├── ui/                 # Wiederverwendbare UI-Komponenten
│   │   │   ├── ProjectCard.tsx
│   │   │   └── SectionHeader.tsx
│   │   ├── icons/              # Icon-Komponenten
│   │   │   ├── LocalIcon.tsx   # Lokales Icon-System
│   │   │   └── TechIcons.tsx   # Tech-Stack Icons
│   │   ├── AboutSection.tsx
│   │   ├── ChatWidget.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ContactSection.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── PortfolioSection.tsx
│   │   ├── ServicesSection.tsx
│   │   └── YouTubeSlider.tsx
│   │
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAdminChat.ts     # Admin Chat State Management
│   │   └── useSocket.ts        # Socket.io Integration
│   │
│   ├── contexts/               # React Context Providers
│   │   └── ChatContext.tsx     # User Chat State
│   │
│   ├── lib/                    # Utility Libraries
│   │   ├── api.ts              # Axios Client
│   │   ├── chatApi.ts          # Chat API Helpers
│   │   ├── chatUtils.ts        # Chat Utilities
│   │   ├── chainRenderers.ts   # Canvas Chain Rendering
│   │   └── utils.ts            # General Utilities
│   │
│   ├── config/                 # Konfigurationsdateien
│   │   ├── chain.ts            # Chain-Rendering-Config
│   │   └── chat.constants.ts   # Chat-Konstanten
│   │
│   ├── types/                  # TypeScript Type Definitions
│   │   ├── chat.ts             # Chat-spezifische Types
│   │   ├── chain.ts            # Chain-Rendering Types
│   │   └── index.ts            # Allgemeine Types
│   │
│   ├── models/                 # MongoDB Models
│   │   └── Chat.ts             # ChatSession & ChatMessage
│   │
│   ├── messages/               # i18n Übersetzungen
│   │   ├── de.json
│   │   └── en.json
│   │
│   ├── data/                   # Statische Daten
│   │   ├── portfolio.ts        # Projekt-Daten
│   │   └── videos.ts           # YouTube-Video-IDs
│   │
│   └── i18n/                   # Internationalisierung
│       ├── config.ts
│       └── request.ts
│
├── public/                     # Statische Assets
│   ├── icons/                 # Cached SVG Icons (auto-generated)
│   └── favicons/              # Favicon Varianten
├── scripts/                   # Build & Setup Scripts
│   └── cache-icons.js         # Icon-Caching-System
├── docs/                      # Dokumentation
├── server.js                  # Socket.io Server
├── ecosystem.config.js        # PM2 Configuration
├── middleware.ts              # Next.js Middleware (i18n)
└── package.json

```

## 🚀 Installation

### Voraussetzungen
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 7.0
- Git

### 1. Repository klonen
```bash
git clone https://github.com/NiklasHoffmann/hoffmann-niklas.de.git
cd hoffmann-niklas.de
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen einrichten
Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/portfolio

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Optional: Email-Benachrichtigungen
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@example.com
```

### 4. Entwicklungsserver starten
```bash
npm run dev
```

Die Website ist jetzt unter [http://localhost:3000](http://localhost:3000) erreichbar.

## 💻 Entwicklung

### Verfügbare Scripts

```bash
# Development Server (Next.js + Socket.io)
npm run dev              # Startet Server (cached Icons automatisch)

# Icon-System
npm run cache-icons      # Lädt alle Icons von Iconify API

# Production Build
npm run build            # Erstellt Production Build (cached Icons automatisch)

# Production Server starten
npm run start

# Code Linting
npm run lint

# PM2 Production Deployment
npm run pm2:start    # Start mit PM2
npm run pm2:stop     # Stop PM2 Prozesse
npm run pm2:restart  # Restart PM2 Prozesse
npm run pm2:logs     # Logs anzeigen
npm run pm2:monit    # Monitoring Dashboard
```

### Hot Reload
- **Next.js**: Auto-Reload bei Dateiänderungen
- **Socket.io Server**: Manueller Restart erforderlich

### Code-Style
- **TypeScript Strict Mode** aktiviert
- **ESLint** für Code-Qualität
- **Prettier** für Code-Formatierung (empfohlen)

## 🌐 Deployment

### Vercel (Empfohlen für Frontend)
1. Repository mit Vercel verbinden
2. Umgebungsvariablen setzen
3. Auto-Deployment bei Git-Push

### VPS/Dedicated Server (mit PM2)
```bash
# 1. Code hochladen
git pull origin master

# 2. Dependencies installieren
npm install --production

# 3. Build erstellen
npm run build

# 4. PM2 starten
npm run pm2:start

# 5. Nginx Reverse Proxy einrichten (Optional)
# Siehe docs/DEPLOYMENT.md
```

### Docker (Alternative)
```bash
# Build
docker build -t portfolio .

# Run
docker run -p 3000:3000 --env-file .env.local portfolio
```

## 📚 Dokumentation

Detaillierte Dokumentation findest du in den folgenden Dateien:

### Hauptdokumentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment-Anleitung
- **[TESTING.md](./TESTING.md)** - Testing-Guide
- **[MIGRATION.md](./MIGRATION.md)** - Migration von Express zu Next.js

### Technische Dokumentation
- **[docs/ICON_SYSTEM.md](./docs/ICON_SYSTEM.md)** - Icon-Caching-System
- **[docs/CHAIN_CONFIG.md](./docs/CHAIN_CONFIG.md)** - Chain-Rendering-Konfiguration
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System-Architektur
- **[docs/COMPONENTS.md](./docs/COMPONENTS.md)** - Component-Übersicht
- **[docs/API_REFERENCE.md](./docs/API_REFERENCE.md)** - API-Dokumentation
- **[docs/PERFORMANCE.md](./docs/PERFORMANCE.md)** - Performance-Optimierungen
- **[docs/TRANSITIONS.md](./docs/TRANSITIONS.md)** - Theme-Transition-System

## 🔌 API Referenz

### Chat API

#### POST `/api/chat/session`
Erstellt eine neue Chat-Session oder gibt existierende zurück.

**Request:**
```json
{
  "userName": "Max Mustermann",
  "email": "max@example.com" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123xyz",
    "userName": "Max Mustermann",
    "createdAt": "2025-11-04T12:00:00Z"
  }
}
```

#### GET `/api/chat/sessions`
Lädt alle Chat-Sessions (Admin only).

**Query Parameters:**
- `status` - Filter nach Status (`active`, `closed`, `archived`)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "total": 10,
    "unreadTotal": 5
  }
}
```

#### POST `/api/chat/message`
Sendet eine neue Nachricht.

**Request:**
```json
{
  "sessionId": "abc123xyz",
  "message": "Hallo!",
  "sender": "user" // oder "admin"
}
```

#### GET `/api/chat/stats`
Lädt Dashboard-Statistiken (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSessions": 42,
    "messagesToday": 156,
    "activeNow": 5,
    "avgResponseTime": "< 5m"
  }
}
```

### Socket.io Events

#### Client → Server
- `join-session` - Session beitreten
- `send-message` - Nachricht senden
- `typing` - Typing-Indicator
- `admin:join` - Admin-Panel beitreten
- `admin:message` - Admin-Nachricht senden

#### Server → Client
- `new-message` - Neue Nachricht empfangen
- `user-typing` - User tippt
- `admin:new-message` - Neue Nachricht (für Benachrichtigung)
- `admin:new-session` - Neue Session erstellt
- `session-joined` - Session erfolgreich beigetreten

## 🤝 Contributing

Contributions sind willkommen! Bitte erstelle ein Issue oder Pull Request.

### Development Workflow
1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

## 📄 Lizenz

© 2025 Niklas Hoffmann. Alle Rechte vorbehalten.

## 👤 Kontakt

**Niklas Hoffmann**
- Website: [hoffmann-niklas.de](https://hoffmann-niklas.de)
- GitHub: [@NiklasHoffmann](https://github.com/NiklasHoffmann)
- Email: mail@hoffmann-niklas.de

---

**Made with ❤️ using Next.js, TypeScript & Socket.io**
