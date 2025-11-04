# 📡 API Reference

Vollständige Dokumentation aller API-Endpunkte und Socket.io-Events.

## Inhaltsverzeichnis
- [REST API](#rest-api)
  - [Chat API](#chat-api)
  - [Contact API](#contact-api)
- [Socket.io Events](#socketio-events)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

---

## REST API

### Base URL
```
Development: http://localhost:3000/api
Production: https://hoffmann-niklas.de/api
```

### Response Format

Alle API-Endpunkte folgen einem einheitlichen Response-Format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Chat API

### Create Session

Erstellt eine neue Chat-Session oder gibt eine existierende zurück.

**Endpoint:** `POST /api/chat/session`

**Request Body:**
```json
{
  "userName": "Max Mustermann",
  "email": "max@example.com"  // optional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123xyz",
    "userName": "Max Mustermann",
    "email": "max@example.com",
    "status": "active",
    "isBlocked": false,
    "createdAt": "2025-01-04T12:00:00.000Z",
    "lastActivity": "2025-01-04T12:00:00.000Z",
    "unreadCount": 0,
    "adminUnreadCount": 0
  }
}
```

**Validierung:**
- `userName`: String, 1-100 Zeichen, erforderlich
- `email`: Valid Email Format, optional

**Fehler:**
- `400 Bad Request` - Ungültige Parameter
- `500 Internal Server Error` - Datenbankfehler

---

### Get Sessions

Lädt alle Chat-Sessions (nur für Admins).

**Endpoint:** `GET /api/chat/sessions`

**Query Parameters:**
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `status` | string | all | Filter: `active`, `closed`, `archived` |
| `limit` | number | 100 | Max. Anzahl Sessions |
| `offset` | number | 0 | Pagination Offset |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "abc123xyz",
        "userName": "Max Mustermann",
        "email": "max@example.com",
        "status": "active",
        "isBlocked": false,
        "createdAt": "2025-01-04T12:00:00.000Z",
        "lastActivity": "2025-01-04T12:30:00.000Z",
        "unreadCount": 3,
        "adminUnreadCount": 1,
        "metadata": {
          "userAgent": "Mozilla/5.0...",
          "ip": "192.168.1.1"
        }
      }
    ],
    "total": 42,
    "unreadTotal": 15
  }
}
```

**Fehler:**
- `401 Unauthorized` - Keine Admin-Berechtigung
- `500 Internal Server Error` - Datenbankfehler

---

### Get Chat History

Lädt alle Nachrichten einer Session.

**Endpoint:** `GET /api/chat/{sessionId}`

**Path Parameters:**
| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `sessionId` | string | ID der Chat-Session |

**Query Parameters:**
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `limit` | number | 100 | Max. Anzahl Messages |
| `before` | string | - | Timestamp für Pagination |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123xyz",
    "messages": [
      {
        "_id": "msg123",
        "sessionId": "abc123xyz",
        "message": "Hallo, ich habe eine Frage!",
        "sender": "user",
        "timestamp": "2025-01-04T12:00:00.000Z",
        "isRead": true
      },
      {
        "_id": "msg124",
        "sessionId": "abc123xyz",
        "message": "Gerne! Wie kann ich helfen?",
        "sender": "admin",
        "timestamp": "2025-01-04T12:01:00.000Z",
        "isRead": false
      }
    ],
    "total": 25,
    "hasMore": false
  }
}
```

**Fehler:**
- `404 Not Found` - Session existiert nicht
- `500 Internal Server Error` - Datenbankfehler

---

### Send Message

Sendet eine neue Nachricht (via REST - primär für Non-Socket-Clients).

**Endpoint:** `POST /api/chat/message`

**Request Body:**
```json
{
  "sessionId": "abc123xyz",
  "message": "Hier ist meine Nachricht",
  "sender": "user"  // oder "admin"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "msg125",
    "sessionId": "abc123xyz",
    "message": "Hier ist meine Nachricht",
    "sender": "user",
    "timestamp": "2025-01-04T12:05:00.000Z",
    "isRead": false
  }
}
```

**Validierung:**
- `sessionId`: String, erforderlich
- `message`: String, 1-5000 Zeichen, erforderlich
- `sender`: Enum (`user`, `admin`), erforderlich

**Fehler:**
- `400 Bad Request` - Ungültige Parameter
- `403 Forbidden` - Session ist blockiert
- `404 Not Found` - Session existiert nicht
- `500 Internal Server Error` - Datenbankfehler

---

### Mark Messages as Read

Markiert Nachrichten als gelesen.

**Endpoint:** `POST /api/chat/mark-read`

**Request Body:**
```json
{
  "sessionId": "abc123xyz",
  "sender": "user"  // markiert admin-messages als gelesen
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "modifiedCount": 5,
    "sessionId": "abc123xyz"
  }
}
```

**Logik:**
- `sender: "user"` → Markiert alle Admin-Nachrichten als gelesen
- `sender: "admin"` → Markiert alle User-Nachrichten als gelesen

