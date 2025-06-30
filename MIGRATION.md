# 🚀 Migration Guide: From Inline Code to npm Package

This guide helps you migrate from inline poker hand replay code to using the `poker-hand-replay` npm package.

## 🎯 Why Migrate?

**Benefits of using the npm package:**
- ✅ Regular updates and bug fixes
- ✅ TypeScript support with full IntelliSense
- ✅ Smaller bundle size with tree-shaking
- ✅ Battle-tested components with comprehensive testing
- ✅ Consistent API and documentation
- ✅ Community support and contributions

## 📋 Migration Checklist

- [ ] Install the npm package
- [ ] Replace inline parser with `PokerStarsParser`
- [ ] Replace custom components with package components
- [ ] Update import statements
- [ ] Migrate configuration to new format
- [ ] Update TypeScript types (if applicable)
- [ ] Test functionality
- [ ] Remove old inline code

## 📦 Step 1: Installation

First, install the package:

```bash
npm install poker-hand-replay
# or
yarn add poker-hand-replay
# or  
pnpm add poker-hand-replay
```

## 🔄 Step 2: Common Migration Patterns

### A. Basic Parser Migration

**Before (Inline):**
```typescript
// Inline parser code (example of what users might have)
class CustomPokerParser {
  parseHand(handHistory: string) {
    // Custom parsing logic...
    const lines = handHistory.split('\n');
    const hand = {
      id: this.extractHandId(lines[0]),
      stakes: this.extractStakes(lines[0]),
      // ... more parsing
    };
    return hand;
  }
  
  private extractHandId(line: string): string {
    const match = line.match(/Hand #(\d+)/);
    return match ? match[1] : '';
  }
  
  // ... more parsing methods
}

const parser = new CustomPokerParser();
const hand = parser.parseHand(handHistory);
```

**After (npm package):**
```typescript
import { PokerStarsParser } from 'poker-hand-replay';

const parser = new PokerStarsParser();
const hand = parser.parse(handHistory);
```

### B. Component Migration

**Before (Inline Components):**
```typescript
// Custom card component
function Card({ card, visible }: { card: string; visible: boolean }) {
  if (!visible) return <div className="card-back" />;
  
  const [rank, suit] = card.split('');
  const isRed = suit === 'h' || suit === 'd';
  
  return (
    <div className={`card ${isRed ? 'red' : 'black'}`}>
      <span className="rank">{rank}</span>
      <span className="suit">{suit}</span>
    </div>
  );
}

// Custom player component  
function Player({ player, isActive }: PlayerProps) {
  return (
    <div className={`player ${isActive ? 'active' : ''}`}>
      <div className="name">{player.name}</div>
      <div className="chips">${player.chips}</div>
      <div className="cards">
        {player.cards?.map((card, i) => (
          <Card key={i} card={card} visible={player.showCards} />
        ))}
      </div>
    </div>
  );
}

// Main component with inline logic
function PokerReplay({ handHistory }: { handHistory: string }) {
  const [currentAction, setCurrentAction] = useState(0);
  const [hand, setHand] = useState(null);
  
  useEffect(() => {
    const parser = new CustomPokerParser();
    setHand(parser.parseHand(handHistory));
  }, [handHistory]);
  
  if (!hand) return <div>Loading...</div>;
  
  return (
    <div className="poker-table">
      {hand.players.map(player => (
        <Player key={player.seat} player={player} isActive={false} />
      ))}
      {/* Custom controls */}
      <button onClick={() => setCurrentAction(currentAction - 1)}>
        Previous
      </button>
      <button onClick={() => setCurrentAction(currentAction + 1)}>
        Next  
      </button>
    </div>
  );
}
```

**After (npm package):**
```typescript
import { PokerHandReplay, type ComponentTheme } from 'poker-hand-replay';

function PokerReplay({ handHistory }: { handHistory: string }) {
  return (
    <PokerHandReplay
      handHistory={handHistory}
      config={{
        theme: 'dark',
        autoPlay: false,
        animationSpeed: 1.5,
        tableShape: 'oval',
        cardDesign: 'four-color'
      }}
      onActionChange={(action, index) => {
        console.log(`Action ${index + 1}:`, action);
      }}
      onReplayEvent={(event, data) => {
        console.log('Replay event:', event, data);
      }}
    />
  );
}
```

### C. Advanced Configuration Migration

