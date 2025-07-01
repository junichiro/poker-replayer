# 🏆 Tournament Example

A specialized example demonstrating tournament-specific features of the Poker
Hand Replay component, including antes, blinds, and multi-table scenarios.

## 🎯 What This Example Shows

- ✅ **Tournament Hands** - SNGs, MTTs, and satellite tournaments
- ✅ **Ante & Blind Structures** - Progressive blind levels
- ✅ **Multi-table Events** - Table changes and seat draws
- ✅ **Bubble Play** - Final table and money bubble scenarios
- ✅ **All-in Situations** - Complex side pot calculations
- ✅ **Tournament Info** - Blind levels, chip counts, payouts
- ✅ **Player Elimination** - Bust outs and table balancing

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## 🏆 Tournament Features

### Hand History Types

```typescript
const tournamentTypes = {
  sng: 'Sit & Go Tournament',
  mtt: 'Multi-Table Tournament',
  satellite: 'Satellite Tournament',
  freeroll: 'Freeroll Tournament',
  bounty: 'Bounty Tournament',
  shootout: 'Shootout Tournament',
};
```

### Blind Structure Display

```typescript
const BlindStructure = ({ level, blinds, ante, duration }) => (
  <div className="blind-structure">
    <div className="level">Level {level}</div>
    <div className="blinds">{blinds.small}/{blinds.big}</div>
    {ante > 0 && <div className="ante">Ante: {ante}</div>}
    <div className="duration">{duration} min</div>
  </div>
);
```

### Tournament Info Panel

```typescript
const TournamentInfo = ({ tournament }) => (
  <div className="tournament-info">
    <h3>{tournament.name}</h3>
    <div className="details">
      <span>Buy-in: ${tournament.buyin}</span>
      <span>Players: {tournament.players}</span>
      <span>Prize Pool: ${tournament.prizePool}</span>
    </div>
    <div className="blinds">
      <span>Level {tournament.level}</span>
      <span>{tournament.blinds}</span>
      {tournament.ante && <span>Ante {tournament.ante}</span>}
    </div>
  </div>
);
```

## 📂 Project Structure

```
tournament/
├── src/
│   ├── data/
│   │   ├── tournament-hands.ts     # Tournament hand histories
│   │   ├── blind-structures.ts     # Blind level progressions
│   │   └── payout-structures.ts    # Prize pool distributions
│   ├── components/
│   │   ├── TournamentInfo.tsx      # Tournament details display
│   │   ├── BlindTimer.tsx          # Blind level countdown
│   │   ├── PayoutTable.tsx         # Prize distribution
│   │   ├── PlayerStack.tsx         # Chip count tracking
│   │   └── BubbleIndicator.tsx     # Money bubble status
│   ├── App.tsx                     # Main application
│   ├── index.tsx                   # Entry point
│   └── styles.css                  # Tournament-specific styling
├── public/
│   └── index.html                  # HTML template
└── README.md                       # This file
```

## 🎯 Tournament Scenarios

### 1. Early Tournament Play

```typescript
const earlyTournamentHand = `
PokerStars Hand #123456789: Tournament #987654321, $20+$2 USD Hold'em No Limit - Level I (10/20) - 2024/01/15 20:00:00 ET
Table '987654321 15' 9-max Seat #1 is the button
Seat 1: Player1 (3000 in chips)
Seat 2: Player2 (3000 in chips)
Seat 3: Player3 (3000 in chips)
Player2: posts small blind 10
Player3: posts big blind 20
*** HOLE CARDS ***
Player1: raises 40 to 60
Player2: folds
Player3: calls 40
*** FLOP *** [Kh 9s 2c]
Player3: checks
Player1: bets 80
Player3: folds
Player1 collected 130 from pot
`;
```

### 2. Ante Level Play

```typescript
const anteHandHistory = `
PokerStars Hand #234567890: Tournament #987654321, $20+$2 USD Hold'em No Limit - Level V (75/150) - 2024/01/15 21:30:00 ET
Table '987654321 15' 9-max Seat #5 is the button
Seat 1: Player1 (4500 in chips)
Seat 2: Player2 (3200 in chips)
Seat 3: Player3 (6800 in chips)
Seat 5: Player5 (2100 in chips)
Player1: posts the ante 20
Player2: posts the ante 20
Player3: posts the ante 20
Player5: posts the ante 20
Player1: posts small blind 75
Player2: posts big blind 150
*** HOLE CARDS ***
Player3: raises 300 to 450
Player5: folds
Player1: calls 375
Player2: folds
*** FLOP *** [As Kd Qh]
Player1: checks
Player3: bets 600
Player1: folds
Player3 collected 1190 from pot
`;
```

