/**
 * Tests specifically designed to cover remaining uncovered lines in PokerStarsParser
 * Focused on achieving 100% code coverage
 */

import { PokerStarsParser } from '../../src/parser/PokerStarsParser';

describe('PokerStarsParser Coverage Tests', () => {
  let parser: PokerStarsParser;

  beforeEach(() => {
    parser = new PokerStarsParser();
  });

  describe('Remaining Uncovered Lines', () => {
    test('should cover pot parsing nextLine call (line 719)', () => {
      // Create a hand that will reach the nextLine() call in parsePotLines
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
Player1 collected 4 from pot
Some additional line after pot info
Final line`;

      const result = parser.parse(testHand);
      
      // Should parse successfully and reach the nextLine() call
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.pots[0].amount).toBe(4);
      }
    });

    test('should handle empty input correctly', () => {
      const result = parser.parse('');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Empty hand history');
      }
    });
  });

  describe('Edge Cases for Complete Coverage', () => {
    test('should handle malformed pot summary sections', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Player1: posts small blind 1
*** HOLE CARDS ***
Player1: checks
*** SUMMARY ***
Invalid pot line format
Another invalid line
Total pot 2 | Rake 0
Player1 collected 2 from pot`;

      const result = parser.parse(testHand);
      
      // Should handle gracefully
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.hand).toBeDefined();
      }
    });

    test('should handle summary section with multiple unrecognized lines', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Player1: posts small blind 1
*** SUMMARY ***
Random line 1
Random line 2
Random line 3
Total pot 1 | Rake 0
Player1 collected 1 from pot
Random line after pot
Another random line
Final random line`;

      const result = parser.parse(testHand);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.hand.pots).toHaveLength(1);
        expect(result.hand.pots[0].amount).toBe(1);
      }
    });
  });
});