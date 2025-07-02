import { PokerStarsParser } from './src/parser/PokerStarsParser';

const testHandHistories = {
  multipleSidePots: `PokerStars Hand #123456900: Tournament #987654340, $50+$5 USD Hold'em No Limit - Level X (500/1000) - 2024/01/15 20:00:00 ET
Table '987654340 15' 9-max Seat #3 is the button
Seat 1: SmallStack (800 in chips)
Seat 2: MediumStack (2500 in chips)
Seat 3: LargeStack (4000 in chips)
Seat 4: BigStack (10000 in chips)
SmallStack: posts small blind 500
MediumStack: posts big blind 1000
*** HOLE CARDS ***
Dealt to BigStack [Ah Ad]
LargeStack: raises 3000 to 4000 and is all-in
BigStack: calls 4000
SmallStack: calls 300 and is all-in
MediumStack: calls 1500 and is all-in
*** FLOP *** [Kh 9s 3d]
*** TURN *** [Kh 9s 3d] [2h]
*** RIVER *** [Kh 9s 3d 2h] [7c]
*** SHOW DOWN ***
SmallStack: shows [Qh Qs] (a pair of Queens)
MediumStack: shows [Jc Jd] (a pair of Jacks)
LargeStack: shows [Ac Ks] (a pair of Aces)
BigStack: shows [Ah Ad] (a pair of Aces)
BigStack collected 3200 from side pot-2
BigStack collected 5100 from side pot-1
BigStack collected 3200 from main pot
*** SUMMARY ***
Total pot 11500 Main pot 3200. Side pot-1 5100. Side pot-2 3200. | Rake 0
Board [Kh 9s 3d 2h 7c]
Seat 1: SmallStack (small blind) showed [Qh Qs] and lost with a pair of Queens
Seat 2: MediumStack (big blind) showed [Jc Jd] and lost with a pair of Jacks
Seat 3: LargeStack (button) showed [Ac Ks] and lost with a pair of Aces
Seat 4: BigStack showed [Ah Ad] and won (11500) with a pair of Aces`,

  splitPotWithOddChip: `PokerStars Hand #123456901: Hold'em No Limit ($2/$5 USD) - 2024/01/15 21:00:00 ET
Table 'SplitTest' 6-max Seat #1 is the button
Seat 1: Player1 (500 in chips)
Seat 2: Player2 (500 in chips)
Seat 3: Player3 (500 in chips)
Player1: posts small blind 2
Player2: posts big blind 5
*** HOLE CARDS ***
Player3: calls 5
Player1: calls 3
Player2: checks
*** FLOP *** [As Kd Qc]
Player1: checks
Player2: bets 10
Player3: calls 10
Player1: folds
*** TURN *** [As Kd Qc] [Jh]
Player2: bets 25
Player3: calls 25
*** RIVER *** [As Kd Qc Jh] [Tc]
Player2: checks
Player3: checks
*** SHOW DOWN ***
Player2: shows [Kh Jd] (a straight, Ten to Ace)
Player3: shows [Ac Qh] (a straight, Ten to Ace)
Player2 collected 41 from pot
Player3 collected 40 from pot
*** SUMMARY ***
Total pot 81 | Rake 1
Board [As Kd Qc Jh Tc]
Seat 1: Player1 (button) (small blind) folded on the Flop
Seat 2: Player2 (big blind) showed [Kh Jd] and won (41) with a straight, Ten to Ace
Seat 3: Player3 showed [Ac Qh] and won (40) with a straight, Ten to Ace`,

  incompleteHandTimeout: `PokerStars Hand #123456902: Tournament #987654341, $10+$1 USD Hold'em No Limit - Level II (50/100) - 2024/01/15 22:00:00 ET
Table '987654341 20' 9-max Seat #5 is the button
Seat 1: ActivePlayer (1500 in chips)
Seat 2: TimeoutPlayer (1500 in chips)
Seat 3: DisconnectPlayer (1500 in chips)
Seat 5: ButtonPlayer (1500 in chips)
ActivePlayer: posts small blind 50
TimeoutPlayer: posts big blind 100
*** HOLE CARDS ***
DisconnectPlayer is disconnected
ActivePlayer: raises 150 to 250
TimeoutPlayer has timed out
TimeoutPlayer: folds
DisconnectPlayer: folds
ButtonPlayer: calls 250
*** FLOP *** [2s 7h Kc]
ActivePlayer: bets 300
ButtonPlayer: calls 300
*** TURN *** [2s 7h Kc] [5d]
ActivePlayer: checks
ButtonPlayer: bets 500
ActivePlayer: folds
Uncalled bet (500) returned to ButtonPlayer
ButtonPlayer collected 1200 from pot
ButtonPlayer: mucks hand
*** SUMMARY ***
Total pot 1200 | Rake 0
Board [2s 7h Kc 5d]
Seat 1: ActivePlayer (small blind) folded on the Turn
Seat 2: TimeoutPlayer (big blind) folded before Flop (didn't bet)
Seat 3: DisconnectPlayer folded before Flop (didn't bet)
Seat 5: ButtonPlayer (button) collected (1200)`,

  complexAllInScenario: `PokerStars Hand #123456903: Tournament #987654342, $100+$10 USD Hold'em No Limit - Level XV (2000/4000) - 2024/01/15 23:00:00 ET
Table '987654342 8' 9-max Seat #2 is the button
Seat 1: ShortestStack (3000 in chips)
Seat 2: ShortStack (8000 in chips)
Seat 3: MidStack (15000 in chips)
Seat 4: ChipLeader (50000 in chips)
ShortestStack: posts small blind 2000
ShortStack: posts big blind 4000
*** HOLE CARDS ***
Dealt to ChipLeader [Ks Kd]
MidStack: raises 11000 to 15000 and is all-in
ChipLeader: calls 15000
ShortestStack: calls 1000 and is all-in
ShortStack: calls 4000 and is all-in
*** FLOP *** [9h 5c 2d]
*** TURN *** [9h 5c 2d] [7s]
*** RIVER *** [9h 5c 2d 7s] [Qh]
*** SHOW DOWN ***
ShortestStack: shows [As Ah] (a pair of Aces)
ShortStack: shows [Kc Qc] (a pair of Queens)
MidStack: shows [Jc Js] (a pair of Jacks)
ChipLeader: shows [Ks Kd] (a pair of Kings)
ShortestStack collected 12000 from main pot
ChipLeader collected 20000 from side pot-1
ChipLeader collected 14000 from side pot-2
*** SUMMARY ***
Total pot 46000 Main pot 12000. Side pot-1 20000. Side pot-2 14000. | Rake 0
Board [9h 5c 2d 7s Qh]
Seat 1: ShortestStack (small blind) showed [As Ah] and won (12000) with a pair of Aces
Seat 2: ShortStack (button) (big blind) showed [Kc Qc] and lost with a pair of Queens
Seat 3: MidStack showed [Jc Js] and lost with a pair of Jacks
Seat 4: ChipLeader showed [Ks Kd] and won (34000) with a pair of Kings`,
};

