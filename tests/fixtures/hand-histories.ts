/**
 * Test fixtures containing realistic hand history data for testing
 */

export const handHistories = {
  // Basic cash game hand
  basicCashGame: `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (200 in chips)
Seat 2: Player2 (250 in chips)
Seat 3: Player3 (180 in chips)
Player2: posts small blind 1
Player3: posts big blind 2
*** HOLE CARDS ***
Dealt to Player1 [Ah Kh]
Player1: raises 4 to 6
Player2: folds
Player3: calls 4
*** FLOP *** [As Kd 9c]
Player3: checks
Player1: bets 8
Player3: calls 8
*** TURN *** [As Kd 9c] [2h]
Player3: checks
Player1: bets 20
Player3: folds
Uncalled bet (20) returned to Player1
Player1 collected 29 from pot
Player1: doesn't show hand
*** SUMMARY ***
Total pot 29 | Rake 0
Board [As Kd 9c 2h]
Seat 1: Player1 (button) collected (29)
Seat 2: Player2 (small blind) folded before Flop
Seat 3: Player3 (big blind) folded on the Turn`,

  // Tournament hand with antes
  tournamentWithAntes: `PokerStars Hand #987654321: Tournament #123456789, $10+$1 USD Hold'em No Limit - Level V (300/600) - 2024/01/15 21:00:00 ET
Table '123456789 15' 9-max Seat #5 is the button
Seat 1: TourneyPlayer1 (15000 in chips)
Seat 2: TourneyPlayer2 (12000 in chips)
Seat 3: TourneyPlayer3 (8000 in chips)
Seat 5: ButtonPlayer (20000 in chips)
TourneyPlayer1: posts the ante 75
TourneyPlayer2: posts the ante 75
TourneyPlayer3: posts the ante 75
ButtonPlayer: posts the ante 75
TourneyPlayer1: posts small blind 300
TourneyPlayer2: posts big blind 600
*** HOLE CARDS ***
TourneyPlayer3: raises 1200 to 1800
ButtonPlayer: calls 1800
TourneyPlayer1: folds
TourneyPlayer2: calls 1200
*** FLOP *** [Qh Js 9d]
TourneyPlayer2: checks
TourneyPlayer3: bets 2400
ButtonPlayer: raises 4800 to 7200
TourneyPlayer2: folds
TourneyPlayer3: folds
Uncalled bet (4800) returned to ButtonPlayer
ButtonPlayer collected 10650 from pot
*** SUMMARY ***
Total pot 10650 | Rake 0
Board [Qh Js 9d]`,

  // All-in scenario
  allInScenario: `PokerStars Hand #456789123: Hold'em No Limit ($2/$5 USD) - 2024/01/15 22:00:00 ET
Table 'AllInTable' 6-max Seat #3 is the button
Seat 1: ShortStack (45 in chips)
Seat 2: MediumStack (120 in chips)
Seat 3: BigStack (300 in chips)
ShortStack: posts small blind 2
MediumStack: posts big blind 5
*** HOLE CARDS ***
Dealt to ShortStack [Ac Ah]
BigStack: raises 10 to 15
ShortStack: raises 30 to 45 and is all-in
MediumStack: calls 40
BigStack: calls 30
*** FLOP *** [Kh 9s 2c]
MediumStack: checks
BigStack: bets 75
MediumStack: calls 75 and is all-in
*** TURN *** [Kh 9s 2c] [7d]
*** RIVER *** [Kh 9s 2c 7d] [3h]
*** SHOW DOWN ***
ShortStack: shows [Ac Ah] (a pair of Aces)
MediumStack: shows [Kc Qd] (a pair of Kings)
BigStack: shows [9h 9c] (three of a kind, Nines)
ShortStack collected 135 from main pot
BigStack collected 150 from side pot
*** SUMMARY ***
Total pot 285 Main pot 135. Side pot 150. | Rake 0
Board [Kh 9s 2c 7d 3h]
Seat 1: ShortStack (small blind) showed [Ac Ah] and won (135) with a pair of Aces
Seat 2: MediumStack (big blind) showed [Kc Qd] and lost with a pair of Kings
Seat 3: BigStack (button) showed [9h 9c] and won (150) with three of a kind, Nines`,

  // Split pot scenario
  splitPot: `PokerStars Hand #789123456: Hold'em No Limit ($1/$2 USD) - 2024/01/15 23:00:00 ET
Table 'SplitTable' 6-max Seat #2 is the button
Seat 1: SplitPlayer1 (200 in chips)
Seat 2: SplitPlayer2 (250 in chips)
SplitPlayer1: posts small blind 1
SplitPlayer2: posts big blind 2
*** HOLE CARDS ***
SplitPlayer1: calls 1
SplitPlayer2: checks
*** FLOP *** [As Kd Qc]
SplitPlayer1: bets 4
SplitPlayer2: calls 4
*** TURN *** [As Kd Qc] [Jh]
SplitPlayer1: bets 10
SplitPlayer2: calls 10
*** RIVER *** [As Kd Qc Jh] [Tc]
SplitPlayer1: checks
SplitPlayer2: checks
*** SHOW DOWN ***
SplitPlayer1: shows [Ah 9h] (a straight, Ten to Ace)
SplitPlayer2: shows [Kh Qh] (a straight, Ten to Ace)
SplitPlayer1 collected 16 from pot
SplitPlayer2 collected 16 from pot
*** SUMMARY ***
Total pot 32 | Rake 0
Board [As Kd Qc Jh Tc]
Seat 1: SplitPlayer1 (small blind) showed [Ah 9h] and won (16) with a straight, Ten to Ace
Seat 2: SplitPlayer2 (big blind) showed [Kh Qh] and won (16) with a straight, Ten to Ace`,

  // Player state changes (timeout, disconnect)
  playerStateChanges: `PokerStars Hand #147258369: Hold'em No Limit ($1/$2 USD) - 2024/01/16 10:00:00 ET
Table 'StateTable' 6-max Seat #1 is the button
Seat 1: ActivePlayer (200 in chips)
Seat 2: TimeoutPlayer (180 in chips)
Seat 3: DisconnectPlayer (220 in chips)
ActivePlayer: posts small blind 1
TimeoutPlayer: posts big blind 2
*** HOLE CARDS ***
DisconnectPlayer is disconnected
ActivePlayer: raises 4 to 6
TimeoutPlayer has timed out
TimeoutPlayer: folds
DisconnectPlayer: folds
ActivePlayer collected 4 from pot
ActivePlayer: doesn't show hand
*** SUMMARY ***
Total pot 4 | Rake 0
Seat 1: ActivePlayer (button) (small blind) collected (4)
Seat 2: TimeoutPlayer (big blind) folded before Flop (didn't bet)
Seat 3: DisconnectPlayer folded before Flop (didn't bet)`,

  // Invalid hand histories for error testing
  emptyHandHistory: '',
  
  invalidHeader: `Invalid header line
Table 'test' 9-max Seat #1 is the button`,
  
  missingPlayers: `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button`,

  malformedAction: `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (200 in chips)
Player1: posts small blind 1
*** HOLE CARDS ***`,

  // Complex multi-way all-in
  complexAllIn: `PokerStars Hand #555666777: Tournament #987654321, $500/$1000 USD Hold'em No Limit - Level X (500/1000) - 2024/01/16 15:00:00 ET
Table '987654321 10' 9-max Seat #4 is the button
Seat 1: VeryShortStack (800 in chips)
Seat 2: ShortStack (2500 in chips)
Seat 3: MediumStack (4000 in chips)
Seat 4: ChipLeader (12000 in chips)
VeryShortStack: posts small blind 500
ShortStack: posts big blind 1000
*** HOLE CARDS ***
Dealt to ChipLeader [Ks Kd]
MediumStack: raises 3000 to 4000 and is all-in
ChipLeader: calls 4000
VeryShortStack: calls 300 and is all-in
ShortStack: calls 1500 and is all-in
*** FLOP *** [9h 5c 2d]
*** TURN *** [9h 5c 2d] [7s]
*** RIVER *** [9h 5c 2d 7s] [Qh]
*** SHOW DOWN ***
VeryShortStack: shows [As Ah] (a pair of Aces)
ShortStack: shows [Jc Js] (a pair of Jacks)
MediumStack: shows [Ac Kc] (high card Ace)
ChipLeader: shows [Ks Kd] (a pair of Kings)
VeryShortStack collected 3200 from main pot
ChipLeader collected 5100 from side pot-1
ChipLeader collected 3000 from side pot-2
*** SUMMARY ***
Total pot 11300 Main pot 3200. Side pot-1 5100. Side pot-2 3000. | Rake 0
Board [9h 5c 2d 7s Qh]
Seat 1: VeryShortStack (small blind) showed [As Ah] and won (3200) with a pair of Aces
Seat 2: ShortStack (big blind) showed [Jc Js] and lost with a pair of Jacks
Seat 3: MediumStack showed [Ac Kc] and lost with high card Ace
Seat 4: ChipLeader (button) showed [Ks Kd] and won (8100) with a pair of Kings`
};

