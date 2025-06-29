# Poker Hand Replay

A React component library for parsing and replaying PokerStars hand histories with beautiful visual animations.

[![npm version](https://badge.fury.io/js/poker-hand-replay.svg)](https://badge.fury.io/js/poker-hand-replay)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🎯 **Parse PokerStars hand histories** with comprehensive format support
- 🎮 **Interactive replay controls** with play, pause, step-by-step navigation
- 🎨 **Customizable themes** (dark, light, auto) with CSS variables
- 📱 **Responsive design** that works on desktop and mobile
- ⚡ **Performance optimized** with React.memo and smart re-renders
- 🛡️ **Error boundaries** with graceful fallbacks and retry mechanisms
- 🔄 **Loading states** with progress indicators and skeleton UI
- 📦 **TypeScript ready** with full type definitions
- 🎪 **Multiple animation variants** for different visual styles
- ♿ **Accessible** with ARIA labels and keyboard navigation

## 📦 Installation

```bash
npm install poker-hand-replay
```

```bash
yarn add poker-hand-replay
```

```bash
pnpm add poker-hand-replay
```

## 🚀 Quick Start

```tsx
import React from 'react';
import { PokerHandReplay } from 'poker-hand-replay';

const handHistory = `
PokerStars Hand #123456789: Hold'em No Limit ($0.25/$0.50 USD) - 2024/01/01 12:00:00 ET
Table 'Example' 6-max Seat #1 is the button
Seat 1: Player1 ($50.00 in chips)
Seat 2: Player2 ($45.75 in chips)
...
`;

function App() {
  return (
    <PokerHandReplay 
      handHistory={handHistory}
      theme="dark"
      autoPlay={false}
      animationSpeed={1.5}
      onActionChange={(action, index) => {
        console.log('Current action:', action);
      }}
    />
  );
}

export default App;
```

## 🎮 API Reference

### `PokerHandReplay` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `handHistory` | `string` | **required** | Raw PokerStars hand history text |
| `config` | `ReplayConfig` | `{}` | Configuration options for replay behavior |
| `onActionChange` | `ActionChangeCallback` | `undefined` | Callback fired when current action changes |
| `onReplayEvent` | `ReplayEventCallback` | `undefined` | Callback for replay events (start, pause, etc.) |
| `className` | `string` | `''` | Custom CSS class for styling |
| `enableLoadingStates` | `boolean` | `true` | Enable loading indicators |
| `enableErrorRecovery` | `boolean` | `true` | Enable automatic error recovery |

### `ReplayConfig` Options

```typescript
interface ReplayConfig {
  autoPlay?: boolean;           // Auto-start replay (default: false)
  animationSpeed?: number;      // Speed multiplier (default: 1.0)
  theme?: 'dark' | 'light' | 'auto'; // Theme (default: 'dark')
  showAllCards?: boolean;       // Show all player cards (default: false)
  size?: 'small' | 'medium' | 'large'; // Component size (default: 'medium')
  tableShape?: 'oval' | 'rectangle'; // Table shape (default: 'oval')
  cardDesign?: 'standard' | 'four-color'; // Card design (default: 'standard')
  customColors?: Record<string, string>; // Custom color overrides
}
```

## 🎨 Theming

The component supports three built-in themes and custom color overrides:

```tsx
// Built-in themes
<PokerHandReplay theme="dark" />
<PokerHandReplay theme="light" />
<PokerHandReplay theme="auto" /> // Follows system preference

// Custom colors
<PokerHandReplay 
  theme="dark"
  config={{
    customColors: {
      '--poker-bg-primary': '#1a1a1a',
      '--poker-text-primary': '#ffffff',
      '--poker-accent': '#00ff88'
    }
  }}
/>
```

## 🔧 Advanced Usage

### Manual Parser Usage

```typescript
import { PokerStarsParser } from 'poker-hand-replay';

const parser = new PokerStarsParser();
const result = parser.parse(handHistoryString);

if (result.success) {
  console.log('Parsed hand:', result.hand);
  console.log('Players:', result.hand.players);
  console.log('Actions:', result.hand.actions);
} else {
  console.error('Parse error:', result.error);
}
```

### Error Handling

```tsx
import { PokerHandReplay, ErrorBoundary } from 'poker-hand-replay';

function CustomErrorFallback({ error, retry }) {
  return (
    <div>
      <h3>Something went wrong!</h3>
      <p>{error.message}</p>
      <button onClick={retry}>Try Again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary fallback={CustomErrorFallback}>
      <PokerHandReplay handHistory={handHistory} />
    </ErrorBoundary>
  );
}
```

### Loading States

```tsx
import { LoadingSpinner } from 'poker-hand-replay';

function CustomLoading() {
  return <LoadingSpinner variant="card" size="large" message="Loading hand..." />;
}

<PokerHandReplay 
  handHistory={handHistory}
  loadingComponent={CustomLoading}
/>
```

## 📋 TypeScript Support

Full TypeScript definitions are included:

```typescript
import { 
  PokerHand, 
  Player, 
  Action, 
  ActionType,
  ReplayConfig 
} from 'poker-hand-replay';

const hand: PokerHand = {
  id: 'hand123',
  stakes: '$0.25/$0.50',
  date: new Date(),
  table: { name: 'Example', maxSeats: 6 },
  players: [...],
  actions: [...],
  board: ['As', 'Kh', '7c'],
  pots: [...]
};
```

## 🏗️ Building from Source

```bash
# Clone the repository
git clone https://github.com/junichiro/poker-replayer.git
cd poker-replayer

# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## 🧪 Testing

The package includes comprehensive tests:

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Icons provided by [Lucide React](https://lucide.dev/)
- Bundled with [Vite](https://vitejs.dev/)

## 📞 Support

- 🐛 [Report bugs](https://github.com/junichiro/poker-replayer/issues)
- 💡 [Request features](https://github.com/junichiro/poker-replayer/issues)
- 📖 [Read documentation](https://github.com/junichiro/poker-replayer#readme)
- 💬 [Discussions](https://github.com/junichiro/poker-replayer/discussions)

---

Made with ❤️ by [Junichiro Tobe](https://github.com/junichiro)