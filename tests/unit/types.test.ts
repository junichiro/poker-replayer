/**
 * Tests for TypeScript type definitions and interfaces
 */

import {
  Street,
  ActionType,
  Position,
  TableInfo,
  Player,
  Action,
  Pot,
  PokerHand,
  ParserError,
  ParserResult,
  ReplayConfig,
  ActionChangeCallback,
  ReplayEventCallback
} from '../../src/types';

describe('TypeScript Types and Interfaces', () => {
  describe('Union Types', () => {
    test('Street type should accept valid values', () => {
      const validStreets: Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];
      
      validStreets.forEach(street => {
        expect(typeof street).toBe('string');
        expect(['preflop', 'flop', 'turn', 'river', 'showdown']).toContain(street);
      });
    });

    test('ActionType should include all poker actions', () => {
      const validActions: ActionType[] = [
        'blind', 'ante', 'deal', 'fold', 'check', 'call', 'bet', 'raise',
        'show', 'uncalled', 'collected', 'muck', 'timeout', 'disconnect',
        'reconnect', 'sitout', 'return'
      ];
      
      expect(validActions).toHaveLength(17);
      
      validActions.forEach(action => {
        expect(typeof action).toBe('string');
      });
    });

    test('Position should include all table positions', () => {
      const validPositions: Position[] = ['BB', 'SB', 'BTN', 'CO', 'HJ', 'MP', 'EP', 'UTG'];
      
      expect(validPositions).toHaveLength(8);
      
      validPositions.forEach(position => {
        expect(typeof position).toBe('string');
        expect(position.length).toBeGreaterThan(1);
        expect(position.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('Interface Validation', () => {
    test('TableInfo interface should work correctly', () => {
      const tableInfo: TableInfo = {
        name: 'Test Table',
        maxSeats: 6,
        buttonSeat: 3
      };

      expect(tableInfo.name).toBe('Test Table');
      expect(tableInfo.maxSeats).toBe(6);
      expect(tableInfo.buttonSeat).toBe(3);
      expect(typeof tableInfo.name).toBe('string');
      expect(typeof tableInfo.maxSeats).toBe('number');
      expect(typeof tableInfo.buttonSeat).toBe('number');
    });

    test('Player interface should handle all properties', () => {
      const fullPlayer: Player = {
        seat: 1,
        name: 'TestPlayer',
        chips: 1000,
        cards: ['As', 'Ah'],
        isHero: true,
        position: 'BTN',
        currentChips: 950,
        isAllIn: false,
        allInAmount: undefined
      };

      expect(fullPlayer.seat).toBe(1);
      expect(fullPlayer.name).toBe('TestPlayer');
      expect(fullPlayer.chips).toBe(1000);
      expect(fullPlayer.cards).toEqual(['As', 'Ah']);
      expect(fullPlayer.isHero).toBe(true);
      expect(fullPlayer.position).toBe('BTN');
      expect(fullPlayer.currentChips).toBe(950);
      expect(fullPlayer.isAllIn).toBe(false);

      // Test minimal player
      const minimalPlayer: Player = {
        seat: 2,
        name: 'MinimalPlayer',
        chips: 500
      };

      expect(minimalPlayer.seat).toBe(2);
      expect(minimalPlayer.cards).toBeUndefined();
      expect(minimalPlayer.isHero).toBeUndefined();
    });

    test('Action interface should support all action scenarios', () => {
      const basicAction: Action = {
        index: 0,
        street: 'preflop',
        type: 'raise',
        player: 'Player1',
        amount: 50
      };

      expect(basicAction.index).toBe(0);
      expect(basicAction.street).toBe('preflop');
      expect(basicAction.type).toBe('raise');
      expect(basicAction.player).toBe('Player1');
      expect(basicAction.amount).toBe(50);

      const allInAction: Action = {
        index: 5,
        street: 'flop',
        type: 'bet',
        player: 'Player2',
        amount: 200,
        isAllIn: true
      };

      expect(allInAction.isAllIn).toBe(true);

      const stateAction: Action = {
        index: 10,
        street: 'turn',
        type: 'timeout',
        player: 'Player3',
        reason: 'Player timed out'
      };

      expect(stateAction.reason).toBe('Player timed out');
      expect(stateAction.amount).toBeUndefined();

      const showAction: Action = {
        index: 15,
        street: 'showdown',
        type: 'show',
        player: 'Player4',
        cards: ['Ks', 'Qh']
      };

      expect(showAction.cards).toEqual(['Ks', 'Qh']);
    });

    test('Pot interface should handle complex pot structures', () => {
      const basicPot: Pot = {
        amount: 100,
        players: ['Winner1']
      };

      expect(basicPot.amount).toBe(100);
      expect(basicPot.players).toEqual(['Winner1']);
      expect(basicPot.isSide).toBeUndefined();

      const sidePot: Pot = {
        amount: 250,
        players: ['Winner2'],
        isSide: true,
        sidePotLevel: 1,
        eligiblePlayers: ['Player1', 'Player2', 'Player3']
      };

      expect(sidePot.isSide).toBe(true);
      expect(sidePot.sidePotLevel).toBe(1);
      expect(sidePot.eligiblePlayers).toHaveLength(3);

      const splitPot: Pot = {
        amount: 200,
        players: ['Winner1', 'Winner2'],
        isSplit: true,
        oddChipWinner: 'Winner1'
      };

      expect(splitPot.isSplit).toBe(true);
      expect(splitPot.players).toHaveLength(2);
      expect(splitPot.oddChipWinner).toBe('Winner1');
    });

    test('PokerHand interface should represent complete hand data', () => {
      const hand: PokerHand = {
        id: 'hand123',
        stakes: '$1/$2',
        date: new Date(),
        table: {
          name: 'TestTable',
          maxSeats: 6,
          buttonSeat: 1
        },
        players: [
          {
            seat: 1,
            name: 'Player1',
            chips: 200
          }
        ],
        actions: [
          {
            index: 0,
            street: 'preflop',
            type: 'blind',
            player: 'Player1',
            amount: 1
          }
        ],
        board: ['As', 'Kh', '9c'],
        pots: [
          {
            amount: 100,
            players: ['Player1']
          }
        ]
      };

      expect(hand.id).toBe('hand123');
      expect(hand.tournamentId).toBeUndefined();
      expect(hand.stakes).toBe('$1/$2');
      expect(hand.date).toBeInstanceOf(Date);
      expect(hand.table).toBeDefined();
      expect(hand.players).toHaveLength(1);
      expect(hand.actions).toHaveLength(1);
      expect(hand.board).toHaveLength(3);
      expect(hand.pots).toHaveLength(1);

      // Tournament hand
      const tournamentHand: PokerHand = {
        ...hand,
        tournamentId: 'tournament456',
        stakes: '$10+$1'
      };

      expect(tournamentHand.tournamentId).toBe('tournament456');
      expect(tournamentHand.stakes).toBe('$10+$1');
    });
  });

  describe('ParserResult Discriminated Union', () => {
    test('should handle successful parsing result', () => {
      const successResult: ParserResult = {
        success: true,
        hand: {
          id: 'test123',
          stakes: '$1/$2',
          date: new Date(),
          table: { name: 'Test', maxSeats: 6, buttonSeat: 1 },
          players: [],
          actions: [],
          board: [],
          pots: []
        }
      };

      expect(successResult.success).toBe(true);
      
      if (successResult.success) {
        // TypeScript should know hand is available
        expect(successResult.hand.id).toBe('test123');
        expect(successResult.hand.stakes).toBe('$1/$2');
      }
    });

    test('should handle error parsing result', () => {
      const errorResult: ParserResult = {
        success: false,
        error: {
          message: 'Parse error occurred',
          line: 5,
          context: 'Invalid line content'
        }
      };

      expect(errorResult.success).toBe(false);
      
      if (!errorResult.success) {
        // TypeScript should know error is available
        expect(errorResult.error.message).toBe('Parse error occurred');
        expect(errorResult.error.line).toBe(5);
        expect(errorResult.error.context).toBe('Invalid line content');
      }
    });

    test('should enforce discriminated union constraints', () => {
      // This test verifies that TypeScript enforces the discriminated union
      function processResult(result: ParserResult) {
        if (result.success) {
          // In this branch, TypeScript knows result.hand exists
          expect(result.hand).toBeDefined();
          expect(result.hand.id).toBeDefined();
        } else {
          // In this branch, TypeScript knows result.error exists
          expect(result.error).toBeDefined();
          expect(result.error.message).toBeDefined();
        }
      }

      const successResult: ParserResult = {
        success: true,
        hand: {
          id: 'test',
          stakes: '$1/$2',
          date: new Date(),
          table: { name: 'Test', maxSeats: 6, buttonSeat: 1 },
          players: [],
          actions: [],
          board: [],
          pots: []
        }
      };

      const errorResult: ParserResult = {
        success: false,
        error: { message: 'Error' }
      };

      processResult(successResult);
      processResult(errorResult);
    });
  });

  describe('Component Configuration Types', () => {
    test('ReplayConfig should support all configuration options', () => {
      const fullConfig: ReplayConfig = {
        autoPlay: true,
        animationSpeed: 1.5,
        theme: 'dark',
        showAllCards: false,
        enableSounds: true
      };

      expect(fullConfig.autoPlay).toBe(true);
      expect(fullConfig.animationSpeed).toBe(1.5);
      expect(fullConfig.theme).toBe('dark');
      expect(fullConfig.showAllCards).toBe(false);
      expect(fullConfig.enableSounds).toBe(true);

      const minimalConfig: ReplayConfig = {};
      expect(Object.keys(minimalConfig)).toHaveLength(0);

      const partialConfig: ReplayConfig = {
        theme: 'light',
        autoPlay: false
      };

      expect(partialConfig.theme).toBe('light');
      expect(partialConfig.autoPlay).toBe(false);
      expect(partialConfig.animationSpeed).toBeUndefined();
    });

    test('Callback function types should work correctly', () => {
      const mockAction: Action = {
        index: 0,
        street: 'preflop',
        type: 'raise',
        player: 'TestPlayer',
        amount: 50
      };

      const actionChangeCallback: ActionChangeCallback = (action, index) => {
        expect(action).toBe(mockAction);
        expect(index).toBe(0);
        expect(typeof action.type).toBe('string');
        expect(typeof index).toBe('number');
      };

      actionChangeCallback(mockAction, 0);

      const replayEventCallback: ReplayEventCallback = (event) => {
        expect(['start', 'pause', 'resume', 'end', 'reset']).toContain(event);
        expect(typeof event).toBe('string');
      };

      const events: Parameters<ReplayEventCallback>[0][] = ['start', 'pause', 'resume', 'end', 'reset'];
      events.forEach(event => {
        replayEventCallback(event);
      });
    });
  });

  describe('Type Safety and Constraints', () => {
    test('should enforce required properties', () => {
      // This test ensures TypeScript compilation catches missing required properties
      
      expect(() => {
        const validPlayer: Player = {
          seat: 1,
          name: 'ValidPlayer',
          chips: 100
        };
        expect(validPlayer.seat).toBe(1);
      }).not.toThrow();

      expect(() => {
        const validAction: Action = {
          index: 0,
          street: 'preflop',
          type: 'fold'
        };
        expect(validAction.index).toBe(0);
      }).not.toThrow();
    });

    test('should allow optional properties to be undefined', () => {
      const actionWithoutOptionals: Action = {
        index: 0,
        street: 'preflop',
        type: 'fold'
      };

      expect(actionWithoutOptionals.player).toBeUndefined();
      expect(actionWithoutOptionals.amount).toBeUndefined();
      expect(actionWithoutOptionals.cards).toBeUndefined();
      expect(actionWithoutOptionals.isAllIn).toBeUndefined();
      expect(actionWithoutOptionals.reason).toBeUndefined();
    });

    test('should enforce tuple constraints for hole cards', () => {
      const playerWithCards: Player = {
        seat: 1,
        name: 'TestPlayer',
        chips: 100,
        cards: ['As', 'Ah'] // Must be exactly 2 cards
      };

      expect(playerWithCards.cards).toHaveLength(2);
      expect(playerWithCards.cards?.[0]).toBe('As');
      expect(playerWithCards.cards?.[1]).toBe('Ah');
    });
  });

  describe('Error Handling Types', () => {
    test('ParserError should provide comprehensive error information', () => {
      const basicError: ParserError = {
        message: 'Basic error'
      };

      expect(basicError.message).toBe('Basic error');
      expect(basicError.line).toBeUndefined();
      expect(basicError.context).toBeUndefined();

      const detailedError: ParserError = {
        message: 'Detailed error with context',
        line: 15,
        context: 'The problematic line content'
      };

      expect(detailedError.message).toBe('Detailed error with context');
      expect(detailedError.line).toBe(15);
      expect(detailedError.context).toBe('The problematic line content');
    });
  });
});