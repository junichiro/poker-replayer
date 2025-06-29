# CLAUDE.md - PokerStars Hand History Replay Module

## Project Overview

This project is a React-based module for parsing and replaying PokerStars hand histories with visual animations. The module should be publishable as an npm package and easily embeddable in other projects.

## Project Goals

1. Create a standalone npm package that can parse PokerStars hand history format
2. Provide a React component for visual replay of poker hands
3. Support embedding in any React application
4. Include TypeScript definitions for better developer experience
5. Provide both CommonJS and ES modules

## Technical Requirements

### Core Dependencies
- React (>= 16.8.0) - peer dependency
- TypeScript for type definitions
- Bundler (Rollup or Vite) for building the package
- Lucide-react for icons

### Package Structure
```
poker-hand-replay/
├── src/
│   ├── components/
│   │   ├── PokerHandReplay.tsx    # Main component
│   │   ├── Card.tsx               # Card display component
│   │   ├── Player.tsx             # Player display component
│   │   └── Controls.tsx           # Playback controls
│   ├── parser/
│   │   └── PokerStarsParser.ts    # Hand history parser
│   ├── types/
│   │   └── index.ts               # TypeScript definitions
│   ├── utils/
│   │   └── index.ts               # Utility functions
│   └── index.ts                   # Package entry point
├── dist/                          # Built files
├── examples/                      # Usage examples
│   └── basic/                     # Basic usage example
├── tests/                         # Test files
├── package.json
├── tsconfig.json
├── rollup.config.js              # or vite.config.js
├── README.md
├── LICENSE
└── CLAUDE.md
```

## Implementation Tasks

### Phase 1: Core Parser Development
1. Extract and refactor the PokerStarsParser class
2. Add comprehensive parsing for all action types
3. Handle edge cases (split pots, side pots, all-ins)
4. Create TypeScript interfaces for all data structures
5. Add unit tests for parser

### Phase 2: Component Architecture
1. Split the monolithic component into smaller, reusable components
2. Implement proper prop typing with TypeScript
3. Add customization options (themes, sizes, animation speeds)
4. Optimize re-renders with React.memo and useMemo
5. Add error boundaries and loading states

### Phase 3: Package Setup
1. Initialize npm package with proper metadata
2. Configure TypeScript compilation
3. Set up build process (Rollup/Vite)
4. Configure exports for both CJS and ESM
5. Add development scripts

### Phase 4: Documentation & Examples
1. Write comprehensive README with usage examples
2. Create API documentation
3. Build example applications
4. Add Storybook for component documentation (optional)
5. Create migration guide from inline usage

### Phase 5: Testing & Quality
1. Unit tests for parser
2. Component tests with React Testing Library
3. Integration tests for full replay functionality
4. Set up CI/CD with GitHub Actions
5. Add linting and formatting (ESLint, Prettier)

## API Design

### Basic Usage
```typescript
import { PokerHandReplay } from 'poker-hand-replay';

function App() {
  return (
    <PokerHandReplay 
      handHistory={handHistoryString}
      theme="dark"
      autoPlay={false}
      animationSpeed={1.5}
      onActionChange={(action, index) => console.log(action)}
    />
  );
}
```

### Advanced Usage
```typescript
import { PokerStarsParser, ReplayController } from 'poker-hand-replay';

// Parse hand history
const parser = new PokerStarsParser();
const hand = parser.parse(handHistoryString);

// Custom replay logic
const controller = new ReplayController(hand);
controller.nextAction();
controller.previousAction();
controller.goToAction(5);
```

## TypeScript Interfaces

```typescript
interface PokerHand {
  id: string;
  tournamentId?: string;
  stakes: string;
  date: Date;
  table: TableInfo;
  players: Player[];
  actions: Action[];
  board: string[];
  pots: Pot[];
}

interface Player {
  seat: number;
  name: string;
  chips: number;
  cards?: [string, string];
  isHero?: boolean;
  position?: Position;
}

interface Action {
  index: number;
  street: Street;
  type: ActionType;
  player?: string;
  amount?: number;
  cards?: string[];
}

type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
type ActionType = 'blind' | 'ante' | 'deal' | 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'show';
type Position = 'BB' | 'SB' | 'BTN' | 'CO' | 'HJ' | 'MP' | 'EP' | 'UTG';
```

## Package.json Structure

```json
{
  "name": "poker-hand-replay",
  "version": "1.0.0",
  "description": "React component for replaying PokerStars hand histories",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.js",
      "import": "./dist/index.esm.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "dependencies": {
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "rollup": "^3.0.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "rollup-plugin-peer-deps-external": "^2.2.4",
    "rollup-plugin-postcss": "^4.0.2"
  }
}
```

## Development Commands

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build the package
npm run test         # Run tests
npm run lint         # Run linting
npm run format       # Format code

# Publishing
npm run prepublish   # Run before publishing
npm publish          # Publish to npm
```

## Testing Strategy

1. **Parser Tests**: Test all possible hand history formats and edge cases
2. **Component Tests**: Test UI interactions and state management
3. **Integration Tests**: Test full replay functionality
4. **Performance Tests**: Ensure smooth animations with large hand histories

## Performance Considerations

1. Memoize expensive calculations (pot calculations, player positions)
2. Use React.memo for components that don't need frequent updates
3. Implement virtual scrolling for action history if needed
4. Optimize animation frames with requestAnimationFrame
5. Lazy load icons and assets

## Customization Options

1. **Themes**: Dark, Light, Custom CSS variables
2. **Table Styles**: Oval, Rectangle, Custom shapes
3. **Card Designs**: Standard, Four-color, Custom designs
4. **Animation Speed**: Configurable from 0.5x to 3x
5. **Sound Effects**: Optional sound effects for actions

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

1. Support for other poker sites (888poker, PartyPoker, etc.)
2. Support for other poker variants (Omaha, Stud)
3. Hand range visualization
4. Equity calculations
5. Export replay as GIF/Video
6. Multi-table support
7. Tournament ICM calculations

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Run tests and build
4. Create git tag
5. Publish to npm
6. Create GitHub release

## Important Notes for Claude Code

- Always use TypeScript for type safety
- Follow React best practices and hooks guidelines
- Ensure accessibility (ARIA labels, keyboard navigation)
- Keep bundle size minimal (< 100KB gzipped)
- Maintain backward compatibility
- Document all public APIs with JSDoc
- Use semantic versioning

## Questions to Address During Development

1. Should we support server-side rendering (SSR)?
2. Should we provide a vanilla JavaScript version?
3. How should we handle very long hand histories (100+ actions)?
4. Should we support hand history import from files?
5. What analytics should we provide (pot odds, equity, etc.)?
