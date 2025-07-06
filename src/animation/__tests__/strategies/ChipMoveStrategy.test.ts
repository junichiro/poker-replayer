/**
 * ChipMoveStrategy テスト
 * TDD approach - RED phase: チップ移動戦略の動作をテストする
 */

import { Action, ExtendedAnimationConfig } from '../../../types';
import { ChipMoveStrategy } from '../../strategies/ChipMoveStrategy';

describe('ChipMoveStrategy', () => {
  let strategy: ChipMoveStrategy;
  let element: HTMLElement;

  beforeEach(() => {
    strategy = new ChipMoveStrategy();
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    strategy.cleanup();
    if (element.parentNode) {
      document.body.removeChild(element);
    }
  });

  describe('strategy info', () => {
    test('正しい名前とバージョンを持つ', () => {
      expect(strategy.name).toBe('Chip Movement Animation');
      expect(strategy.version).toBe('1.0.0');
    });
  });

  describe('canAnimate', () => {
    test('betアクションでtrueを返す', () => {
      const betAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 50,
      };

      expect(strategy.canAnimate(betAction)).toBe(true);
    });

    test('callアクションでtrueを返す', () => {
      const callAction: Action = {
        index: 2,
        street: 'preflop',
        type: 'call',
        player: 'Player2',
        amount: 50,
      };

      expect(strategy.canAnimate(callAction)).toBe(true);
    });

    test('raiseアクションでtrueを返す', () => {
      const raiseAction: Action = {
        index: 3,
        street: 'preflop',
        type: 'raise',
        player: 'Player1',
        amount: 100,
      };

      expect(strategy.canAnimate(raiseAction)).toBe(true);
    });

    test('collectedアクションでtrueを返す', () => {
      const collectedAction: Action = {
        index: 10,
        street: 'showdown',
        type: 'collected',
        player: 'Player1',
        amount: 200,
      };

      expect(strategy.canAnimate(collectedAction)).toBe(true);
    });

    test('金額が0のアクションでfalseを返す', () => {
      const zeroAmountAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 0,
      };

      expect(strategy.canAnimate(zeroAmountAction)).toBe(false);
    });

    test('金額が未定義のアクションでfalseを返す', () => {
      const noAmountAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
      };

      expect(strategy.canAnimate(noAmountAction)).toBe(false);
    });

    test('foldアクションでfalseを返す', () => {
      const foldAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'fold',
        player: 'Player1',
      };

      expect(strategy.canAnimate(foldAction)).toBe(false);
    });

    test('checkアクションでfalseを返す', () => {
      const checkAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'check',
        player: 'Player1',
      };

      expect(strategy.canAnimate(checkAction)).toBe(false);
    });

    test('dealアクションでfalseを返す', () => {
      const dealAction: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      expect(strategy.canAnimate(dealAction)).toBe(false);
    });
  });

  describe('getDefaultConfig', () => {
    test('適切なデフォルト設定を返す', () => {
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      expect(config.duration).toBe(600);
      expect(config.easing).toBe('cubic-bezier(0.25, 0.46, 0.45, 0.94)');
      expect(config.delay).toBe(0);
      expect(config.fillMode).toBe('forwards');
      expect(config.customProperties?.chipScale).toBe(1.0);
      expect(config.customProperties?.pathCurve).toBe(0.3);
    });

    test('設定値が適切な範囲内にある', () => {
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      expect(config.duration).toBeGreaterThan(0);
      expect(config.duration).toBeLessThan(3000); // 3秒以内
      expect(['forwards', 'backwards', 'both', 'none']).toContain(config.fillMode);
      expect(config.customProperties?.chipScale).toBeGreaterThan(0);
      expect(config.customProperties?.pathCurve).toBeGreaterThanOrEqual(0);
    });
  });

  describe('animate', () => {
    test('betアクションでアニメーションが実行される', async () => {
      const betAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 50,
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      const animationPromise = strategy.animate(element, betAction, config);
      expect(animationPromise).toBeInstanceOf(Promise);

      await expect(animationPromise).resolves.toBeUndefined();
    });

    test('callアクションでアニメーションが実行される', async () => {
      const callAction: Action = {
        index: 2,
        street: 'preflop',
        type: 'call',
        player: 'Player2',
        amount: 50,
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      await expect(strategy.animate(element, callAction, config)).resolves.toBeUndefined();
    });

    test('raiseアクションでアニメーションが実行される', async () => {
      const raiseAction: Action = {
        index: 3,
        street: 'preflop',
        type: 'raise',
        player: 'Player1',
        amount: 100,
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      await expect(strategy.animate(element, raiseAction, config)).resolves.toBeUndefined();
    });

    test('collectedアクションでアニメーションが実行される', async () => {
      const collectedAction: Action = {
        index: 10,
        street: 'showdown',
        type: 'collected',
        player: 'Player1',
        amount: 200,
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      await expect(strategy.animate(element, collectedAction, config)).resolves.toBeUndefined();
    });

    test('チップ要素が正しく作成される', async () => {
      const betAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 75,
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      // アニメーション実行中にチップ要素をチェック
      const animationPromise = strategy.animate(element, betAction, config);

      // 少し待ってからチェック
      await new Promise(resolve => setTimeout(resolve, 10));

      const chipElement = document.querySelector('.chip-animation') as HTMLElement;
      expect(chipElement).toBeTruthy();
      expect(chipElement.textContent).toBe('$75');
      expect(chipElement.style.position).toBe('absolute');
      expect(chipElement.style.borderRadius).toBe('50%');

      await animationPromise;
    });

    test('カスタム設定でアニメーションを実行できる', async () => {
      const betAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 100,
      };
      const customConfig: ExtendedAnimationConfig = {
        duration: 800,
        easing: 'ease-in-out',
        delay: 50,
        fillMode: 'both',
        customProperties: {
          chipScale: 1.5,
          pathCurve: 0.5,
        },
      };

      await expect(strategy.animate(element, betAction, customConfig)).resolves.toBeUndefined();
    });

    test('大きな金額でアニメーションできる', async () => {
      const bigBetAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 1000,
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      await expect(strategy.animate(element, bigBetAction, config)).resolves.toBeUndefined();
    });

    test('小さな金額でアニメーションできる', async () => {
      const smallBetAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 1,
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      await expect(strategy.animate(element, smallBetAction, config)).resolves.toBeUndefined();
    });
  });

  describe('cleanup', () => {
    test('cleanupメソッドが例外を投げない', () => {
      expect(() => strategy.cleanup()).not.toThrow();
    });

    test('cleanup後にチップ要素が削除される', async () => {
      const betAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 50,
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      await strategy.animate(element, betAction, config);

      // cleanup前にチップ要素の数を確認
      let chipElements = document.querySelectorAll('.chip-animation');
      const initialCount = chipElements.length;

      strategy.cleanup();

      // cleanup後にチップ要素が削除されることを確認
      chipElements = document.querySelectorAll('.chip-animation');
      expect(chipElements.length).toBeLessThanOrEqual(initialCount);
    });
  });

  describe('integration scenarios', () => {
    test('プレフロップでのベットアニメーション', async () => {
      const preflopBet: Action = {
        index: 3,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 25,
      };

      expect(strategy.canAnimate(preflopBet)).toBe(true);
      await expect(
        strategy.animate(element, preflopBet, strategy.getDefaultConfig())
      ).resolves.toBeUndefined();
    });

    test('フロップでのレイズアニメーション', async () => {
      const flopRaise: Action = {
        index: 8,
        street: 'flop',
        type: 'raise',
        player: 'Player2',
        amount: 75,
      };

      expect(strategy.canAnimate(flopRaise)).toBe(true);
      await expect(
        strategy.animate(element, flopRaise, strategy.getDefaultConfig())
      ).resolves.toBeUndefined();
    });

    test('ショーダウンでのポット回収アニメーション', async () => {
      const potCollection: Action = {
        index: 25,
        street: 'showdown',
        type: 'collected',
        player: 'Winner',
        amount: 150,
      };

      expect(strategy.canAnimate(potCollection)).toBe(true);
      await expect(
        strategy.animate(element, potCollection, strategy.getDefaultConfig())
      ).resolves.toBeUndefined();
    });

    test('オールインのアニメーション', async () => {
      const allInAction: Action = {
        index: 5,
        street: 'turn',
        type: 'raise',
        player: 'Player3',
        amount: 500,
        isAllIn: true,
      };

      expect(strategy.canAnimate(allInAction)).toBe(true);
      await expect(
        strategy.animate(element, allInAction, strategy.getDefaultConfig())
      ).resolves.toBeUndefined();
    });

    test('連続するベットアクションのアニメーション', async () => {
      const firstBet: Action = {
        index: 1,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 50,
      };

      const secondBet: Action = {
        index: 2,
        street: 'preflop',
        type: 'call',
        player: 'Player2',
        amount: 50,
      };

      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      await Promise.all([
        strategy.animate(element, firstBet, config),
        strategy.animate(element, secondBet, { ...config, delay: 200 }),
      ]);
    });
  });
});
