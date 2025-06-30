/**
 * Specialized tests for pot calculation logic in PokerStarsParser
 * Addresses pot amount mismatch warnings and ensures accurate calculation
 */

import { PokerStarsParser } from '../../src/parser/PokerStarsParser';

describe('PokerStarsParser Pot Calculation', () => {
  let parser: PokerStarsParser;

  beforeEach(() => {
    parser = new PokerStarsParser();
  });

  describe('Simple Pot Calculations', () => {
    test('should calculate simple heads-up pot correctly', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
Player1: calls 1
Player2: checks
*** FLOP *** [As Kd Qc]
Player1: bets 5
Player2: calls 5
*** TURN *** [As Kd Qc] [Jh]
Player1: checks
Player2: bets 10
Player1: folds
Uncalled bet (10) returned to Player2
Player2 collected 14 from pot
*** SUMMARY ***
Total pot 14 | Rake 0
Board [As Kd Qc Jh]
Seat 1: Player1 (button) (small blind) folded on the Turn
Seat 2: Player2 (big blind) collected (14)`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.pots[0].amount).toBe(14);
        expect(result.hand.pots[0].players).toContain('Player2');
        
        // Verify uncalled bet action
        const uncalledAction = result.hand.actions.find(action => action.type === 'uncalled');
        expect(uncalledAction).toBeDefined();
        expect(uncalledAction?.amount).toBe(10);
        expect(uncalledAction?.player).toBe('Player2');
      }
    });

    test('should handle multi-way pot with accurate totals', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Seat 3: Player3 (100 in chips)
Player2: posts small blind 1
Player3: posts big blind 2
*** HOLE CARDS ***
Player1: calls 2
Player2: calls 1
Player3: checks
*** FLOP *** [As Kd Qc]
Player2: bets 5
Player3: calls 5
Player1: calls 5
*** TURN *** [As Kd Qc] [Jh]
Player2: checks
Player3: bets 15
Player1: folds
Player2: folds
Uncalled bet (15) returned to Player3
Player3 collected 21 from pot
*** SUMMARY ***
Total pot 21 | Rake 0
Board [As Kd Qc Jh]
Seat 1: Player1 folded on the Turn
Seat 2: Player2 (small blind) folded on the Turn
Seat 3: Player3 (big blind) collected (21)`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.pots[0].amount).toBe(21);
        expect(result.hand.pots[0].players).toContain('Player3');
        
        // Verify all betting actions sum correctly
        const bettingActions = result.hand.actions.filter(action => 
          ['blind', 'call', 'bet'].includes(action.type) && action.amount
        );
        const totalBetting = bettingActions.reduce((sum, action) => 
          sum + (action.amount || 0), 0
        );
        
        // Total betting minus uncalled bet should equal pot
        const uncalledAction = result.hand.actions.find(action => action.type === 'uncalled');
        const uncalledAmount = uncalledAction?.amount || 0;
        expect(totalBetting - uncalledAmount).toBe(21);
      }
    });
  });

  describe('Side Pot Calculations', () => {
    test('should calculate side pots with correct amounts and eligible players', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: ShortStack (10 in chips)
Seat 2: BigStack1 (100 in chips)
Seat 3: BigStack2 (100 in chips)
ShortStack: posts small blind 1
BigStack1: posts big blind 2
*** HOLE CARDS ***
BigStack2: raises 6 to 8
ShortStack: raises 2 to 10 and is all-in
BigStack1: calls 8
BigStack2: calls 2
*** FLOP *** [As Kd Qc]
BigStack1: bets 20
BigStack2: calls 20
*** TURN *** [As Kd Qc] [Jh]
BigStack1: bets 40
BigStack2: folds
Uncalled bet (40) returned to BigStack1
*** SHOW DOWN ***
ShortStack: shows [Ah Ac] (three of a kind, Aces)
BigStack1: shows [Ks Qd] (two pair, Kings and Queens)
ShortStack collected 30 from main pot
BigStack1 collected 40 from side pot
*** SUMMARY ***
Total pot 70 Main pot 30. Side pot 40. | Rake 0
Board [As Kd Qc Jh]
Seat 1: ShortStack (button) (small blind) showed [Ah Ac] and won (30) with three of a kind, Aces
Seat 2: BigStack1 (big blind) showed [Ks Qd] and won (40) with two pair, Kings and Queens
Seat 3: BigStack2 folded on the Turn`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.pots).toHaveLength(2);
        
        const mainPot = result.hand.pots.find(pot => !pot.isSide);
        const sidePot = result.hand.pots.find(pot => pot.isSide);
        
        expect(mainPot).toBeDefined();
        expect(sidePot).toBeDefined();
        
        expect(mainPot?.amount).toBe(30);
        expect(sidePot?.amount).toBe(40);
        
        expect(mainPot?.players).toContain('ShortStack');
        expect(sidePot?.players).toContain('BigStack1');
        
        // Verify eligible players (note: BigStack2 folded so may not be in eligible list)
        expect(mainPot?.eligiblePlayers).toContain('ShortStack');
        expect(mainPot?.eligiblePlayers).toContain('BigStack1');
        
        expect(sidePot?.eligiblePlayers).toContain('BigStack1');
        expect(sidePot?.eligiblePlayers).not.toContain('ShortStack');
      }
    });

    test('should handle complex multi-level side pots', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: VeryShort (5 in chips)
Seat 2: Short (25 in chips)
Seat 3: Medium (50 in chips)
Seat 4: BigStack (200 in chips)
VeryShort: posts small blind 1
Short: posts big blind 2
*** HOLE CARDS ***
Medium: raises 6 to 8
BigStack: calls 8
VeryShort: raises 4 to 5 and is all-in
Short: calls 23 and is all-in
Medium: calls 42 and is all-in
BigStack: calls 42
*** FLOP *** [As Kd Qc]
*** TURN *** [As Kd Qc] [Jh]
*** RIVER *** [As Kd Qc Jh] [Tc]
*** SHOW DOWN ***
VeryShort: shows [Ah Ac] (three of a kind, Aces)
Short: shows [Ks Qd] (two pair, Kings and Queens)
Medium: shows [Jc Js] (three of a kind, Jacks)
BigStack: shows [Td 9d] (two pair, Tens and Jacks)
VeryShort collected 20 from main pot
Medium collected 60 from side pot-1
Medium collected 50 from side pot-2
*** SUMMARY ***
Total pot 130 Main pot 20. Side pot-1 60. Side pot-2 50. | Rake 0
Board [As Kd Qc Jh Tc]
Seat 1: VeryShort (button) (small blind) showed [Ah Ac] and won (20) with three of a kind, Aces
Seat 2: Short (big blind) showed [Ks Qd] and lost with two pair, Kings and Queens
Seat 3: Medium showed [Jc Js] and won (110) with three of a kind, Jacks
Seat 4: BigStack showed [Td 9d] and lost with two pair, Tens and Jacks`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.pots).toHaveLength(3);
        
        const mainPot = result.hand.pots.find(pot => !pot.isSide);
        const sidePots = result.hand.pots.filter(pot => pot.isSide);
        
        expect(mainPot).toBeDefined();
        expect(sidePots).toHaveLength(2);
        
        expect(mainPot?.amount).toBe(20);
        expect(sidePots[0].amount).toBe(60);
        expect(sidePots[1].amount).toBe(50);
        
        // Check side pot levels
        expect(sidePots[0].sidePotLevel).toBe(1);
        expect(sidePots[1].sidePotLevel).toBe(2);
        
        // Verify winners
        expect(mainPot?.players).toContain('VeryShort');
        expect(sidePots[0].players).toContain('Medium');
        expect(sidePots[1].players).toContain('Medium');
      }
    });
  });

  describe('Split Pot Calculations', () => {
    test('should handle even split pot correctly', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
Player1: calls 1
Player2: checks
*** FLOP *** [As Kd Qc]
Player1: bets 10
Player2: calls 10
*** TURN *** [As Kd Qc] [Jh]
Player1: bets 20
Player2: calls 20
*** RIVER *** [As Kd Qc Jh] [Tc]
Player1: checks
Player2: checks
*** SHOW DOWN ***
Player1: shows [Ah 9s] (a straight, Ten to Ace)
Player2: shows [Kh Qs] (a straight, Ten to Ace)
Player1 collected 33 from pot
Player2 collected 33 from pot
*** SUMMARY ***
Total pot 66 | Rake 0
Board [As Kd Qc Jh Tc]
Seat 1: Player1 (button) (small blind) showed [Ah 9s] and won (33) with a straight, Ten to Ace
Seat 2: Player2 (big blind) showed [Kh Qs] and won (33) with a straight, Ten to Ace`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.pots[0].amount).toBe(66);
        expect(result.hand.pots[0].isSplit).toBe(true);
        expect(result.hand.pots[0].players).toHaveLength(2);
        expect(result.hand.pots[0].players).toContain('Player1');
        expect(result.hand.pots[0].players).toContain('Player2');
      }
    });

    test('should handle odd split pot with extra chip', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
Player1: calls 1
Player2: checks
*** FLOP *** [As Kd Qc]
Player1: bets 10
Player2: calls 10
*** TURN *** [As Kd Qc] [Jh]
Player1: bets 20
Player2: calls 20
*** RIVER *** [As Kd Qc Jh] [Tc]
Player1: bets 1
Player2: calls 1
*** SHOW DOWN ***
Player1: shows [Ah 9s] (a straight, Ten to Ace)
Player2: shows [Kh Qs] (a straight, Ten to Ace)
Player1 collected 34 from pot
Player2 collected 33 from pot
*** SUMMARY ***
Total pot 67 | Rake 0
Board [As Kd Qc Jh Tc]
Seat 1: Player1 (button) (small blind) showed [Ah 9s] and won (34) with a straight, Ten to Ace
Seat 2: Player2 (big blind) showed [Kh Qs] and won (33) with a straight, Ten to Ace`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.pots[0].amount).toBe(67);
        expect(result.hand.pots[0].isSplit).toBe(true);
        expect(result.hand.pots[0].oddChipWinner).toBe('Player1');
        expect(result.hand.pots[0].players).toHaveLength(2);
      }
    });

    test('should handle three-way split pot', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Seat 3: Player3 (100 in chips)
Player2: posts small blind 1
Player3: posts big blind 2
*** HOLE CARDS ***
Player1: calls 2
Player2: calls 1
Player3: checks
*** FLOP *** [As Kd Qc]
Player2: bets 10
Player3: calls 10
Player1: calls 10
*** TURN *** [As Kd Qc] [Jh]
Player2: checks
Player3: checks
Player1: checks
*** RIVER *** [As Kd Qc Jh] [Tc]
Player2: checks
Player3: checks
Player1: checks
*** SHOW DOWN ***
Player1: shows [Ah 9s] (a straight, Ten to Ace)
Player2: shows [Kh Qs] (a straight, Ten to Ace)
Player3: shows [Jd 9d] (a straight, Ten to Ace)
Player1 collected 12 from pot
Player2 collected 12 from pot
Player3 collected 12 from pot
*** SUMMARY ***
Total pot 36 | Rake 0
Board [As Kd Qc Jh Tc]
Seat 1: Player1 showed [Ah 9s] and won (12) with a straight, Ten to Ace
Seat 2: Player2 (small blind) showed [Kh Qs] and won (12) with a straight, Ten to Ace
Seat 3: Player3 (big blind) showed [Jd 9d] and won (12) with a straight, Ten to Ace`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.pots[0].amount).toBe(36);
        expect(result.hand.pots[0].isSplit).toBe(true);
        expect(result.hand.pots[0].players).toHaveLength(3);
        expect(result.hand.pots[0].players).toContain('Player1');
        expect(result.hand.pots[0].players).toContain('Player2');
        expect(result.hand.pots[0].players).toContain('Player3');
      }
    });
  });

  describe('Pot Validation and Edge Cases', () => {
    test('should validate pot math matches collected actions', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
Player1: raises 8 to 10
Player2: calls 8
*** FLOP *** [As Kd Qc]
Player2: checks
Player1: bets 15
Player2: calls 15
*** TURN *** [As Kd Qc] [Jh]
Player2: checks
Player1: bets 30
Player2: folds
Uncalled bet (30) returned to Player1
Player1 collected 50 from pot
*** SUMMARY ***
Total pot 50 | Rake 0
Board [As Kd Qc Jh]
Seat 1: Player1 (button) (small blind) collected (50)
Seat 2: Player2 (big blind) folded on the Turn`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.pots[0].amount).toBe(50);
        
        // Verify the collected action matches pot amount
        const collectedAction = result.hand.actions.find(action => action.type === 'collected');
        expect(collectedAction).toBeDefined();
        expect(collectedAction?.amount).toBe(50);
        expect(collectedAction?.player).toBe('Player1');
      }
    });

    test('should handle pots with rake correctly', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
Player1: raises 18 to 20
Player2: calls 18
*** FLOP *** [As Kd Qc]
Player2: checks
Player1: bets 30
Player2: calls 30
*** TURN *** [As Kd Qc] [Jh]
Player2: checks
Player1: bets 50
Player2: calls 50
*** RIVER *** [As Kd Qc Jh] [Tc]
Player2: checks
Player1: checks
*** SHOW DOWN ***
Player1: shows [Ah Kh] (two pair, Aces and Kings)
Player2: shows [As Qs] (two pair, Aces and Queens)
Player1 collected 197 from pot
*** SUMMARY ***
Total pot 200 | Rake 3
Board [As Kd Qc Jh Tc]
Seat 1: Player1 (button) (small blind) showed [Ah Kh] and won (197) with two pair, Aces and Kings
Seat 2: Player2 (big blind) showed [As Qs] and lost with two pair, Aces and Queens`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.pots).toHaveLength(1);
        // Total pot is 200, but collected amount is 197 due to rake
        expect(result.hand.pots[0].amount).toBe(200);
        
        const collectedAction = result.hand.actions.find(action => action.type === 'collected');
        expect(collectedAction).toBeDefined();
        expect(collectedAction?.amount).toBe(197);
        expect(collectedAction?.player).toBe('Player1');
      }
    });

    test('should handle missing collection lines gracefully', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
Player1: calls 1
Player2: checks
*** FLOP *** [As Kd Qc]
Player1: bets 5
Player2: folds
*** SUMMARY ***
Total pot 8 | Rake 0
Board [As Kd Qc]
Seat 1: Player1 (button) (small blind) collected (8)
Seat 2: Player2 (big blind) folded on the Flop`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.pots[0].amount).toBe(8);
        expect(result.hand.pots[0].players).toContain('Player1');
      }
    });
  });

  describe('Tournament Pot Calculations', () => {
    test('should handle tournament pot with correct chip counts', () => {
      const testHand = `PokerStars Hand #123: Tournament #456, $10+$1 USD Hold'em No Limit - Level I (10/20) - 2024/01/15 20:00:00 ET
Table '456 1' 9-max Seat #1 is the button
Seat 1: Player1 (1500 in chips)
Seat 2: Player2 (1500 in chips)
Player1: posts small blind 10
Player2: posts big blind 20
*** HOLE CARDS ***
Player1: raises 40 to 60
Player2: calls 40
*** FLOP *** [As Kd Qc]
Player2: checks
Player1: bets 80
Player2: calls 80
*** TURN *** [As Kd Qc] [Jh]
Player2: checks
Player1: bets 200
Player2: folds
Uncalled bet (200) returned to Player1
Player1 collected 280 from pot
*** SUMMARY ***
Total pot 280 | Rake 0
Board [As Kd Qc Jh]
Seat 1: Player1 (button) (small blind) collected (280)
Seat 2: Player2 (big blind) folded on the Turn`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.tournamentId).toBe('456');
        expect(result.hand.stakes).toBe('$10/$20');
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.pots[0].amount).toBe(280);
        
        // Verify starting chip counts
        expect(result.hand.players[0].chips).toBe(1500);
        expect(result.hand.players[1].chips).toBe(1500);
      }
    });
  });
});