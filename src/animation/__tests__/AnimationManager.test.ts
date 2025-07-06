/**
 * AnimationManager テスト
 * TDD approach - RED phase: AnimationManagerの動作をテストする
 */

import {
  Action,
  IAnimationStrategy,
  IAnimationManager,
  ExtendedAnimationConfig,
  AnimationType,
} from '../../types';
import { AnimationManager } from '../AnimationManager';

// モック実装（テスト用）
class MockAnimationStrategy implements IAnimationStrategy {
  name = 'Mock Strategy';
  version = '1.0.0';
  animationCallCount = 0;
  lastConfig?: ExtendedAnimationConfig;

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
    this.animationCallCount++;
    this.lastConfig = config;
    return new Promise(resolve => {
      setTimeout(resolve, 10); // 短時間でテスト実行
    });
  }

  cleanup(): void {
    this.animationCallCount = 0;
    this.lastConfig = undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MockAnimationManager implements IAnimationManager {
  private strategies = new Map<AnimationType, IAnimationStrategy>();
  private globalConfig: Partial<ExtendedAnimationConfig> = {};
  private activeAnimations = new Set<Promise<void>>();

  registerStrategy(type: AnimationType, strategy: IAnimationStrategy): void {
    this.strategies.set(type, strategy);
  }

  unregisterStrategy(type: AnimationType): void {
    this.strategies.delete(type);
  }

  async executeAnimation(
    type: AnimationType,
    element: HTMLElement,
    action: Action,
    config?: Partial<ExtendedAnimationConfig>
  ): Promise<void> {
    const strategy = this.strategies.get(type);
    if (!strategy || !strategy.canAnimate(action)) {
      return;
    }

    const finalConfig = {
      ...strategy.getDefaultConfig(),
      ...this.globalConfig,
      ...config,
    };

    const animation = strategy.animate(element, action, finalConfig);
    this.activeAnimations.add(animation);

    try {
      await animation;
    } finally {
      this.activeAnimations.delete(animation);
    }
  }

  getAvailableStrategies(): Map<AnimationType, IAnimationStrategy> {
    return new Map(this.strategies);
  }

  setGlobalConfig(config: Partial<ExtendedAnimationConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config };
  }

  isAnimating(): boolean {
    return this.activeAnimations.size > 0;
  }

  stopAllAnimations(): void {
    this.activeAnimations.clear();
  }
}

