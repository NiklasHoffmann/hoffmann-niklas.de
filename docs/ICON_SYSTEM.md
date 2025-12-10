# Icon Caching System

## Übersicht

Dieses Projekt verwendet ein **lokales Icon-Caching-System** anstelle von externen Iconify API-Aufrufen. Dies eliminiert CORS-Probleme und verbessert die Performance.

## Vorteile

- ✅ **Keine CORS-Fehler** - Alle Icons werden lokal gehostet
- ⚡ **Schnellere Ladezeiten** - Keine externen API-Aufrufe
- 🌐 **Offline-Funktionsfähig** - Icons funktionieren ohne Internetverbindung
- 🎨 **Theme-Kompatibel** - Icons verwenden `currentColor` und passen sich automatisch an Dark/Light Mode an
- 📦 **Organisiert** - Icons sind nach Kategorien strukturiert

## Struktur

```
scripts/
  └── cache-icons.js          # Icon-Download-Script
public/
  └── icons/                  # Gecachte SVG-Icons
      ├── brand-react.svg
      ├── ui-chevron-right.svg
      ├── timeline-rocket.svg
      └── ...
src/
  └── components/
      └── icons/
          └── LocalIcon.tsx   # Icon-Komponente (Drop-in Replacement für @iconify/react)
```

## Icon-Kategorien

Die Icons sind in folgende Kategorien organisiert:

### 1. **Brands** (13 Icons)
Tech Stack & Brand Logos
- React, Next.js, TypeScript, Tailwind CSS, Node.js, Ethereum, Figma, Express, MongoDB, WalletConnect

### 2. **Services** (2 Icons)
Service Section Icons
- Cube/Grid Toggle

### 3. **UI** (7 Icons)
UI-Elemente & Navigation
- Chevrons, Menu, Close, Send, Lightning, Lightbulb

### 4. **Timeline** (3 Icons)
About Section Timeline
- Rocket, Briefcase, Code

### 5. **Highlights** (5 Icons)
About Section Highlights
- Web, Palette, API, Database, Responsive

### 6. **Chat** (4 Icons)
Chat Widget
- Bubble, Close, Maximize, Minimize

### 7. **Admin** (8 Icons)
Admin Panel
- User, Message, Shield, Clock, Delete, Check, Alert, Loader

### 8. **Legal** (5 Icons)
Legal Pages
- Document, Gavel, Shield, Cookie, Lock

**Total: 47 Icons**

## Verwendung

### Icon-Komponente

Die `Icon`-Komponente ist ein vollständiger Drop-in-Replacement für `@iconify/react`:

```tsx
import { Icon } from '@/components/icons/LocalIcon';

// Verwendung genau wie @iconify/react
<Icon icon="mdi:chevron-right" className="w-6 h-6" />
<Icon icon="logos:react" width={24} height={24} />
<Icon icon="mdi:loading" width="1em" height="1em" />
```

### Props

- `icon` (string, required) - Iconify icon name (z.B. 'mdi:chat', 'logos:react')
- `className` (string, optional) - CSS classes
- `width` (string | number, optional) - Breite (px oder "1em")
- `height` (string | number, optional) - Höhe (px oder "1em")
- `style` (CSSProperties, optional) - Inline styles

## Scripts

### Icons manuell aktualisieren
```bash
npm run cache-icons
```

### Automatisches Caching
Icons werden automatisch gecacht bei:
- `npm run dev` (predev hook)
- `npm run build` (prebuild hook)

## Neues Icon hinzufügen

1. **Icon zur Kategorie in `scripts/cache-icons.js` hinzufügen:**

```javascript
const iconCategories = {
    ui: [
        // ...existing icons
        { name: 'mdi:new-icon', filename: 'ui-new-icon.svg' },
    ],
};
```

2. **Mapping in `src/components/icons/LocalIcon.tsx` hinzufügen:**

```typescript
const ICON_MAP: Record<string, string> = {
    // ...existing mappings
    'mdi:new-icon': 'ui-new-icon',
};
```

3. **Icons neu cachen:**
```bash
npm run cache-icons
```

## Troubleshooting

### Icon wird nicht angezeigt
1. Prüfe Console auf Warnungen: `[LocalIcon] Icon not found in cache: ...`
2. Stelle sicher, dass Icon in `ICON_MAP` gemappt ist
3. Prüfe, ob SVG-Datei in `/public/icons/` existiert
4. Führe `npm run cache-icons` aus

### Dark Mode Farben falsch
- Icons sollten automatisch `currentColor` verwenden
- Prüfe, ob `fill="currentColor"` in SVG vorhanden ist (nicht `fill="#currentColor"`)
- Das Script ersetzt automatisch `#currentColor` mit `currentColor`

### Performance
- Icons werden als statische Assets von `/public/icons/` geladen
- Next.js optimiert automatisch den Asset-Delivery
- Durchschnittliche Icon-Größe: 200-500 bytes

## Migration von @iconify/react

Das Projekt wurde von `@iconify/react` migriert. Die `Icon`-Komponente ist zu 100% API-kompatibel, sodass keine Code-Änderungen in den Komponenten notwendig waren - nur Import-Pfade wurden angepasst:

**Vorher:**
```tsx
import { Icon } from '@iconify/react';
```

**Nachher:**
```tsx
import { Icon } from '@/components/icons/LocalIcon';
```

## Technische Details

- **SVG-Format:** Inline `<img>` Tags mit lokalen SVG-Pfaden
- **Farbsystem:** `currentColor` für automatische Theme-Anpassung
- **Größen:** Unterstützt px-Werte und "1em" für font-size-relative Skalierung
- **Caching:** Iconify API → Lokale Datei-Transformation
- **Build-Zeit:** Icons werden vor jedem Build/Dev-Start gecacht
