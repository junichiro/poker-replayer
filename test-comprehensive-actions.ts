import { PokerStarsParser } from './src/parser/PokerStarsParser';

const testHandHistories = {
  allInScenarios: `PokerStars Hand #123456800: Tournament #987654330, $10+$1 USD Hold'em No Limit - Level V (300/600) - 2024/01/15 18:00:00 ET
Table '987654330 5' 9-max Seat #2 is the button
Seat 1: AllInRaiser (2000 in chips)
Seat 2: AllInCaller (1500 in chips)
Seat 3: AllInBetter (800 in chips)
Seat 4: RegularPlayer (5000 in chips)
AllInRaiser: posts small blind 300
AllInCaller: posts big blind 600
*** HOLE CARDS ***
Dealt to RegularPlayer [Ah Ad]
AllInBetter: bets 800 and is all-in
RegularPlayer: calls 800
AllInRaiser: raises 1200 to 2000 and is all-in
AllInCaller: calls 900 and is all-in
RegularPlayer: calls 1200
*** FLOP *** [Kh 9s 3d]
*** TURN *** [Kh 9s 3d] [2h]
*** RIVER *** [Kh 9s 3d 2h] [7c]
*** SHOW DOWN ***
AllInRaiser: shows [Qh Qs] (a pair of Queens)
AllInCaller: shows [Jc Jd] (a pair of Jacks)
AllInBetter: shows [Ac Ks] (a pair of Kings)
RegularPlayer: shows [Ah Ad] (a pair of Aces)
RegularPlayer collected 6300 from pot
*** SUMMARY ***
Total pot 6300 | Rake 0`,

  playerStateChanges: `PokerStars Hand #123456801: Hold'em No Limit ($1/$2 USD) - 2024/01/15 19:00:00 ET
Table 'StateChanges' 6-max Seat #1 is the button
Seat 1: NormalPlayer (200 in chips)
Seat 2: TimeoutPlayer (200 in chips)
Seat 3: DisconnectPlayer (200 in chips)
Seat 4: SitoutPlayer (200 in chips)
Seat 5: ReturningPlayer (200 in chips)
NormalPlayer: posts small blind 1
TimeoutPlayer: posts big blind 2
*** HOLE CARDS ***
DisconnectPlayer is disconnected
NormalPlayer: raises 4 to 6
TimeoutPlayer has timed out
TimeoutPlayer: folds
DisconnectPlayer: folds
SitoutPlayer: sits out
ReturningPlayer: calls 6
*** FLOP *** [2s 7h Kc]
ReturningPlayer has returned
SitoutPlayer is sitting out
NormalPlayer: bets 8
ReturningPlayer: calls 8
*** TURN *** [2s 7h Kc] [5d]
DisconnectPlayer is connected
NormalPlayer: checks
ReturningPlayer: checks
*** RIVER *** [2s 7h Kc 5d] [9h]
NormalPlayer: bets 20
ReturningPlayer: folds
Uncalled bet (20) returned to NormalPlayer
NormalPlayer collected 30 from pot
NormalPlayer: mucks hand
*** SUMMARY ***
Total pot 30 | Rake 0`,

  tournamentSpecific: `PokerStars Hand #123456802: Tournament #987654331, $20+$2 USD Hold'em No Limit - Level X (800/1600) - 2024/01/15 20:00:00 ET
Table '987654331 10' 9-max Seat #5 is the button
Seat 1: AntePlayer1 (15000 in chips)
Seat 2: AntePlayer2 (12000 in chips)
Seat 3: DeadBlindPlayer (8000 in chips)
Seat 5: ButtonPlayer (20000 in chips)
AntePlayer1: posts the ante 200
AntePlayer2: posts the ante 200
DeadBlindPlayer: posts the ante 200
ButtonPlayer: posts the ante 200
AntePlayer1: posts small blind 800
AntePlayer2: posts big blind 1600
DeadBlindPlayer: posts dead blind 800
*** HOLE CARDS ***
ButtonPlayer: raises 3200 to 4800
AntePlayer1: folds
AntePlayer2: calls 3200
DeadBlindPlayer: folds
*** FLOP *** [As Kd Qc]
AntePlayer2: checks
ButtonPlayer: bets 6000
AntePlayer2: folds
Uncalled bet (6000) returned to ButtonPlayer
ButtonPlayer collected 11600 from pot
*** SUMMARY ***
Total pot 11600 | Rake 0`
};

console.log('Testing comprehensive action parsing...\n');

const parser = new PokerStarsParser();
let totalTests = 0;
let passedTests = 0;

// Test 1: All-in scenarios
console.log('=== Test 1: All-in Action Parsing ===');
const result1 = parser.parse(testHandHistories.allInScenarios);
if (result1.success && result1.hand) {
  const allInActions = result1.hand.actions.filter(action => action.isAllIn);
  console.log(`Found ${allInActions.length} all-in actions:`);
  
  allInActions.forEach(action => {
    console.log(`- ${action.player}: ${action.type} $${action.amount} (all-in)`);
  });
  
  // Check if we found the expected all-in actions
  const expectedAllIns = ['AllInBetter', 'AllInRaiser', 'AllInCaller'];
  let foundAllIns = 0;
  expectedAllIns.forEach(player => {
    if (allInActions.some(action => action.player === player)) {
      foundAllIns++;
    }
  });
  
  totalTests++;
  if (foundAllIns === expectedAllIns.length) {
    console.log('✅ All-in parsing test passed');
    passedTests++;
  } else {
    console.log('❌ All-in parsing test failed');
  }
} else {
  console.log('❌ Failed to parse all-in scenarios');
  totalTests++;
}

