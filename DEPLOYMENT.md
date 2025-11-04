# 🚀 Deployment Guide - Live Chat System

## 📋 Voraussetzungen

- Node.js 18+ installiert
- MongoDB installiert (lokal oder Cloud wie MongoDB Atlas)
- PM2 global installiert: `npm install -g pm2`
- (Optional) Nginx als Reverse Proxy für SSL

---

## 🔧 Setup für Production

### 1. Environment Variables einrichten

Erstelle eine `.env.local` Datei im Root:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Socket.io URL (WICHTIG!)
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com

# Server Port
PORT=3000

# Node Environment
NODE_ENV=production
```

**⚠️ WICHTIG:** `NEXT_PUBLIC_SOCKET_URL` muss deine Production-Domain sein!

---

### 2. Build für Production

```bash
npm run build
```

Dies erstellt einen optimierten Production-Build in `.next/`

---

### 3. MongoDB Setup

**Option A: MongoDB Atlas (Cloud - Empfohlen)**
1. Gehe zu [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Erstelle kostenlosen Cluster
3. Erstelle Database User
4. Whitelist deine Server-IP
5. Kopiere Connection String in `.env.local`

**Option B: Lokale MongoDB**
```bash
# Installation (Ubuntu/Debian)
sudo apt install mongodb

# Starten
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Connection String
MONGODB_URI=mongodb://localhost:27017/chat-database
```

---

### 4. Server starten mit PM2

**Development (lokal testen):**
```bash
npm run dev
```

**Production:**
```bash
# Mit PM2 starten
pm2 start ecosystem.config.js --env production

# Status checken
pm2 status

# Logs ansehen
pm2 logs hoffmann-niklas-chat

# Server neustarten
pm2 restart hoffmann-niklas-chat

# Server stoppen
pm2 stop hoffmann-niklas-chat

# PM2 beim System-Start automatisch starten
pm2 startup
pm2 save
```

---

### 5. Nginx Reverse Proxy (für SSL)

Erstelle Nginx Config: `/etc/nginx/sites-available/your-domain.com`

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket Support für Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Aktivieren:**
```bash
sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**SSL Zertifikat mit Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🧪 Testing Checklist

### Lokal (Development)
- [ ] `npm run dev` startet Server erfolgreich
- [ ] MongoDB Verbindung funktioniert
- [ ] Chat öffnet sich beim Klick
- [ ] Name-Input erscheint beim ersten Mal
- [ ] Nachrichten werden gesendet
- [ ] Socket.io "Connected" Status
- [ ] Admin Panel zeigt Sessions
- [ ] Admin kann antworten
- [ ] Dark/Light Mode funktioniert

### Production (VPS)
- [ ] `pm2 start` läuft ohne Fehler
- [ ] `pm2 logs` zeigt "Server running on port 3000"
- [ ] MongoDB Cloud Connection funktioniert
- [ ] HTTPS funktioniert (SSL-Zertifikat gültig)
- [ ] WebSocket Verbindung erfolgreich
- [ ] Chat funktioniert über Domain
- [ ] Admin Panel über `/admin/chat` erreichbar

---

## 🔍 Troubleshooting

### Problem: Socket.io verbindet nicht
**Lösung:**
- Check `.env.local`: `NEXT_PUBLIC_SOCKET_URL` muss korrekt sein
- Check Nginx Config: WebSocket-Headers gesetzt?
- Check Firewall: Port 3000 offen?

### Problem: MongoDB Connection Error
**Lösung:**
- Check `MONGODB_URI` Syntax
- MongoDB Atlas: IP whitelisted?
- Lokale MongoDB: Läuft der Service? `sudo systemctl status mongodb`

### Problem: Chat Widget erscheint nicht
**Lösung:**
- Browser Console öffnen (F12)
- Check für Errors
- Verify `NEXT_PUBLIC_SOCKET_URL` ist gesetzt

### Problem: Admin Panel 404
**Lösung:**
- Build neu erstellen: `npm run build`
- PM2 neustarten: `pm2 restart all`

---

## 📊 Monitoring

### PM2 Monitoring
```bash
# Real-time Monitoring
pm2 monit

# Status aller Apps
pm2 status

# Logs
pm2 logs hoffmann-niklas-chat --lines 100

# Memory & CPU Usage
pm2 describe hoffmann-niklas-chat
```

### MongoDB Monitoring
```bash
# MongoDB Atlas: Dashboard verwenden
# Lokale MongoDB: mongosh verwenden

mongosh
use chat-database
db.chatsessions.countDocuments()  // Anzahl Sessions
db.chatmessages.countDocuments()  // Anzahl Messages
```

---

## 🎯 Performance Tipps

1. **MongoDB Indexes:**
```javascript
db.chatsessions.createIndex({ sessionId: 1 })
db.chatmessages.createIndex({ sessionId: 1, timestamp: -1 })
```

2. **PM2 Cluster Mode:**
Bereits konfiguriert in `ecosystem.config.js` (1 Instance)

3. **Nginx Caching:**
Statische Assets cachen (bereits in Config)

4. **Environment:**
`NODE_ENV=production` für optimierte Performance

---

## 🔐 Security

1. **MongoDB:** Nicht public machen, User mit minimal permissions
2. **Environment Variables:** `.env.local` NICHT committen!
3. **Admin Panel:** Später Auth hinzufügen (Login-Schutz)
4. **HTTPS:** Immer SSL nutzen (Let's Encrypt kostenlos)
5. **Rate Limiting:** Bei Bedarf hinzufügen

---

## 🚀 Quick Start Commands

```bash
# 1. Clone & Install
git pull
npm install

# 2. Environment Setup
cp .env.example .env.local
# Edit .env.local mit deinen Werten

# 3. Build
npm run build

# 4. Start Production
pm2 start ecosystem.config.js --env production

# 5. Check Status
pm2 status
pm2 logs

# Done! 🎉
```

---

## 📝 Nächste Schritte (Optional)

- [ ] Admin-Login/Auth implementieren
- [ ] Email-Notifications bei neuen Messages
- [ ] Chat-Archive/Export Funktion
- [ ] Rate Limiting für Spam-Schutz
- [ ] Analytics/Metrics Dashboard
- [ ] File-Upload im Chat
- [ ] Multi-Language Support für Chat
- [ ] Push Notifications (Browser)

---

**Support:** Bei Fragen check die Logs oder MongoDB Connection!
