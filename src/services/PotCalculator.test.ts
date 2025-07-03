import { Pot, CollectedAction } from '../types';

import { PotCalculator } from './PotCalculator';

describe('PotCalculator', () => {
  let potCalculator: PotCalculator;

  beforeEach(() => {
    potCalculator = new PotCalculator();
  });

  describe('サイドポット計算', () => {
    test('オールインプレイヤーがいない場合、メインポットのみ作成される', () => {
      const allInAmounts: number[] = [];
      const totalContributions = 100;
      const activePlayers = new Set(['Player1', 'Player2']);

      const result = potCalculator.calculatePotStructure(
        allInAmounts,
        totalContributions,
        activePlayers
      );

      expect(result.totalPot).toBe(100);
      expect(result.sidePots).toHaveLength(0);
      expect(result.mainPot).toBeUndefined();
    });

    test('1人のオールインプレイヤーがいる場合、メインポットとサイドポットが作成される', () => {
      const allInAmounts = [50];
      const totalContributions = 200;
      const activePlayers = new Set(['Player2', 'Player3']);

      const result = potCalculator.calculatePotStructure(
        allInAmounts,
        totalContributions,
        activePlayers
      );

      expect(result.totalPot).toBe(200);
      expect(result.mainPot).toBe(150); // 50 * 3 players
      expect(result.sidePots).toHaveLength(1);
    });

    test('複数のオールインプレイヤーがいる場合、複数のサイドポットが作成される', () => {
      const allInAmounts = [30, 60];
      const totalContributions = 300;
      const activePlayers = new Set(['Player3', 'Player4']);

      const result = potCalculator.calculatePotStructure(
        allInAmounts,
        totalContributions,
        activePlayers
      );

      expect(result.totalPot).toBe(300);
      expect(result.mainPot).toBe(120); // 30 * 4 players
      expect(result.sidePots).toHaveLength(2);
      expect(result.sidePots[0].amount).toBe(90); // (60-30) * 3 players
      expect(result.sidePots[1].amount).toBe(90); // remaining for active players
    });
  });

  describe('対象プレイヤー計算', () => {
    test('メインポット(レベル0)では全てのプレイヤーが対象となる', () => {
      const allInPlayers = new Map([
        ['Player1', 50],
        ['Player2', 100],
      ]);
      const activePlayers = new Set(['Player3', 'Player4']);

      const result = potCalculator.getEligiblePlayers(0, allInPlayers, activePlayers);

      expect(result).toHaveLength(4);
      expect(result).toContain('Player1');
      expect(result).toContain('Player2');
      expect(result).toContain('Player3');
      expect(result).toContain('Player4');
    });

    test('サイドポットではより高額でオールインしたプレイヤーのみが対象となる', () => {
      const allInPlayers = new Map([
        ['Player1', 50],
        ['Player2', 100],
      ]);
      const activePlayers = new Set(['Player3']);

      const result = potCalculator.getEligiblePlayers(1, allInPlayers, activePlayers);

      expect(result).toHaveLength(2);
      expect(result).toContain('Player2'); // より高額でオールイン
      expect(result).toContain('Player3'); // アクティブプレイヤー
      expect(result).not.toContain('Player1'); // 低額オールイン
    });
  });

  describe('ポット検証', () => {
    test('回収額と期待額が一致する場合、エラーなし', () => {
      const pots: Pot[] = [
        {
          amount: 100,
          players: ['Player1'],
          eligiblePlayers: ['Player1', 'Player2'],
        },
      ];
      const collectedActions: CollectedAction[] = [
        {
          player: 'Player1',
          amount: 95,
          type: 'single',
        },
      ];
      const rake = 5;

      expect(() => {
        potCalculator.validatePotMath(pots, collectedActions, rake);
      }).not.toThrow();
    });

    test('回収額と期待額が一致しない場合、エラーがスローされる', () => {
      const pots: Pot[] = [
        {
          amount: 100,
          players: ['Player1'],
          eligiblePlayers: ['Player1'],
        },
      ];
      const collectedActions: CollectedAction[] = [
        {
          player: 'Player1',
          amount: 80,
          type: 'single',
        },
      ];

      expect(() => {
        potCalculator.validatePotMath(pots, collectedActions);
      }).toThrow('Pot math validation failed');
    });

    test('スプリットポットの場合、オッドチップの勝者が正しく設定される', () => {
      const pots: Pot[] = [
        {
          amount: 101,
          players: ['Player1', 'Player2'],
          eligiblePlayers: ['Player1', 'Player2'],
          isSplit: true,
        },
      ];
      const collectedActions: CollectedAction[] = [
        {
          player: 'Player1',
          amount: 51,
          type: 'single',
        },
        {
          player: 'Player2',
          amount: 50,
          type: 'single',
        },
      ];

      potCalculator.enhancePots(pots, collectedActions);

      expect(pots[0].oddChipWinner).toBe('Player1');
    });
  });
});