**Fehler:**
- `400 Bad Request` - Ungültige Parameter
- `404 Not Found` - Session existiert nicht
- `500 Internal Server Error` - Datenbankfehler

---

### Get Dashboard Stats

Lädt Statistiken für das Admin-Dashboard.

**Endpoint:** `GET /api/chat/stats`

**Response:** `200 OK`
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

**Berechnungslogik:**
- `totalSessions`: Gesamtanzahl aller Sessions
- `messagesToday`: Nachrichten seit 00:00 Uhr (Serverzeit)
- `activeNow`: Sessions mit lastActivity < 30min
- `avgResponseTime`: Durchschnittliche Zeit zwischen User-Message und Admin-Reply (ToDo)

**Fehler:**
- `401 Unauthorized` - Keine Admin-Berechtigung
- `500 Internal Server Error` - Datenbankfehler

---

### Update Session

Aktualisiert Session-Metadaten.

**Endpoint:** `PATCH /api/chat/session`

**Request Body:**
```json
{
  "sessionId": "abc123xyz",
  "updates": {
    "status": "closed",        // optional
    "isBlocked": true,         // optional
    "adminUnreadCount": 0      // optional
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123xyz",
    "modified": true
  }
}
```

**Fehler:**
- `400 Bad Request` - Ungültige Updates
- `404 Not Found` - Session existiert nicht
- `500 Internal Server Error` - Datenbankfehler

---

### Delete Session

Löscht eine Chat-Session und alle zugehörigen Nachrichten.

**Endpoint:** `DELETE /api/chat/session`

**Request Body:**
```json
{
  "sessionId": "abc123xyz"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123xyz",
    "deleted": true,
    "messagesDeleted": 25
  }
}
```

**Fehler:**
- `400 Bad Request` - Fehlende sessionId
- `404 Not Found` - Session existiert nicht
- `500 Internal Server Error` - Datenbankfehler

---

## Contact API

### Submit Contact Form

Speichert eine Kontaktanfrage.

**Endpoint:** `POST /api/contact`

**Request Body:**
```json
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "subject": "Projektanfrage",
  "message": "Ich hätte Interesse an..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "contact123",
    "name": "Max Mustermann",
    "email": "max@example.com",
    "subject": "Projektanfrage",
    "message": "Ich hätte Interesse an...",
    "createdAt": "2025-01-04T12:00:00.000Z",
    "status": "unread"
  }
}
```

**Validierung:**
- `name`: String, 1-100 Zeichen
- `email`: Valid Email Format
- `subject`: String, 1-200 Zeichen
- `message`: String, 1-5000 Zeichen

**Fehler:**
- `400 Bad Request` - Validierungsfehler
- `500 Internal Server Error` - Datenbankfehler

---

### Get All Contacts

Lädt alle Kontaktanfragen (Admin only).

**Endpoint:** `GET /api/contact`

**Query Parameters:**
| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `status` | string | all | Filter: `unread`, `read`, `archived` |
| `limit` | number | 50 | Max. Anzahl |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "contacts": [...],
    "total": 15
  }
}
```

---

### Get Single Contact

Lädt eine einzelne Kontaktanfrage.

**Endpoint:** `GET /api/contact/{id}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "contact123",
    "name": "Max Mustermann",
    ...
  }
}
```

**Fehler:**
- `404 Not Found` - Kontakt existiert nicht

---

### Delete Contact

Löscht eine Kontaktanfrage.

**Endpoint:** `DELETE /api/contact/{id}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

## Socket.io Events

### Verbindungsaufbau

