# 🧪 Testing Guide - Live Chat System

## 📝 Pre-Testing Checklist

### 1. Environment Setup
- [ ] `.env.local` erstellt (kopiere von `.env.example`)
- [ ] MongoDB läuft (lokal oder Cloud)
- [ ] `MONGODB_URI` in `.env.local` gesetzt
- [ ] `NEXT_PUBLIC_SOCKET_URL=http://localhost:3000` in `.env.local`

### 2. Dependencies
```bash
npm install
```

---

## 🚀 Test 1: Development Server starten

```bash
npm run dev
```

**Expected Output:**
```
> Ready on http://localhost:3000
> Socket.io server running
```

**Checklist:**
- [ ] Server startet ohne Errors
- [ ] Keine MongoDB Connection Errors
- [ ] Browser: `http://localhost:3000` öffnet Website

---

## 💬 Test 2: User Chat - Basis Funktionen

### 2.1 Chat öffnen
1. Öffne `http://localhost:3000`
2. Klicke auf Chat-Button (rechts unten)
3. **Expected:** Chat öffnet sich, Name-Input erscheint

### 2.2 Name eingeben
1. Gib Namen ein (z.B. "Max Mustermann")
2. Klick "Start Chat"
3. **Expected:** 
   - Welcome Message: "Hi Max! 👋"
   - Input-Feld erscheint
   - Chat ist bereit

### 2.3 Nachricht senden
1. Schreibe Nachricht: "Hallo, ich brauche Hilfe"
2. Klick Send oder Enter
3. **Expected:**
   - Nachricht erscheint rechts (blaue Bubble)
   - Timestamp wird angezeigt
   - Input-Feld wird geleert

### 2.4 Chat minimieren/maximieren
1. Klick auf Minimize-Button (-)
2. **Expected:** Chat wird klein, Header bleibt sichtbar
3. Klick auf Header
4. **Expected:** Chat wird wieder groß

### 2.5 Chat schließen & wiederherstellen
1. Klick Close-Button (X)
2. **Expected:** Chat verschwindet komplett
3. Klick Chat-Button (rechts unten)
4. **Expected:** 
   - Chat öffnet wieder
   - Alte Nachrichten sind noch da (localStorage)
   - Gleicher Name