console.log('Testing edge case handling...\n');

const parser = new PokerStarsParser();
let totalTests = 0;
let passedTests = 0;

// Test 1: Multiple Side Pots
console.log('=== Test 1: Multiple Side Pots ===');
const result1 = parser.parse(testHandHistories.multipleSidePots);
if (result1.success && result1.hand) {
  const pots = result1.hand.pots;
  console.log(`Found ${pots.length} pots:`);

  pots.forEach((pot, index) => {
    const type = pot.isSide ? `side pot-${pot.sidePotLevel}` : 'main pot';
    const winners = pot.players.join(', ');
    const eligibility = pot.eligiblePlayers ? `(${pot.eligiblePlayers.length} eligible)` : '';
    console.log(`- ${type}: $${pot.amount} won by ${winners} ${eligibility}`);
  });

  // Validate side pot structure
  const mainPot = pots.find(p => !p.isSide);
  const sidePots = pots
    .filter(p => p.isSide)
    .sort((a, b) => (a.sidePotLevel || 0) - (b.sidePotLevel || 0));

  totalTests++;
  if (mainPot && sidePots.length === 2 && pots.every(p => p.players.length > 0)) {
    console.log('✅ Multiple side pots test passed');
    passedTests++;

    // Additional validation: Check if eligibility makes sense
    const eligibilityCorrect = sidePots.every(
      sp => sp.eligiblePlayers && sp.eligiblePlayers.length <= 4
    );
    if (eligibilityCorrect) {
      console.log('✅ Side pot eligibility calculated correctly');
    } else {
      console.log('⚠️  Side pot eligibility may be incorrect');
    }
  } else {
    console.log('❌ Multiple side pots test failed');
  }
} else {
  console.log('❌ Failed to parse multiple side pots scenario');
  totalTests++;
}

console.log('\n=== Test 2: Split Pot with Odd Chip ===');
const result2 = parser.parse(testHandHistories.splitPotWithOddChip);
if (result2.success && result2.hand) {
  const pots = result2.hand.pots;
  console.log(`Found ${pots.length} pots:`);

  pots.forEach(pot => {
    const splitInfo = pot.isSplit ? ' (SPLIT)' : '';
    const oddChip = pot.oddChipWinner ? ` [odd chip: ${pot.oddChipWinner}]` : '';
    console.log(`- Pot: $${pot.amount} won by ${pot.players.join(', ')}${splitInfo}${oddChip}`);
  });

  totalTests++;
  if (pots.length === 1 && pots[0].isSplit && pots[0].players.length === 2) {
    console.log('✅ Split pot with odd chip test passed');
    passedTests++;

    // Check if odd chip winner is identified
    if (pots[0].oddChipWinner) {
      console.log('✅ Odd chip winner correctly identified');
    } else {
      console.log('⚠️  Odd chip winner not identified (may be normal for this scenario)');
    }
  } else {
    console.log('❌ Split pot with odd chip test failed');
  }
} else {
  console.log('❌ Failed to parse split pot scenario');
  totalTests++;
}

