# 🛠️ Development Guide

Entwickler-Dokumentation für die Arbeit am Projekt.

## Inhaltsverzeichnis
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code-Style & Conventions](#code-style--conventions)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Ersteinrichtung

```bash
# 1. Repository klonen
git clone https://github.com/NiklasHoffmann/hoffmann-niklas.de.git
cd hoffmann-niklas.de

# 2. Node Modules installieren
npm install

# 3. Environment Variables einrichten
cp .env.example .env.local
# Dann .env.local mit echten Werten füllen

# 4. MongoDB lokal starten (oder Cloud-URL verwenden)
# Via Docker:
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# 5. Development Server starten
npm run dev
```

**Wichtig:** Der Development-Server startet Next.js UND Socket.io gleichzeitig via `server.js`.

### Umgebungsvariablen

Erstelle `.env.local` im Root-Verzeichnis:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/portfolio

# Socket.io URL (für Client-Side)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Optional: Email Benachrichtigungen
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@example.com
```

---

## Development Workflow

### Server starten

```bash
# Development Mode (Hot Reload)
npm run dev

# Production Build testen
npm run build
npm run start

# PM2 Production Mode
npm run pm2:start
npm run pm2:logs    # Logs ansehen
npm run pm2:monit   # Monitoring
npm run pm2:stop    # Stoppen
```

### File Watching

**Next.js Hot Reload:**
- React Components: ✅ Auto-Reload
- API Routes: ✅ Auto-Reload
- Styles: ✅ Auto-Reload

**Socket.io Server:**
- `server.js`: ❌ Manueller Restart erforderlich
- Änderungen → `Ctrl+C` → `npm run dev`

**Workaround für Socket.io:**
```bash
# Terminal 1: Socket.io mit nodemon
npm install -g nodemon
nodemon server.js

# Terminal 2: Next.js
npx next dev
```

### Browser DevTools

**React DevTools:**
```bash
# Chrome Extension installieren
# Dann: F12 → Components Tab
```

**Redux DevTools (falls später Redux hinzugefügt wird):**
```bash
npm install --save-dev @redux-devtools/extension
```

**Socket.io Debugging:**
```typescript
// In Browser Console:
localStorage.debug = 'socket.io-client:socket';
// Dann Seite neu laden
```

---

## Code-Style & Conventions

### TypeScript

**Strict Mode aktiviert:**
```json
// tsconfig.json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

**Type Definitions:**
```typescript
// ✅ Gut: Explizite Types
interface UserProps {
  name: string;
  age: number;
}

function greet({ name, age }: UserProps): string {
  return `Hello ${name}, you are ${age} years old`;
}

// ❌ Schlecht: Implizite any
function greet(user) {
  return `Hello ${user.name}`;
}
```

### Component Structure

**Functional Components mit TypeScript:**
```typescript
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  count?: number; // Optional
}

const MyComponent: FC<MyComponentProps> = ({ title, count = 0 }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
    </div>
  );
};

export default MyComponent;
```

**Hooks Order:**
```typescript
function MyComponent() {
  // 1. State Hooks
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // 2. Context Hooks
  const { user } = useAuth();

  // 3. Custom Hooks
  const { sessions } = useAdminChat();

  // 4. useEffect
  useEffect(() => {
    // Side effects
  }, []);

  // 5. Event Handlers
  const handleClick = () => {
    setCount(count + 1);
  };

  // 6. Render
  return <div onClick={handleClick}>{count}</div>;
}
```

### Naming Conventions

**Files:**
```
PascalCase:    Component.tsx, Page.tsx
camelCase:     utils.ts, api.ts, hooks.ts
kebab-case:    my-component.module.css
UPPER_CASE:    CONSTANTS.ts, README.md
```

**Variables & Functions:**
```typescript
// Components: PascalCase
const UserProfile = () => {};

// Functions: camelCase
function fetchUserData() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// Private Functions: _prefixed (optional)
function _internalHelper() {}

// Boolean Variables: is/has/should prefix
const isLoading = true;
const hasError = false;
const shouldRender = true;
```

**Event Handlers:**
```typescript
// Prefix: handle
const handleSubmit = () => {};
const handleInputChange = () => {};

// In Props: Prefix on
<Component onSubmit={handleSubmit} onChange={handleInputChange} />
```

### Import Order

```typescript
// 1. React & Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. External Libraries
import axios from 'axios';
import { io } from 'socket.io-client';

// 3. Internal Modules (@/ alias)
import { ChatMessage } from '@/types/chat';
import { fetchChatSessions } from '@/lib/chatApi';
import { formatChatTime } from '@/lib/chatUtils';

// 4. Components
import SessionList from '@/components/admin/SessionList';
import Button from '@/components/ui/Button';

// 5. Styles
import styles from './Component.module.css';
```

### Tailwind CSS

**Utility-First:**
```tsx
// ✅ Gut: Tailwind Utilities
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">

// ❌ Schlecht: Inline Styles
<div style={{ display: 'flex', padding: '16px', backgroundColor: 'white' }}>
```

**Conditional Classes:**
```typescript
// clsx/cn Helper
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  isActive && "active-class",
  isPrimary ? "primary-class" : "secondary-class"
)} />
```

**Responsive Design:**
```tsx
<div className="
  text-sm md:text-base lg:text-lg
  p-2 md:p-4 lg:p-6
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
```

### JSDoc Comments

**Functions:**
```typescript
/**
 * Fetches user data from API
 * 
 * @param userId - Unique user identifier
 * @param options - Optional fetch configuration
 * @returns Promise resolving to user data
 * @throws {Error} If user not found
 * 
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
async function fetchUser(userId: string, options?: FetchOptions): Promise<User> {
  // Implementation
}
```

**Complex Interfaces:**
```typescript
/**
 * Chat message data structure
 * 
 * @interface ChatMessage
 * @property {string} _id - MongoDB document ID
 * @property {string} sessionId - Associated chat session
 * @property {string} message - Message content (max 5000 chars)
 * @property {'user' | 'admin'} sender - Message sender type
 * @property {Date} timestamp - Message creation time
 * @property {boolean} isRead - Read status flag
 */
interface ChatMessage {
  _id: string;
  sessionId: string;
  message: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  isRead: boolean;
}
```

---

## Testing

### Test-Setup (Coming Soon)

```bash
# Install Testing Libraries
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Install Playwright für E2E
npm install --save-dev @playwright/test
```

### Unit Tests

```typescript
// utils.test.ts
import { formatChatTime } from '@/lib/chatUtils';

describe('formatChatTime', () => {
  it('formats date to HH:MM', () => {
    const date = new Date('2025-01-04T14:30:00Z');
    expect(formatChatTime(date)).toBe('14:30');
  });

  it('handles ISO string input', () => {
    expect(formatChatTime('2025-01-04T14:30:00Z')).toBe('14:30');
  });
});
```

### Integration Tests

```typescript
// api.test.ts
import { fetchChatSessions } from '@/lib/chatApi';

describe('Chat API', () => {
  it('fetches sessions successfully', async () => {
    const sessions = await fetchChatSessions();
    expect(Array.isArray(sessions)).toBe(true);
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test('user can send message', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Open chat
  await page.click('[data-testid="chat-widget"]');
  
  // Enter name
  await page.fill('input[name="userName"]', 'Test User');
  await page.click('button[type="submit"]');
  
  // Send message
  await page.fill('textarea', 'Hello!');
  await page.click('button[aria-label="Send"]');
  
  // Verify message appears
  await expect(page.locator('text=Hello!')).toBeVisible();
});
```

---

## Git Workflow

### Branch Strategy

```bash
# Main Branch
master           # Production-ready code

# Feature Branches
feature/chat-notifications
feature/admin-dashboard

# Bugfix Branches
fix/message-rendering
fix/socket-reconnect

# Release Branches (optional)
release/v1.0.0
```

### Commit Messages (Conventional Commits)

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Build process, dependencies

**Examples:**
```bash
# Feature
git commit -m "feat(chat): add typing indicators"

# Bug Fix
git commit -m "fix(admin): correct unread count calculation"

# Documentation
git commit -m "docs: update API reference with new endpoints"

# Breaking Change
git commit -m "feat(api)!: change session response format

BREAKING CHANGE: Session API now returns nested user object"
```

### Pull Request Workflow

```bash
# 1. Create Feature Branch
git checkout -b feature/new-feature

# 2. Make Changes & Commit
git add .
git commit -m "feat: add new feature"

# 3. Push to Remote
git push origin feature/new-feature

# 4. Open Pull Request on GitHub
# - Add description
# - Link related issues
# - Request review

# 5. After Approval: Squash & Merge
```

### Useful Git Commands

```bash
# Stash Changes
git stash
git stash pop

# Amend Last Commit
git commit --amend

# Interactive Rebase (clean up history)
git rebase -i HEAD~3

# Cherry-pick Commit
git cherry-pick <commit-hash>

# View Commit History
git log --oneline --graph --all

# Undo Last Commit (keep changes)
git reset --soft HEAD~1

# Discard All Changes
git reset --hard HEAD
```

---

## Troubleshooting

### Port bereits belegt

```bash
# Finde Prozess auf Port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### MongoDB Connection Error

```bash
# Check MongoDB Status
# Windows (Docker):
docker ps | grep mongo

# Restart Container:
docker restart mongodb

# Check Connection String:
echo $MONGODB_URI
```

### Socket.io Connection Failed

**Browser Console:**
```javascript
// Enable Debug Logging
localStorage.debug = 'socket.io-client:socket';

// Check Connection
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (err) => console.error('Error:', err));
```

**Server-Side:**
```javascript
// In server.js
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});
```

### Next.js Build Errors

```bash
# Clear .next Cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Type Check
npx tsc --noEmit

# Lint Check
npm run lint
```

### Hot Reload not working

```bash
# Check File Watchers Limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Windows: Restart Dev Server
# Ctrl+C
npm run dev
```

### TypeScript Errors in VSCode

```bash
# Restart TS Server
# VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Update TypeScript
npm install -D typescript@latest

# Check tsconfig.json
npx tsc --showConfig
```

---

## Performance Monitoring

### Next.js Analytics

```typescript
// Add to _app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### React DevTools Profiler

```bash
# In Browser:
# React DevTools → Profiler → Start Recording
# Perform Actions
# Stop Recording → Analyze Flame Graph
```

### Lighthouse Audit

```bash
# Chrome DevTools → Lighthouse → Generate Report
# Or use CLI:
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

---

## Helpful Resources

**Next.js:**
- [Next.js Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

**Socket.io:**
- [Socket.io Docs](https://socket.io/docs/v4/)
- [Emit Cheatsheet](https://socket.io/docs/v4/emit-cheatsheet/)

**MongoDB:**
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [Query Optimization](https://www.mongodb.com/docs/manual/core/query-optimization/)

**Tailwind CSS:**
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Playground](https://play.tailwindcss.com/)

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** Januar 2025  
**Autor:** Niklas Hoffmann
