/**
 * Performance and memory tests for PokerStarsParser
 * Ensures parser efficiency and proper resource management
 */

import { PokerStarsParser } from '../../src/parser/PokerStarsParser';

describe('PokerStarsParser Performance Tests', () => {
  let parser: PokerStarsParser;

  beforeEach(() => {
    parser = new PokerStarsParser();
  });

  describe('Parser Speed Tests', () => {
    test('should parse simple hand within performance threshold', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
Player1: calls 1
Player2: checks
*** SUMMARY ***
Total pot 4 | Rake 0
Seat 1: Player1 (button) (small blind) collected (4)
Seat 2: Player2 (big blind) folded before Flop`;

      const iterations = 1000;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
      }
      
      const endTime = Date.now();
      const averageTime = (endTime - startTime) / iterations;
      
      // Should parse each hand in less than 1ms on average
      expect(averageTime).toBeLessThan(1);
    });

    test('should parse complex tournament hand efficiently', () => {
      const testHand = `PokerStars Hand #123: Tournament #456, $500+$50 USD Hold'em No Limit - Level X (500/1000) - 2024/01/15 20:00:00 ET
Table '456 10' 9-max Seat #5 is the button
Seat 1: Player1 (15000 in chips)
Seat 2: Player2 (25000 in chips)
Seat 3: Player3 (8000 in chips)
Seat 4: Player4 (35000 in chips)
Seat 5: Player5 (12000 in chips)
Seat 6: Player6 (45000 in chips)
Seat 7: Player7 (30000 in chips)
Seat 8: Player8 (20000 in chips)
Seat 9: Player9 (10000 in chips)
Player1: posts the ante 125
Player2: posts the ante 125
Player3: posts the ante 125
Player4: posts the ante 125
Player5: posts the ante 125
Player6: posts the ante 125
Player7: posts the ante 125
Player8: posts the ante 125
Player9: posts the ante 125
Player6: posts small blind 500
Player7: posts big blind 1000
*** HOLE CARDS ***
Player8: folds
Player9: raises 8875 to 9875 and is all-in
Player1: folds
Player2: calls 9875
Player3: raises 8875 to 9875 and is all-in
Player4: folds
Player5: folds
Player6: folds
Player7: folds
Player2: calls -2000
*** FLOP *** [As Kd Qc]
*** TURN *** [As Kd Qc] [Jh]
*** RIVER *** [As Kd Qc Jh] [Tc]
*** SHOW DOWN ***
Player9: shows [Ah Ac] (three of a kind, Aces)
Player3: shows [Ks Qs] (two pair, Kings and Queens)
Player2: shows [Jc Js] (three of a kind, Jacks)
Player9 collected 18000 from main pot
Player2 collected 14000 from side pot
*** SUMMARY ***
Total pot 32000 Main pot 18000. Side pot 14000. | Rake 0
Board [As Kd Qc Jh Tc]
Seat 1: Player1 folded before Flop (didn't bet)
Seat 2: Player2 showed [Jc Js] and won (14000) with three of a kind, Jacks
Seat 3: Player3 showed [Ks Qs] and lost with two pair, Kings and Queens
Seat 4: Player4 folded before Flop (didn't bet)
Seat 5: Player5 (button) folded before Flop (didn't bet)
Seat 6: Player6 (small blind) folded before Flop
Seat 7: Player7 (big blind) folded before Flop
Seat 8: Player8 folded before Flop (didn't bet)
Seat 9: Player9 showed [Ah Ac] and won (18000) with three of a kind, Aces`;

      const startTime = Date.now();
      const result = parser.parse(testHand);
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
      
      if (result.success) {
        expect(result.hand.players).toHaveLength(9);
        expect(result.hand.pots).toHaveLength(2);
        expect(result.hand.actions.filter(a => a.type === 'ante')).toHaveLength(9);
      }
    });

    test('should handle very long action sequences efficiently', () => {
      // Create a hand with many betting rounds
      const manyActions = Array.from({ length: 50 }, (_, i) => {
        const player = i % 2 === 0 ? 'Player1' : 'Player2';
        const action = i % 4 === 0 ? 'bets' : 'calls';
        const amount = 5 + (i % 10);
        return `${player}: ${action} ${amount}`;
      }).join('\n');
      
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (10000 in chips)
Seat 2: Player2 (10000 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
${manyActions}
*** SUMMARY ***
Total pot 1000 | Rake 0
Seat 1: Player1 (button) (small blind) collected (1000)
Seat 2: Player2 (big blind) folded before Flop`;

      const startTime = Date.now();
      const result = parser.parse(testHand);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      
      // Parser should handle this gracefully, either parsing successfully or failing fast
      expect(result).toBeDefined();
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not leak memory with multiple parses', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
Player1: calls 1
Player2: checks
*** SUMMARY ***
Total pot 4 | Rake 0
Seat 1: Player1 (button) (small blind) collected (4)
Seat 2: Player2 (big blind) folded before Flop`;

      const initialMemory = process.memoryUsage().heapUsed;
      
      // Parse the same hand many times
      for (let i = 0; i < 10000; i++) {
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 100MB for 10k parses)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    test('should properly reset internal state between parses', () => {
      const hand1 = `PokerStars Hand #111: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'Table1' 6-max Seat #1 is the button
Seat 1: Alice (100 in chips)
Seat 2: Bob (200 in chips)
Alice: posts small blind 1
Bob: posts big blind 2
*** HOLE CARDS ***
Alice: raises 3 to 5
Bob: calls 3
*** SUMMARY ***
Total pot 10 | Rake 0
Seat 1: Alice (button) (small blind) collected (10)
Seat 2: Bob (big blind) folded before Flop`;

      const hand2 = `PokerStars Hand #222: Tournament #333, $50+$5 USD Hold'em No Limit - Level II (50/100) - 2024/01/15 21:00:00 ET
Table '333 5' 9-max Seat #3 is the button
Seat 1: Charlie (1500 in chips)
Seat 2: Dave (1200 in chips)
Seat 3: Eve (1800 in chips)
Charlie: posts small blind 50
Dave: posts big blind 100
*** HOLE CARDS ***
Eve: raises 200 to 300
Charlie: folds
Dave: calls 200
*** FLOP *** [As Kd Qc]
Dave: checks
Eve: bets 400
Dave: folds
Uncalled bet (400) returned to Eve
Eve collected 650 from pot
*** SUMMARY ***
Total pot 650 | Rake 0
Board [As Kd Qc]
Seat 1: Charlie (small blind) folded before Flop
Seat 2: Dave (big blind) folded on the Flop
Seat 3: Eve (button) collected (650)`;

      // Parse first hand
      const result1 = parser.parse(hand1);
      expect(result1.success).toBe(true);
      
      // Parse second hand immediately after
      const result2 = parser.parse(hand2);
      expect(result2.success).toBe(true);
      
      // Verify complete state reset
      if (result1.success && result2.success) {
        // Different hand IDs
        expect(result1.hand.id).toBe('111');
        expect(result2.hand.id).toBe('222');
        
        // Different tournaments (cash vs tournament)
        expect(result1.hand.tournamentId).toBeUndefined();
        expect(result2.hand.tournamentId).toBe('333');
        
        // Different stakes
        expect(result1.hand.stakes).toBe('$1/$2');
        expect(result2.hand.stakes).toBe('$50/$100');
        
        // Different players
        expect(result1.hand.players[0].name).toBe('Alice');
        expect(result2.hand.players[0].name).toBe('Charlie');
        
        // Different action counts
        expect(result1.hand.actions.length).not.toBe(result2.hand.actions.length);
        
        // Verify no data bleed between parses
        expect(result1.hand.players.some(p => p.name === 'Charlie')).toBe(false);
        expect(result2.hand.players.some(p => p.name === 'Alice')).toBe(false);
      }
    });

    test('should handle concurrent parsing correctly', async () => {
      const createTestHand = (id: number) => `PokerStars Hand #${id}: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:0${id % 10}:00 ET
Table 'Table${id}' 6-max Seat #1 is the button
Seat 1: Player${id}_1 (100 in chips)
Seat 2: Player${id}_2 (100 in chips)
Player${id}_1: posts small blind 1
Player${id}_2: posts big blind 2
*** HOLE CARDS ***
Player${id}_1: calls 1
Player${id}_2: checks
*** SUMMARY ***
Total pot 4 | Rake 0
Seat 1: Player${id}_1 (button) (small blind) collected (4)
Seat 2: Player${id}_2 (big blind) folded before Flop`;

      // Create multiple parsers to simulate concurrent usage
      const parsers = Array.from({ length: 10 }, () => new PokerStarsParser());
      const hands = Array.from({ length: 100 }, (_, i) => createTestHand(i + 1));
      
      const startTime = Date.now();
      
      // Parse all hands concurrently
      const results = await Promise.all(
        hands.map((hand, index) => {
          const parser = parsers[index % parsers.length];
          return Promise.resolve(parser.parse(hand));
        })
      );
      
      const endTime = Date.now();
      
      // All results should be successful
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.hand.id).toBe(String(index + 1));
        }
      });
      
      // Should complete reasonably fast even with concurrent parsing
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Large Data Structure Tests', () => {
    test('should handle hand with maximum realistic action count', () => {
      // Simulate a very long tournament hand with many streets and actions
      const players = Array.from({ length: 9 }, (_, i) => 
        `Seat ${i + 1}: Player${i + 1} (${1000 + i * 100} in chips)`
      ).join('\n');
      
      const antes = Array.from({ length: 9 }, (_, i) => 
        `Player${i + 1}: posts the ante 25`
      ).join('\n');
      
      const preflopActions = Array.from({ length: 15 }, (_, i) => {
        const player = `Player${(i % 9) + 1}`;
        const actions = ['folds', 'calls 100', 'raises 100 to 200'];
        return `${player}: ${actions[i % 3]}`;
      }).join('\n');
      
      const flopActions = Array.from({ length: 10 }, (_, i) => {
        const player = `Player${(i % 3) + 1}`;
        const actions = ['checks', 'bets 200', 'calls 200'];
        return `${player}: ${actions[i % 3]}`;
      }).join('\n');
      
      const testHand = `PokerStars Hand #123: Tournament #456, $1000+$100 USD Hold'em No Limit - Level X (100/200) - 2024/01/15 20:00:00 ET
Table '456 1' 9-max Seat #1 is the button
${players}
${antes}
Player1: posts small blind 100
Player2: posts big blind 200
*** HOLE CARDS ***
${preflopActions}
*** FLOP *** [As Kd Qc]
${flopActions}
*** SUMMARY ***
Total pot 5000 | Rake 0
Board [As Kd Qc]
Seat 1: Player1 (button) (small blind) collected (5000)`;

      const startTime = Date.now();
      const result = parser.parse(testHand);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(200); // Should complete within 200ms
      
      if (result.success) {
        expect(result.hand.players).toHaveLength(9);
        expect(result.hand.actions.length).toBeGreaterThan(30);
        
        // Verify all antes are parsed
        const anteActions = result.hand.actions.filter(a => a.type === 'ante');
        expect(anteActions).toHaveLength(9);
        
        // Verify structure is maintained with large action count
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.board).toEqual(['As', 'Kd', 'Qc']);
      }
    });

    test('should handle parsing with unusual but valid data patterns', () => {
      const testHand = `PokerStars Hand #9999999999: Hold'em No Limit ($10000/$20000 USD) - 2024/12/31 23:59:59 ET
Table 'VeryLongTableNameThatShouldStillBeHandledCorrectly' 2-max Seat #1 is the button
Seat 1: PlayerWithVeryLongNameThatIsStillValid (99999999.99 in chips)
Seat 2: AnotherPlayerWithEquallyLongButValidName (99999999.99 in chips)
PlayerWithVeryLongNameThatIsStillValid: posts small blind 10000
AnotherPlayerWithEquallyLongButValidName: posts big blind 20000
*** HOLE CARDS ***
PlayerWithVeryLongNameThatIsStillValid: raises 40000 to 60000
AnotherPlayerWithEquallyLongButValidName: calls 40000
*** FLOP *** [As Kd Qc]
AnotherPlayerWithEquallyLongButValidName: checks
PlayerWithVeryLongNameThatIsStillValid: bets 100000
AnotherPlayerWithEquallyLongButValidName: calls 100000
*** TURN *** [As Kd Qc] [Jh]
AnotherPlayerWithEquallyLongButValidName: checks
PlayerWithVeryLongNameThatIsStillValid: bets 99839999.99 and is all-in
AnotherPlayerWithEquallyLongButValidName: calls 99839999.99 and is all-in
*** RIVER *** [As Kd Qc Jh] [Tc]
*** SHOW DOWN ***
PlayerWithVeryLongNameThatIsStillValid: shows [Ah Kh] (two pair, Aces and Kings)
AnotherPlayerWithEquallyLongButValidName: shows [Qs Js] (two pair, Queens and Jacks)
PlayerWithVeryLongNameThatIsStillValid collected 199999999.98 from pot
*** SUMMARY ***
Total pot 199999999.98 | Rake 0
Board [As Kd Qc Jh Tc]
Seat 1: PlayerWithVeryLongNameThatIsStillValid (button) (small blind) showed [Ah Kh] and won (199999999.98) with two pair, Aces and Kings
Seat 2: AnotherPlayerWithEquallyLongButValidName (big blind) showed [Qs Js] and lost with two pair, Queens and Jacks`;

      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.hand.id).toBe('9999999999');
        expect(result.hand.stakes).toBe('$10000/$20000');
        expect(result.hand.table.name).toBe('VeryLongTableNameThatShouldStillBeHandledCorrectly');
        expect(result.hand.players[0].chips).toBe(99999999.99);
        expect(result.hand.pots[0].amount).toBe(199999999.98);
        
        // Verify all-in actions are correctly identified
        const allInActions = result.hand.actions.filter(a => a.isAllIn);
        expect(allInActions).toHaveLength(2);
      }
    });
  });
});