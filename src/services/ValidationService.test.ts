import { ValidationService } from './ValidationService';
import { PokerHand } from '../types';

// Mock hand data for testing
const createMockHand = (): PokerHand => ({
  id: 'test-hand',
  stakes: '$1/$2',
  date: new Date(),
  table: { name: 'Test Table', maxSeats: 6, buttonSeat: 1 },
  players: [
    { seat: 1, name: 'Hero', chips: 200, isHero: true },
    { seat: 2, name: 'Villain1', chips: 150 },
  ],
  actions: [
    { index: 0, street: 'preflop', type: 'blind', player: 'Hero', amount: 1 },
    { index: 1, street: 'preflop', type: 'blind', player: 'Villain1', amount: 2 },
    { index: 2, street: 'preflop', type: 'call', player: 'Hero', amount: 1 },
    { index: 3, street: 'preflop', type: 'check', player: 'Villain1' },
  ],
  board: ['As', '7c', '2d'],
  pots: [{ amount: 4, players: ['Hero'] }],
});

describe('ValidationService', () => {
  let validationService: ValidationService;
  let mockHand: PokerHand;

  beforeEach(() => {
    mockHand = createMockHand();
    validationService = new ValidationService();
  });

  describe('アクションインデックス検証', () => {
    test('有効なアクションインデックスを検証できる', () => {
      const result = validationService.validateActionIndex(2, 4);

      expect(result.isValid).toBe(true);
      expect(result.isAtStart).toBe(false);
      expect(result.isAtEnd).toBe(false);
      expect(result.errors).toHaveLength(0);
    });

    test('開始位置(-1)を正しく検証できる', () => {
      const result = validationService.validateActionIndex(-1, 4);

      expect(result.isValid).toBe(true);
      expect(result.isAtStart).toBe(true);
      expect(result.isAtEnd).toBe(false);
      expect(result.errors).toHaveLength(0);
    });

    test('終了位置を正しく検証できる', () => {
      const result = validationService.validateActionIndex(3, 4);

      expect(result.isValid).toBe(true);
      expect(result.isAtStart).toBe(false);
      expect(result.isAtEnd).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('無効なアクションインデックスを検出できる', () => {
      const resultTooLow = validationService.validateActionIndex(-2, 4);
      const resultTooHigh = validationService.validateActionIndex(4, 4);

      expect(resultTooLow.isValid).toBe(false);
      expect(resultTooLow.errors).toContain('Action index -2 is below minimum (-1)');

      expect(resultTooHigh.isValid).toBe(false);
      expect(resultTooHigh.errors).toContain('Action index 4 exceeds maximum (3)');
    });

    test('空のハンドでも正常に動作する', () => {
      const result = validationService.validateActionIndex(-1, 0);

      expect(result.isValid).toBe(true);
      expect(result.isAtStart).toBe(true);
      expect(result.isAtEnd).toBe(true);
    });
  });

  describe('コントロール状態検証', () => {
    test('開始位置でのコントロール状態を検証できる', () => {
      const result = validationService.validateControlState(-1, 4, false);

      expect(result.canGoToPrevious).toBe(false);
      expect(result.canGoToNext).toBe(true);
      expect(result.canReset).toBe(false);
      expect(result.canPlayPause).toBe(true);
      expect(result.validationErrors).toHaveLength(0);
    });

    test('中間位置でのコントロール状態を検証できる', () => {
      const result = validationService.validateControlState(2, 4, false);

      expect(result.canGoToPrevious).toBe(true);
      expect(result.canGoToNext).toBe(true);
      expect(result.canReset).toBe(true);
      expect(result.canPlayPause).toBe(true);
      expect(result.validationErrors).toHaveLength(0);
    });

    test('終了位置でのコントロール状態を検証できる', () => {
      const result = validationService.validateControlState(3, 4, false);

      expect(result.canGoToPrevious).toBe(true);
      expect(result.canGoToNext).toBe(false);
      expect(result.canReset).toBe(true);
      expect(result.canPlayPause).toBe(false); // Can't play at end
      expect(result.validationErrors).toHaveLength(0);
    });

    test('プレイ中の状態を検証できる', () => {
      const result = validationService.validateControlState(1, 4, true);

      expect(result.canGoToPrevious).toBe(true); // Can interrupt playback
      expect(result.canGoToNext).toBe(true);
      expect(result.canReset).toBe(true);
      expect(result.canPlayPause).toBe(true); // Can pause
      expect(result.validationErrors).toHaveLength(0);
    });

    test('無効な状態でエラーを検出できる', () => {
      const result = validationService.validateControlState(5, 4, false);

      expect(result.validationErrors).toContain('Current action index (5) is invalid');
    });

    test('無効化されたコントロールを処理できる', () => {
      const result = validationService.validateControlState(1, 4, false, true);

      expect(result.canGoToPrevious).toBe(false);
      expect(result.canGoToNext).toBe(false);
      expect(result.canReset).toBe(false);
      expect(result.canPlayPause).toBe(false);
      expect(result.validationErrors).toHaveLength(0);
    });
  });

  describe('アクション遷移検証', () => {
    test('有効な前進遷移を検証できる', () => {
      const result = validationService.validateTransition(1, 2, 4);

      expect(result.isValidTransition).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test('有効な後退遷移を検証できる', () => {
      const result = validationService.validateTransition(2, 1, 4);

      expect(result.isValidTransition).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test('開始位置への遷移を検証できる', () => {
      const result = validationService.validateTransition(0, -1, 4);

      expect(result.isValidTransition).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test('範囲外への遷移を検出できる', () => {
      const resultTooLow = validationService.validateTransition(0, -2, 4);
      const resultTooHigh = validationService.validateTransition(2, 4, 4);

      expect(resultTooLow.isValidTransition).toBe(false);
      expect(resultTooLow.reason).toContain('Target index -2 is out of range');

      expect(resultTooHigh.isValidTransition).toBe(false);
      expect(resultTooHigh.reason).toContain('Target index 4 is out of range');
    });

    test('大きなジャンプも許可される', () => {
      const result = validationService.validateTransition(0, 3, 4);

      expect(result.isValidTransition).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('再生状態検証', () => {
    test('開始位置での再生状態を検証できる', () => {
      const result = validationService.validatePlaybackState(false, -1, 4);

      expect(result.canPlay).toBe(true);
      expect(result.canPause).toBe(false);
      expect(result.shouldStop).toBe(false);
      expect(result.reasons).toHaveLength(0);
    });

    test('中間位置での再生状態を検証できる', () => {
      const result = validationService.validatePlaybackState(true, 2, 4);

      expect(result.canPlay).toBe(false); // Already playing
      expect(result.canPause).toBe(true);
      expect(result.shouldStop).toBe(false);
      expect(result.reasons).toHaveLength(0);
    });

    test('終了位置での再生状態を検証できる', () => {
      const result = validationService.validatePlaybackState(false, 3, 4);

      expect(result.canPlay).toBe(false);
      expect(result.canPause).toBe(false);
      expect(result.shouldStop).toBe(true);
      expect(result.reasons).toContain('At end of hand');
    });

    test('空のハンドでの再生状態を検証できる', () => {
      const result = validationService.validatePlaybackState(false, -1, 0);

      expect(result.canPlay).toBe(false);
      expect(result.canPause).toBe(false);
      expect(result.shouldStop).toBe(true);
      expect(result.reasons).toContain('No actions to play');
    });
  });

  describe('数値制約検証', () => {
    test('有効な数値を検証できる', () => {
      const result = validationService.validateNumericConstraints(5, {
        min: 0,
        max: 10,
        integer: true,
        positive: true,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('最小値違反を検出できる', () => {
      const result = validationService.validateNumericConstraints(-1, {
        min: 0,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value -1 is below minimum 0');
    });

    test('最大値違反を検出できる', () => {
      const result = validationService.validateNumericConstraints(15, {
        max: 10,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value 15 exceeds maximum 10');
    });

    test('整数制約違反を検出できる', () => {
      const result = validationService.validateNumericConstraints(5.5, {
        integer: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value 5.5 must be an integer');
    });

    test('正数制約違反を検出できる', () => {
      const result = validationService.validateNumericConstraints(0, {
        positive: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value 0 must be positive (> 0)');
    });

    test('非負数制約違反を検出できる', () => {
      const result = validationService.validateNumericConstraints(-1, {
        nonNegative: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value -1 must be non-negative (>= 0)');
    });

    test('複数の制約違反を検出できる', () => {
      const result = validationService.validateNumericConstraints(-5.5, {
        min: 0,
        integer: true,
        positive: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('ゲーム状態検証', () => {
    test('有効なゲーム状態を検証できる', () => {
      const result = validationService.validateGameState({
        isPlaying: false,
        currentActionIndex: 2,
        totalActions: 4,
        canStepForward: true,
        canStepBackward: true,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('一貫性のないゲーム状態を検出できる', () => {
      const result = validationService.validateGameState({
        isPlaying: false,
        currentActionIndex: 3,
        totalActions: 4,
        canStepForward: true, // Should be false at end
        canStepBackward: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('canStepForward should be false at end of hand');
    });

    test('開始位置の状態を検証できる', () => {
      const result = validationService.validateGameState({
        isPlaying: false,
        currentActionIndex: -1,
        totalActions: 4,
        canStepForward: true,
        canStepBackward: false,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('ハンド構造検証', () => {
    test('有効なハンド構造を検証できる', () => {
      const result = validationService.validateHandStructure(mockHand);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('無効なプレイヤー数を検出できる', () => {
      const invalidHand = { ...mockHand, players: [] };
      const result = validationService.validateHandStructure(invalidHand);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hand must have at least one player');
    });

    test('アクションのインデックス連続性を検証できる', () => {
      const invalidHand = {
        ...mockHand,
        actions: [
          { index: 0, street: 'preflop', type: 'blind', player: 'Hero', amount: 1 },
          { index: 2, street: 'preflop', type: 'blind', player: 'Villain1', amount: 2 }, // Missing index 1
        ],
      };
      const result = validationService.validateHandStructure(invalidHand);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Action index gap detected: expected 1, found 2');
    });

    test('存在しないプレイヤーのアクションを検出できる', () => {
      const invalidHand = {
        ...mockHand,
        actions: [
          { index: 0, street: 'preflop', type: 'blind', player: 'UnknownPlayer', amount: 1 },
        ],
      };
      const result = validationService.validateHandStructure(invalidHand);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Action references unknown player: UnknownPlayer');
    });
  });

  describe('設定管理', () => {
    test('デフォルト設定を取得できる', () => {
      const config = validationService.getConfig();

      expect(config.strictValidation).toBeDefined();
      expect(config.allowIncrementalValidation).toBeDefined();
      expect(config.maxActionIndex).toBeDefined();
    });

    test('設定を更新できる', () => {
      validationService.updateConfig({
        strictValidation: true,
        maxActionIndex: 1000,
      });

      const config = validationService.getConfig();
      expect(config.strictValidation).toBe(true);
      expect(config.maxActionIndex).toBe(1000);
    });
  });

  describe('エラー処理', () => {
    test('不正な入力でもエラーが発生しない', () => {
      expect(() => {
        validationService.validateActionIndex(NaN, 4);
      }).not.toThrow();

      expect(() => {
        validationService.validateControlState(Infinity, 4, false);
      }).not.toThrow();
    });

    test('null/undefinedの処理が適切に行われる', () => {
      const result = validationService.validateHandStructure(null as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hand data is null or undefined');
    });
  });
});