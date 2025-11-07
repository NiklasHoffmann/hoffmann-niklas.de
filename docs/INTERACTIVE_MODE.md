# Interactive Mode System - Best Practices

## 🏗️ Architecture Overview

The interactive mode system uses a **Context Provider pattern** to manage state centrally and avoid prop drilling.

### Key Components:

1. **InteractiveModeProvider** (`src/contexts/InteractiveModeContext.tsx`)
   - Single source of truth for interactive mode state
   - Handles localStorage persistence automatically
   - Provides `showActive` helper to prevent code duplication

2. **UI Constants** (`src/config/ui.constants.ts`)
   - Centralized configuration for transitions, colors, and sizes
   - Prevents magic numbers scattered across components

3. **Toggle Components** (`src/components/*Toggle.tsx`)
   - Simple, focused components that consume the context
   - No local state management or localStorage logic

## ✅ Best Practices

### 1. **Always use the Context Hook**
```tsx
// ✅ Good
const { showActive } = useInteractiveMode();

// ❌ Bad - Don't calculate this yourself
const showActive = mounted && isInteractive;
```

### 2. **Use Constants for Magic Numbers**
```tsx
// ✅ Good
import { TRANSITIONS } from '@/config/ui.constants';
className="transition-all duration-700"

// ❌ Bad
className="transition-all duration-700"  // Where does 700 come from?
```

### 3. **Memoize Expensive Calculations**
```tsx
// ✅ Good - Prevents unnecessary recalculations
const sections = useMemo(() => [
    { id: "hero", label: t('start'), color: neonColors[0] },
    // ...
], [neonColors, t]);

// ❌ Bad - Recalculates on every render
const sections = [
    { id: "hero", label: t('start'), color: neonColors[0] },
    // ...
];
```

### 4. **Keep Components Focused**
```tsx
// ✅ Good - Single responsibility
export function ThemeToggle() {
    const { showActive } = useInteractiveMode();
    const { theme, setTheme } = useTheme();
    // ...
}

// ❌ Bad - Too many concerns
export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const [isInteractive, setIsInteractive] = useState(true);
    useEffect(() => { /* localStorage logic */ });
    // ...
}
```

### 5. **Avoid Hydration Mismatches**
- Always use consistent SSR defaults
- Use the `mounted` flag from context when needed
- Never conditionally render different content based on `typeof window`

```tsx
// ✅ Good
const { mounted } = useInteractiveMode();
const colors = !mounted || theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

// ❌ Bad - Causes hydration mismatch
const colors = typeof window !== 'undefined' && theme === 'light' ? LIGHT_COLORS : DARK_COLORS;
```

## 🔄 How It Works

### On Initial Load (SSR):
1. `InteractiveModeProvider` starts with `SSR_DEFAULT = true`
2. Components render with this default (no hydration mismatch)
3. `mounted = false`, so `showActive = false` (no visual effects yet)

### After Hydration:
1. First `useEffect` runs, loads value from localStorage
2. `setMounted(true)` activates visual effects
3. `showActive` becomes `true` if interactive mode is enabled

### On State Change:
1. User clicks toggle → `setIsInteractive()` called
2. Context updates all consumers automatically
3. Second `useEffect` saves to localStorage

### On Language Change:
1. Route changes → Page remounts → Provider recreates
2. First `useEffect` loads saved value from localStorage
3. State restored seamlessly, no reset!

## 📝 Adding New Interactive Features

To add a new component that responds to interactive mode:

```tsx
'use client';

import { useInteractiveMode } from '@/contexts/InteractiveModeContext';

export function MyNewComponent() {
    const { showActive } = useInteractiveMode();
    
    return (
        <div className={showActive ? 'fancy-effects' : 'simple-style'}>
            {/* Your content */}
        </div>
    );
}
```

That's it! No localStorage, no useEffect, no mounted state. The context handles everything.

## 🚀 Performance Considerations

- **Context updates only when state changes** (not on every render)
- **useMemo** prevents unnecessary recalculations
- **showActive** is pre-computed in the provider
- **No event listeners** needed (removed CustomEvent pattern)

## 🧪 Testing Checklist

When making changes, verify:
- [ ] No hydration warnings in console
- [ ] Interactive mode persists across language changes
- [ ] No flash/blink on page load
- [ ] Toggle transitions are smooth (700ms)
- [ ] State saves to localStorage correctly
- [ ] All toggle buttons respond to interactive mode
