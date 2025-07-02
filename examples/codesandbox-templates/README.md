# 🏖️ CodeSandbox Templates

Ready-to-use CodeSandbox templates for quickly experimenting with Poker Hand
Replay components.

## 🚀 Available Templates

| Template       | Description                          | Status      |
| -------------- | ------------------------------------ | ----------- |
| **Basic**      | Simple setup with essential features | Coming Soon |
| **Vite**       | Modern build tooling with fast HMR   | Coming Soon |
| **Advanced**   | Complete feature showcase            | Planned     |
| **Theming**    | Custom themes and styling            | Planned     |
| **Tournament** | Tournament-specific features         | Planned     |

## 📋 Template Configurations

### Basic Template

```json
{
  "name": "poker-hand-replay-basic",
  "description": "Basic Poker Hand Replay example",
  "template": "create-react-app-typescript",
  "dependencies": {
    "poker-hand-replay": "latest",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.0"
  }
}
```

### Advanced Template

```json
{
  "name": "poker-hand-replay-advanced",
  "description": "Advanced Poker Hand Replay example with all features",
  "template": "create-react-app-typescript",
  "dependencies": {
    "poker-hand-replay": "latest",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^16.18.0"
  }
}
```

## 🔧 Quick Setup

### 1. Fork Template

Click on any template link above to open it in CodeSandbox.

### 2. Customize

- Edit the hand history data
- Modify theme and configuration
- Add your own components

### 3. Share

- Save your customized version
- Share the URL with others
- Embed in documentation

## 📝 Template Contents

Each template includes:

- ✅ **Pre-configured setup** - Ready to run immediately
- ✅ **Sample hand histories** - Real PokerStars data
- ✅ **TypeScript support** - Full type safety
- ✅ **Comments and documentation** - Learn as you go
- ✅ **Multiple examples** - Different use cases
- ✅ **Responsive design** - Works on all devices

## 🎯 Use Cases

### Learning

- Understand component API
- Experiment with configurations
- Test different hand histories

### Prototyping

- Quick proof of concepts
- Client demonstrations
- Feature testing

### Bug Reports

- Reproduce issues
- Share minimal examples
- Collaborate on fixes

### Integration Testing

- Test with your data
- Verify compatibility
- Performance testing

## 🔗 Creating Your Own Template

### 1. Base Configuration

```json
{
  "name": "your-poker-template",
  "description": "Your custom poker template",
  "template": "create-react-app-typescript",
  "dependencies": {
    "poker-hand-replay": "^1.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### 2. App.tsx

```typescript
import React from 'react';
import { PokerHandReplay } from 'poker-hand-replay';

const sampleHand = `
PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'Example' 6-max Seat #1 is the button
Seat 1: Player1 (200 in chips)
Seat 2: Player2 (250 in chips)
Player2: posts small blind 1
Player1: posts big blind 2
*** HOLE CARDS ***
Dealt to Player1 [Ah Kh]
Player2: raises 4 to 6
Player1: calls 4
*** FLOP *** [As Kd 9c]
Player1: checks
Player2: bets 8
Player1: calls 8
*** TURN *** [As Kd 9c] [2h]
Player1: checks
Player2: bets 20
Player1: calls 20
*** RIVER *** [As Kd 9c 2h] [3h]
Player1: checks
Player2: checks
*** SHOW DOWN ***
Player1: shows [Ah Kh] (a pair of Aces)
Player2: shows [Kc Qd] (high card King)
Player1 collected 68 from pot
*** SUMMARY ***
Total pot 68 | Rake 0
Board [As Kd 9c 2h 3h]
Seat 1: Player1 (big blind) showed [Ah Kh] and won (68) with a pair of Aces
Seat 2: Player2 (small blind) showed [Kc Qd] and lost with high card King
`;

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🃏 Poker Hand Replay</h1>
      <PokerHandReplay
        handHistory={sampleHand}
        config={{
          theme: "dark",
          autoPlay: false,
          animationSpeed: 1.5
        }}
      />
    </div>
  );
}

export default App;
```

### 3. index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Poker Hand Replay Template</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #0f1419;
        color: white;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## 🛠️ Advanced Templates

### With React Router

```typescript
// For multi-page applications
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/replay/:handId" element={<ReplayPage />} />
        <Route path="/gallery" element={<HandGallery />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### With State Management

```typescript
// With Redux Toolkit
import { configureStore, createSlice } from '@reduxjs/toolkit';

const pokerSlice = createSlice({
  name: 'poker',
  initialState: {
    hands: [],
    currentHand: 0,
    isPlaying: false,
  },
  reducers: {
    loadHand: (state, action) => {
      state.hands.push(action.payload);
    },
    setCurrentHand: (state, action) => {
      state.currentHand = action.payload;
    },
    togglePlay: state => {
      state.isPlaying = !state.isPlaying;
    },
  },
});
```

### With Styled Components

```typescript
// With styled-components
import styled from 'styled-components';

const PokerContainer = styled.div`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 3rem;
  text-align: center;
`;
```

## 📚 Resources

- **[CodeSandbox Documentation](https://codesandbox.io/docs/)**
- **[React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)**
- **[Poker Hand Replay API](../../docs/api/)**

## 🤝 Contributing Templates

Want to create a new template?

1. **Fork an existing template**
2. **Make your modifications**
3. **Test thoroughly**
4. **Submit a pull request**

### Template Guidelines

- ✅ **Keep it focused** - One concept per template
- ✅ **Document everything** - Clear comments and README
- ✅ **Test thoroughly** - Ensure it works out of the box
- ✅ **Follow conventions** - Use established patterns
- ✅ **Include examples** - Show different use cases

---

**Ready to experiment?** Pick a template and start building amazing poker
applications!
