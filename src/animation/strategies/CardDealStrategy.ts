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

    // 複数カードの場合は各カード用の要素を作成してアニメーション
    const cards = action.cards;
    const stackDelay = (config.customProperties?.stackDelay as number) || 100;

    const animations = cards.map((card, index) => {
      const cardElement = this.createCardElement(element, card, index);
      return this.animateSingleCard(cardElement, card, config, index * stackDelay);
    });

    await Promise.all(animations);
  }

  /**
   * カード要素を作成
   */
  private createCardElement(
    containerElement: HTMLElement,
    card: string,
    index: number
  ): HTMLElement {
    const cardElement = document.createElement('div');
    cardElement.className = 'card-deal-animation';
    cardElement.setAttribute('data-card', card);
    cardElement.setAttribute('data-card-index', index.toString());

    // カード要素のスタイル設定
    cardElement.style.position = 'absolute';
    cardElement.style.width = '60px';
    cardElement.style.height = '84px';
    cardElement.style.backgroundColor = '#fff';
    cardElement.style.border = '1px solid #ccc';
    cardElement.style.borderRadius = '8px';
    cardElement.style.display = 'flex';
    cardElement.style.alignItems = 'center';
    cardElement.style.justifyContent = 'center';
    cardElement.style.fontSize = '12px';
    cardElement.style.fontWeight = 'bold';
    cardElement.style.zIndex = (1000 + index).toString();
    cardElement.style.pointerEvents = 'none';
    cardElement.textContent = card;

    // コンテナ要素に追加
    const container = containerElement.parentElement || containerElement;
    container.style.position = 'relative';
    container.appendChild(cardElement);

    return cardElement;
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

        // アニメーション完了を待つ
        setTimeout(resolve, config.duration);
      }, totalDelay);
    });
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup(): void {
    // 作成されたカード要素をクリーンアップ
    const cardElements = document.querySelectorAll('.card-deal-animation');
    cardElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  }
}