console.log('\n=== Test 2: Player State Changes ===');
const result2 = parser.parse(testHandHistories.playerStateChanges);
if (result2.success && result2.hand) {
  const stateActions = result2.hand.actions.filter(action => 
    ['timeout', 'disconnect', 'reconnect', 'sitout', 'return', 'muck'].includes(action.type)
  );
  
  console.log(`Found ${stateActions.length} player state actions:`);
  stateActions.forEach(action => {
    console.log(`- ${action.player}: ${action.type}${action.reason ? ` (${action.reason})` : ''}`);
  });
  
  // Check for expected state changes
  const expectedStates = ['timeout', 'disconnect', 'reconnect', 'sitout', 'return', 'muck'];
  let foundStates = 0;
  expectedStates.forEach(state => {
    if (stateActions.some(action => action.type === state)) {
      foundStates++;
    }
  });
  
  totalTests++;
  if (foundStates === expectedStates.length) {
    console.log('✅ Player state changes test passed');
    passedTests++;
  } else {
    console.log(`❌ Player state changes test failed: found ${foundStates} types, expected ${expectedStates.length}`);
  }
} else {
  console.log('❌ Failed to parse player state changes');
  totalTests++;
}

console.log('\n=== Test 3: Tournament-Specific Actions ===');
const result3 = parser.parse(testHandHistories.tournamentSpecific);
if (result3.success && result3.hand) {
  const anteActions = result3.hand.actions.filter(action => action.type === 'ante');
  const deadBlindActions = result3.hand.actions.filter(action => 
    action.type === 'blind' && action.player === 'DeadBlindPlayer'
  );
  
  console.log(`Found ${anteActions.length} ante actions:`);
  anteActions.forEach(action => {
    console.log(`- ${action.player}: posts ante $${action.amount}`);
  });
  
  console.log(`Found ${deadBlindActions.length} dead blind actions:`);
  deadBlindActions.forEach(action => {
    console.log(`- ${action.player}: posts dead blind $${action.amount}`);
  });
  
  totalTests++;
  if (anteActions.length === 4 && deadBlindActions.length === 1) {
    console.log('✅ Tournament-specific actions test passed');
    passedTests++;
  } else {
    console.log(`❌ Tournament-specific actions test failed: found ${anteActions.length} antes (expected 4), ${deadBlindActions.length} dead blinds (expected 1)`);
  }
} else {
  console.log('❌ Failed to parse tournament-specific actions');
  totalTests++;
}

console.log('\n=== Test 4: Standard Actions Still Work ===');
// Use existing test
const standardHand = `PokerStars Hand #123456790: Tournament #987654322, $5+$0.50 USD Hold'em No Limit - Level V (75/150) - 2024/01/15 15:00:00 ET
Table '987654322 2' 6-max Seat #3 is the button
Seat 1: Player1 (1500 in chips)
Seat 2: Player2 (1500 in chips)
Seat 3: Player3 (1500 in chips)
Player1: posts small blind 75
Player2: posts big blind 150
*** HOLE CARDS ***
Player3: raises 300 to 450
Player1: folds
Player2: calls 300
*** FLOP *** [7h 2s 9c]
Player2: checks
Player3: bets 600
Player2: folds
Uncalled bet (600) returned to Player3
Player3 collected 975 from pot
*** SUMMARY ***
Total pot 975 | Rake 0`;

const result4 = parser.parse(standardHand);
if (result4.success && result4.hand) {
  const standardActions = result4.hand.actions.filter(action => 
    ['blind', 'raise', 'fold', 'call', 'check', 'bet', 'uncalled', 'collected'].includes(action.type)
  );
  
  console.log(`Found ${standardActions.length} standard actions - all working correctly`);
  
  totalTests++;
  if (standardActions.length === 10) {
    console.log('✅ Standard actions still work');
    passedTests++;
  } else {
    console.log(`❌ Standard actions broken: found ${standardActions.length} actions (expected 10)`);
  }
} else {
  console.log('❌ Failed to parse standard actions');
  totalTests++;
}

console.log(`\n=== Final Results ===`);
console.log(`Tests passed: ${passedTests}/${totalTests}`);
console.log(passedTests === totalTests ? '🎉 All tests passed!' : '⚠️  Some tests failed');

// Additional validation
console.log('\n=== Action Type Coverage ===');
const allResults = [result1, result2, result3, result4];
const allActionTypes = new Set<string>();

allResults.forEach(result => {
  if (result.success && result.hand) {
    result.hand.actions.forEach(action => {
      allActionTypes.add(action.type);
    });
  }
});

console.log('Action types parsed:', Array.from(allActionTypes).sort().join(', '));
console.log(`Total unique action types: ${allActionTypes.size}`);