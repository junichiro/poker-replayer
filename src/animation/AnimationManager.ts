/**
 * AnimationManager - OCP対応のアニメーション管理システム
 * Open/Closed Principle に従い、新しいアニメーション戦略を動的に登録可能
 */

import {
  IAnimationManager,
  IAnimationStrategy,
  AnimationType,
  ExtendedAnimationConfig,
  Action,
} from '../types';

/**
 * アニメーション管理クラス
 * 戦略パターンとファクトリーパターンを組み合わせて実装
 */
export class AnimationManager implements IAnimationManager {
  private strategies = new Map<AnimationType, IAnimationStrategy>();
  private globalConfig: Partial<ExtendedAnimationConfig> = {};
  private activeAnimations = new Set<Promise<void>>();

  /**
   * アニメーション戦略を登録
   */
  registerStrategy(type: AnimationType, strategy: IAnimationStrategy): void {
    this.strategies.set(type, strategy);
  }

  /**
   * アニメーション戦略を登録解除
   */
  unregisterStrategy(type: AnimationType): void {
    const strategy = this.strategies.get(type);
    if (strategy) {
      strategy.cleanup();
      this.strategies.delete(type);
    }
  }

  /**
   * アニメーションを実行
   */
  async executeAnimation(
    type: AnimationType,
    element: HTMLElement,
    action: Action,
    config?: Partial<ExtendedAnimationConfig>
  ): Promise<void> {
    const strategy = this.strategies.get(type);
    if (!strategy || !strategy.canAnimate(action)) {
      return; // アニメーションをスキップ
    }

    // 設定をマージ（デフォルト設定 < グローバル設定 < 個別設定）
    const finalConfig: ExtendedAnimationConfig = {
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

  /**
   * 利用可能な戦略のマップを取得
   */
  getAvailableStrategies(): Map<AnimationType, IAnimationStrategy> {
    return new Map(this.strategies);
  }

  /**
   * グローバル設定を設定
   */
  setGlobalConfig(config: Partial<ExtendedAnimationConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config };
  }

  /**
   * アニメーション実行中かどうかを判定
   */
  isAnimating(): boolean {
    return this.activeAnimations.size > 0;
  }

  /**
   * すべてのアニメーションを停止
   */
  stopAllAnimations(): void {
    this.activeAnimations.clear();
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup(): void {
    this.stopAllAnimations();
    this.strategies.forEach(strategy => strategy.cleanup());
    this.strategies.clear();
    this.globalConfig = {};
  }
}
