import { Action, PokerHand } from '../types';

import { ActionAnalyzer } from './ActionAnalyzer';

// Mock hand data for testing
const createMockHand = (): PokerHand => ({
  id: 'test-hand',
  stakes: '$1/$2',
  date: new Date(),
  table: { name: 'Test Table', maxSeats: 6, buttonSeat: 1 },
  players: [
    { seat: 1, name: 'Hero', chips: 200, isHero: true },
    { seat: 2, name: 'Villain1', chips: 150 },
    { seat: 3, name: 'Villain2', chips: 300 },
  ],
  actions: [
    { index: 0, street: 'preflop', type: 'blind', player: 'Hero', amount: 1 },
    { index: 1, street: 'preflop', type: 'blind', player: 'Villain1', amount: 2 },
    { index: 2, street: 'preflop', type: 'raise', player: 'Villain2', amount: 8 },
    { index: 3, street: 'preflop', type: 'call', player: 'Hero', amount: 7 },
    { index: 4, street: 'preflop', type: 'fold', player: 'Villain1' },
    { index: 5, street: 'flop', type: 'check', player: 'Hero' },
    { index: 6, street: 'flop', type: 'bet', player: 'Villain2', amount: 12 },
    { index: 7, street: 'flop', type: 'raise', player: 'Hero', amount: 100 }, // Large raise to trigger big_raise detection
    { index: 8, street: 'flop', type: 'fold', player: 'Villain2' },
  ],
  board: ['As', '7c', '2d'],
  pots: [{ amount: 40, players: ['Hero'] }],
});