### 3. Bubble Play

```typescript
const bubbleHand = `
PokerStars Hand #345678901: Tournament #987654321, $20+$2 USD Hold'em No Limit - Level XII (500/1000) - 2024/01/15 23:45:00 ET
Table '987654321 1' 7-max Seat #3 is the button
*** 7 players left, 6 paid ***
Seat 1: BubbleBoy (3200 in chips)
Seat 2: ChipLeader (28000 in chips)
Seat 3: MediumStack (8500 in chips)
Seat 4: ShortStack (2800 in chips)
Seat 5: SafeStack (12000 in chips)
Seat 6: AggPlayer (9500 in chips)
Seat 7: TightPlayer (6000 in chips)
BubbleBoy: posts the ante 100
ChipLeader: posts the ante 100
MediumStack: posts the ante 100
ShortStack: posts the ante 100
SafeStack: posts the ante 100
AggPlayer: posts the ante 100
TightPlayer: posts the ante 100
ShortStack: posts small blind 500
SafeStack: posts big blind 1000
*** HOLE CARDS ***
AggPlayer: folds
TightPlayer: folds
BubbleBoy: raises 2100 to 3100 and is all-in
ChipLeader: folds
MediumStack: folds
ShortStack: folds
SafeStack: folds
Uncalled bet (2100) returned to BubbleBoy
BubbleBoy collected 3200 from pot
BubbleBoy: doesn't show hand
`;
```

### 4. Final Table

```typescript
const finalTableHand = `
PokerStars Hand #456789012: Tournament #987654321, $20+$2 USD Hold'em No Limit - Level XVIII (2500/5000) - 2024/01/16 01:15:00 ET
Table '987654321 1' 3-max Seat #2 is the button
*** FINAL TABLE ***
Seat 1: Finalist1 (45000 in chips)
Seat 2: Finalist2 (32000 in chips)
Seat 3: Finalist3 (53000 in chips)
Finalist1: posts the ante 500
Finalist2: posts the ante 500
Finalist3: posts the ante 500
Finalist3: posts small blind 2500
Finalist1: posts big blind 5000
*** HOLE CARDS ***
Finalist2: raises 10000 to 15000
Finalist3: folds
Finalist1: calls 10000
*** FLOP *** [Jh Js 7c]
Finalist1: checks
Finalist2: bets 16500 and is all-in
Finalist1: calls 16500
*** TURN *** [Jh Js 7c] [2d]
*** RIVER *** [Jh Js 7c 2d] [Kh]
*** SHOW DOWN ***
Finalist1: shows [Jd Kc] (a full house, Jacks full of Kings)
Finalist2: shows [Ac Ad] (two pair, Aces and Jacks)
Finalist1 collected 67000 from pot
Finalist2 finished the tournament in 2nd place and received $240.00
*** SUMMARY ***
Total pot 67000 | Rake 0
Board [Jh Js 7c 2d Kh]
Seat 1: Finalist1 (big blind) showed [Jd Kc] and won (67000) with a full house, Jacks full of Kings
Seat 2: Finalist2 (button) showed [Ac Ad] and lost with two pair, Aces and Jacks
`;
```

## 🏆 Tournament Components

### Blind Timer

