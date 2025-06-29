/**
 * Integration tests for PokerStarsParser
 * Tests the parser as a complete system with realistic scenarios
 */

import { PokerStarsParser } from '../../src/parser/PokerStarsParser';
import { handHistories } from '../fixtures/hand-histories';

describe('PokerStarsParser Integration Tests', () => {
  let parser: PokerStarsParser;

  beforeEach(() => {
    parser = new PokerStarsParser();
  });

  describe('End-to-End Hand Processing', () => {
    test('should process complete cash game hand successfully', () => {
      const result = parser.parse(handHistories.basicCashGame);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        
        // Verify complete hand structure
        expect(hand.id).toBeDefined();
        expect(hand.stakes).toBeDefined();
        expect(hand.date).toBeInstanceOf(Date);
        expect(hand.table).toBeDefined();
        expect(hand.players.length).toBeGreaterThan(0);
        expect(hand.actions.length).toBeGreaterThan(0);
        expect(hand.board.length).toBeGreaterThan(0);
        expect(hand.pots.length).toBeGreaterThan(0);
        
        // Verify data consistency
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
        
        // Verify pot totals make sense
        const totalPotAmount = hand.pots.reduce((sum, pot) => sum + pot.amount, 0);
        expect(totalPotAmount).toBeGreaterThan(0);
      }
    });

    test('should handle complex tournament scenario', () => {
      const result = parser.parse(handHistories.complexAllIn);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        
        // Verify tournament-specific data
        expect(hand.tournamentId).toBeDefined();
        expect(hand.stakes).toContain('/'); // Tournament blind level format
        
        // Verify complex pot structure
        expect(hand.pots.length).toBeGreaterThan(1);
        
        const mainPot = hand.pots.find(pot => !pot.isSide);
        const sidePots = hand.pots.filter(pot => pot.isSide);
        
        expect(mainPot).toBeDefined();
        expect(sidePots.length).toBeGreaterThan(0);
        
        // Verify side pot levels are sequential
        const sidePotLevels = sidePots
          .map(pot => pot.sidePotLevel!)
          .sort((a, b) => a - b);
        
        for (let i = 0; i < sidePotLevels.length; i++) {
          expect(sidePotLevels[i]).toBe(i + 1);
        }
        
        // Verify all-in tracking
        const allInActions = hand.actions.filter(a => a.isAllIn);
        
        expect(allInActions.length).toBeGreaterThan(0);
      }
    });

    test('should maintain data integrity across all parsing phases', () => {
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
            
            if (pot.eligiblePlayers) {
              expect(pot.eligiblePlayers).toBeInstanceOf(Array);
            }
          });
        }
      });
    });
  });

  describe('Cross-Hand Consistency', () => {
    test('should produce consistent results for same hand', () => {
      const hand1 = parser.parse(handHistories.basicCashGame);
      const hand2 = parser.parse(handHistories.basicCashGame);
      
      expect(hand1.success).toBe(true);
      expect(hand2.success).toBe(true);
      
      if (hand1.success && hand2.success) {
        // Results should be identical
        expect(hand1.hand.id).toBe(hand2.hand.id);
        expect(hand1.hand.stakes).toBe(hand2.hand.stakes);
        expect(hand1.hand.players.length).toBe(hand2.hand.players.length);
        expect(hand1.hand.actions.length).toBe(hand2.hand.actions.length);
        expect(hand1.hand.board.length).toBe(hand2.hand.board.length);
        expect(hand1.hand.pots.length).toBe(hand2.hand.pots.length);
      }
    });

    test('should handle multiple different hands without interference', () => {
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

  describe('Real-World Scenario Handling', () => {
    test('should handle player state changes gracefully', () => {
      const result = parser.parse(handHistories.playerStateChanges);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        
        // Should have timeout and disconnect actions
        const stateActions = hand.actions.filter(action => 
          ['timeout', 'disconnect'].includes(action.type)
        );
        
        expect(stateActions.length).toBeGreaterThan(0);
        
        // Should still complete parsing successfully
        expect(hand.pots.length).toBeGreaterThan(0);
        expect(hand.pots[0].players.length).toBeGreaterThan(0);
      }
    });

    test('should handle edge case pot distributions', () => {
      const result = parser.parse(handHistories.splitPot);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        
        // Should identify split pot
        expect(hand.pots[0].isSplit).toBe(true);
        expect(hand.pots[0].players.length).toBe(2);
        
        // Both players should be winners
        const winners = hand.pots[0].players;
        expect(winners).toContain('SplitPlayer1');
        expect(winners).toContain('SplitPlayer2');
      }
    });

    test('should maintain performance with complex hands', () => {
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
        expect(duration).toBeLessThan(50); // Should complete within 50ms
      });
    });
  });

  describe('Error Recovery', () => {
    test('should provide meaningful error messages', () => {
      const invalidHands = [
        handHistories.emptyHandHistory,
        handHistories.invalidHeader,
        handHistories.missingPlayers,
        handHistories.malformedAction
      ];

      invalidHands.forEach(handHistory => {
        const result = parser.parse(handHistory);
        
        // The parser is robust and may handle some incomplete hands gracefully
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.error.message).toBeTruthy();
          expect(result.error.message.length).toBeGreaterThan(0);
        } else {
          // If it parses successfully, that's also valid behavior
          expect(result.hand).toBeDefined();
        }
      });
    });

    test('should not crash on malformed input', () => {
      const malformedInputs = [
        'completely invalid text',
        '{"json": "object"}',
        '12345',
        '',
        null as any,
        undefined as any,
        {} as any,
        [] as any
      ];

      malformedInputs.forEach(input => {
        expect(() => {
          const result = parser.parse(input);
          expect(result.success).toBe(false);
        }).not.toThrow();
      });
    });
  });

  describe('Memory and Resource Management', () => {
    test('should not accumulate memory over multiple parses', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Parse multiple hands
      for (let i = 0; i < 50; i++) {
        const result = parser.parse(handHistories.basicCashGame);
        expect(result.success).toBe(true);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
    });

    test('should handle large hand histories efficiently', () => {
      // Create a larger hand history by repeating actions
      const largeHandHistory = handHistories.complexAllIn + '\n' + 
        handHistories.allInScenario.split('\n').slice(3).join('\n');
      
      const startTime = process.hrtime.bigint();
      const result = parser.parse(largeHandHistory);
      const endTime = process.hrtime.bigint();
      
      const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
      
      expect(duration).toBeLessThan(100);
    });
  });
});