### 2.6 Dark/Light Mode
1. Toggle Theme (Sonnen/Mond Icon)
2. **Expected:**
   - Chat-Hintergrund wechselt (#090909 ↔ #ffffff)
   - Text-Farbe passt sich an
   - Kein Hydration Error in Console

**✅ Test 2 Checklist:**
- [ ] Chat öffnet sich
- [ ] Name wird gespeichert
- [ ] Nachrichten senden funktioniert
- [ ] Minimize/Maximize funktioniert
- [ ] Close/Reopen behält Session
- [ ] Dark/Light Mode funktioniert

---

## 👨‍💼 Test 3: Admin Panel

### 3.1 Admin Panel öffnen
1. Öffne `http://localhost:3000/admin/chat`
2. **Expected:**
   - Session-Liste (links) ist sichtbar
   - Stats: "Active" und "Unread" angezeigt
   - "No chat sessions" wenn noch keine Session

### 3.2 Session erscheint in Liste
1. In anderem Tab/Browser: User-Chat öffnen & Nachricht senden
2. Zurück zu Admin Panel
3. **Expected:**
   - Session erscheint in Liste
   - User-Name wird angezeigt
   - Unread Badge = 1
   - Online-Status = grüner Punkt

### 3.3 Session auswählen
1. Klick auf Session in Liste
2. **Expected:**
   - Rechte Seite zeigt Chat
   - User-Name im Header
   - Alle Messages vom User sichtbar
   - Messages links (User), rechts (Admin)

### 3.4 Als Admin antworten
1. Schreibe Antwort: "Hallo! Wie kann ich helfen?"
2. Klick Send
3. **Expected:**
   - Nachricht erscheint rechts (blau)
   - Im User-Chat (anderen Tab): Nachricht erscheint links

### 3.5 Connection Status
1. Check rechts unten: Connection Indicator
2. **Expected:**
   - Grün = "Connected"
   - Socket.io funktioniert

**✅ Test 3 Checklist:**
- [ ] Admin Panel lädt ohne Errors
- [ ] Sessions erscheinen in Liste
- [ ] Unread Counter funktioniert
- [ ] Session auswählen zeigt Chat
- [ ] Admin kann antworten
- [ ] Connection Status korrekt

---

## 🔄 Test 4: Real-time Features

### 4.1 Real-time Messages
**Setup:** 2 Browser-Tabs
- Tab 1: User-Chat
- Tab 2: Admin Panel (Session selected)

**Test:**
1. Tab 1 (User): Sende Nachricht
2. **Expected:** Tab 2 (Admin) zeigt sofort neue Nachricht
3. Tab 2 (Admin): Sende Antwort
4. **Expected:** Tab 1 (User) zeigt sofort Antwort

### 4.2 Typing Indicator
1. Tab 1 (User): Tippe in Input-Feld (nicht senden)
2. **Expected:** Tab 2 (Admin) zeigt "typing..." indicator
3. Tab 2 (Admin): Tippe
4. **Expected:** Tab 1 (User) zeigt "typing..." indicator

### 4.3 Online Status
1. Tab 1 (User): Chat schließen (X)
2. **Expected:** 
   - Tab 2 (Admin): Online-Status wird grau/offline
   - Stats: "Active" Count -1
3. Tab 1: Chat wieder öffnen
4. **Expected:** Tab 2 zeigt wieder "Online"

**✅ Test 4 Checklist:**
- [ ] Messages erscheinen real-time
- [ ] Typing indicator funktioniert (beide Richtungen)
- [ ] Online/Offline Status aktualisiert sich
- [ ] Stats (Active/Unread) updaten automatisch

---

## 🗄️ Test 5: Persistenz & Session Management

### 5.1 Session Persistenz (localStorage)
1. User-Chat öffnen, Nachricht senden
2. Browser-Tab schließen (komplett)
3. Neuen Tab öffnen: `http://localhost:3000`
4. Chat-Button klicken
5. **Expected:**
   - Gleiche Session wird geladen
   - Alte Nachrichten sichtbar
   - Gleicher Name
   - Kein erneuter Name-Input

### 5.2 MongoDB Persistenz
1. Server stoppen: `Ctrl+C`
2. Server neu starten: `npm run dev`
3. Chat öffnen
4. **Expected:**
   - Alte Nachrichten sind noch da (aus DB)
   - Session wurde wiederhergestellt

### 5.3 Neue Session nach Cache-Clear
1. Browser: F12 → Application → Local Storage → Clear
2. Seite neu laden
3. Chat öffnen
4. **Expected:**
   - Name-Input erscheint (neue Session)
   - Alte Messages NICHT sichtbar (neue Session ID)

**✅ Test 5 Checklist:**
- [ ] localStorage speichert Session
- [ ] MongoDB speichert Messages
- [ ] Session überlebt Server-Restart
- [ ] Cache-Clear = Neue Session

---

## 🐛 Test 6: Error Handling

### 6.1 MongoDB Offline
1. MongoDB stoppen: `sudo systemctl stop mongodb`
2. Server neu starten: `npm run dev`
3. **Expected:**
   - Server startet mit Error-Log
   - Chat öffnet aber (Frontend funktioniert)
   - Messages können nicht gespeichert werden

### 6.2 Socket.io Disconnect
1. Browser: Network Tab → Offline
2. Chat: Nachricht senden
3. **Expected:**
   - "Reconnecting..." Status erscheint
   - Nachricht wird nicht gesendet
4. Network: Online
5. **Expected:** Auto-reconnect

### 6.3 Invalid Session ID
1. LocalStorage: Ändere `chatSessionId` zu "invalid-123"
2. Chat öffnen
3. **Expected:**
   - Neue Session wird erstellt
   - Kein Crash

**✅ Test 6 Checklist:**
- [ ] MongoDB Errors werden gehandled
- [ ] Socket Disconnect zeigt Status
- [ ] Auto-reconnect funktioniert
- [ ] Invalid Session ID = neue Session

---

## 📱 Test 7: Responsive & Mobile

### 7.1 Mobile View (Chrome DevTools)
1. F12 → Device Toolbar (Responsive Mode)
2. Wähle iPhone/Android
3. **Expected:**
   - Chat Button sichtbar
   - Chat öffnet fullscreen
   - Input nicht von Keyboard verdeckt

### 7.2 Admin Panel Mobile
1. Mobile View: `http://localhost:3000/admin/chat`
2. **Expected:**
   - Session-Liste fullwidth
   - Session klicken → Chat fullscreen
   - Close-Button (X) zurück zur Liste

**✅ Test 7 Checklist:**
- [ ] Chat funktioniert auf Mobile
- [ ] Admin Panel responsive
- [ ] Touch-Events funktionieren
- [ ] Keyboard blockiert nicht Input

---

## 🎨 Test 8: UI/UX Details

### 8.1 Visual Polish
- [ ] Chat Button: Hover-Effect funktioniert
- [ ] Unread Badge: Animiert (pulse)
- [ ] Message Bubbles: Schatten & Rounded Corners
- [ ] Timestamps: Korrekt formatiert
- [ ] Typing Indicator: 3 Dots animiert
- [ ] Scroll: Auto-scroll zu neuen Messages

### 8.2 Dark Mode Details
- [ ] Chat-Hintergrund: #090909 (sehr dunkel)
- [ ] Borders: #262626 (subtil)
- [ ] Text: Weiß (#ffffff)
- [ ] Kein Transparency-Bleed
- [ ] Admin Panel: Gleiche Farben

**✅ Test 8 Checklist:**
- [ ] Alle Hover-Effects funktionieren
- [ ] Animationen smooth
- [ ] Dark Mode konsistent
- [ ] Auto-scroll funktioniert

---

## ✅ Final Checklist - Production Ready

### Frontend
- [ ] Chat öffnet/schließt korrekt
- [ ] Messages werden gesendet/empfangen
- [ ] Real-time updates funktionieren
- [ ] Dark/Light Mode ohne Fehler
- [ ] Responsive auf allen Devices
- [ ] Keine Console Errors
- [ ] Keine Hydration Mismatches

### Backend
- [ ] MongoDB Connection stabil
- [ ] Socket.io Events funktionieren
- [ ] Admin Events (admin:join, admin:message) funktionieren
- [ ] Server-Logs zeigen alle Events
- [ ] Keine Memory Leaks (PM2 monit)

### Admin Panel
- [ ] Sessions werden gelistet
- [ ] Stats (Active/Unread) korrekt
- [ ] Chat-Ansicht funktioniert
- [ ] Admin kann antworten
- [ ] Typing indicator beide Richtungen
- [ ] Connection Status sichtbar

### Performance
- [ ] Page Load < 2s
- [ ] Message Send < 200ms
- [ ] Socket Reconnect < 1s
- [ ] No lag bei 10+ Messages

---

## 🚀 Ready for Production?

**Wenn alle Tests ✅ sind:**
```bash
# Build für Production
npm run build

# Mit PM2 starten
pm2 start ecosystem.config.js --env production

# Monitoring
pm2 logs
pm2 monit

# Production URL testen
https://your-domain.com
```

**Siehe:** `DEPLOYMENT.md` für vollständige Deployment-Anleitung!

---

## 🆘 Troubleshooting

### Console Errors?
- Check Browser Console (F12)
- Check Server Logs (Terminal)
- Check PM2 Logs: `pm2 logs`

### Socket nicht connected?
- Check `.env.local`: `NEXT_PUBLIC_SOCKET_URL`
- Check CORS in `server.js`
- Check Firewall/Network

### Messages nicht gespeichert?
- Check MongoDB Connection
- Check API Routes: Network Tab (F12)
- Check `MONGODB_URI` in `.env.local`

### Admin Panel leer?
- User-Chat öffnen & Message senden
- Check API: `/api/chat/sessions`
- Check MongoDB: Sessions Collection

---

**Happy Testing! 🎉**
