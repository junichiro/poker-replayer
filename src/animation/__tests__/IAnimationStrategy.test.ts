/**
 * IAnimationStrategy Interface テスト
 * TDD approach - RED phase: インターフェースの契約をテストする
 */

import { Action, IAnimationStrategy, ExtendedAnimationConfig, AnimationType } from '../../types';

describe('IAnimationStrategy Interface', () => {
  // テスト用のモックストラテジー
  class MockAnimationStrategy implements IAnimationStrategy {
    name = 'Mock Strategy';
    version = '1.0.0';

    canAnimate(action: Action): boolean {
      return action.type === 'deal';
    }

    getDefaultConfig(): ExtendedAnimationConfig {
      return {
        duration: 300,
        easing: 'ease-in-out',
        fillMode: 'forwards',
      };
    }

    async animate(
      element: HTMLElement,
      action: Action,
      config: ExtendedAnimationConfig
    ): Promise<void> {
      return new Promise(resolve => {
        setTimeout(resolve, config.duration);
      });
    }

    cleanup(): void {
      // Mock cleanup
    }
  }

  describe('strategy contract', () => {
    test('strategyは必要なプロパティを実装している必要がある', () => {
      const strategy = new MockAnimationStrategy();

      expect(strategy.name).toBe('Mock Strategy');
      expect(strategy.version).toBe('1.0.0');
      expect(typeof strategy.animate).toBe('function');
      expect(typeof strategy.canAnimate).toBe('function');
      expect(typeof strategy.getDefaultConfig).toBe('function');
      expect(typeof strategy.cleanup).toBe('function');
    });

    test('canAnimateメソッドは適切にアクションをフィルタリングする', () => {
      const strategy = new MockAnimationStrategy();

      const dealAction: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      const foldAction: Action = {
        index: 1,
        street: 'preflop',
        type: 'fold',
        player: 'Player1',
      };

      expect(strategy.canAnimate(dealAction)).toBe(true);
      expect(strategy.canAnimate(foldAction)).toBe(false);
    });

    test('getDefaultConfigメソッドは有効な設定を返す', () => {
      const strategy = new MockAnimationStrategy();
      const config = strategy.getDefaultConfig();

      expect(config.duration).toBeGreaterThan(0);
      expect(typeof config.easing).toBe('string');
      expect(['forwards', 'backwards', 'both', 'none']).toContain(config.fillMode);
    });

    test('animateメソッドはPromiseを返す', async () => {
      const strategy = new MockAnimationStrategy();
      const element = document.createElement('div');
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
  });

  describe('AnimationType enum', () => {
    test('すべての必要なアニメーションタイプが定義されている', () => {
      expect(AnimationType.CARD_DEAL).toBe('card-deal');
      expect(AnimationType.CHIP_MOVE).toBe('chip-move');
      expect(AnimationType.PLAYER_ACTION).toBe('player-action');
      expect(AnimationType.POT_COLLECTION).toBe('pot-collection');
      expect(AnimationType.FOLD_ANIMATION).toBe('fold-animation');
      expect(AnimationType.ALL_IN_ANIMATION).toBe('all-in-animation');
      expect(AnimationType.CUSTOM).toBe('custom');
    });
  });

  describe('AnimationConfig interface', () => {
    test('有効な設定オブジェクトを作成できる', () => {
      const config: ExtendedAnimationConfig = {
        duration: 500,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        delay: 100,
        iterations: 2,
        fillMode: 'both',
        customProperties: {
          scale: 1.2,
          rotate: 45,
        },
      };

      expect(config.duration).toBe(500);
      expect(config.easing).toBe('cubic-bezier(0.4, 0.0, 0.2, 1)');
      expect(config.delay).toBe(100);
      expect(config.iterations).toBe(2);
      expect(config.fillMode).toBe('both');
      expect(config.customProperties?.scale).toBe(1.2);
    });

    test('最小限の設定で動作する', () => {
      const config: ExtendedAnimationConfig = {
        duration: 300,
        easing: 'ease',
      };

      expect(config.duration).toBe(300);
      expect(config.easing).toBe('ease');
      expect(config.delay).toBeUndefined();
      expect(config.iterations).toBeUndefined();
      expect(config.fillMode).toBeUndefined();
      expect(config.customProperties).toBeUndefined();
    });
  });
});
