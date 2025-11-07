# Transitions Management

## Globale Transition-Verwaltung

Alle Transitions werden zentral verwaltet, um konsistente Animationen über die gesamte App zu gewährleisten.

## CSS Variables (globals.css)

```css
:root {
  --transition-fast: 300ms;      /* Schnelle Interaktionen (Hover, Header) */
  --transition-standard: 500ms;  /* Standard UI Elemente */
  --transition-slow: 700ms;      /* Theme, Language, Interactive Toggle */
}
```

### Globale Overrides

Alle Tailwind `.transition-all` und `.transition-colors` Klassen nutzen automatisch `--transition-slow` (700ms):

```css
.transition-all {
  transition-duration: var(--transition-slow) !important;
}

.transition-colors {
  transition-duration: var(--transition-slow) !important;
}
```

## TypeScript Constants (ui.constants.ts)

```typescript
export const TRANSITIONS = {
  FAST: 300,      // 300ms - Schnelle Interaktionen
  STANDARD: 500,  // 500ms - Standard UI
  SLOW: 700,      // 700ms - Toggle Changes
} as const;
```

## Toggle Components

Alle drei Toggle-Komponenten nutzen **700ms Transitions**:

### ThemeToggle
- Button: `duration-700 ease-in-out`
- Icons: `duration-700 ease-in-out`
- Glow Effect: `duration-700 ease-in-out`

### LanguageToggle
- Button: `duration-700`
- Text: `duration-700`
- Glow Effect: `duration-700`

### InteractiveToggle
- Button: `duration-700`
- Icons: `duration-700`
- Glow Effect: `duration-700`

## Transitions Ändern

### Methode 1: Globale CSS Variable ändern (empfohlen)

```css
/* In globals.css */
:root {
  --transition-slow: 500ms; /* Von 700ms auf 500ms */
}
```

✅ **Vorteil**: Eine Änderung betrifft alle Komponenten
✅ **Konsistent**: Body, Toggles, und alle .transition-all nutzen den gleichen Wert

### Methode 2: Tailwind Config erweitern

```typescript
// In tailwind.config.ts
theme: {
  extend: {
    transitionDuration: {
      '700': '700ms',  // Hier anpassen
    },
  },
}
```

### Methode 3: TypeScript Konstante (nur für JS-Code)

```typescript
// In ui.constants.ts
export const TRANSITIONS = {
  SLOW: 500,  // Von 700 auf 500
} as const;
```

⚠️ **Achtung**: Betrifft nur JS-Code, nicht CSS/Tailwind

## Best Practices

1. **Immer duration-700 für Toggles nutzen**: Konsistente UX
2. **CSS Variable für globale Änderungen**: Einfachste Verwaltung
3. **Dokumentation aktualisieren**: Bei Änderungen dieser Datei anpassen

## Beispiel: Toggle Transition Flow

```
User klickt Toggle
    ↓
State ändert sich (React)
    ↓
CSS Klassen ändern sich
    ↓
transition-all duration-700
    ↓
Smooth Animation (700ms)
    ↓
Neuer State sichtbar
```

## Affected Components

### Mit 700ms Transition:
- ✅ ThemeToggle (Button, Icon, Glow)
- ✅ LanguageToggle (Button, Text, Glow)
- ✅ InteractiveToggle (Button, Icon, Glow)
- ✅ ServicesSection (Cube, Grid Cards)
- ✅ ChainBackground (Opacity)
- ✅ Body (Background, Foreground)
- ✅ ContactSection (Form inputs, Buttons)

### Mit anderen Durations:
- Header Navigation: 300ms (schnellere Response)
- Hover Effects: Nutzt globale .transition-all (700ms)

## Debugging

Wenn Transitions nicht funktionieren:

1. **Browser DevTools öffnen**
2. **Element inspizieren**
3. **Computed Styles checken**: Sollte `transition-duration: 700ms` zeigen
4. **CSS Variable prüfen**: `getComputedStyle(document.documentElement).getPropertyValue('--transition-slow')`

```javascript
// In Browser Console
console.log(
  getComputedStyle(document.documentElement)
    .getPropertyValue('--transition-slow')
); // Sollte "700ms" sein
```
