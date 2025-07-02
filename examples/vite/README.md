# ⚡ Vite Example

A modern Vite + React example showcasing fast development and optimized builds
with the Poker Hand Replay component.

## 🎯 What This Example Shows

- ✅ **Vite Integration** - Fast HMR and optimized builds
- ✅ **TypeScript Support** - Full type safety with Vite
- ✅ **ESM Support** - Modern ES modules usage
- ✅ **CSS Modules** - Scoped styling with Vite
- ✅ **Environment Variables** - Vite env configuration
- ✅ **Build Optimization** - Production-ready bundling

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📂 Project Structure

```
vite/
├── src/
│   ├── components/
│   │   └── PokerDemo.tsx       # Demo component
│   ├── styles/
│   │   └── PokerDemo.module.css # CSS modules
│   ├── App.tsx                 # Main app
│   ├── main.tsx               # Vite entry point
│   └── vite-env.d.ts          # Vite types
├── public/
│   └── vite.svg               # Vite logo
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

## ⚡ Vite Features

### Fast Hot Module Replacement

Vite provides instant updates during development:

```typescript
// Changes to this component update instantly
export const PokerDemo = () => {
  return (
    <PokerHandReplay
      handHistory={sampleHand}
      config={{ theme: "casino" }}
    />
  );
};
```

### CSS Modules Support

```css
/* PokerDemo.module.css */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.replayWrapper {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
}
```

### Environment Variables

```typescript
// Access Vite environment variables
const isDev = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL;

const config = {
  theme: isDev ? 'dark' : 'professional',
  enableSounds: !isDev, // Disable sounds in development
};
```

## 🔧 Configuration

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          poker: ['poker-hand-replay'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['poker-hand-replay'],
  },
});
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

## 🎨 Styling with CSS Modules

```tsx
import styles from './PokerDemo.module.css';

export const PokerDemo = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Poker Hand Replay</h1>
    <div className={styles.replayWrapper}>
      <PokerHandReplay handHistory={handHistory} className={styles.replay} />
    </div>
  </div>
);
```

## 📦 Production Build

Vite creates optimized production builds:

```bash
npm run build
# Output in dist/ directory

npm run preview
# Preview the production build
```

## 🔗 Useful Links

- [Vite Documentation](https://vitejs.dev/)
- [Vite React Plugin](https://github.com/vitejs/vite/tree/main/packages/plugin-react)
- [CSS Modules](https://github.com/css-modules/css-modules)

---

**Ready to build fast?** This example shows how Vite can accelerate your poker
app development!
