import { PokerStarsParser } from './src/parser/PokerStarsParser';

const handWithSidePots = `PokerStars Hand #123456791: Tournament #987654323, $10+$1 USD Hold'em No Limit - Level X (300/600) - 2024/01/15 16:00:00 ET
Table '987654323 3' 9-max Seat #5 is the button
Seat 1: Player1 (5000 in chips)
Seat 2: Player2 (1000 in chips)
Seat 3: Player3 (2000 in chips)
Seat 5: Player5 (10000 in chips)
Player1: posts small blind 300
Player2: posts big blind 600
*** HOLE CARDS ***
Dealt to Player5 [Ac Ad]
Player3: raises 1400 to 2000 and is all-in
Player5: calls 2000
Player1: folds
Player2: calls 400 and is all-in
*** FLOP *** [Kh 9s 3d]
*** TURN *** [Kh 9s 3d] [2h]
*** RIVER *** [Kh 9s 3d 2h] [7c]
*** SHOW DOWN ***
Player2: shows [Qh Qs] (a pair of Queens)
Player3: shows [Jc Jd] (a pair of Jacks)
Player5: shows [Ac Ad] (a pair of Aces)
Player5 collected 2000 from side pot
Player5 collected 3300 from main pot
*** SUMMARY ***
Total pot 5300 Main pot 3300. Side pot 2000. | Rake 0
Board [Kh 9s 3d 2h 7c]
Seat 1: Player1 (small blind) folded before Flop
Seat 2: Player2 (big blind) showed [Qh Qs] and lost with a pair of Queens
Seat 3: Player3 showed [Jc Jd] and lost with a pair of Jacks
Seat 5: Player5 (button) showed [Ac Ad] and won (5300) with a pair of Aces`;

const simpleHand = `PokerStars Hand #123456792: Tournament #987654324, $5+$0.50 USD Hold'em No Limit - Level I (10/20) - 2024/01/15 17:00:00 ET
Table '987654324 4' 6-max Seat #1 is the button
Seat 1: Winner (1500 in chips)
Seat 2: Loser (1500 in chips)
Winner: posts small blind 10
Loser: posts big blind 20
*** HOLE CARDS ***
Winner: raises 40 to 60
Loser: calls 40
*** FLOP *** [As Kd Qc]
Loser: checks
Winner: bets 80
Loser: folds
Uncalled bet (80) returned to Winner
Winner collected 120 from pot
*** SUMMARY ***
Total pot 120 | Rake 0
Board [As Kd Qc]
Seat 1: Winner (button) (small blind) collected (120)
Seat 2: Loser (big blind) folded on the Flop`;

console.log('Testing summary parsing...\n');

const parser = new PokerStarsParser();

// Test 1: Hand with side pots
console.log('Test 1: Hand with side pots');
const result1 = parser.parse(handWithSidePots);
if (result1.success && result1.hand) {
  const pots = result1.hand.pots;
  console.log(`Found ${pots.length} pots:`);
  pots.forEach((pot, index) => {
    console.log(`- Pot ${index + 1}: $${pot.amount} won by ${pot.players.join(', ')} ${pot.isSide ? '(side pot)' : '(main pot)'}`);
  });
  
  // Verify pot totals
  const totalPot = pots.reduce((sum, pot) => sum + pot.amount, 0);
  console.log(`Total pot amount: $${totalPot}`);
  console.log(totalPot === 5300 ? '✅ Pot amounts correct' : '❌ Pot amounts incorrect');
} else {
  console.log('❌ Failed to parse hand with side pots');
}

console.log('\nTest 2: Simple hand with single winner');
const result2 = parser.parse(simpleHand);
if (result2.success && result2.hand) {
  const pots = result2.hand.pots;
  console.log(`Found ${pots.length} pots:`);
  pots.forEach((pot, index) => {
    console.log(`- Pot ${index + 1}: $${pot.amount} won by ${pot.players.join(', ')}`);
  });
  console.log(pots[0].players.includes('Winner') ? '✅ Winner correctly identified' : '❌ Winner not identified');
} else {
  console.log('❌ Failed to parse simple hand');
}