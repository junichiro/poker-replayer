import { PokerHand, Player, Action, Pot } from '../types';

import { HandHistoryValidator } from './HandHistoryValidator';

describe('HandHistoryValidator', () => {
  let validator: HandHistoryValidator;

  beforeEach(() => {
    validator = new HandHistoryValidator();
  });

  describe('ハンド構造検証', () => {
    test('有効なハンドは検証を通過する', () => {
      const hand: PokerHand = {
        id: '123456789',
        stakes: '$1/$2',
        date: new Date(),
        table: {
          name: 'Test Table',
          maxSeats: 6,
          buttonSeat: 1,
        },
        players: [
          { seat: 1, name: 'Player1', chips: 100 },
          { seat: 2, name: 'Player2', chips: 200 },
        ],
        actions: [
          { index: 0, street: 'preflop', type: 'blind', player: 'Player1', amount: 1 },
          { index: 1, street: 'preflop', type: 'blind', player: 'Player2', amount: 2 },
        ],
        board: [],
        pots: [{ amount: 3, players: ['Player1'], eligiblePlayers: ['Player1', 'Player2'] }],
      };

      const result = validator.validateHandStructure(hand);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('必須フィールドが欠けている場合、エラーが返される', () => {
      const hand = {
        // id が欠けている
        stakes: '$1/$2',
        date: new Date(),
        table: { name: 'Test Table', maxSeats: 6, buttonSeat: 1 },
        players: [],
        actions: [],
        board: [],
        pots: [],
      } as any;

      const result = validator.validateHandStructure(hand);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hand ID is required');
    });

    test('プレイヤーが存在しない場合、エラーが返される', () => {
      const hand: PokerHand = {
        id: '123456789',
        stakes: '$1/$2',
        date: new Date(),
        table: { name: 'Test Table', maxSeats: 6, buttonSeat: 1 },
        players: [], // プレイヤーなし
        actions: [],
        board: [],
        pots: [],
      };

      const result = validator.validateHandStructure(hand);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least 2 players are required');
    });
  });

  describe('プレイヤー整合性検証', () => {
    test('アクションのプレイヤーがプレイヤーリストに存在する場合、検証を通過する', () => {
      const players: Player[] = [
        { seat: 1, name: 'Player1', chips: 100 },
        { seat: 2, name: 'Player2', chips: 200 },
      ];

      const actions: Action[] = [
        { index: 0, street: 'preflop', type: 'blind', player: 'Player1', amount: 1 },
        { index: 1, street: 'preflop', type: 'call', player: 'Player2', amount: 1 },
      ];

      const result = validator.validatePlayerConsistency(players, actions);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('存在しないプレイヤーのアクションがある場合、エラーが返される', () => {
      const players: Player[] = [{ seat: 1, name: 'Player1', chips: 100 }];

      const actions: Action[] = [
        { index: 0, street: 'preflop', type: 'call', player: 'NonExistentPlayer', amount: 10 },
      ];

      const result = validator.validatePlayerConsistency(players, actions);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Action by unknown player: NonExistentPlayer');
    });

    test('重複するシート番号がある場合、エラーが返される', () => {
      const players: Player[] = [
        { seat: 1, name: 'Player1', chips: 100 },
        { seat: 1, name: 'Player2', chips: 200 }, // 重複シート
      ];

      const result = validator.validatePlayerConsistency(players, []);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate seat number: 1');
    });

    test('重複するプレイヤー名がある場合、エラーが返される', () => {
      const players: Player[] = [
        { seat: 1, name: 'Player1', chips: 100 },
        { seat: 2, name: 'Player1', chips: 200 }, // 重複名前
      ];

      const result = validator.validatePlayerConsistency(players, []);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate player name: Player1');
    });
  });

  describe('ポット合計検証', () => {
    test('ポット合計とアクション金額が一致する場合、検証を通過する', () => {
      const pots: Pot[] = [
        { amount: 100, players: ['Player1'], eligiblePlayers: ['Player1', 'Player2'] },
      ];

      const actions: Action[] = [
        { index: 0, street: 'preflop', type: 'blind', player: 'Player1', amount: 10 },
        { index: 1, street: 'preflop', type: 'blind', player: 'Player2', amount: 20 },
        { index: 2, street: 'preflop', type: 'call', player: 'Player1', amount: 30 },
        { index: 3, street: 'preflop', type: 'call', player: 'Player2', amount: 40 },
      ];

      const result = validator.validatePotTotals(pots, actions);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('ポット合計とアクション金額が一致しない場合、エラーが返される', () => {
      const pots: Pot[] = [
        { amount: 200, players: ['Player1'], eligiblePlayers: ['Player1'] }, // 合計が合わない
      ];

      const actions: Action[] = [
        { index: 0, street: 'preflop', type: 'blind', player: 'Player1', amount: 10 },
        { index: 1, street: 'preflop', type: 'call', player: 'Player2', amount: 20 },
      ];

      const result = validator.validatePotTotals(pots, actions);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pot total mismatch: expected 30, got 200');
    });

    test('回収アクションは計算から除外される', () => {
      const pots: Pot[] = [{ amount: 30, players: ['Player1'], eligiblePlayers: ['Player1'] }];

      const actions: Action[] = [
        { index: 0, street: 'preflop', type: 'blind', player: 'Player1', amount: 10 },
        { index: 1, street: 'preflop', type: 'call', player: 'Player2', amount: 20 },
        { index: 2, street: 'showdown', type: 'collected', player: 'Player1', amount: 30 }, // 除外されるべき
      ];

      const result = validator.validatePotTotals(pots, actions);

      expect(result.isValid).toBe(true);
    });

    test('アンコールベットは計算から除外される', () => {
      const pots: Pot[] = [{ amount: 30, players: ['Player1'], eligiblePlayers: ['Player1'] }];

      const actions: Action[] = [
        { index: 0, street: 'preflop', type: 'blind', player: 'Player1', amount: 10 },
        { index: 1, street: 'preflop', type: 'call', player: 'Player2', amount: 20 },
        { index: 2, street: 'preflop', type: 'uncalled', player: 'Player2', amount: 10 }, // これは除外されるべき
      ];

      const result = validator.validatePotTotals(pots, actions);

      expect(result.isValid).toBe(true);
    });
  });

  describe('組み合わせ検証', () => {
    test('複数の検証エラーが同時に検出される', () => {
      const hand: PokerHand = {
        id: '', // 無効
        stakes: '$1/$2',
        date: new Date(),
        table: { name: 'Test Table', maxSeats: 6, buttonSeat: 1 },
        players: [
          { seat: 1, name: 'Player1', chips: 100 },
          { seat: 1, name: 'Player2', chips: 200 }, // 重複シート
        ],
        actions: [
          { index: 0, street: 'preflop', type: 'call', player: 'UnknownPlayer', amount: 10 }, // 不明プレイヤー
        ],
        board: [],
        pots: [
          { amount: 1000, players: ['Player1'], eligiblePlayers: ['Player1'] }, // 金額不一致
        ],
      };

      const handResult = validator.validateHandStructure(hand);
      const playerResult = validator.validatePlayerConsistency(hand.players, hand.actions);
      const potResult = validator.validatePotTotals(hand.pots, hand.actions);

      expect(handResult.isValid).toBe(false);
      expect(playerResult.isValid).toBe(false);
      expect(potResult.isValid).toBe(false);

      expect(handResult.errors.length).toBeGreaterThan(0);
      expect(playerResult.errors.length).toBeGreaterThan(0);
      expect(potResult.errors.length).toBeGreaterThan(0);
    });
  });
});