```typescript
const BlindTimer = ({ currentLevel, nextLevel, timeLeft }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="blind-timer">
      <div className="current-level">
        <h3>Level {currentLevel.level}</h3>
        <div className="blinds">{currentLevel.small}/{currentLevel.big}</div>
        {currentLevel.ante && <div className="ante">Ante: {currentLevel.ante}</div>}
      </div>

      <div className="timer">
        <div className="time-left">{formatTime(timeLeft)}</div>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${(timeLeft / currentLevel.duration) * 100}%` }}
          />
        </div>
      </div>

      <div className="next-level">
        <h4>Next: {nextLevel.small}/{nextLevel.big}</h4>
        {nextLevel.ante && <span>Ante: {nextLevel.ante}</span>}
      </div>
    </div>
  );
};
```

### Payout Structure

```typescript
const PayoutTable = ({ payouts, totalPlayers, currentPlayers }) => (
  <div className="payout-table">
    <h3>Prize Structure</h3>
    <div className="payout-grid">
      {payouts.map((payout, index) => (
        <div
          key={index}
          className={`payout-row ${currentPlayers <= index + 1 ? 'in-money' : ''}`}
        >
          <span className="position">{index + 1}</span>
          <span className="percentage">{payout.percentage}%</span>
          <span className="amount">${payout.amount}</span>
        </div>
      ))}
    </div>
    <div className="bubble-info">
      {currentPlayers > payouts.length ? (
        <span className="bubble-warning">
          {currentPlayers - payouts.length} from the money
        </span>
      ) : (
        <span className="in-money">In the money!</span>
      )}
    </div>
  </div>
);
```

### Player Chip Stack Tracker

```typescript
const PlayerStackTracker = ({ players, averageStack }) => (
  <div className="stack-tracker">
    <h3>Chip Counts</h3>
    {players
      .sort((a, b) => b.chips - a.chips)
      .map((player, index) => (
        <div key={player.name} className="player-stack">
          <span className="rank">#{index + 1}</span>
          <span className="name">{player.name}</span>
          <span className="chips">{player.chips.toLocaleString()}</span>
          <div className="stack-bar">
            <div
              className="stack-fill"
              style={{ width: `${(player.chips / averageStack) * 50}%` }}
            />
          </div>
          <span className="bb-count">
            {Math.floor(player.chips / currentBlinds.big)} BB
          </span>
        </div>
      ))}
  </div>
);
```

## 📊 Tournament Analytics

### ICM Calculator

```typescript
const calculateICM = (stacks: number[], payouts: number[]) => {
  // Independent Chip Model calculation
  const totalChips = stacks.reduce((sum, stack) => sum + stack, 0);

  return stacks.map(stack => {
    const chipPercentage = stack / totalChips;
    const equityValue = payouts.reduce((equity, payout, index) => {
      const probability = calculateFinishProbability(stack, stacks, index);
      return equity + probability * payout;
    }, 0);

    return {
      chips: stack,
      percentage: chipPercentage,
      equity: equityValue,
      bb: Math.floor(stack / currentBlinds.big),
    };
  });
};
```

### Bubble Factor

```typescript
const calculateBubbleFactor = (
  playerStack: number,
  averageStack: number,
  playersLeft: number,
  payouts: number
) => {
  const chipEquity = playerStack / (averageStack * playersLeft);
  const prizeEquity = calculateICMEquity(
    playerStack,
    allStacks,
    payoutStructure
  );

  return chipEquity / prizeEquity;
};
```

## 🎯 Advanced Tournament Features

### Table Balancing

```typescript
const TableBalancer = ({ tables, targetSize }) => {
  const balanceTables = () => {
    // Algorithm to balance player counts across tables
    const totalPlayers = tables.reduce((sum, table) => sum + table.players.length, 0);
    const tablesNeeded = Math.ceil(totalPlayers / targetSize);

    // Redistribute players
    return redistributePlayers(tables, tablesNeeded, targetSize);
  };

  useEffect(() => {
    const balanced = balanceTables();
    if (balanced !== tables) {
      onTablesRebalanced(balanced);
    }
  }, [tables]);

  return (
    <div className="table-balancer">
      {tables.map(table => (
        <div key={table.id} className="table-status">
          <span>Table {table.number}: {table.players.length} players</span>
          {table.players.length < 4 && <span className="breaking">Breaking</span>}
        </div>
      ))}
    </div>
  );
};
```

### Satellite Qualification

```typescript
const SatelliteTracker = ({ target, seats, qualified }) => (
  <div className="satellite-info">
    <h3>Satellite to {target}</h3>
    <div className="qualification-status">
      <span>{qualified.length} of {seats} seats won</span>
      <div className="qualified-players">
        {qualified.map(player => (
          <span key={player} className="qualified">{player} ✓</span>
        ))}
      </div>
    </div>
  </div>
);
```

## 🔧 Configuration

### Tournament-Specific Settings

```typescript
const tournamentConfig = {
  theme: 'professional',
  showChipCounts: true,
  showBlindLevels: true,
  highlightBubble: true,
  showICMValues: true,
  enableSoundAlerts: true,
  animations: {
    chipStacking: true,
    eliminationEffects: true,
    levelUpTransitions: true,
  },
};
```

## 📚 Tournament Resources

- **Poker Tournament Strategy**
  - [Tournament Poker Strategy](https://www.pokerstrategy.com/)
  - [ICM Calculations](https://www.holdemresources.net/)
  - [Bubble Play Guide](https://upswingpoker.com/bubble-play/)

- **Tournament Formats**
  - [PokerStars Tournament Types](https://www.pokerstars.com/poker/tournaments/)
  - [MTT vs SNG Strategy](https://www.partypoker.com/how-to-play/strategy/)

## 🔗 Related Examples

- **[Advanced Example](../advanced/)** - Complete feature showcase
- **[Basic Example](../basic/)** - Fundamental concepts
- **[Theming Example](../theming/)** - Visual customization

---

**Tournament ready!** This example covers everything from early play to final
table scenarios.
