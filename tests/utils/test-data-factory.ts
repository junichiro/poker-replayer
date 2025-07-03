/**
 * Test data factory for creating optimized, minimal test datasets
 * Reduces test execution time by providing smaller, focused test data
 */

export class TestDataFactory {
  /**
   * Create a minimal hand history for basic parsing tests
   */
  static createMinimalHand(overrides: Partial<MinimalHandOptions> = {}): string {
    const options = {
      handId: '123456789',
      stakes: '$1/$2',
      players: 2,
      actions: ['fold'],
      ...overrides,
    };

    const playerSeats = Array.from(
      { length: options.players },
      (_, i) => `Seat ${i + 1}: Player${i + 1} (100 in chips)`
    ).join('\n');

    const actions = options.actions.map((action, i) => `Player${i + 1}: ${action}`).join('\n');

    return `PokerStars Hand #${options.handId}: Hold'em No Limit (${options.stakes} USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' ${options.players}-max Seat #1 is the button
${playerSeats}
Player1: posts small blind 1
${actions}
*** SUMMARY ***
Total pot 1 | Rake 0`;
  }

  /**
   * Create a hand with specific betting actions for testing action parsing
   */
  static createActionHand(actions: ActionType[]): string {
    const actionLines = actions
      .map((action, i) => {
        const player = `Player${(i % 3) + 1}`;
        switch (action) {
          case 'fold':
            return `${player}: folds`;
          case 'call':
            return `${player}: calls 2`;
          case 'raise':
            return `${player}: raises 2 to 4`;
          case 'check':
            return `${player}: checks`;
          case 'bet':
            return `${player}: bets 2`;
          default:
            return `${player}: ${action}`;
        }
      })
      .join('\n');

    return `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 (100 in chips)
Seat 2: Player2 (100 in chips)
Seat 3: Player3 (100 in chips)
Player1: posts small blind 1
Player2: posts big blind 2
*** HOLE CARDS ***
${actionLines}
*** SUMMARY ***
Total pot 5 | Rake 0`;
  }

  /**
   * Create a batch of test hands for performance testing
   */
  static createTestBatch(count: number, handFactory: () => string): string[] {
    return Array.from({ length: count }, () => handFactory());
  }

  /**
   * Create test data with specific pot size for pot calculation tests
   */
  static createPotCalculationHand(potAmount: number, players: string[]): string {
    const seats = players
      .map((player, i) => `Seat ${i + 1}: ${player} (${potAmount * 2} in chips)`)
      .join('\n');

    return `PokerStars Hand #123: Hold'em No Limit ($1/$2 USD) - 2024/01/15 20:00:00 ET
Table 'TestTable' ${players.length}-max Seat #1 is the button
${seats}
${players[0]}: posts small blind 1
${players[1]}: posts big blind 2
*** HOLE CARDS ***
${players[0]}: calls 2
${players[1]}: checks
*** FLOP *** [Ah Kh Qh]
${players[1]}: bets ${potAmount / 2}
${players[0]}: calls ${potAmount / 2}
*** TURN *** [Ah Kh Qh] [Js]
${players[1]}: checks
${players[0]}: bets ${potAmount / 2}
${players[1]}: calls ${potAmount / 2}
*** SUMMARY ***
Total pot ${potAmount} | Rake 0
${players[0]}: collected ${potAmount}`;
  }
}

interface MinimalHandOptions {
  handId: string;
  stakes: string;
  players: number;
  actions: string[];
}

type ActionType = 'fold' | 'call' | 'raise' | 'check' | 'bet';

/**
 * Pre-generated test data sets for common scenarios
 * These are cached to avoid regeneration during test execution
 */
export const CACHED_TEST_DATA = {
  SIMPLE_FOLD: TestDataFactory.createMinimalHand({ actions: ['folds'] }),
  SIMPLE_CALL: TestDataFactory.createMinimalHand({ actions: ['calls 2'] }),
  TWO_PLAYER_FOLD: TestDataFactory.createMinimalHand({ players: 2, actions: ['folds'] }),
  THREE_PLAYER_FOLD: TestDataFactory.createMinimalHand({ players: 3, actions: ['folds', 'folds'] }),

  // Action sequences
  FOLD_CALL_RAISE: TestDataFactory.createActionHand(['fold', 'call', 'raise']),
  CHECK_BET_FOLD: TestDataFactory.createActionHand(['check', 'bet', 'fold']),

  // Pot calculation scenarios
  SMALL_POT: TestDataFactory.createPotCalculationHand(10, ['Player1', 'Player2']),
  MEDIUM_POT: TestDataFactory.createPotCalculationHand(100, ['Player1', 'Player2', 'Player3']),
};

/**
 * Mock expensive operations for unit tests
 */
export class TestMocks {
  static mockParserValidation() {
    // Mock expensive validation operations
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }

  static restoreParserValidation() {
    jest.restoreAllMocks();
  }

  static createFastParserMock() {
    return {
      parse: jest.fn().mockReturnValue({
        success: true,
        hand: {
          id: '123',
          players: [],
          actions: [],
          pots: [],
        },
      }),
      validateCard: jest.fn().mockReturnValue(true),
      parseActions: jest.fn().mockReturnValue([]),
    };
  }
}
