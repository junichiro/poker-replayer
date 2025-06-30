import { useState } from 'react';
import { PokerHandReplay, type ComponentTheme, type Action, type ReplayEventCallback } from 'poker-hand-replay';
import './App.css';

const sampleHandHistory = `PokerStars Hand #243490149326: Tournament #3476545632, $10+$1 USD Hold'em No Limit - Level I (10/20) - 2024/01/15 20:30:00 ET
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
Seat 3: Player3 folded before Flop (didn't bet)`;

function App() {
  const [theme, setTheme] = useState<ComponentTheme>('dark');

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚡ Vite + Poker Hand Replay</h1>
        <p>Fast development with instant HMR</p>
      </header>

      <div className="controls">
        <label htmlFor="theme-select">Theme:</label>
        <select 
          id="theme-select"
          value={theme} 
          onChange={(e) => setTheme(e.target.value as ComponentTheme)}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="casino">Casino</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      <main className="replay-container">
        <PokerHandReplay
          handHistory={sampleHandHistory}
          config={{
            theme,
            autoPlay: false,
            animationSpeed: 1.5,
            tableShape: 'oval',
            cardDesign: 'four-color',
          }}
          onActionChange={(action: Action, index: number) => {
            console.log(`Action ${index + 1}:`, action);
          }}
          onReplayEvent={(event, data) => {
            console.log('Replay event:', event, data);
          }}
        />
      </main>

      <footer className="app-footer">
        <p>
          Built with ⚡ <a href="https://vitejs.dev" target="_blank">Vite</a> and 
          🃏 <a href="../../README.md" target="_blank">Poker Hand Replay</a>
        </p>
        <p>
          Edit <code>src/App.tsx</code> and save to see changes instantly!
        </p>
      </footer>
    </div>
  );
}

export default App;