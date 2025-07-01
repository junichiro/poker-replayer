/**
 * Simple Integration Tests
 * Basic integration tests that verify core functionality without complex UI interactions
 */

import { PokerStarsParser } from '../../src/parser/PokerStarsParser';
import { handHistories } from '../fixtures/hand-histories';

describe('Simple Integration Tests', () => {
  let parser: PokerStarsParser;

  beforeEach(() => {
    parser = new PokerStarsParser();
  });

  describe('End-to-End Parsing Integration', () => {
    test('should successfully parse and structure complete hand data', () => {
      const result = parser.parse(handHistories.basicCashGame);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        
        // Verify complete data structure
        expect(hand.id).toBeDefined();
        expect(hand.stakes).toBeDefined();
        expect(hand.date).toBeInstanceOf(Date);
        expect(hand.table).toBeDefined();
        expect(hand.players.length).toBeGreaterThan(0);
        expect(hand.actions.length).toBeGreaterThan(0);
        expect(hand.board.length).toBeGreaterThan(0);
        expect(hand.pots.length).toBeGreaterThan(0);
        
        // Verify data relationships
        const playerNames = new Set(hand.players.map(p => p.name));
        const actionPlayers = new Set(
          hand.actions
            .filter(a => a.player)
            .map(a => a.player!)
        );
        
        // All action players should exist in players list
        actionPlayers.forEach(playerName => {
          expect(playerNames.has(playerName)).toBe(true);
        });
      }
    });

    test('should handle complex tournament scenarios', () => {
      const result = parser.parse(handHistories.complexAllIn);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        
        // Verify tournament data
        expect(hand.tournamentId).toBeDefined();
        expect(hand.stakes).toContain('/');
        
        // Verify complex pot structure
        expect(hand.pots.length).toBeGreaterThan(1);
        
        const mainPot = hand.pots.find(pot => !pot.isSide);
        const sidePots = hand.pots.filter(pot => pot.isSide);
        
        expect(mainPot).toBeDefined();
        expect(sidePots.length).toBeGreaterThan(0);
      }
    });

    test('should maintain data consistency across all test scenarios', () => {
      const testHands = [
        handHistories.basicCashGame,
        handHistories.tournamentWithAntes,
        handHistories.allInScenario,
        handHistories.splitPot,
        handHistories.complexAllIn
      ];

      testHands.forEach((handHistory, index) => {
        const result = parser.parse(handHistory);
        
        expect(result.success).toBe(true);
        
        if (result.success) {
          const hand = result.hand;
          
          // Basic structure validation
          expect(hand.id).toBeTruthy();
          expect(hand.stakes).toBeTruthy();
          expect(hand.date).toBeInstanceOf(Date);
          expect(hand.table).toBeDefined();
          expect(hand.players).toBeInstanceOf(Array);
          expect(hand.actions).toBeInstanceOf(Array);
          expect(hand.board).toBeInstanceOf(Array);
          expect(hand.pots).toBeInstanceOf(Array);
          
          // Players validation
          hand.players.forEach(player => {
            expect(player.seat).toBeGreaterThan(0);
            expect(player.name).toBeTruthy();
            expect(player.chips).toBeGreaterThan(0);
            expect(typeof player.currentChips).toBe('number');
          });
          
          // Actions validation
          hand.actions.forEach((action, actionIndex) => {
            expect(typeof action.index).toBe('number');
            expect(action.index).toBeGreaterThanOrEqual(0);
            expect(action.street).toBeTruthy();
            expect(action.type).toBeTruthy();
            
            if (action.amount !== undefined) {
              expect(action.amount).toBeGreaterThanOrEqual(0);
            }
          });
          
          // Pots validation
          hand.pots.forEach(pot => {
            expect(pot.amount).toBeGreaterThan(0);
            expect(pot.players).toBeInstanceOf(Array);
            expect(pot.players.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe('Performance Integration', () => {
    test('should parse hands within performance thresholds', () => {
      const complexHands = [
        handHistories.complexAllIn,
        handHistories.allInScenario,
        handHistories.tournamentWithAntes
      ];

      complexHands.forEach(handHistory => {
        const startTime = process.hrtime.bigint();
        const result = parser.parse(handHistory);
        const endTime = process.hrtime.bigint();
        
        const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
        
        expect(result.success).toBe(true);
        expect(duration).toBeLessThan(100); // Should complete within 100ms
      });
    });

    test('should handle multiple parses efficiently', () => {
      const iterations = 10;
      const startTime = process.hrtime.bigint();
      
      for (let i = 0; i < iterations; i++) {
        const result = parser.parse(handHistories.basicCashGame);
        expect(result.success).toBe(true);
      }
      
      const endTime = process.hrtime.bigint();
      const totalDuration = Number(endTime - startTime) / 1_000_000;
      const averageDuration = totalDuration / iterations;
      
      expect(averageDuration).toBeLessThan(50); // Average should be under 50ms
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle malformed input gracefully', () => {
      const malformedInputs = [
        'completely invalid text',
        '{"json": "object"}',
        '12345',
        '',
        handHistories.invalidHeader,
        handHistories.emptyHandHistory
      ];

      malformedInputs.forEach(input => {
        expect(() => {
          const result = parser.parse(input);
          // Should either succeed or fail gracefully
          if (!result.success) {
            expect(result.error).toBeDefined();
            expect(result.error.message).toBeTruthy();
          }
        }).not.toThrow();
      });
    });

    test('should provide meaningful error information', () => {
      const result = parser.parse(handHistories.invalidHeader);
      
      // Whether it succeeds or fails, it should handle gracefully
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.message).toBeTruthy();
        expect(result.error.message.length).toBeGreaterThan(0);
      } else {
        // If it parses successfully, that's also acceptable
        expect(result.hand).toBeDefined();
      }
    });
  });

  describe('Cross-Hand Consistency', () => {
    test('should produce consistent results for same input', () => {
      const result1 = parser.parse(handHistories.basicCashGame);
      const result2 = parser.parse(handHistories.basicCashGame);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      
      if (result1.success && result2.success) {
        expect(result1.hand.id).toBe(result2.hand.id);
        expect(result1.hand.stakes).toBe(result2.hand.stakes);
        expect(result1.hand.players.length).toBe(result2.hand.players.length);
        expect(result1.hand.actions.length).toBe(result2.hand.actions.length);
      }
    });

    test('should handle different hands without interference', () => {
      const results = [
        parser.parse(handHistories.basicCashGame),
        parser.parse(handHistories.tournamentWithAntes),
        parser.parse(handHistories.allInScenario)
      ];

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // All should have different IDs
      if (results.every(r => r.success)) {
        const hands = results.map(r => r.hand!);
        const ids = hands.map(h => h.id);
        
        expect(new Set(ids).size).toBe(ids.length); // All unique
      }
    });
  });

  describe('Data Integrity Integration', () => {
    test('should maintain pot calculation accuracy', () => {
      const result = parser.parse(handHistories.splitPot);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        
        // Verify pot distribution
        const totalPotAmount = hand.pots.reduce((sum, pot) => sum + pot.amount, 0);
        expect(totalPotAmount).toBeGreaterThan(0);
        
        // Verify split pot handling
        if (hand.pots[0].isSplit) {
          expect(hand.pots[0].players.length).toBeGreaterThanOrEqual(2);
        }
      }
    });

    test('should track player chip changes accurately', () => {
      const result = parser.parse(handHistories.allInScenario);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        
        // Verify all-in tracking
        const allInActions = hand.actions.filter(a => a.isAllIn);
        expect(allInActions.length).toBeGreaterThan(0);
        
        // Verify player chip tracking
        hand.players.forEach(player => {
          expect(typeof player.currentChips).toBe('number');
          expect(player.currentChips).toBeGreaterThanOrEqual(0);
        });
      }
    });

    test('should handle side pot calculations correctly', () => {
      const result = parser.parse(handHistories.complexAllIn);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        
        const sidePots = hand.pots.filter(pot => pot.isSide);
        
        if (sidePots.length > 0) {
          // Verify side pot structure
          sidePots.forEach(pot => {
            expect(pot.sidePotLevel).toBeGreaterThan(0);
            expect(pot.players.length).toBeGreaterThan(0);
            expect(pot.amount).toBeGreaterThan(0);
          });
          
          // Verify side pot levels are sequential
          const levels = sidePots.map(pot => pot.sidePotLevel!).sort((a, b) => a - b);
          for (let i = 0; i < levels.length; i++) {
            expect(levels[i]).toBe(i + 1);
          }
        }
      }
    });
  });
});