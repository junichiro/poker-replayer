# 🃏 Poker Hand Replay

A React component library for parsing and replaying PokerStars hand histories
with beautiful visual animations.

[![npm version](https://badge.fury.io/js/poker-hand-replay.svg)](https://badge.fury.io/js/poker-hand-replay)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/poker-hand-replay)](https://bundlephobia.com/package/poker-hand-replay)

## ✨ Features

- 🎯 **Parse PokerStars hand histories** with comprehensive format support
- 🎮 **Interactive replay controls** with play, pause, step-by-step navigation
- 🎨 **5 built-in themes** (dark, light, auto, casino, professional)
- 📱 **Responsive design** that works on desktop and mobile
- ⚡ **Performance optimized** with React.memo and smart re-renders
- 🛡️ **Robust error handling** with retry mechanisms and fallbacks
- 🔄 **Loading states** with progress indicators and skeleton UI
- 📦 **TypeScript ready** with comprehensive type definitions
- 🎪 **Multiple table shapes** (oval, rectangle, circle, hexagon)
- 🎴 **5 card designs** (standard, four-color, large-indices, minimal, classic)
- ♿ **Accessible** with ARIA labels and keyboard navigation
- 🔊 **Sound effects** support for enhanced experience

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

// Real PokerStars hand history example
const handHistory = `
PokerStars Hand #243490149326: Tournament #3476545632, $10+$1 USD Hold'em No Limit - Level I (10/20) - 2024/01/15 20:30:00 ET
Table '3476545632 1' 9-max Seat #1 is the button
Seat 1: HeroPlayer ($1500 in chips)
Seat 2: Villain1 ($1500 in chips)
Seat 3: Player3 ($1500 in chips)
HeroPlayer: posts small blind 10
Villain1: posts big blind 20
*** HOLE CARDS ***
Dealt to HeroPlayer [As Kh]
Player3: folds
HeroPlayer: raises 40 to 60
Villain1: calls 40
*** FLOP *** [Ah 7c 2d]
HeroPlayer: bets 80
Villain1: calls 80
*** TURN *** [Ah 7c 2d] [Kd]
HeroPlayer: bets 200
Villain1: folds
Uncalled bet (200) returned to HeroPlayer
HeroPlayer collected 280 from pot
HeroPlayer: doesn't show hand
*** SUMMARY ***
Total pot 280 | Rake 0
Board [Ah 7c 2d Kd]
Seat 1: HeroPlayer (button) (small blind) collected (280)
Seat 2: Villain1 (big blind) folded on the Turn
Seat 3: Player3 folded before Flop (didn't bet)
`;

function App() {
  return (
    <PokerHandReplay
      handHistory={handHistory}
      config={{
        theme: 'dark',
        autoPlay: false,
        animationSpeed: 1.5,
        tableShape: 'oval',
        cardDesign: 'four-color',
      }}
      onActionChange={(action, index) => {
        console.log(`Action ${index}: ${action.player} ${action.type}`, action);
      }}
      onReplayEvent={(event, data) => {
        console.log(`Replay event: ${event}`, data);
      }}
    />
  );
}

export default App;
```

## 🎮 API Reference

### `PokerHandReplay` Props

| Prop                  | Type                   | Default          | Description                                     |
| --------------------- | ---------------------- | ---------------- | ----------------------------------------------- |
| `handHistory`         | `string`               | **required**     | Raw PokerStars hand history text                |
| `config`              | `ReplayConfig`         | `{}`             | Configuration options for replay behavior       |
| `onActionChange`      | `ActionChangeCallback` | `undefined`      | Callback fired when current action changes      |
| `onReplayEvent`       | `ReplayEventCallback`  | `undefined`      | Callback for replay events (start, pause, etc.) |
| `className`           | `string`               | `''`             | Custom CSS class for styling                    |
| `enableLoadingStates` | `boolean`              | `true`           | Enable loading indicators and progress          |
| `enableErrorRecovery` | `boolean`              | `true`           | Enable automatic error recovery with retry      |
| `loadingComponent`    | `React.ComponentType`  | `LoadingSpinner` | Custom loading component                        |
| `errorComponent`      | `React.ComponentType`  | `ErrorBoundary`  | Custom error fallback component                 |

### `ReplayConfig` Options

```typescript
interface ReplayConfig {
  // Playback Control
  autoPlay?: boolean; // Auto-start replay (default: false)
  animationSpeed?: number; // Speed multiplier 0.5-3.0 (default: 1.0)

  // Visual Appearance
  theme?: 'light' | 'dark' | 'auto' | 'casino' | 'professional';
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
  tableShape?: 'oval' | 'rectangle' | 'circle' | 'hexagon';
  cardDesign?:
    | 'standard'
    | 'four-color'
    | 'large-indices'
    | 'minimal'
    | 'classic';

  // Gameplay Options
  showAllCards?: boolean; // Reveal all hole cards (default: false)
  enableSounds?: boolean; // Enable sound effects (default: false)

  // Customization
  customColors?: Partial<ThemeColors>; // Override theme colors
  animations?: AnimationConfig; // Fine-tune animations
}
```

### Animation Configuration

```typescript
interface AnimationConfig {
  enableCardAnimations?: boolean; // Card dealing animations
  enableChipAnimations?: boolean; // Chip movement animations
  enableActionHighlight?: boolean; // Highlight current action
  cardDealDuration?: number; // Card deal speed (ms)
  actionTransitionDuration?: number; // Action transition speed (ms)
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}
```

## 🎨 Theming & Customization

### Built-in Themes

```tsx
// Dark theme (default)
<PokerHandReplay config={{ theme: "dark" }} handHistory={handHistory} />

// Light theme
<PokerHandReplay config={{ theme: "light" }} handHistory={handHistory} />

// Auto theme (follows system preference)
<PokerHandReplay config={{ theme: "auto" }} handHistory={handHistory} />

// Casino theme (green felt)
<PokerHandReplay config={{ theme: "casino" }} handHistory={handHistory} />

// Professional theme (clean, minimal)
<PokerHandReplay config={{ theme: "professional" }} handHistory={handHistory} />
```

### Custom Colors

```tsx
<PokerHandReplay
  config={{
    theme: 'dark',
    customColors: {
      bgPrimary: '#1a1a1a',
      bgTable: '#0f5132',
      textPrimary: '#ffffff',
      heroHighlight: '#ffd700',
      actionHighlight: '#ff6b6b',
      potColor: '#28a745',
    },
  }}
  handHistory={handHistory}
/>
```

### Table Shapes & Card Designs

```tsx
<PokerHandReplay
  config={{
    tableShape: 'oval', // oval, rectangle, circle, hexagon
    cardDesign: 'four-color', // standard, four-color, large-indices, minimal, classic
    size: 'large', // extra-small, small, medium, large, extra-large
  }}
  handHistory={handHistory}
/>
```

## 🔧 Advanced Usage

### Manual Parser Usage

```typescript
import { PokerStarsParser } from 'poker-hand-replay';

const parser = new PokerStarsParser();
const result = parser.parse(handHistory);

if (result.success) {
  const { hand } = result;

  console.log('Hand ID:', hand.id);
  console.log('Stakes:', hand.stakes);
  console.log('Players:', hand.players.length);
  console.log('Actions:', hand.actions.length);
  console.log('Board cards:', hand.board);
  console.log('Final pots:', hand.pots);

  // Access specific player data
  const hero = hand.players.find(p => p.isHero);
  if (hero) {
    console.log('Hero:', hero.name, 'Position:', hero.position);
    console.log('Hero cards:', hero.cards);
  }
} else {
  console.error('Parse error:', result.error.message);
  console.error('Error context:', result.error.context);
}
```

### Error Handling with Custom Fallback

```tsx
import { PokerHandReplay, ErrorBoundary } from 'poker-hand-replay';

function CustomErrorFallback({ error, retry, canRetry, boundaryName }) {
  return (
    <div className="error-container">
      <h3>🚨 Hand Replay Error</h3>
      <p>
        <strong>Error:</strong> {error.message}
      </p>
      <p>
        <strong>Component:</strong> {boundaryName}
      </p>
      <details>
        <summary>Technical Details</summary>
        <pre>{error.stack}</pre>
      </details>
      {canRetry && (
        <button onClick={retry} className="retry-button">
          🔄 Try Again
        </button>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      fallback={CustomErrorFallback}
      name="HandReplayContainer"
      maxRetries={3}
      enableLogging={true}
    >
      <PokerHandReplay handHistory={handHistory} enableErrorRecovery={true} />
    </ErrorBoundary>
  );
}
```

### Loading States & Progress

```tsx
import { PokerHandReplay, LoadingSpinner, useLoading } from 'poker-hand-replay';

function CustomLoadingComponent({ message, progress, phase }) {
  return (
    <div className="custom-loading">
      <LoadingSpinner
        variant="card"
        size="large"
        message={message || 'Loading hand...'}
      />
      {progress !== undefined && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      {phase && <p className="loading-phase">Phase: {phase}</p>}
    </div>
  );
}

function App() {
  return (
    <PokerHandReplay
      handHistory={handHistory}
      loadingComponent={CustomLoadingComponent}
      enableLoadingStates={true}
    />
  );
}
```

### Event Handling & Callbacks

```tsx
function App() {
  const handleActionChange = (action, index) => {
    console.log(`Action ${index + 1}:`, {
      street: action.street,
      type: action.type,
      player: action.player,
      amount: action.amount,
      isAllIn: action.isAllIn,
    });
  };

  const handleReplayEvent = (event, data) => {
    switch (event) {
      case 'parseSuccess':
        console.log('Hand parsed successfully:', data.hand?.id);
        break;
      case 'parseError':
        console.error('Parse failed:', data.error?.message);
        break;
      case 'start':
        console.log('Replay started');
        break;
      case 'pause':
        console.log('Replay paused');
        break;
      case 'end':
        console.log('Replay finished');
        break;
      case 'retry':
        console.log(`Retry attempt ${data.attempt}`);
        break;
    }
  };

  return (
    <PokerHandReplay
      handHistory={handHistory}
      onActionChange={handleActionChange}
      onReplayEvent={handleReplayEvent}
      config={{
        autoPlay: true,
        animationSpeed: 2.0,
      }}
    />
  );
}
```

## 📋 TypeScript Support

Full TypeScript definitions with comprehensive interfaces:

```typescript
import {
  PokerHand,
  Player,
  Action,
  ActionType,
  Street,
  Position,
  ReplayConfig,
  ThemeColors,
  ParserResult,
} from 'poker-hand-replay';

// Type-safe action handling
const handleAction = (action: Action, index: number) => {
  // action.type is properly typed as ActionType union
  if (action.type === 'bet' || action.type === 'raise') {
    console.log(`${action.player} ${action.type} ${action.amount}`);
  }

  // Street-specific logic
  switch (action.street) {
    case 'preflop':
    case 'flop':
    case 'turn':
    case 'river':
    case 'showdown':
      // Handle each street
      break;
  }
};

// Type-safe configuration
const config: ReplayConfig = {
  theme: 'casino', // Autocomplete available
  tableShape: 'hexagon', // Validated options
  cardDesign: 'four-color', // Type-checked
  animationSpeed: 1.5, // Number validation
  autoPlay: false, // Boolean
};
```

## 🏗️ Development Scripts

```bash
# Development
npm run dev              # Watch mode build
npm run dev:serve        # Preview server on port 3000

# Building
npm run build            # Production build
npm run build:dev        # Development build
npm run build:analyze    # Bundle analysis

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Fix lint issues
npm run lint:ci          # Strict linting (zero warnings)
npm run format           # Format code
npm run format:check     # Check formatting

# Type Checking
npm run typecheck        # Main TypeScript check
npm run typecheck:all    # All configurations (parallel)
npm run typecheck:build  # Build configuration
npm run typecheck:test   # Test configuration

# Documentation
npm run docs             # Generate API documentation
npm run docs:serve       # Generate with watch mode
npm run docs:markdown    # Generate markdown docs
npm run docs:json        # Generate JSON export
npm run docs:clean       # Clean documentation

# Validation
npm run validate         # Complete local validation
npm run ci               # Full CI pipeline
npm run size-check       # Bundle size validation

# Cleanup
npm run clean            # Clean build artifacts
npm run clean:all        # Full environment reset
```

## 🧪 Testing

The package includes comprehensive test coverage:

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode for development
npm run test:coverage      # Generate detailed coverage report
npm run test:unit          # Unit tests (src directory)
npm run test:integration   # Integration tests (tests directory)
npm run test:ci            # CI-optimized testing
```

Test coverage includes:

- **Parser Tests**: All PokerStars format variations
- **Component Tests**: React component behavior
- **Integration Tests**: End-to-end hand replay scenarios
- **Type Tests**: TypeScript definition validation
- **Performance Tests**: Memory usage and optimization

## 🎯 Supported Hand History Formats

The parser supports comprehensive PokerStars formats:

- ✅ **Cash Games**: All stakes and formats
- ✅ **Tournaments**: SNGs, MTTs, with antes/blinds
- ✅ **All Game Types**: Hold'em, Omaha (future)
- ✅ **Side Pots**: Complex all-in scenarios
- ✅ **Split Pots**: Tied hands with proper distribution
- ✅ **Player States**: Timeouts, disconnections, sit-outs
- ✅ **Special Actions**: Uncalled bets, mucks, shows
- ✅ **Board Runouts**: Flop, turn, river card dealing

## 🔍 Troubleshooting

### Common Issues

**Parse Errors**

```tsx
// Check for invalid hand history format
const result = parser.parse(handHistory);
if (!result.success) {
  console.log('Parse error:', result.error.message);
  console.log('Error line:', result.error.line);
  console.log('Context:', result.error.context);
}
```

**Performance Issues**

```tsx
// Optimize for large hand histories
<PokerHandReplay
  config={{
    animationSpeed: 0.5, // Slower animations
    animations: {
      enableCardAnimations: false, // Disable heavy animations
      enableChipAnimations: false,
    },
  }}
  handHistory={handHistory} // For demonstration; use a very large hand history string for actual performance testing
/>
```

**Memory Usage**

```tsx
// Use error boundaries for memory management
<ErrorBoundary maxRetries={1}>
  <PokerHandReplay handHistory={handHistory} />
</ErrorBoundary>
```

### Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Chrome Android 88+
- **Bundle Size**: ~23KB gzipped (ESM), ~17KB gzipped (CJS)
- **Dependencies**: React 16.8+, React DOM 16.8+

## 📖 API Documentation

Comprehensive API documentation is auto-generated from TypeScript interfaces and
JSDoc comments.

### Online Documentation

- **Interactive API Docs**: Browse interfaces, types, and examples
- **Searchable Reference**: Find components and utilities quickly
- **Source Links**: Jump directly to implementation code
- **Type Definitions**: Complete TypeScript coverage

### Generating Documentation Locally

```bash
# Generate HTML documentation
npm run docs

# Generate markdown documentation
npm run docs:markdown

# Generate JSON export for custom processing
npm run docs:json

# Serve documentation with hot reload
npm run docs:serve
```

### Documentation Structure

```
docs/
├── api/                    # HTML documentation
│   ├── classes/           # Class documentation (PokerStarsParser, etc.)
│   ├── interfaces/        # Interface documentation (PokerHandReplayProps, etc.)
│   ├── functions/         # Function documentation (hooks, utilities)
│   ├── type-aliases/      # Type aliases (CardRank, ActionType, etc.)
│   └── variables/         # Component exports
├── markdown/              # Markdown format for integration
└── api.json              # JSON export for custom tools
```

### Key Documentation Features

- **🔗 Cross-References**: Links between related types and components
- **📝 Inline Examples**: Code examples in JSDoc comments
- **🏷️ Type Safety**: Full TypeScript integration
- **📊 Categorization**: Organized by component groups
- **🔍 Search Support**: Find APIs quickly
- **📱 Responsive**: Works on all devices

## 🤝 Contributing

We welcome contributions! Please see our
[contribution guidelines](CONTRIBUTING.md).

### Development Setup

```bash
# Clone and setup
git clone https://github.com/junichiro/poker-replayer.git
cd poker-replayer
npm install

# Development workflow
npm run dev              # Start development
npm run test:watch       # Run tests in watch mode
npm run validate         # Full validation before PR

# Before committing
npm run ci               # Ensure all checks pass
```

### Contribution Process

1. 🍴 Fork the repository
2. 🌿 Create a feature branch: `git checkout -b feature/amazing-feature`
3. ✅ Make changes and add tests
4. ✔️ Run validation: `npm run ci`
5. 📝 Commit changes: `git commit -m 'feat: add amazing feature'`
6. 🚀 Push to branch: `git push origin feature/amazing-feature`
7. 🔄 Open a pull request

## 📊 Bundle Analysis

The package is optimized for minimal bundle size:

```bash
npm run build:analyze    # Generate bundle analysis
npm run size-check       # Validate size limits
```

Current bundle sizes:

- **ESM Build**: ~23KB gzipped
- **CJS Build**: ~17KB gzipped
- **Type Definitions**: ~12KB

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and
  [TypeScript](https://www.typescriptlang.org/)
- Icons by [Lucide React](https://lucide.dev/)
- Bundled with [Vite](https://vitejs.dev/)
- Testing with [Jest](https://jestjs.io/)
- Linting with [ESLint](https://eslint.org/)

## 📞 Support & Community

- 🐛 [Report Issues](https://github.com/junichiro/poker-replayer/issues)
- 💡 [Feature Requests](https://github.com/junichiro/poker-replayer/issues)
- 📖 [Documentation](https://github.com/junichiro/poker-replayer#readme)
- 💬 [Discussions](https://github.com/junichiro/poker-replayer/discussions)
- 📧 [Email Support](mailto:junichiro.tobe@gmail.com)

## 🏆 Roadmap

- [ ] **v1.1**: Omaha hand history support
- [ ] **v1.2**: 888poker and PartyPoker parsers
- [ ] **v1.3**: Hand range visualization
- [ ] **v1.4**: Equity calculations integration
- [ ] **v1.5**: Export replay as GIF/Video
- [ ] **v2.0**: Multi-table tournament support

---

<div align="center">

**Made with ❤️ by [Junichiro Tobe](https://github.com/junichiro)**

[⭐ Star this repo](https://github.com/junichiro/poker-replayer) •
[🐛 Report Bug](https://github.com/junichiro/poker-replayer/issues) •
[✨ Request Feature](https://github.com/junichiro/poker-replayer/issues)

</div>