describe('ActionAnalyzer', () => {
  let actionAnalyzer: ActionAnalyzer;
  let mockHand: PokerHand;

  beforeEach(() => {
    mockHand = createMockHand();
    actionAnalyzer = new ActionAnalyzer();
  });

  describe('アクション分類機能', () => {
    test('アクションタイプ別にカテゴリを判定できる', () => {
      const blindAction = mockHand.actions[0];
      const raiseAction = mockHand.actions[2];
      const foldAction = mockHand.actions[4];

      expect(actionAnalyzer.categorizeAction(blindAction)).toBe('forced');
      expect(actionAnalyzer.categorizeAction(raiseAction)).toBe('aggressive');
      expect(actionAnalyzer.categorizeAction(foldAction)).toBe('passive');
    });

    test('アクションの重要度を判定できる', () => {
      const blindAction = mockHand.actions[0];
      const bigRaiseAction = mockHand.actions[7]; // Hero's raise on flop
      const foldAction = mockHand.actions[4];

      expect(actionAnalyzer.getActionPriority(blindAction, mockHand)).toBe('low');
      expect(actionAnalyzer.getActionPriority(bigRaiseAction, mockHand)).toBe('high');
      expect(actionAnalyzer.getActionPriority(foldAction, mockHand)).toBe('medium');
    });

    test('重要なアクションかどうかを判定できる', () => {
      const blindAction = mockHand.actions[0];
      const bigRaiseAction = mockHand.actions[7];

      expect(actionAnalyzer.isSignificantAction(blindAction, mockHand)).toBe(false);
      expect(actionAnalyzer.isSignificantAction(bigRaiseAction, mockHand)).toBe(true);
    });
  });

  describe('アクション書式化機能', () => {
    test('アクションを読みやすい形式に変換できる', () => {
      const raiseAction = mockHand.actions[2];
      const formatted = actionAnalyzer.formatAction(raiseAction, { includeBBMultiple: true });

      expect(formatted).toContain('Villain2');
      expect(formatted).toContain('raises');
      expect(formatted).toContain('$8');
      expect(formatted).toContain('4BB'); // 8/2 = 4BB
    });

    test('アクションの詳細説明を生成できる', () => {
      const raiseAction = mockHand.actions[2];
      const description = actionAnalyzer.getActionDescription(raiseAction, mockHand, true);

      expect(description).toContain('Villain2');
      expect(description).toContain('preflop');
      expect(description).toContain('raise');
    });

    test('金額を文脈に合わせて書式化できる', () => {
      const amount = 12;
      const formatted = actionAnalyzer.formatAmount(amount, {
        bigBlind: 2,
        potSize: 18,
        includePercentage: true,
      });

      expect(formatted).toContain('$12');
      expect(formatted).toContain('6BB');
      expect(formatted).toContain('67%'); // 12/18 ≈ 67%
    });
  });

  describe('アクションフィルタリング機能', () => {
    test('プレイヤー別にアクションをフィルタリングできる', () => {
      const heroActions = actionAnalyzer.filterActions(mockHand.actions, {
        player: 'Hero',
      });

      expect(heroActions).toHaveLength(4); // Hero has 4 actions: blind, call, check, raise
      expect(heroActions.every(action => action.player === 'Hero')).toBe(true);
    });

    test('アクションタイプ別にフィルタリングできる', () => {
      const bettingActions = actionAnalyzer.filterActions(mockHand.actions, {
        types: ['raise', 'bet', 'call'],
      });

      expect(bettingActions).toHaveLength(4);
      expect(bettingActions.every(action => ['raise', 'bet', 'call'].includes(action.type))).toBe(
        true
      );
    });

    test('ストリート別にフィルタリングできる', () => {
      const flopActions = actionAnalyzer.filterActions(mockHand.actions, {
        street: 'flop',
      });

      expect(flopActions).toHaveLength(4);
      expect(flopActions.every(action => action.street === 'flop')).toBe(true);
    });

    test('金額範囲でフィルタリングできる', () => {
      const bigActions = actionAnalyzer.filterActions(mockHand.actions, {
        amountRange: { min: 10, max: 50 },
      });

      expect(bigActions).toHaveLength(1); // Only bet $12 (raise $60 is > 50)
      expect(
        bigActions.every(action => action.amount && action.amount >= 10 && action.amount <= 50)
      ).toBe(true);
    });
  });

  describe('アクション検索機能', () => {
    test('プレイヤー名で検索できる', () => {
      const results = actionAnalyzer.searchActions(mockHand.actions, 'Hero');

      expect(results).toHaveLength(4); // Hero has 4 actions
      expect(results.every(action => action.player === 'Hero')).toBe(true);
    });

    test('アクションタイプで検索できる', () => {
      const results = actionAnalyzer.searchActions(mockHand.actions, 'raise');

      expect(results).toHaveLength(2);
      expect(results.every(action => action.type === 'raise')).toBe(true);
    });

    test('金額で検索できる', () => {
      const results = actionAnalyzer.searchActions(mockHand.actions, '100');

      expect(results).toHaveLength(1);
      expect(results[0].amount).toBe(100);
    });

    test('部分一致検索ができる', () => {
      const results = actionAnalyzer.searchActions(mockHand.actions, 'ill'); // Matches Villain1, Villain2

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(action => action.player && action.player.includes('ill'))).toBe(true);
    });
  });

  describe('統計分析機能', () => {
    test('アクション統計を取得できる', () => {
      const stats = actionAnalyzer.getActionStats(mockHand.actions);

      expect(stats.totalActions).toBe(9);
      expect(stats.actionsByType.raise).toBe(2);
      expect(stats.actionsByType.fold).toBe(2);
      expect(stats.actionsByStreet.preflop).toBe(5);
      expect(stats.actionsByStreet.flop).toBe(4);
    });

    test('プレイヤー統計を取得できる', () => {
      const heroStats = actionAnalyzer.getPlayerStats(mockHand.actions, 'Hero');

      expect(heroStats.totalActions).toBe(4); // blind, call, check, raise
      expect(heroStats.aggressiveActions).toBe(1); // 1 raise
      expect(heroStats.passiveActions).toBe(2); // 1 call, 1 check (blind is forced)
      expect(heroStats.vpip).toBe(true); // Voluntarily put money in pot
    });

    test('キーモーメントを特定できる', () => {
      const keyMoments = actionAnalyzer.identifyKeyMoments(mockHand);

      expect(keyMoments).toHaveLength(3); // 2 big_raises and 1 fold_to_raise
      expect(keyMoments[0].type).toBe('big_raise');
      expect(keyMoments[0].actionIndex).toBe(2); // Villain2's big raise preflop
      expect(keyMoments[1].type).toBe('big_raise');
      expect(keyMoments[1].actionIndex).toBe(7); // Hero's big raise on flop
      expect(keyMoments[2].type).toBe('fold_to_raise');
      expect(keyMoments[2].actionIndex).toBe(8); // Villain2 folds to raise
    });
  });

  describe('設定オプション', () => {
    test('カスタム分析ルールを設定できる', () => {
      const customRules = {
        significantRaiseThreshold: 3.0, // 3x pot size
        bigBlindSize: 2,
        aggressionThreshold: 2.0,
      };

      actionAnalyzer.updateConfig(customRules);

      const config = actionAnalyzer.getConfig();
      expect(config.significantRaiseThreshold).toBe(3.0);
      expect(config.bigBlindSize).toBe(2);
    });

    test('デフォルト設定を取得できる', () => {
      const config = actionAnalyzer.getConfig();

      expect(config.significantRaiseThreshold).toBeDefined();
      expect(config.bigBlindSize).toBeDefined();
      expect(config.aggressionThreshold).toBeDefined();
    });
  });

  describe('エラー処理', () => {
    test('無効なアクションでもエラーが発生しない', () => {
      const invalidAction = { index: 0, street: 'preflop', type: 'invalid' } as any;

      expect(() => {
        actionAnalyzer.categorizeAction(invalidAction);
      }).not.toThrow();

      expect(() => {
        actionAnalyzer.formatAction(invalidAction);
      }).not.toThrow();
    });

    test('空のアクション配列でも正常に動作する', () => {
      const stats = actionAnalyzer.getActionStats([]);

      expect(stats.totalActions).toBe(0);
      expect(stats.actionsByType).toEqual({});
      expect(stats.actionsByStreet).toEqual({});
    });

    test('無効な検索クエリでも空配列を返す', () => {
      const results = actionAnalyzer.searchActions(mockHand.actions, '');

      expect(results).toEqual([]);
    });
  });

  describe('パフォーマンス', () => {
    test('大量のアクションでも高速に処理できる', () => {
      // 1000個のモックアクションを生成
      const largeActionSet = Array.from({ length: 1000 }, (_, i) => ({
        index: i,
        street: 'preflop' as const,
        type: 'call' as const,
        player: `Player${i % 10}`,
        amount: i * 2,
      }));

      const startTime = Date.now();
      const stats = actionAnalyzer.getActionStats(largeActionSet);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
      expect(stats.totalActions).toBe(1000);
    });
  });
});