// Expected parsed results for validation
export const expectedResults = {
  basicCashGame: {
    id: '123456789',
    stakes: '$1/$2',
    playerCount: 3,
    actionsCount: 10, // Expected number of actions
    boardCards: ['As', 'Kd', '9c', '2h'],
    potAmount: 29
  },
  
  tournamentWithAntes: {
    id: '987654321',
    tournamentId: '123456789',
    stakes: '$300/$600',
    playerCount: 4,
    anteCount: 4,
    boardCards: ['Qh', 'Js', '9d']
  },
  
  allInScenario: {
    id: '456789123',
    stakes: '$2/$5',
    playerCount: 3,
    allInCount: 2, // Number of all-in actions
    sidePots: 1,
    mainPotAmount: 135,
    sidePotAmount: 150
  },
  
  splitPot: {
    id: '789123456',
    stakes: '$1/$2',
    playerCount: 2,
    isSplit: true,
    splitAmount: 16
  }
};

// Test data for specific parsing methods
export const testCases = {
  headers: [
    {
      input: "PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET",
      expected: {
        id: '123456789',
        stakes: '$1/$2',
        date: new Date('2024-01-15T20:00:00')
      }
    },
    {
      input: "PokerStars Hand #987654321: Tournament #555666777, $10+$1 USD Hold'em No Limit - Level V (300/600) - 2024/01/15 21:00:00 ET",
      expected: {
        id: '987654321',
        tournamentId: '555666777',
        stakes: '$300/$600',
        date: new Date('2024-01-15T21:00:00')
      }
    }
  ],
  
  players: [
    {
      input: "Seat 1: Player1 (200 in chips)",
      expected: {
        seat: 1,
        name: 'Player1',
        chips: 200
      }
    },
    {
      input: "Seat 5: LongPlayerName (15000 in chips)",
      expected: {
        seat: 5,
        name: 'LongPlayerName',
        chips: 15000
      }
    }
  ],
  
  actions: [
    {
      input: "Player1: raises 4 to 6",
      expected: {
        type: 'raise',
        player: 'Player1',
        amount: 6
      }
    },
    {
      input: "Player2: calls 30 and is all-in",
      expected: {
        type: 'call',
        player: 'Player2',
        amount: 30,
        isAllIn: true
      }
    },
    {
      input: "Player3: folds",
      expected: {
        type: 'fold',
        player: 'Player3'
      }
    }
  ]
};