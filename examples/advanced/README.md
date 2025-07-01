# 🚀 Advanced Example

A comprehensive example showcasing all features and capabilities of the Poker
Hand Replay component library.

## 🎯 What This Example Shows

- ✅ **All Component Features** - Every configuration option and capability
- ✅ **Advanced Error Handling** - Custom error boundaries and recovery
- ✅ **Custom Loading States** - Progress indicators and skeleton loaders
- ✅ **Event System** - Complete event handling and analytics
- ✅ **Theme Customization** - Custom themes and color schemes
- ✅ **Performance Optimization** - Memoization and efficient re-renders
- ✅ **Accessibility** - ARIA labels and keyboard navigation
- ✅ **Multi-hand Support** - Loading and switching between hands
- ✅ **Parser Integration** - Direct parser usage and hand analysis
- ✅ **Debug Mode** - Detailed logging and development tools

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the example.

## 📂 Project Structure

```
advanced/
├── src/
│   ├── components/
│   │   ├── AdvancedControls.tsx    # Custom control panel
│   │   ├── HandAnalyzer.tsx        # Hand analysis display
│   │   ├── ThemeCustomizer.tsx     # Live theme editor
│   │   ├── ErrorDisplay.tsx        # Custom error UI
│   │   └── LoadingStates.tsx       # Custom loading components
│   ├── hooks/
│   │   ├── useHandHistory.ts       # Hand management hook
│   │   ├── useThemeEditor.ts       # Theme editing hook
│   │   └── useAnalytics.ts         # Event analytics hook
│   ├── utils/
│   │   ├── handHistoryData.ts      # Comprehensive test data
│   │   ├── themeUtils.ts           # Theme helper functions
│   │   └── debugUtils.ts           # Debug and logging utilities
│   ├── App.tsx                     # Main application
│   ├── index.tsx                   # Entry point
│   └── styles.css                  # Advanced styling
├── public/
│   └── index.html                  # HTML template
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## 🎨 Key Features Demonstrated

### 1. Complete Feature Showcase

```typescript
// Full configuration with all options
const advancedConfig: ReplayConfig = {
  autoPlay: false,
  animationSpeed: 1.5,
  theme: customTheme,
  showAllCards: true,
  enableSounds: true,
  size: 'large',
  customColors: {
    bgPrimary: '#1a1a2e',
    bgTable: '#16213e',
    textPrimary: '#eee',
    heroHighlight: '#ffd700',
    actionHighlight: '#ff6b6b',
    potColor: '#4ecdc4',
  },
  tableShape: 'oval',
  cardDesign: 'four-color',
  animations: {
    enableCardAnimations: true,
    enableChipAnimations: true,
    enableActionHighlight: true,
    cardDealDuration: 1000,
    actionTransitionDuration: 500,
    easing: 'ease-in-out',
  },
};
```

### 2. Advanced Error Handling

```typescript
// Custom error boundary with detailed error information
const CustomErrorFallback = ({ error, retry, canRetry, boundaryName }) => (
  <div className="advanced-error">
    <h2>🚨 Error in {boundaryName}</h2>
    <details>
      <summary>Error Details</summary>
      <pre>{error.stack}</pre>
    </details>
    {canRetry && <button onClick={retry}>Try Again</button>}
  </div>
);
```

### 3. Real-time Hand Analysis

```typescript
// Live hand analysis as replay progresses
const HandAnalyzer = ({ hand, currentAction }) => {
  const potOdds = calculatePotOdds(hand, currentAction);
  const handStrength = evaluateHandStrength(hand.players[0].cards, hand.board);

  return (
    <div className="hand-analysis">
      <div>Pot Odds: {potOdds}%</div>
      <div>Hand Strength: {handStrength}</div>
      <div>Expected Value: ${expectedValue}</div>
    </div>
  );
};
```

### 4. Custom Theme Editor

```typescript
// Live theme customization
const ThemeCustomizer = ({ onThemeChange }) => {
  const [colors, setColors] = useState(defaultColors);

  const updateColor = (key: string, value: string) => {
    const newColors = { ...colors, [key]: value };
    setColors(newColors);
    onThemeChange({ name: 'custom', colors: newColors });
  };

  return (
    <div className="theme-editor">
      {Object.entries(colors).map(([key, value]) => (
        <ColorPicker
          key={key}
          label={key}
          value={value}
          onChange={(color) => updateColor(key, color)}
        />
      ))}
    </div>
  );
};
```

### 5. Performance Monitoring

```typescript
// Performance metrics and optimization
const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 0,
  });

  useEffect(() => {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      // Analyze performance metrics
    });
    observer.observe({ entryTypes: ['measure', 'navigation'] });

    return () => observer.disconnect();
  }, []);

  return metrics;
};
```

## 🔧 Advanced Configuration Options

### Animation Control

```typescript
// Fine-grained animation control
const animationConfig = {
  enableCardAnimations: true,
  enableChipAnimations: true,
  enableActionHighlight: true,
  cardDealDuration: 1200, // Slower card dealing
  actionTransitionDuration: 600, // Smooth transitions
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Custom easing
};
```

### Event Analytics

```typescript
// Comprehensive event tracking
const handleReplayEvent = (event: string, data?: any) => {
  // Send to analytics service
  analytics.track('poker_replay_event', {
    event,
    handId: data?.hand?.id,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  });

  // Custom event handling
  switch (event) {
    case 'parseSuccess':
      console.log('Hand parsed:', data.hand);
      break;
    case 'actionChange':
      console.log('Action changed:', data.action);
      break;
  }
};
```

### Multi-hand Management

```typescript
// Handle multiple hand histories
const useHandManager = () => {
  const [hands, setHands] = useState<HandHistory[]>([]);
  const [currentHand, setCurrentHand] = useState<number>(0);

  const loadHand = useCallback(async (handHistory: string) => {
    const parser = new PokerStarsParser();
    const result = parser.parse(handHistory);

    if (result.success) {
      setHands(prev => [...prev, result.hand]);
    }
  }, []);

  return { hands, currentHand, setCurrentHand, loadHand };
};
```

## 🧪 Testing Features

### Debug Mode

Enable comprehensive debugging:

```typescript
const debugConfig = {
  enableDebugMode: true,
  logAllEvents: true,
  showPerformanceMetrics: true,
  highlightRenders: true,
};
```

### Performance Testing

```typescript
// Memory usage monitoring
const useMemoryMonitoring = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      if ('memory' in performance) {
        console.log('Memory usage:', performance.memory);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);
};
```

## 📊 Analytics Integration

### Event Tracking

```typescript
// Google Analytics integration
const trackReplayEvent = (event: string, data: any) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'poker_replay', {
      event_category: 'component_interaction',
      event_label: event,
      value: data.actionIndex || 0,
    });
  }
};
```

### Performance Metrics

```typescript
// Custom performance tracking
const trackPerformance = () => {
  // First Contentful Paint
  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];

  // Time to Interactive
  const ttiEntry = performance.getEntriesByName('time-to-interactive')[0];

  // Send metrics to analytics
  sendAnalytics('performance', {
    fcp: fcpEntry?.startTime,
    tti: ttiEntry?.startTime,
  });
};
```

## 🎨 Custom Styling

### CSS Variables

```css
:root {
  --poker-primary-color: #667eea;
  --poker-secondary-color: #764ba2;
  --poker-success-color: #2ed573;
  --poker-error-color: #ff4757;
  --poker-warning-color: #ffa502;

  --poker-table-felt: #0f5132;
  --poker-card-bg: #ffffff;
  --poker-card-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

  --poker-animation-duration: 0.5s;
  --poker-animation-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### Responsive Design

```css
@media (max-width: 768px) {
  .poker-replay {
    transform: scale(0.8);
    transform-origin: top center;
  }

  .controls-panel {
    flex-direction: column;
  }

  .theme-customizer {
    display: none; /* Hide on mobile for simplicity */
  }
}
```

## 📱 Accessibility Features

### Keyboard Navigation

```typescript
// Custom keyboard controls
const useKeyboardControls = () => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ': // Spacebar for play/pause
          event.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight': // Next action
          event.preventDefault();
          nextAction();
          break;
        case 'ArrowLeft': // Previous action
          event.preventDefault();
          previousAction();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
};
```

### Screen Reader Support

```typescript
// ARIA live regions for screen readers
const [announcement, setAnnouncement] = useState<string>('');

const announceAction = (action: Action) => {
  setAnnouncement(
    `${action.player} ${action.type}${
      action.amount ? ` ${action.amount} chips` : ''
    }`
  );
};

return (
  <div aria-live="polite" className="sr-only">
    {announcement}
  </div>
);
```

## 🔗 Integration Examples

### React Context

```typescript
// Global poker game context
const PokerGameContext = createContext({
  hands: [],
  currentHand: 0,
  settings: defaultSettings,
});

export const usePokerGame = () => useContext(PokerGameContext);
```

### State Management

```typescript
// Redux/Zustand integration
const usePokerStore = create((set, get) => ({
  hands: [],
  currentAction: 0,
  isPlaying: false,

  setHands: hands => set({ hands }),
  nextAction: () =>
    set(state => ({
      currentAction: Math.min(state.currentAction + 1, state.totalActions - 1),
    })),
  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),
}));
```

## 📚 Learn More

- **[Basic Example](../basic/)** - Start with the fundamentals
- **[Theming Example](../theming/)** - Focus on visual customization
- **[Framework Examples](../)** - Integration with different React frameworks
- **[API Documentation](../../docs/api/)** - Complete API reference

## 🤝 Contributing

This advanced example demonstrates best practices. Feel free to:

1. Add new features or optimizations
2. Improve accessibility
3. Add more analytics integrations
4. Enhance performance monitoring
5. Create new custom components

---

**Need help?**
[Open an issue](https://github.com/junichiro/poker-replayer/issues) or check the
[discussions](https://github.com/junichiro/poker-replayer/discussions).