describe('AnimationManager', () => {
  let manager: AnimationManager;
  let mockStrategy: MockAnimationStrategy;
  let element: HTMLElement;

  beforeEach(() => {
    manager = new AnimationManager();
    mockStrategy = new MockAnimationStrategy();
    element = document.createElement('div');
  });

  describe('strategy registration', () => {
    test('strategyを登録できる', () => {
      manager.registerStrategy(AnimationType.CARD_DEAL, mockStrategy);

      const strategies = manager.getAvailableStrategies();
      expect(strategies.has(AnimationType.CARD_DEAL)).toBe(true);
      expect(strategies.get(AnimationType.CARD_DEAL)).toBe(mockStrategy);
    });

    test('複数のstrategyを登録できる', () => {
      const secondStrategy = new MockAnimationStrategy();
      secondStrategy.name = 'Second Strategy';

      manager.registerStrategy(AnimationType.CARD_DEAL, mockStrategy);
      manager.registerStrategy(AnimationType.CHIP_MOVE, secondStrategy);

      const strategies = manager.getAvailableStrategies();
      expect(strategies.size).toBe(2);
      expect(strategies.has(AnimationType.CARD_DEAL)).toBe(true);
      expect(strategies.has(AnimationType.CHIP_MOVE)).toBe(true);
    });

    test('strategyを登録解除できる', () => {
      manager.registerStrategy(AnimationType.CARD_DEAL, mockStrategy);
      expect(manager.getAvailableStrategies().has(AnimationType.CARD_DEAL)).toBe(true);

      manager.unregisterStrategy(AnimationType.CARD_DEAL);
      expect(manager.getAvailableStrategies().has(AnimationType.CARD_DEAL)).toBe(false);
    });

    test('同じタイプのstrategyを上書き登録できる', () => {
      const firstStrategy = new MockAnimationStrategy();
      const secondStrategy = new MockAnimationStrategy();
      secondStrategy.name = 'Updated Strategy';

      manager.registerStrategy(AnimationType.CARD_DEAL, firstStrategy);
      manager.registerStrategy(AnimationType.CARD_DEAL, secondStrategy);

      const strategies = manager.getAvailableStrategies();
      expect(strategies.get(AnimationType.CARD_DEAL)?.name).toBe('Updated Strategy');
    });
  });

  describe('animation execution', () => {
    beforeEach(() => {
      manager.registerStrategy(AnimationType.CARD_DEAL, mockStrategy);
    });

    test('適切なアクションでアニメーションを実行できる', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      await manager.executeAnimation(AnimationType.CARD_DEAL, element, action);

      expect(mockStrategy.animationCallCount).toBe(1);
    });

    test('不適切なアクションではアニメーションをスキップする', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'fold',
        player: 'Player1',
      };

      await manager.executeAnimation(AnimationType.CARD_DEAL, element, action);

      expect(mockStrategy.animationCallCount).toBe(0);
    });

    test('登録されていないタイプではアニメーションをスキップする', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      await manager.executeAnimation(AnimationType.CHIP_MOVE, element, action);

      expect(mockStrategy.animationCallCount).toBe(0);
    });

    test('設定をマージしてアニメーションを実行する', async () => {
      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      const customConfig = {
        duration: 500,
        delay: 100,
      };

      await manager.executeAnimation(AnimationType.CARD_DEAL, element, action, customConfig);

      expect(mockStrategy.lastConfig?.duration).toBe(500);
      expect(mockStrategy.lastConfig?.delay).toBe(100);
      expect(mockStrategy.lastConfig?.easing).toBe('ease-in-out'); // デフォルト値
    });
  });

  describe('global configuration', () => {
    beforeEach(() => {
      manager.registerStrategy(AnimationType.CARD_DEAL, mockStrategy);
    });

    test('グローバル設定を適用できる', async () => {
      manager.setGlobalConfig({
        duration: 400,
        easing: 'linear',
      });

      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      await manager.executeAnimation(AnimationType.CARD_DEAL, element, action);

      expect(mockStrategy.lastConfig?.duration).toBe(400);
      expect(mockStrategy.lastConfig?.easing).toBe('linear');
    });

    test('個別設定がグローバル設定を上書きする', async () => {
      manager.setGlobalConfig({
        duration: 400,
        easing: 'linear',
      });

      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      const customConfig = {
        duration: 600,
      };

      await manager.executeAnimation(AnimationType.CARD_DEAL, element, action, customConfig);

      expect(mockStrategy.lastConfig?.duration).toBe(600); // 個別設定
      expect(mockStrategy.lastConfig?.easing).toBe('linear'); // グローバル設定
    });
  });

  describe('animation state management', () => {
    test('初期状態ではアニメーション中ではない', () => {
      expect(manager.isAnimating()).toBe(false);
    });

    test('アニメーション実行中はisAnimating()がtrueを返す', async () => {
      manager.registerStrategy(AnimationType.CARD_DEAL, mockStrategy);

      const action: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      const animationPromise = manager.executeAnimation(AnimationType.CARD_DEAL, element, action);

      // アニメーション実行中
      expect(manager.isAnimating()).toBe(true);

      await animationPromise;

      // アニメーション完了後
      expect(manager.isAnimating()).toBe(false);
    });

    test('複数のアニメーションを並行実行できる', async () => {
      const secondStrategy = new MockAnimationStrategy();
      manager.registerStrategy(AnimationType.CARD_DEAL, mockStrategy);
      manager.registerStrategy(AnimationType.CHIP_MOVE, secondStrategy);

      const dealAction: Action = {
        index: 0,
        street: 'preflop',
        type: 'deal',
        cards: ['Ah', 'Kd'],
      };

      // CHIP_MOVEでもcanAnimateがtrueを返すようにモック設定
      secondStrategy.canAnimate = () => true;

      const promises = [
        manager.executeAnimation(AnimationType.CARD_DEAL, element, dealAction),
        manager.executeAnimation(AnimationType.CHIP_MOVE, element, dealAction),
      ];

      await Promise.all(promises);

      expect(mockStrategy.animationCallCount).toBe(1);
      expect(secondStrategy.animationCallCount).toBe(1);
    });

    test('stopAllAnimationsですべてのアニメーションを停止できる', () => {
      manager.stopAllAnimations();
      expect(manager.isAnimating()).toBe(false);
    });
  });
});