**Before (Multiple inline configurations):**
```typescript
// Scattered configuration across components
const TABLE_CONFIG = {
  maxSeats: 9,
  shape: 'oval',
  theme: 'dark'
};

const CARD_CONFIG = {
  design: 'standard',
  showBack: true,
  animateDealing: false
};

const ANIMATION_CONFIG = {
  duration: 300,
  easing: 'ease-in-out',
  enableChipMovement: true
};

function MyPokerTable() {
  // Components using scattered configs...
}
```

**After (Centralized configuration):**
```typescript
import { PokerHandReplay, type ReplayConfig } from 'poker-hand-replay';

const config: ReplayConfig = {
  theme: 'dark',
  autoPlay: false,
  animationSpeed: 1.5,
  tableShape: 'oval',
  cardDesign: 'four-color',
  showAllCards: false,
  enableSounds: false,
  size: 'medium',
  animations: {
    enableCardAnimations: true,
    enableChipAnimations: true,
    enableActionHighlight: true,
    cardDealDuration: 800,
    actionTransitionDuration: 400,
    easing: 'ease-out'
  }
};

function MyPokerTable({ handHistory }: { handHistory: string }) {
  return (
    <PokerHandReplay
      handHistory={handHistory}
      config={config}
      enableLoadingStates={true}
      enableErrorRecovery={true}
    />
  );
}
```

## 🔧 Step 3: TypeScript Migration

### Before (Custom types):
```typescript
interface CustomHand {
  id: string;
  stakes?: string;
  players: CustomPlayer[];
  actions: CustomAction[];
}

interface CustomPlayer {
  seat: number;
  name: string;
  chips: number;
  cards?: string[];
}

interface CustomAction {
  type: string;
  player?: string;
  amount?: number;
}
```

### After (Package types):
```typescript
import type { 
  PokerHand,
  Player, 
  Action,
  ComponentTheme,
  ReplayConfig,
  ReplayEventCallback
} from 'poker-hand-replay';

// Use the comprehensive types provided by the package
function handleActionChange(action: Action, index: number) {
  // Full type safety with IntelliSense
  console.log(action.type, action.player, action.amount);
}

const replayEventHandler: ReplayEventCallback = (event, data) => {
  switch (event) {
    case 'parseError':
      console.error('Parse failed:', data?.error);
      break;
    case 'parseSuccess': 
      console.log('Hand parsed:', data?.hand?.id);
      break;
    // ... other events with full type support
  }
};
```

## 🎨 Step 4: Styling Migration

### Before (Custom CSS):
```css
/* Custom styles scattered across files */
.poker-table {
  background: #0f1419;
  border-radius: 50%;
  width: 800px;
  height: 400px;
}

.player {
  position: absolute;
  /* Manual positioning */
}

.card {
  width: 40px;
  height: 60px;
  /* Custom card styling */
}
```

### After (Theme system):
```typescript
// Use built-in themes or customize
<PokerHandReplay
  config={{ 
    theme: 'casino',  // or 'dark', 'light', 'professional'
    tableShape: 'oval',
    cardDesign: 'four-color',
    size: 'large'
  }}
/>

// Or override with CSS custom properties
/* globals.css */
:root {
  --poker-bg-primary: #your-color;
  --poker-text-primary: #your-text-color;
  /* Override any CSS variables */
}
```

## ⚠️ Breaking Changes & Migration Issues

### 1. Parser API Changes
```typescript
// Old inline parsers might have used different method names
// OLD:
const hand = parser.parseHand(handHistory);

// NEW:
const hand = parser.parse(handHistory);
```

### 2. Event Handler Changes
```typescript
// OLD: Custom event systems
onActionClick(action) { ... }

// NEW: Standardized callbacks
onActionChange={(action, index) => { ... }}
onReplayEvent={(event, data) => { ... }}
```

### 3. Configuration Structure
```typescript
// OLD: Flat configuration
{ theme: 'dark', animationDuration: 300, cardStyle: 'modern' }

// NEW: Nested configuration
{
  theme: 'dark',
  animations: {
    cardDealDuration: 300,
    easing: 'ease-out'
  },
  cardDesign: 'four-color'
}
```

## 🧪 Step 5: Testing Your Migration

Create a test component to verify migration:

