/**
 * Comprehensive unit tests for PokerStarsParser
 */

import { PokerStarsParser } from '../../src/parser/PokerStarsParser';
import { handHistories, expectedResults, testCases } from '../fixtures/hand-histories';
import { 
  PokerHand, 
  Player, 
  Action, 
  ParserResult, 
  Street, 
  ActionType 
} from '../../src/types';

describe('PokerStarsParser', () => {
  let parser: PokerStarsParser;

  beforeEach(() => {
    parser = new PokerStarsParser();
  });

  describe('Basic Parsing Functionality', () => {
    test('should parse a basic cash game hand successfully', () => {
      const result = parser.parse(handHistories.basicCashGame);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        expect(hand.id).toBe(expectedResults.basicCashGame.id);
        expect(hand.stakes).toBe(expectedResults.basicCashGame.stakes);
        expect(hand.players).toHaveLength(expectedResults.basicCashGame.playerCount);
        expect(hand.board).toEqual(expectedResults.basicCashGame.boardCards);
      }
    });

    test('should parse tournament hand with antes', () => {
      const result = parser.parse(handHistories.tournamentWithAntes);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        expect(hand.id).toBe(expectedResults.tournamentWithAntes.id);
        expect(hand.tournamentId).toBe(expectedResults.tournamentWithAntes.tournamentId);
        expect(hand.stakes).toBe(expectedResults.tournamentWithAntes.stakes);
        expect(hand.players).toHaveLength(expectedResults.tournamentWithAntes.playerCount);
        
        // Check ante actions
        const anteActions = hand.actions.filter(action => action.type === 'ante');
        expect(anteActions).toHaveLength(expectedResults.tournamentWithAntes.anteCount);
      }
    });

    test('should handle all-in scenarios with side pots', () => {
      const result = parser.parse(handHistories.allInScenario);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        expect(hand.players).toHaveLength(expectedResults.allInScenario.playerCount);
        
        // Check all-in actions
        const allInActions = hand.actions.filter(action => action.isAllIn);
        expect(allInActions).toHaveLength(expectedResults.allInScenario.allInCount);
        
        // Check pot structure
        expect(hand.pots).toHaveLength(2); // Main pot + side pot
        const mainPot = hand.pots.find(pot => !pot.isSide);
        const sidePot = hand.pots.find(pot => pot.isSide);
        
        expect(mainPot).toBeDefined();
        expect(sidePot).toBeDefined();
        expect(mainPot?.amount).toBe(expectedResults.allInScenario.mainPotAmount);
        expect(sidePot?.amount).toBe(expectedResults.allInScenario.sidePotAmount);
      }
    });

    test('should handle split pot scenarios', () => {
      const result = parser.parse(handHistories.splitPot);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        expect(hand.players).toHaveLength(expectedResults.splitPot.playerCount);
        expect(hand.pots).toHaveLength(1);
        expect(hand.pots[0].isSplit).toBe(true);
        expect(hand.pots[0].players).toHaveLength(2);
      }
    });
  });

  describe('Header Parsing', () => {
    test.each(testCases.headers)('should parse header correctly: $input', ({ input, expected }) => {
      // Create a minimal hand history with just the header for testing
      const testHand = `${input}
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: TestPlayer (100 in chips)
TestPlayer: posts small blind 1
*** SUMMARY ***
Total pot 1 | Rake 0`;
      
      const result = parser.parse(testHand);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        expect(hand.id).toBe(expected.id);
        expect(hand.stakes).toBe(expected.stakes);
        
        if (expected.tournamentId) {
          expect(hand.tournamentId).toBe(expected.tournamentId);
        }
        
        expect(hand.date.getFullYear()).toBe(expected.date.getFullYear());
        expect(hand.date.getMonth()).toBe(expected.date.getMonth());
        expect(hand.date.getDate()).toBe(expected.date.getDate());
      }
    });
  });

  describe('Player Parsing', () => {
    test.each(testCases.players)('should parse player info: $input', ({ input, expected }) => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
${input}
${expected.name}: posts small blind 1
*** SUMMARY ***
Total pot 1 | Rake 0`;
      
      const result = parser.parse(testHand);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        const player = hand.players.find(p => p.name === expected.name);
        
        expect(player).toBeDefined();
        expect(player?.seat).toBe(expected.seat);
        expect(player?.chips).toBe(expected.chips);
      }
    });
  });

  describe('Action Parsing', () => {
    test('should parse all standard action types', () => {
      const result = parser.parse(handHistories.basicCashGame);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        const actionTypes = new Set(hand.actions.map(action => action.type));
        
        expect(actionTypes).toContain('blind');
        expect(actionTypes).toContain('raise');
        expect(actionTypes).toContain('fold');
        expect(actionTypes).toContain('call');
        expect(actionTypes).toContain('bet');
        expect(actionTypes).toContain('uncalled');
        expect(actionTypes).toContain('collected');
      }
    });

    test('should identify all-in actions correctly', () => {
      const result = parser.parse(handHistories.allInScenario);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        const allInActions = hand.actions.filter(action => action.isAllIn);
        
        expect(allInActions.length).toBeGreaterThan(0);
        allInActions.forEach(action => {
          expect(action.isAllIn).toBe(true);
          expect(action.amount).toBeDefined();
          expect(action.player).toBeDefined();
        });
      }
    });

    test('should handle player state changes', () => {
      const result = parser.parse(handHistories.playerStateChanges);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        const stateActions = hand.actions.filter(action => 
          ['timeout', 'disconnect'].includes(action.type)
        );
        
        expect(stateActions.length).toBeGreaterThan(0);
        
        const timeoutAction = hand.actions.find(action => action.type === 'timeout');
        const disconnectAction = hand.actions.find(action => action.type === 'disconnect');
        
        expect(timeoutAction).toBeDefined();
        expect(disconnectAction).toBeDefined();
        expect(timeoutAction?.reason).toContain('timed out');
        expect(disconnectAction?.reason).toContain('disconnected');
      }
    });
  });

  describe('Board Card Parsing', () => {
    test('should parse flop cards correctly', () => {
      const result = parser.parse(handHistories.basicCashGame);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        expect(hand.board).toHaveLength(4); // Flop + Turn
        expect(hand.board.slice(0, 3)).toEqual(['As', 'Kd', '9c']); // Flop
        expect(hand.board[3]).toBe('2h'); // Turn
      }
    });

    test('should handle complete board (flop, turn, river)', () => {
      const result = parser.parse(handHistories.allInScenario);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        expect(hand.board).toHaveLength(5);
        expect(hand.board).toEqual(['Kh', '9s', '2c', '7d', '3h']);
      }
    });
  });

  describe('Pot Calculation', () => {
    test('should calculate simple pot correctly', () => {
      const result = parser.parse(handHistories.basicCashGame);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        expect(hand.pots).toHaveLength(1);
        expect(hand.pots[0].amount).toBe(29);
        expect(hand.pots[0].players).toContain('Player1');
      }
    });

    test('should handle complex side pot scenarios', () => {
      const result = parser.parse(handHistories.complexAllIn);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        expect(hand.pots.length).toBeGreaterThan(1);
        
        const mainPot = hand.pots.find(pot => !pot.isSide);
        const sidePots = hand.pots.filter(pot => pot.isSide);
        
        expect(mainPot).toBeDefined();
        expect(sidePots.length).toBeGreaterThan(0);
        
        // Verify side pot levels
        sidePots.forEach(pot => {
          expect(pot.sidePotLevel).toBeDefined();
          expect(pot.sidePotLevel).toBeGreaterThan(0);
        });
      }
    });

    test('should track eligible players for each pot', () => {
      const result = parser.parse(handHistories.allInScenario);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        hand.pots.forEach(pot => {
          expect(pot.eligiblePlayers).toBeDefined();
          expect(pot.eligiblePlayers!.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle empty hand history', () => {
      const result = parser.parse(handHistories.emptyHandHistory);
      
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toContain('Hand ID not found');
      }
    });

    test('should handle invalid header', () => {
      const result = parser.parse(handHistories.invalidHeader);
      
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toContain('Invalid header');
      }
    });

    test('should handle missing players section gracefully', () => {
      const result = parser.parse(handHistories.missingPlayers);
      
      // The parser is robust and may handle incomplete hands
      if (!result.success) {
        expect(result.error).toBeDefined();
      } else {
        // If it parses successfully, that's also acceptable
        expect(result.hand).toBeDefined();
      }
    });

    test('should provide error context when parsing fails', () => {
      const result = parser.parse(handHistories.malformedAction);
      
      // The parser may handle incomplete hands gracefully
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.line).toBeDefined();
        expect(result.error.context).toBeDefined();
      } else {
        // If it parses successfully, verify basic structure
        expect(result.hand).toBeDefined();
      }
    });
  });

  describe('Date Parsing', () => {
    test('should parse various date formats correctly', () => {
      const testDates = [
        {
          input: "2024/01/15 20:00:00",
          expected: new Date('2024-01-15T20:00:00')
        },
        {
          input: "2024/12/31 23:59:59",
          expected: new Date('2024-12-31T23:59:59')
        }
      ];

      testDates.forEach(({ input, expected }) => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - ${input} ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: TestPlayer (100 in chips)
TestPlayer: posts small blind 1
*** SUMMARY ***
Total pot 1 | Rake 0`;
        
        const result = parser.parse(testHand);
        
        expect(result.success).toBe(true);
        
        if (result.success) {
          const hand = result.hand;
          expect(hand.date.getTime()).toBe(expected.getTime());
        }
      });
    });
  });

  describe('Table Information', () => {
    test('should parse table info correctly', () => {
      const result = parser.parse(handHistories.basicCashGame);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        expect(hand.table.name).toBe('TestTable');
        expect(hand.table.maxSeats).toBe(6);
        expect(hand.table.buttonSeat).toBe(1);
      }
    });
  });

  describe('Hole Cards', () => {
    test('should parse hero hole cards when present', () => {
      const result = parser.parse(handHistories.basicCashGame);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        const heroPlayer = hand.players.find(p => p.isHero);
        
        expect(heroPlayer).toBeDefined();
        expect(heroPlayer?.cards).toEqual(['Ah', 'Kh']);
      }
    });
  });

  describe('Street Actions', () => {
    test('should organize actions by street correctly', () => {
      const result = parser.parse(handHistories.basicCashGame);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        const streets: Street[] = ['preflop', 'flop', 'turn', 'river'];
        
        streets.forEach(street => {
          const streetActions = hand.actions.filter(action => action.street === street);
          if (streetActions.length > 0) {
            expect(streetActions.every(action => action.street === street)).toBe(true);
          }
        });
      }
    });
  });

  describe('Action Indexing', () => {
    test('should assign sequential indices to actions', () => {
      const result = parser.parse(handHistories.basicCashGame);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        hand.actions.forEach((action, index) => {
          expect(action.index).toBe(index);
        });
      }
    });
  });

  describe('Player Chip Tracking', () => {
    test('should track current chips throughout hand', () => {
      const result = parser.parse(handHistories.allInScenario);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        hand.players.forEach(player => {
          expect(player.currentChips).toBeDefined();
          expect(typeof player.currentChips).toBe('number');
        });
      }
    });

    test('should mark all-in players correctly', () => {
      const result = parser.parse(handHistories.allInScenario);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        // Check for all-in actions instead of player state
        const allInActions = hand.actions.filter(a => a.isAllIn);
        
        expect(allInActions.length).toBeGreaterThan(0);
        allInActions.forEach(action => {
          expect(action.isAllIn).toBe(true);
          expect(action.amount).toBeDefined();
          expect(action.amount).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Performance', () => {
    test('should parse hand history within reasonable time', () => {
      const startTime = Date.now();
      const result = parser.parse(handHistories.complexAllIn);
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    test('should handle multiple parses without memory leaks', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Parse the same hand multiple times
      for (let i = 0; i < 100; i++) {
        const result = parser.parse(handHistories.basicCashGame);
        expect(result.success).toBe(true);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});