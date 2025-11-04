# Chain Background - Konfigurations-Guide

## Verwendung

Die `ChainBackground`-Komponente ist jetzt vollständig konfigurierbar mit verschiedenen Presets und individuellen Einstellungen.

### Basic Usage (Standard Panzer-Kette)

```tsx
import { ChainBackground } from '@/components/ChainBackground';

<ChainBackground />
```

### Presets verwenden

Es gibt 5 vordefinierte Presets:

#### 1. **Default** (Aktuelle Konfiguration - Panzer-Stil)
```tsx
<ChainBackground preset="default" />
```
- horizontalOffset: 200px
- curveSize: 125px  
- linkWidth: 5px
- linkHeight: 11px
- spacing: 7px
- style: 'panzer' (detailliert mit Glanzeffekten)

#### 2. **Compact** (Kompakter Panzer-Stil)
```tsx
<ChainBackground preset="compact" />
```
- horizontalOffset: 150px
- curveSize: 80px
- linkWidth: 4px
- linkHeight: 9px
- spacing: 6px
- Ideal für mobile oder kleinere Ansichten

#### 3. **Bold** (Große, auffällige Kette)
```tsx
<ChainBackground preset="bold" />
```
- horizontalOffset: 250px
- curveSize: 150px
- linkWidth: 7px
- linkHeight: 14px
- spacing: 9px
- style: 'bold' (kräftiger Stil mit starken Schatten)

#### 4. **Minimal** (Minimalistischer Stil)
```tsx
<ChainBackground preset="minimal" />
```
- horizontalOffset: 100px
- curveSize: 60px
- linkWidth: 3px
- linkHeight: 7px
- spacing: 5px
- style: 'minimal' (sehr schlicht, dünne Linien)

#### 5. **Classic** (Klassischer Kettenstil)
```tsx
<ChainBackground preset="classic" />
```
- horizontalOffset: 180px
- curveSize: 100px
- linkWidth: 6px
- linkHeight: 12px
- spacing: 8px
- style: 'classic' (einfache Kettenglieder mit Schatten)

### Custom Configuration

Du kannst auch individuelle Werte überschreiben:

```tsx
<ChainBackground 
  preset="default"
  customConfig={{
    horizontalOffset: 300,  // Weiter vom Rand
    curveSize: 200,         // Größere Kurven
    linkWidth: 8,           // Dickere Glieder
  }}
/>
```

Oder komplett eigene Konfiguration:

```tsx
<ChainBackground 
  customConfig={{
    horizontalOffset: 120,
    curveSize: 90,
    sectionPadding: 50,
    linkWidth: 4,
    linkHeight: 10,
    spacing: 6,
    style: 'panzer',  // oder 'classic', 'minimal', 'bold'
  }}
/>
```

## Verfügbare Chain-Stile

### 1. **Panzer** (Default)
- Detaillierte 3D-Optik mit Glanzeffekten
- Alternierende Z-Order (vorne/hinten)
- Silberne Gradienten
- Lichtreflexionen und Schatten

### 2. **Classic**
- Einfache Kettenglieder
- Einzelne Farbe mit Schatten
- Saubere Kontur

### 3. **Minimal**
- Sehr schlicht
- Dünne Linien
- Keine Schatten
- Perfekt für moderne, cleane Designs

### 4. **Bold**
- Kräftig und auffällig
- Starke Schatten
- Radialer Gradient
- Dicke Kontur

## Konfigurations-Parameter

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `horizontalOffset` | number | Abstand der Kette vom linken/rechten Rand |
| `curveSize` | number | Radius der Kurven zwischen Sections |
| `sectionPadding` | number | Abstand vom Ende einer Section |
| `linkWidth` | number | Breite (Dicke) der einzelnen Kettenglieder |
| `linkHeight` | number | Länge der einzelnen Kettenglieder |
| `spacing` | number | Abstand zwischen den Kettengliedern |
| `style` | 'panzer' \| 'classic' \| 'minimal' \| 'bold' | Visual Style |

## Beispiel-Kombinationen

### Subtile Chain für Text-lastige Seiten
```tsx
<ChainBackground 
  preset="minimal"
  customConfig={{
    horizontalOffset: 80,
    spacing: 8,
  }}
/>
```

### Auffällige Hero-Chain
```tsx
<ChainBackground 
  preset="bold"
  customConfig={{
    horizontalOffset: 350,
    curveSize: 180,
  }}
/>
```

### Mobile-optimiert
```tsx
<ChainBackground 
  preset="compact"
  customConfig={{
    horizontalOffset: 100,
    curveSize: 60,
  }}
/>
```

## Implementation in page.tsx

Aktuell in `src/app/[locale]/page.tsx`:

```tsx
import { ChainBackground } from "@/components/ChainBackground";

export default function HomePage() {
    return (
        <>
            <Header />
            {/* Default Preset */}
            <ChainBackground />
            
            {/* Oder mit Custom Config */}
            {/* <ChainBackground preset="bold" /> */}
            
            <main className="relative z-10">
                {/* ... Sections */}
            </main>
        </>
    );
}
```

## Farben anpassen

Die Farben sind in `src/types/chain.ts` unter `CHAIN_COLORS` definiert und können dort zentral angepasst werden.

```typescript
export const CHAIN_COLORS: ChainColorConfig = {
  panzer: {
    outerStroke: '#52525b',  // Ändern für andere Farbe
    // ...
  },
  // ...
};
```