```typescript
import { PokerHandReplay } from 'poker-hand-replay';

const testHandHistory = `PokerStars Hand #243490149326: Tournament #3476545632, $10+$1 USD Hold'em No Limit - Level I (10/20) - 2024/01/15 20:30:00 ET
Table '3476545632 1' 9-max Seat #1 is the button
Seat 1: HeroPlayer ($1500 in chips)
Seat 2: Villain1 ($1500 in chips)
HeroPlayer: posts small blind 10
Villain1: posts big blind 20
*** HOLE CARDS ***
Dealt to HeroPlayer [As Kh]
HeroPlayer: raises 40 to 60
Villain1: calls 40
*** FLOP *** [Ah 7c 2d]
HeroPlayer: bets 80
Villain1: folds
Uncalled bet (80) returned to HeroPlayer
HeroPlayer collected 140 from pot
*** SUMMARY ***
Total pot 140 | Rake 0
Board [Ah 7c 2d]
Seat 1: HeroPlayer (button) (small blind) collected (140)
Seat 2: Villain1 (big blind) folded on the Flop`;

function MigrationTest() {
  return (
    <div>
      <h2>Migration Test</h2>
      <PokerHandReplay
        handHistory={testHandHistory}
        config={{
          theme: 'dark',
          autoPlay: false
        }}
        onActionChange={(action, index) => {
          console.log('✅ Action callback working:', action.type);
        }}
        onReplayEvent={(event, data) => {
          console.log('✅ Event callback working:', event);
        }}
      />
    </div>
  );
}
```

## 🗑️ Step 6: Cleanup

After verifying everything works:

1. **Remove old files:**
   ```bash
   # Remove old inline components
   rm src/components/OldPokerTable.tsx
   rm src/components/OldCard.tsx
   rm src/utils/oldParser.ts
   ```

2. **Update imports across your codebase:**
   ```bash
   # Find all old imports
   grep -r "from.*OldPokerTable" src/
   grep -r "import.*CustomParser" src/
   ```

3. **Remove unused dependencies:**
   ```bash
   npm uninstall old-poker-library
   ```

4. **Update documentation:**
   - Update README.md
   - Update component stories/examples
   - Update type definitions

## 🎁 Bonus: New Features Available

After migration, you gain access to:

```typescript
// ✨ Error boundaries with retry
<PokerHandReplay
  enableErrorRecovery={true}
  onReplayEvent={(event, data) => {
    if (event === 'parseError') {
      // Automatic retry handling available
    }
  }}
/>

// ✨ Loading states
<PokerHandReplay 
  enableLoadingStates={true}
  loadingConfig={{
    showProgressBar: true,
    customSpinner: <MySpinner />
  }}
/>

// ✨ Advanced animations
<PokerHandReplay
  config={{
    animations: {
      enableCardAnimations: true,
      enableChipAnimations: true,
      enableActionHighlight: true,
      cardDealDuration: 800,
      actionTransitionDuration: 400,
      easing: 'ease-out'
    }
  }}
/>

// ✨ Accessibility features
<PokerHandReplay
  config={{
    accessibility: {
      enableKeyboardNavigation: true,
      announceActions: true,
      screenReaderOptimized: true
    }
  }}
/>
```

## 🆘 Need Help?

If you run into issues during migration:

1. **Check the examples:** See `examples/` directory for working implementations
2. **Read the API docs:** Full TypeScript definitions with JSDoc
3. **Open an issue:** [GitHub Issues](https://github.com/junichiro/poker-replayer/issues)
4. **Common issues:** Check the troubleshooting section below

## 🔧 Troubleshooting

### Issue: "Module not found: poker-hand-replay"
```bash
# Solution: Make sure it's installed
npm install poker-hand-replay
```

### Issue: TypeScript errors with config object
```typescript
// Solution: Import the type
import type { ReplayConfig } from 'poker-hand-replay';

const config: ReplayConfig = {
  // Your config with full type checking
};
```

### Issue: Styling doesn't match old design
```css
/* Solution: Override CSS custom properties */
:root {
  --poker-bg-primary: #your-old-color;
  --poker-table-border: #your-old-border;
}
```

### Issue: Events not firing
```typescript
// Solution: Make sure you're using the correct event names
<PokerHandReplay
  onActionChange={(action, index) => { /* ✅ Correct */ }}
  onReplayEvent={(event, data) => { /* ✅ Correct */ }}
  // ❌ Not: onActionClick, onHandComplete, etc.
/>
```

---

## 📚 Next Steps

After migration:
- Explore the [examples directory](./examples/) for advanced usage patterns
- Read the [API documentation](./docs/) for comprehensive reference
- Check out [Storybook](https://your-storybook-url) for interactive component demos
- Consider contributing improvements back to the package!

Happy migrating! 🚀
