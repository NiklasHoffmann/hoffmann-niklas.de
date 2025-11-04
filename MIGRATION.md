# Migration vom separaten Express Server zu Next.js API Routes ✅

## Was wurde gemacht:

### ❌ Vorher (Kompliziert):
- **2 separate Server**: Next.js (Port 3000) + Express (Port 5000)
- **2x package.json** und 2x node_modules
- **Separates Deployment** notwendig
- **CORS-Konfiguration** erforderlich

### ✅ Jetzt (Einfach):
- **1 Server**: Alles in Next.js integriert
- **API Routes**: `src/app/api/contact/route.ts`
- **Einfaches Deployment**: z.B. auf Vercel
- **Kein CORS** notwendig (same-origin)

## Neue Struktur:

```
src/app/api/
├── contact/
│   ├── route.ts          # POST (create) & GET (list all)
│   └── [id]/
│       └── route.ts      # PATCH (mark as read)
```

## Environment Variables (.env.local):

```bash
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Email (Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password  # App-Passwort generieren!
RECIPIENT_EMAIL=niklas@hoffmann-niklas.de

# API URL (now internal)
NEXT_PUBLIC_API_URL=/api
```

## Gmail App-Passwort erstellen:

1. Google Account → Sicherheit
2. 2-Faktor-Authentifizierung aktivieren
3. App-Passwörter → "Sonstige" auswählen
4. Passwort kopieren und in `.env.local` einfügen

## API Endpoints:

### POST /api/contact
Sendet eine Kontaktanfrage:
```typescript
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "message": "Hallo, ich interessiere mich für..."
}
```

### GET /api/contact
Liste aller Kontaktanfragen (für Admin-Panel)

### PATCH /api/contact/[id]
Markiert Kontakt als gelesen

## Vorteile:

✅ **Einfacher**: Nur 1 Server statt 2
✅ **Schneller**: Keine Cross-Origin Requests
✅ **Günstiger**: Vercel Free Tier reicht aus
✅ **Wartbarer**: Alles in einem Projekt
✅ **Sicherer**: Keine externen API-Calls nötig

## Testing:

```bash
# Server starten
npm run dev

# API testen
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello World Test Message!"}'
```

## Deployment (Vercel):

```bash
# Environment Variables in Vercel Dashboard eintragen
vercel env add MONGODB_URI
vercel env add EMAIL_USER
vercel env add EMAIL_PASSWORD
vercel env add RECIPIENT_EMAIL

# Deploy
vercel --prod
```

## Migration abgeschlossen! 🎉

Der alte `server/` Ordner wurde gelöscht.
Alle Funktionen sind jetzt in Next.js API Routes integriert.
