/**
 * CardDealStrategy テスト
 * TDD approach - RED phase: カードディール戦略の動作をテストする
 */

import { Action, ExtendedAnimationConfig } from '../../../types';
import { CardDealStrategy } from '../../strategies/CardDealStrategy';

describe('CardDealStrategy', () => {
  let strategy: CardDealStrategy;
  let element: HTMLElement;

  beforeEach(() => {
    strategy = new CardDealStrategy();
    element = document.createElement('div');
    // Add element to body for proper testing
    document.body.appendChild(element);
  });

  afterEach(() => {
    // Clean up card elements after each test
    strategy.cleanup();
    // Remove test element from body
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  describe('strategy info', () => {
    test('正しい名前とバージョンを持つ', () => {
      expect(strategy.name).toBe('Card Deal Animation');
      expect(strategy.version).toBe('1.0.0');
    });
  });

  describe('canAnimate', () => {
    test('カードが配られるアクションでtrueを返す', () => {
      const dealAction: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      expect(strategy.canAnimate(dealAction)).toBe(true);
    });

    test('フロップディールアクションでtrueを返す', () => {
      const flopAction: Action = {
        index: 5,
        street: 'flop',
        type: 'deal',
        cards: ['Ah', 'Kd', 'Qc'],
      };

      expect(strategy.canAnimate(flopAction)).toBe(true);
    });

    test('カードが含まれていないdealアクションでfalseを返す', () => {
      const emptyDealAction: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
      };

      expect(strategy.canAnimate(emptyDealAction)).toBe(false);
    });

    test('空の配列のdealアクションでfalseを返す', () => {
      const emptyCardsDealAction: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: [],
      };

      expect(strategy.canAnimate(emptyCardsDealAction)).toBe(false);
    });

    test('deal以外のアクションでfalseを返す', () => {
      const foldAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'fold',
        player: 'Player1',
      };

      expect(strategy.canAnimate(foldAction)).toBe(false);
    });

    test('betアクションでfalseを返す', () => {
      const betAction: Action = {
        index: 2,
        street: 'preflop',
        type: 'bet',
        player: 'Player1',
        amount: 50,
      };

      expect(strategy.canAnimate(betAction)).toBe(false);
    });
  });

  describe('getDefaultConfig', () => {
    test('適切なデフォルト設定を返す', () => {
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      expect(config.duration).toBe(800);
      expect(config.easing).toBe('cubic-bezier(0.4, 0.0, 0.2, 1)');
      expect(config.delay).toBe(0);
      expect(config.fillMode).toBe('forwards');
    });

    test('設定値が適切な範囲内にある', () => {
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      expect(config.duration).toBeGreaterThan(0);
      expect(config.duration).toBeLessThan(5000); // 5秒以内
      expect(['forwards', 'backwards', 'both', 'none']).toContain(config.fillMode);
    });
  });

  describe('animate', () => {
    test('アニメーションが正常に実行される', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      const animationPromise = strategy.animate(element, action, config);
      expect(animationPromise).toBeInstanceOf(Promise);

      await expect(animationPromise).resolves.toBeUndefined();
    });

    test('カード要素が正しく作成される', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      await strategy.animate(element, action, config);

      // 作成されたカード要素を確認
      const cardElements = document.querySelectorAll('.card-deal-animation');
      expect(cardElements.length).toBe(2);

      const firstCard = cardElements[0] as HTMLElement;
      expect(firstCard.getAttribute('data-card')).toBe('Ah');
      expect(firstCard.style.position).toBe('absolute');
    });

    test('カスタム設定でアニメーションを実行できる', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };
      const customConfig: ExtendedAnimationConfig = {
        duration: 1000,
        easing: 'ease-in-out',
        delay: 100,
        fillMode: 'both',
      };

      await strategy.animate(element, action, customConfig);

      // カード要素が作成されることを確認
      const cardElements = document.querySelectorAll('.card-deal-animation');
      expect(cardElements.length).toBe(2);
    });

    test('遅延設定が考慮される', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };
      const configWithDelay: ExtendedAnimationConfig = {
        duration: 100,
        easing: 'ease',
        delay: 50,
        fillMode: 'forwards',
      };

      const startTime = Date.now();
      await strategy.animate(element, action, configWithDelay);
      const endTime = Date.now();

      // 遅延 + 実行時間が含まれていることを確認（テスト環境の誤差を考慮）
      expect(endTime - startTime).toBeGreaterThanOrEqual(140); // 100 + 50 - 10ms誤差
    });

    test('複数のカードでアニメーションを実行できる', async () => {
      const flopAction: Action = {
        index: 5,
        street: 'flop',
        type: 'deal',
        cards: ['Ah', 'Kd', 'Qc'],
      };
      const config: ExtendedAnimationConfig = strategy.getDefaultConfig();

      await expect(strategy.animate(element, flopAction, config)).resolves.toBeUndefined();
    });
  });

  describe('cleanup', () => {
    test('cleanupメソッドが例外を投げない', () => {
      expect(() => strategy.cleanup()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    test('プレフロップのカード配布をアニメーションできる', async () => {
      const preflopAction: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      expect(strategy.canAnimate(preflopAction)).toBe(true);
      await expect(
        strategy.animate(element, preflopAction, strategy.getDefaultConfig())
      ).resolves.toBeUndefined();
    });

    test('フロップをアニメーションできる', async () => {
      const flopAction: Action = {
        index: 10,
        street: 'flop',
        type: 'deal',
        cards: ['Ah', 'Kd', 'Qc'],
      };

      expect(strategy.canAnimate(flopAction)).toBe(true);
      await expect(
        strategy.animate(element, flopAction, strategy.getDefaultConfig())
      ).resolves.toBeUndefined();
    });

    test('ターンをアニメーションできる', async () => {
      const turnAction: Action = {
        index: 15,
        street: 'turn',
        type: 'deal',
        cards: ['Js'],
      };

      expect(strategy.canAnimate(turnAction)).toBe(true);
      await expect(
        strategy.animate(element, turnAction, strategy.getDefaultConfig())
      ).resolves.toBeUndefined();
    });

    test('リバーをアニメーションできる', async () => {
      const riverAction: Action = {
        index: 20,
        street: 'river',
        type: 'deal',
        cards: ['9h'],
      };

      expect(strategy.canAnimate(riverAction)).toBe(true);
      await expect(
        strategy.animate(element, riverAction, strategy.getDefaultConfig())
      ).resolves.toBeUndefined();
    });
  });
});
