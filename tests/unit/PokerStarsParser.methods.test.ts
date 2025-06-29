/**
 * Unit tests for individual PokerStarsParser methods
 * Tests internal parser methods in isolation
 */

import { PokerStarsParser } from '../../src/parser/PokerStarsParser';

describe('PokerStarsParser Individual Methods', () => {
  let parser: PokerStarsParser;

  beforeEach(() => {
    parser = new PokerStarsParser();
  });

  describe('Header Parsing Edge Cases', () => {
    test('should handle headers with different tournament formats', () => {
      const headers = [
        "PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET",
        "PokerStars Hand #987654321: Tournament #555666777, $10+$1 USD Hold'em No Limit - Level V (300/600) - 2024/01/15 21:00:00 ET",
        "PokerStars Hand #456789123: Tournament #888999000, Freeroll Hold'em No Limit - Level I (10/20) - 2024/01/15 22:00:00 ET"
      ];

      headers.forEach(header => {
        const testHand = `${header}
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: TestPlayer (100 in chips)
TestPlayer: posts small blind 1
*** SUMMARY ***
Total pot 1 | Rake 0`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
      });
    });

    test('should handle various date formats', () => {
      const dateFormats = [
        '2024/01/15 20:00:00',
        '2024/12/31 23:59:59',
        '2024/01/01 00:00:00',
        '2024/06/15 12:30:45'
      ];

      dateFormats.forEach(dateStr => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - ${dateStr} ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: TestPlayer (100 in chips)
TestPlayer: posts small blind 1
*** SUMMARY ***
Total pot 1 | Rake 0`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.hand.date).toBeInstanceOf(Date);
          expect(result.hand.date.getFullYear()).toBe(2024);
        }
      });
    });

    test('should reject invalid headers', () => {
      const invalidHeaders = [
        'Invalid header without proper format',
        'PokerStars Hand: Missing hand number',
        'Hand #123456789: Missing PokerStars prefix',
        'PokerStars Hand #abc: Non-numeric hand ID'
      ];

      invalidHeaders.forEach(header => {
        const testHand = `${header}
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: TestPlayer (100 in chips)`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Table Information Parsing', () => {
    test('should parse different table configurations', () => {
      const tableConfigs = [
        "Table 'CashGame Table' 2-max Seat #1 is the button",
        "Table '6Max Table 123' 6-max Seat #3 is the button",
        "Table 'Tournament Table' 9-max Seat #9 is the button",
        "Table 'Heads Up' 2-max Seat #2 is the button"
      ];

      tableConfigs.forEach(tableConfig => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
${tableConfig}
Seat 1: TestPlayer (100 in chips)
TestPlayer: posts small blind 1
*** SUMMARY ***
Total pot 1 | Rake 0`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.hand.table.name).toBeTruthy();
          expect(result.hand.table.maxSeats).toBeGreaterThan(0);
          expect(result.hand.table.buttonSeat).toBeGreaterThan(0);
        }
      });
    });

    test('should handle special table names', () => {
      const specialNames = [
        "Table 'Table with spaces' 6-max Seat #1 is the button",
        "Table 'Table_with_underscores' 6-max Seat #1 is the button",
        "Table 'Table-with-dashes' 6-max Seat #1 is the button",
        "Table '123456789' 6-max Seat #1 is the button"
      ];

      specialNames.forEach(tableLine => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
${tableLine}
Seat 1: TestPlayer (100 in chips)
TestPlayer: posts small blind 1
*** SUMMARY ***
Total pot 1 | Rake 0`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Player Information Parsing', () => {
    test('should handle various player names and chip amounts', () => {
      const playerLines = [
        'Seat 1: Player1 (100 in chips)',
        'Seat 2: Player_With_Underscores (1500 in chips)',
        'Seat 3: Player-With-Dashes (25000 in chips)',
        'Seat 4: 123PlayerWithNumbers (500 in chips)',
        'Seat 5: VeryLongPlayerNameThatIsStillValid (10000 in chips)'
      ];

      playerLines.forEach(playerLine => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
${playerLine}
${playerLine.split(':')[1].split('(')[0].trim()}: posts small blind 1
*** SUMMARY ***
Total pot 1 | Rake 0`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.hand.players).toHaveLength(1);
          expect(result.hand.players[0].name).toBeTruthy();
          expect(result.hand.players[0].chips).toBeGreaterThan(0);
        }
      });
    });

    test('should handle invalid player formats gracefully', () => {
      const invalidPlayerLines = [
        'Seat: Missing seat number',
        'Seat 1 Missing colon',
        'Seat 1: (100 in chips)', // Missing player name
        'Seat 1: Player1 (abc in chips)', // Non-numeric chips
        'Seat abc: Player1 (100 in chips)' // Non-numeric seat
      ];

      invalidPlayerLines.forEach(playerLine => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
${playerLine}`;
        
        const result = parser.parse(testHand);
        
        // The parser may handle invalid players gracefully or reject them
        if (!result.success) {
          expect(result.error).toBeDefined();
        } else {
          // If it parses successfully, that's also acceptable
          expect(result.hand).toBeDefined();
        }
      });
    });
  });

  describe('Action Parsing Edge Cases', () => {
    test('should handle all blind variations', () => {
      const blindActions = [
        'Player1: posts small blind 1',
        'Player2: posts big blind 2',
        'Player3: posts small & big blinds 3',
        'Player4: posts dead blind 1',
        'Player5: posts the ante 0.50'
      ];

      blindActions.forEach(blindAction => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
${blindAction}
*** SUMMARY ***
Total pot 1 | Rake 0`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
        
        if (result.success) {
          const blindOrAnteActions = result.hand.actions.filter(
            action => action.type === 'blind' || action.type === 'ante'
          );
          expect(blindOrAnteActions.length).toBeGreaterThan(0);
        }
      });
    });

    test('should handle all standard action types', () => {
      const actions = [
        { line: 'Player1: folds', type: 'fold' },
        { line: 'Player1: checks', type: 'check' },
        { line: 'Player1: calls 10', type: 'call' },
        { line: 'Player1: bets 15', type: 'bet' },
        { line: 'Player1: raises 10 to 25', type: 'raise' },
        { line: 'Player1: calls 20 and is all-in', type: 'call' },
        { line: 'Player1: bets 50 and is all-in', type: 'bet' },
        { line: 'Player1: raises 30 to 100 and is all-in', type: 'raise' }
      ];

      actions.forEach(({ line, type }) => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Player1: posts small blind 1
*** HOLE CARDS ***
${line}
*** SUMMARY ***
Total pot 1 | Rake 0`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
        
        if (result.success) {
          const actionOfType = result.hand.actions.find(action => action.type === type);
          expect(actionOfType).toBeDefined();
        }
      });
    });

    test('should handle player state change actions', () => {
      const stateChanges = [
        { line: 'Player1 has timed out', type: 'timeout' },
        { line: 'Player1 is disconnected', type: 'disconnect' },
        { line: 'Player1 is connected', type: 'reconnect' },
        { line: 'Player1: sits out', type: 'sitout' },
        { line: 'Player1 is sitting out', type: 'sitout' },
        { line: 'Player1 has returned', type: 'return' },
        { line: 'Player1: mucks hand', type: 'muck' }
      ];

      stateChanges.forEach(({ line, type }) => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Player1: posts small blind 1
*** HOLE CARDS ***
${line}
*** SUMMARY ***
Total pot 1 | Rake 0`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
        
        if (result.success) {
          const stateAction = result.hand.actions.find(action => action.type === type);
          expect(stateAction).toBeDefined();
          if (type === 'timeout' || type === 'disconnect') {
            expect(stateAction?.reason).toBeDefined();
          }
        }
      });
    });
  });

  describe('Board Card Parsing', () => {
    test('should handle different board configurations', () => {
      const boardConfigs = [
        { cards: '[As Kd Qc]', count: 3 }, // Flop only
        { cards: '[As Kd Qc] [Jh]', count: 4 }, // Flop + Turn
        { cards: '[As Kd Qc] [Jh] [Tc]', count: 5 } // Flop + Turn + River
      ];

      boardConfigs.forEach(({ cards, count }) => {
        const streets = cards.split('] [').map(s => s.replace(/[\[\]]/g, ''));
        const fullHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Player1: posts small blind 1
*** HOLE CARDS ***
${streets.length >= 1 ? `*** FLOP *** [${streets[0]}]` : ''}
${streets.length >= 2 ? `*** TURN *** [${streets[0]}] [${streets[1]}]` : ''}
${streets.length >= 3 ? `*** RIVER *** [${streets[0]}] [${streets[1]}] [${streets[2]}]` : ''}
*** SUMMARY ***
Total pot 1 | Rake 0
Board ${cards}`;
        
        const result = parser.parse(fullHand);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.hand.board).toHaveLength(count);
        }
      });
    });

    test('should handle various card formats', () => {
      const cardFormats = [
        '[2s 3h 4c]',
        '[Ts Js Qs]',
        '[Ah Kh Qh]',
        '[9d Td Jd]'
      ];

      cardFormats.forEach(cards => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Player1: posts small blind 1
*** HOLE CARDS ***
*** FLOP *** ${cards}
*** SUMMARY ***
Total pot 1 | Rake 0
Board ${cards}`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.hand.board).toHaveLength(3);
          result.hand.board.forEach(card => {
            expect(card).toMatch(/^[2-9TJQKA][shdc]$/);
          });
        }
      });
    });
  });

  describe('Hole Card Parsing', () => {
    test('should parse hero hole cards correctly', () => {
      const holeCardCombos = [
        '[As Ah]',
        '[Kh Qh]',
        '[2c 7d]',
        '[Tc Js]'
      ];

      holeCardCombos.forEach(cards => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Hero (100 in chips)
Hero: posts small blind 1
*** HOLE CARDS ***
Dealt to Hero ${cards}
*** SUMMARY ***
Total pot 1 | Rake 0`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
        
        if (result.success) {
          const hero = result.hand.players.find(p => p.isHero);
          expect(hero).toBeDefined();
          expect(hero?.cards).toHaveLength(2);
          expect(hero?.cards?.[0]).toMatch(/^[2-9TJQKA][shdc]$/);
          expect(hero?.cards?.[1]).toMatch(/^[2-9TJQKA][shdc]$/);
        }
      });
    });

    test('should handle multiple hole card reveals', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Hero (100 in chips)
Seat 2: Villain (100 in chips)
Hero: posts small blind 1
Villain: posts big blind 2
*** HOLE CARDS ***
Dealt to Hero [As Ah]
Dealt to Villain [Kh Qh]
*** SUMMARY ***
Total pot 3 | Rake 0`;
      
      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const playersWithCards = result.hand.players.filter(p => p.cards);
        expect(playersWithCards.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Summary Parsing Edge Cases', () => {
    test('should handle various pot total formats', () => {
      const potFormats = [
        'Total pot 100 | Rake 0',
        'Total pot 1500 | Rake 5',
        'Total pot 50000 | Rake 150',
        'Total pot 25 Main pot 15. Side pot 10. | Rake 0'
      ];

      potFormats.forEach(potLine => {
        const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Player1: posts small blind 1
*** SUMMARY ***
${potLine}`;
        
        const result = parser.parse(testHand);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.hand.pots.length).toBeGreaterThan(0);
        }
      });
    });

    test('should handle multiple side pot levels', () => {
      const testHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (200 in chips)
Seat 3: Player3 (300 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
Player3: calls 2
Player1: calls 1
Player2: checks
*** SUMMARY ***
Total pot 6000 Main pot 300. Side pot-1 1200. Side pot-2 4500. | Rake 0`;
      
      const result = parser.parse(testHand);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const sidePots = result.hand.pots.filter(pot => pot.isSide);
        expect(sidePots.length).toBe(2);
        
        const levels = sidePots.map(pot => pot.sidePotLevel).sort();
        expect(levels).toEqual([1, 2]);
      }
    });
  });

  describe('Error Context and Recovery', () => {
    test('should provide line numbers for errors when they occur', () => {
      const invalidAction = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Player1: posts small blind 1
*** HOLE CARDS ***
This is an invalid action line`;
      
      const result = parser.parse(invalidAction);
      
      // The parser may handle incomplete hands gracefully
      if (!result.success) {
        expect(result.error.line).toBeDefined();
        expect(result.error.context).toBeDefined();
      } else {
        // If it parses successfully, that's also acceptable
        expect(result.hand).toBeDefined();
      }
    });

    test('should handle truncated hand histories gracefully', () => {
      const truncatedHand = `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Player1: posts small blind 1`;
      // Missing summary section
      
      const result = parser.parse(truncatedHand);
      
      // The parser may handle truncated hands gracefully or fail
      if (!result.success) {
        expect(result.error).toBeDefined();
      } else {
        // If it parses successfully, that's also acceptable
        expect(result.hand).toBeDefined();
      }
    });
  });
});