import {
  IPotCalculator,
  IPlayerStateTracker,
  IActionParser,
  IHandHistoryValidator,
} from '../services';

import { RefactoredPokerStarsParser } from './RefactoredPokerStarsParser';

// Mock services for testing
const mockPotCalculator: IPotCalculator = {
  calculatePotStructure: jest.fn(),
  getEligiblePlayers: jest.fn(),
  validatePotMath: jest.fn(),
  enhancePots: jest.fn(),
};

const mockPlayerStateTracker: IPlayerStateTracker = {
  trackPlayerChips: jest.fn(),
  markPlayerAllIn: jest.fn(),
  removeActivePlayer: jest.fn(),
  getPlayerChips: jest.fn(),
  getAllInPlayers: jest.fn(),
  getActivePlayers: jest.fn(),
  reset: jest.fn(),
  initializePlayer: jest.fn(),
  isPlayerAllIn: jest.fn(),
  isPlayerActive: jest.fn(),
};

const mockActionParser: IActionParser = {
  parseAction: jest.fn(),
  createAction: jest.fn(),
  extractCollectedActions: jest.fn(),
  reset: jest.fn(),
};

const mockValidator: IHandHistoryValidator = {
  validateHandStructure: jest.fn(),
  validatePlayerConsistency: jest.fn(),
  validatePotTotals: jest.fn(),
};

describe('RefactoredPokerStarsParser', () => {
  let parser: RefactoredPokerStarsParser;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    parser = new RefactoredPokerStarsParser(
      mockPotCalculator,
      mockPlayerStateTracker,
      mockActionParser,
      mockValidator
    );
  });

  describe('依存関係注入', () => {
    test('デフォルトの依存関係で作成できる', () => {
      const defaultParser = new RefactoredPokerStarsParser();
      expect(defaultParser).toBeInstanceOf(RefactoredPokerStarsParser);
    });

    test('カスタム依存関係で作成できる', () => {
      expect(parser).toBeInstanceOf(RefactoredPokerStarsParser);
    });
  });

  describe('空入力処理', () => {
    test('空のハンドヒストリーでエラーが返される', () => {
      const result = parser.parse('');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Empty hand history');
    });

    test('空白のみのハンドヒストリーでエラーが返される', () => {
      const result = parser.parse('   \n  \t  \n   ');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Empty hand history');
    });
  });

  describe('基本的なパース機能', () => {
    test('有効なハンドヒストリーが正常にパースされる', () => {
      const handHistory = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'Test Table' 6-max Seat #1 is the button
Seat 1: Player1 ($100 in chips)
Seat 2: Player2 ($200 in chips)
Player1: posts small blind $1
Player2: posts big blind $2
*** HOLE CARDS ***
Dealt to Player1 [As Ks]
Player1: calls $1
Player2: checks
*** SUMMARY ***
Total pot $4 | Rake $0.20
Seat 1: Player1 collected ($3.80)`;

      // Setup mocks
      (mockActionParser.extractCollectedActions as jest.Mock).mockReturnValue([
        { player: 'Player1', amount: 3.8, type: 'single' },
      ]);

      (mockPotCalculator.calculatePotStructure as jest.Mock).mockReturnValue({
        totalPot: 4,
        sidePots: [],
        distributions: [],
      });

      (mockPlayerStateTracker.getAllInPlayers as jest.Mock).mockReturnValue(new Map());
      (mockPlayerStateTracker.getActivePlayers as jest.Mock).mockReturnValue(
        new Set(['Player1', 'Player2'])
      );

      (mockActionParser.createAction as jest.Mock).mockImplementation(
        (type, player, amount, street) => ({
          index: 0,
          street: street || 'preflop',
          type,
          player,
          amount,
        })
      );

      const result = parser.parse(handHistory);

      expect(result.success).toBe(true);
      expect(result.hand).toBeDefined();

      if (result.success) {
        expect(result.hand.id).toBe('123456789');
        expect(result.hand.stakes).toBe('$1/$2');
        expect(result.hand.players).toHaveLength(2);
        expect(result.hand.players[0].name).toBe('Player1');
        expect(result.hand.players[1].name).toBe('Player2');
      }
    });
  });

  describe('サービス統合', () => {
    test('プレイヤー状態トラッカーが正しく初期化される', () => {
      const handHistory = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'Test Table' 6-max Seat #1 is the button
Seat 1: Player1 ($100 in chips)
Seat 2: Player2 ($200 in chips)
Player1: posts small blind $1
*** SUMMARY ***
Total pot $1 | Rake $0`;

      parser.parse(handHistory);

      expect(mockPlayerStateTracker.reset).toHaveBeenCalled();
      expect(mockPlayerStateTracker.initializePlayer).toHaveBeenCalledWith('Player1', 100);
      expect(mockPlayerStateTracker.initializePlayer).toHaveBeenCalledWith('Player2', 200);
    });

    test('アクションパーサーがリセットされる', () => {
      const handHistory = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'Test Table' 6-max Seat #1 is the button
Seat 1: Player1 ($100 in chips)
*** SUMMARY ***
Total pot $0 | Rake $0`;

      parser.parse(handHistory);

      expect(mockActionParser.reset).toHaveBeenCalled();
    });

    test('コレクションアクションが抽出される', () => {
      const handHistory = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'Test Table' 6-max Seat #1 is the button
Seat 1: Player1 ($100 in chips)
*** SUMMARY ***
Total pot $0 | Rake $0`;

      parser.parse(handHistory);

      expect(mockActionParser.extractCollectedActions).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    test('パース中の例外が適切に処理される', () => {
      const handHistory = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'Test Table' 6-max Seat #1 is the button`;

      // Mock to throw error
      (mockActionParser.extractCollectedActions as jest.Mock).mockImplementation(() => {
        throw new Error('Parsing error');
      });

      const result = parser.parse(handHistory);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Parsing error');
    });

    test('不明なエラーが適切に処理される', () => {
      const handHistory = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'Test Table' 6-max Seat #1 is the button
Seat 1: Player1 ($100 in chips)
*** SUMMARY ***
Total pot $0 | Rake $0`;

      (mockActionParser.extractCollectedActions as jest.Mock).mockImplementation(() => {
        throw 'Unknown error';
      });

      const result = parser.parse(handHistory);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Unknown parsing error');
    });
  });

  describe('後方互換性', () => {
    test('元のPokerStarsParserと同じインターフェースを提供する', () => {
      // パブリックメソッドが存在することを確認
      expect(typeof parser.parse).toBe('function');

      // parseメソッドがParserResultを返すことを確認
      const result = parser.parse('');
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });
  });
});
