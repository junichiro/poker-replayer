/**
 * CardDealStrategy - カードディールアニメーション戦略
 * カードが配られる際のアニメーションを実装
 */

import { IAnimationStrategy, ExtendedAnimationConfig, Action } from '../../types';

/**
 * カードディールアニメーション戦略
 */
export class CardDealStrategy implements IAnimationStrategy {
  readonly name = 'Card Deal Animation';
  readonly version = '1.0.0';

  /**
   * アクションがアニメーション可能かチェック
   */
  canAnimate(action: Action): boolean {
    return action.type === 'deal' && !!action.cards && action.cards.length > 0;
  }

  /**
   * デフォルト設定を取得
   */
  getDefaultConfig(): ExtendedAnimationConfig {
    return {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      delay: 0,
      fillMode: 'forwards',
      customProperties: {
        cardScale: 1.0,
        cardRotation: 0,
        stackDelay: 100, // カードごとの遅延
      },
    };
  }

  /**
   * カードディールアニメーションを実行
   */
  async animate(
    element: HTMLElement,
    action: Action,
    config: ExtendedAnimationConfig
  ): Promise<void> {
    if (!action.cards || action.cards.length === 0) {
      return;
    }

    // 複数カードの場合は順番にアニメーション
    const cards = action.cards;
    const stackDelay = config.customProperties?.stackDelay || 100;

    const animations = cards.map((card, index) =>
      this.animateSingleCard(element, card, config, index * stackDelay)
    );

    await Promise.all(animations);
  }

  /**
   * 単一カードのアニメーション
   */
  private async animateSingleCard(
    element: HTMLElement,
    card: string,
    config: ExtendedAnimationConfig,
    additionalDelay: number = 0
  ): Promise<void> {
    return new Promise(resolve => {
      const totalDelay = (config.delay || 0) + additionalDelay;

      // 初期状態を設定（カードが見えない状態から開始）
      element.style.opacity = '0';
      element.style.transform = 'translateX(-50px) rotateY(-90deg) scale(0.8)';
      element.style.transition = 'none';

      setTimeout(() => {
        // アニメーションを開始
        element.style.transition = `all ${config.duration}ms ${config.easing}`;
        element.style.opacity = '1';
        element.style.transform = 'translateX(0) rotateY(0) scale(1)';

        // カードデータ属性を設定
        element.setAttribute('data-card', card);

        // アニメーション完了を待つ
        setTimeout(resolve, config.duration);
      }, totalDelay);
    });
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup(): void {
    // 特に管理するリソースはないが、将来の拡張性のため
  }
}
