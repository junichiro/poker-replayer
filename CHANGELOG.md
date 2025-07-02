# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-30

### Added

- 🎯 **Initial Release** - Complete poker hand replay component library
- 🎮 **PokerHandReplay Component** - Main component for replaying PokerStars
  hand histories
- 🃏 **PokerStarsParser** - Comprehensive parser for PokerStars hand history
  format
- 🎨 **Theme Support** - Dark, light, and auto themes with custom color
  overrides
- ⚡ **Performance Optimizations** - React.memo, useMemo, and smart re-renders
- 🛡️ **Error Boundaries** - Graceful error handling with retry mechanisms
- 🔄 **Loading States** - Progress indicators and skeleton components
- 📦 **TypeScript Support** - Full type definitions for all components and APIs
- 🎪 **Animation Variants** - Multiple loading and transition animations
- ♿ **Accessibility** - ARIA labels and keyboard navigation support

### Components

- `PokerHandReplay` - Main replay component with comprehensive features
- `ErrorBoundary` - Robust error boundary with retry capabilities
- `ParserErrorBoundary` - Specialized error boundary for parser errors
- `LoadingSpinner` - Configurable loading indicators with 5 variants
- `Card` - Memoized card display component with multiple designs
- `Player` - Optimized player display with state management
- `Table` - Interactive poker table with customizable shapes
- `Controls` - Playback controls with full keyboard support
- `ActionHistory` - Virtualized action list for performance

### Utilities

- `PokerStarsParser` - Robust hand history parser with error handling
- `useRetry` - Configurable retry hook with exponential backoff
- `useLoading` - Loading state management with progress tracking
- `customization` - Theme and style utilities
- `performance` - Performance monitoring and optimization helpers

### Features

- ✅ Parse PokerStars hand histories with comprehensive format support
- ✅ Interactive replay controls (play, pause, step-by-step navigation)
- ✅ Customizable themes and styling
- ✅ Responsive design for desktop and mobile
- ✅ Error recovery and retry mechanisms
- ✅ Loading states with progress tracking
- ✅ TypeScript ready with full type definitions
- ✅ Performance optimized for large hand histories
- ✅ Accessible with ARIA labels and keyboard navigation

### Package Setup

- 📦 **NPM Package** - Properly configured for publishing
- 🏗️ **Build System** - Vite-based build with TypeScript and React support
- 🧪 **Testing** - Comprehensive test suite with Jest
- 📝 **Documentation** - Complete README with examples and API reference
- ⚖️ **MIT License** - Open source license for broad usage

### Supported Formats

- PokerStars cash game hand histories
- PokerStars tournament hand histories
- Multiple betting rounds (preflop, flop, turn, river, showdown)
- All-in scenarios and side pots
- Multiple action types (fold, check, call, bet, raise, show)
- Player timeouts and disconnections

### Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

### Dependencies

- **Runtime**: `lucide-react` (icons)
- **Peer**: `react` (>=16.8.0), `react-dom` (>=16.8.0)
- **Build**: TypeScript, Vite, ESLint, Prettier, Jest