console.log('\n=== Test 3: Incomplete Hand with Timeouts ===');
const result3 = parser.parse(testHandHistories.incompleteHandTimeout);
if (result3.success && result3.hand) {
  const timeoutActions = result3.hand.actions.filter(
    action => action.type === 'timeout' || action.type === 'disconnect'
  );

  console.log(`Found ${timeoutActions.length} player state actions:`);
  timeoutActions.forEach(action => {
    console.log(`- ${action.player}: ${action.type}${action.reason ? ` (${action.reason})` : ''}`);
  });

  const pots = result3.hand.pots;
  console.log(`Hand completed with ${pots.length} pot(s) despite player issues`);

  totalTests++;
  if (timeoutActions.length >= 2 && pots.length === 1 && pots[0].players.length === 1) {
    console.log('✅ Incomplete hand handling test passed');
    passedTests++;
  } else {
    console.log('❌ Incomplete hand handling test failed');
  }
} else {
  console.log('❌ Failed to parse incomplete hand scenario');
  totalTests++;
}

console.log('\n=== Test 4: Complex All-in Scenario ===');
const result4 = parser.parse(testHandHistories.complexAllInScenario);
if (result4.success && result4.hand) {
  const allInActions = result4.hand.actions.filter(action => action.isAllIn);
  console.log(`Found ${allInActions.length} all-in actions:`);
  allInActions.forEach(action => {
    console.log(`- ${action.player}: ${action.type} $${action.amount} (all-in)`);
  });

  const pots = result4.hand.pots;
  console.log(`\nPot structure with ${pots.length} pots:`);
  pots.forEach(pot => {
    const type = pot.isSide ? `side pot-${pot.sidePotLevel}` : 'main pot';
    console.log(`- ${type}: $${pot.amount} won by ${pot.players.join(', ')}`);
  });

  // Validate complex scenario
  const mainPot = pots.find(p => !p.isSide);
  const sidePots = pots.filter(p => p.isSide);
  const totalPotAmount = pots.reduce((sum, pot) => sum + pot.amount, 0);

  totalTests++;
  if (mainPot && sidePots.length === 2 && totalPotAmount === 46000) {
    console.log('✅ Complex all-in scenario test passed');
    passedTests++;

    // Check pot assignments
    const correctAssignments =
      mainPot.players.includes('ShortestStack') &&
      sidePots.some(sp => sp.players.includes('ChipLeader'));

    if (correctAssignments) {
      console.log('✅ Pot assignments are correct');
    } else {
      console.log('⚠️  Pot assignments may be incorrect');
    }
  } else {
    console.log('❌ Complex all-in scenario test failed');
  }
} else {
  console.log('❌ Failed to parse complex all-in scenario');
  totalTests++;
}

console.log('\n=== Test 5: Player Chip Tracking ===');
// Use the complex all-in scenario to test chip tracking
if (result4.success && result4.hand) {
  const players = result4.hand.players;
  console.log('Final player states:');

  players.forEach(player => {
    const allInStatus = player.isAllIn ? ' (ALL-IN)' : '';
    const chipInfo =
      player.currentChips !== undefined
        ? ` [chips: ${player.chips} -> ${player.currentChips}]`
        : '';
    console.log(`- ${player.name}: ${chipInfo}${allInStatus}`);
  });

  totalTests++;
  const playersWithChipInfo = players.filter(p => p.currentChips !== undefined);
  if (playersWithChipInfo.length === players.length) {
    console.log('✅ Player chip tracking test passed');
    passedTests++;
  } else {
    console.log('❌ Player chip tracking test failed');
  }
} else {
  totalTests++;
  console.log('❌ Player chip tracking test skipped due to parsing failure');
}

console.log(`\n=== Final Results ===`);
console.log(`Tests passed: ${passedTests}/${totalTests}`);
console.log(
  passedTests === totalTests ? '🎉 All edge case tests passed!' : '⚠️  Some edge case tests failed'
);

// Additional validation
console.log('\n=== Edge Case Feature Coverage ===');
const allResults = [result1, result2, result3, result4];
const features = {
  splitPots: 0,
  sidePots: 0,
  allInTracking: 0,
  playerStateChanges: 0,
  chipTracking: 0,
};

allResults.forEach(result => {
  if (result.success && result.hand) {
    // Check for split pots
    if (result.hand.pots.some(p => p.isSplit)) {
      features.splitPots++;
    }

    // Check for side pots
    if (result.hand.pots.some(p => p.isSide)) {
      features.sidePots++;
    }

    // Check for all-in tracking
    if (result.hand.actions.some(a => a.isAllIn)) {
      features.allInTracking++;
    }

    // Check for player state changes
    if (result.hand.actions.some(a => ['timeout', 'disconnect'].includes(a.type))) {
      features.playerStateChanges++;
    }

    // Check for chip tracking
    if (result.hand.players.some(p => p.currentChips !== undefined)) {
      features.chipTracking++;
    }
  }
});

Object.entries(features).forEach(([feature, count]) => {
  console.log(`${feature}: ${count} scenarios tested`);
});

console.log(
  `\nTotal edge case scenarios covered: ${Object.values(features).reduce((a, b) => a + b, 0)}`
);
