/**
 * CardDealStrategy テスト
 * TDD approach - RED phase: カードディール戦略の動作をテストする
 */

import { Action } from '../../../types';

// テスト用のインターフェース定義（実装前）
interface IAnimationStrategy {
  name: string;
  version: string;
  animate(element: HTMLElement, action: Action, config: AnimationConfig): Promise<void>;
  canAnimate(action: Action): boolean;
  getDefaultConfig(): AnimationConfig;
  cleanup(): void;
}

interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  iterations?: number;
  fillMode?: 'forwards' | 'backwards' | 'both' | 'none';
  customProperties?: Record<string, unknown>;
}

// モック実装（テスト用）
class MockCardDealStrategy implements IAnimationStrategy {
  name = 'Card Deal Animation';
  version = '1.0.0';

  canAnimate(action: Action): boolean {
    return action.type === 'deal' && !!action.cards && action.cards.length > 0;
  }

  getDefaultConfig(): AnimationConfig {
    return {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      delay: 0,
      fillMode: 'forwards',
    };
  }

  async animate(element: HTMLElement, action: Action, config: AnimationConfig): Promise<void> {
    return new Promise(resolve => {
      // カードディールアニメーションをシミュレート
      element.style.transition = `transform ${config.duration}ms ${config.easing}`;
      element.style.transform = 'translateX(0) rotateY(0)';

      setTimeout(resolve, config.duration + (config.delay || 0));
    });
  }

  cleanup(): void {
    // リソースのクリーンアップ
  }
}

describe('CardDealStrategy', () => {
  let strategy: MockCardDealStrategy;
  let element: HTMLElement;

  beforeEach(() => {
    strategy = new MockCardDealStrategy();
    element = document.createElement('div');
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
      const config = strategy.getDefaultConfig();

      expect(config.duration).toBe(800);
      expect(config.easing).toBe('cubic-bezier(0.4, 0.0, 0.2, 1)');
      expect(config.delay).toBe(0);
      expect(config.fillMode).toBe('forwards');
    });

    test('設定値が適切な範囲内にある', () => {
      const config = strategy.getDefaultConfig();

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
      const config = strategy.getDefaultConfig();

      const animationPromise = strategy.animate(element, action, config);
      expect(animationPromise).toBeInstanceOf(Promise);

      await expect(animationPromise).resolves.toBeUndefined();
    });

    test('CSSプロパティが正しく設定される', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };
      const config = strategy.getDefaultConfig();

      await strategy.animate(element, action, config);

      expect(element.style.transition).toContain('transform');
      expect(element.style.transition).toContain('800ms');
      expect(element.style.transition).toContain('cubic-bezier(0.4, 0.0, 0.2, 1)');
      expect(element.style.transform).toBe('translateX(0) rotateY(0)');
    });

    test('カスタム設定でアニメーションを実行できる', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };
      const customConfig: AnimationConfig = {
        duration: 1000,
        easing: 'ease-in-out',
        delay: 100,
        fillMode: 'both',
      };

      await strategy.animate(element, action, customConfig);

      expect(element.style.transition).toContain('1000ms');
      expect(element.style.transition).toContain('ease-in-out');
    });

    test('遅延設定が考慮される', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };
      const configWithDelay: AnimationConfig = {
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
      const config = strategy.getDefaultConfig();

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