**Client-Side:**
```typescript
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

---

### User Events

#### Join Session
User tritt einer Chat-Session bei.

**Emit:**
```typescript
socket.emit('join-session', { sessionId: 'abc123xyz' });
```

**Receive:**
```typescript
socket.on('session-joined', (data) => {
  console.log('Joined session:', data.sessionId);
});
```

**Data:**
```json
{
  "sessionId": "abc123xyz",
  "userName": "Max Mustermann"
}
```

---

#### Send Message
User sendet eine Nachricht.

**Emit:**
```typescript
socket.emit('send-message', {
  sessionId: 'abc123xyz',
  message: 'Hallo!',
  sender: 'user'
});
```

**Receive (in Session-Room):**
```typescript
socket.on('new-message', (data) => {
  console.log('New message:', data);
});
```

**Data:**
```json
{
  "sessionId": "abc123xyz",
  "message": "Hallo!",
  "sender": "user",
  "timestamp": "2025-01-04T12:00:00.000Z"
}
```

---

#### Typing Indicator
User tippt gerade.

**Emit:**
```typescript
socket.emit('typing', {
  sessionId: 'abc123xyz',
  isTyping: true
});
```

**Receive (andere Session-Teilnehmer):**
```typescript
socket.on('user-typing', (data) => {
  console.log('User is typing:', data.isTyping);
});
```

---

### Admin Events

#### Join Admin Panel
Admin betritt das Admin-Panel.

**Emit:**
```typescript
socket.emit('admin:join');
```

Server tracked Admin in `adminSockets` Set für Benachrichtigungen.

---

#### Admin Send Message
Admin sendet eine Nachricht.

**Emit:**
```typescript
socket.emit('admin:message', {
  sessionId: 'abc123xyz',
  message: 'Wie kann ich helfen?'
});
```

**Receive (in Session-Room):**
```typescript
socket.on('new-message', (data) => {
  // Gleiche Struktur wie User-Message
});
```

---

#### Admin Typing
Admin tippt gerade.

**Emit:**
```typescript
socket.emit('admin:typing', {
  sessionId: 'abc123xyz',
  isTyping: true
});
```

---

#### New Message Notification
Admin erhält Benachrichtigung über neue User-Nachricht.

**Receive:**
```typescript
socket.on('admin:new-message', (data) => {
  // Sound abspielen
  playNotificationSound();
  // Session-Liste aktualisieren
  fetchSessions();
});
```

**Data:**
```json
{
  "sessionId": "abc123xyz"
}
```

**Trigger:** Wird emitted wenn ein User eine Nachricht sendet.

---

#### New Session Created
Admin erhält Benachrichtigung über neue Session.

**Receive:**
```typescript
socket.on('admin:new-session', (data) => {
  console.log('New session:', data.sessionId);
});
```

**Data:**
```json
{
  "sessionId": "abc123xyz",
  "userName": "Max Mustermann"
}
```

---

### Connection Events

#### Connect
Verbindung hergestellt.

```typescript
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});
```

#### Disconnect
Verbindung getrennt.

```typescript
socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});
```

**Disconnect Reasons:**
- `transport close` - Netzwerk-Problem
- `ping timeout` - Server antwortet nicht
- `client namespace disconnect` - Client hat disconnect() aufgerufen

#### Reconnect
Automatische Wiederverbindung.

```typescript
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});
```

---

## Error Codes

### HTTP Status Codes

| Code | Bedeutung | Beschreibung |
|------|-----------|--------------|
| 200 | OK | Request erfolgreich |
| 400 | Bad Request | Ungültige Parameter |
| 401 | Unauthorized | Authentifizierung erforderlich |
| 403 | Forbidden | Zugriff verweigert (z.B. blockiert) |
| 404 | Not Found | Ressource nicht gefunden |
| 429 | Too Many Requests | Rate Limit überschritten |
| 500 | Internal Server Error | Server-Fehler |

### Socket.io Error Events

```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

**Error Types:**
- `validation_error` - Ungültige Event-Daten
- `session_not_found` - Session existiert nicht
- `session_blocked` - Session ist blockiert
- `unauthorized` - Keine Berechtigung

---

## Rate Limiting

**ToDo:** Rate Limiting ist noch nicht implementiert.

**Geplante Limits:**
- REST API: 100 requests/minute pro IP
- Socket.io Messages: 30 messages/minute pro Session
- Connection Attempts: 10/minute pro IP

**Header:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1704369600
```

---

## Beispiel-Flows

### Kompletter User-Chat-Flow

```typescript
// 1. Verbindung herstellen
const socket = io(SOCKET_URL);

// 2. Session erstellen/laden
const response = await fetch('/api/chat/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userName: 'Max' })
});
const { data } = await response.json();
const sessionId = data.sessionId;

// 3. Session beitreten
socket.emit('join-session', { sessionId });

socket.on('session-joined', () => {
  console.log('Successfully joined session');
});

// 4. Nachrichten empfangen
socket.on('new-message', (message) => {
  displayMessage(message);
});

// 5. Nachricht senden
socket.emit('send-message', {
  sessionId,
  message: 'Hallo!',
  sender: 'user'
});

// 6. Typing Indicator
const handleTyping = debounce(() => {
  socket.emit('typing', { sessionId, isTyping: true });
  setTimeout(() => {
    socket.emit('typing', { sessionId, isTyping: false });
  }, 1000);
}, 500);
```

### Admin-Panel-Flow

```typescript
// 1. Admin-Panel beitreten
socket.emit('admin:join');

// 2. Sessions laden
const response = await fetch('/api/chat/sessions');
const { data } = await response.json();
const sessions = data.sessions;

// 3. Neue Messages hören
socket.on('admin:new-message', ({ sessionId }) => {
  playNotificationSound();
  fetchSessions(); // Refresh
});

// 4. Session auswählen & Messages laden
const messagesResponse = await fetch(`/api/chat/${sessionId}`);
const { data: msgData } = await messagesResponse.json();

// 5. Antworten
socket.emit('admin:message', {
  sessionId,
  message: 'Wie kann ich helfen?'
});

// 6. Als gelesen markieren
await fetch('/api/chat/mark-read', {
  method: 'POST',
  body: JSON.stringify({ sessionId, sender: 'admin' })
});
```

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** Januar 2025  
**Autor:** Niklas Hoffmann
