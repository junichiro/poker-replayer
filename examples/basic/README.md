# 🃏 Basic Example

A minimal example demonstrating the core functionality of the Poker Hand Replay
component.

## 🎯 What This Example Shows

- ✅ Basic `PokerHandReplay` component usage
- ✅ Simple hand history parsing
- ✅ Default theme and controls
- ✅ Error handling
- ✅ TypeScript integration

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
basic/
├── src/
│   ├── App.tsx          # Main application component
│   ├── index.tsx        # React entry point
│   ├── hand-data.ts     # Sample hand history data
│   └── index.css        # Basic styling
├── public/
│   └── index.html       # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🔧 Key Features Demonstrated

### Basic Component Usage

```typescript
import { PokerHandReplay } from 'poker-hand-replay';

function App() {
  return (
    <PokerHandReplay
      handHistory={handHistoryString}
      config={{
        theme: "dark",
        autoPlay: false,
        animationSpeed: 1.0
      }}
    />
  );
}
```

### Error Handling

```typescript
// Graceful error handling for invalid hand histories
const [error, setError] = useState<string | null>(null);

const handleReplayEvent = (event: string, data?: any) => {
  if (event === 'parseError') {
    setError(data.error?.message || 'Failed to parse hand history');
  } else if (event === 'parseSuccess') {
    setError(null);
  }
};
```

### Action Tracking

```typescript
// Track current action for debugging or analytics
const handleActionChange = (action: Action, index: number) => {
  console.log(`Action ${index + 1}: ${action.player} ${action.type}`, action);
};
```

## 📋 Dependencies

- **poker-hand-replay** - The main component library
- **react** ^18.0.0 - React framework
- **react-dom** ^18.0.0 - React DOM renderer
- **typescript** ^4.9.0 - TypeScript support

## 🎨 Customization

### Changing Themes

```typescript
// Available themes: "light", "dark", "auto", "casino", "professional"
<PokerHandReplay
  config={{ theme: "casino" }}
  handHistory={handHistory}
/>
```

### Animation Speed

```typescript
// Speed range: 0.5 (slow) to 3.0 (fast)
<PokerHandReplay
  config={{ animationSpeed: 2.0 }}
  handHistory={handHistory}
/>
```

### Auto-play

```typescript
// Enable auto-play for automatic progression
<PokerHandReplay
  config={{ autoPlay: true }}
  handHistory={handHistory}
/>
```

## 🐛 Troubleshooting

### Common Issues

**Component not rendering**

- Ensure you have React 16.8+ installed
- Check that the hand history string is valid
- Verify TypeScript configuration

**Parse errors**

- Check hand history format (must be PokerStars format)
- Ensure the string is complete and properly formatted
- Use the error callback to debug parsing issues

**Styling issues**

- Import the component CSS if required
- Check for CSS conflicts with your existing styles
- Use the `className` prop for custom styling

## 📚 Next Steps

- **Advanced Example** - Explore all component features
- **Theming Example** - Learn custom styling
- **Framework Examples** - Next.js, Vite, CRA integration

## 🔗 Useful Links

- [Main Documentation](../../README.md)
- [API Reference](../../docs/api/)
- [Other Examples](../)

---

**Need help?**
[Open an issue](https://github.com/junichiro/poker-replayer/issues) or check the
[discussions](https://github.com/junichiro/poker-replayer/discussions).
