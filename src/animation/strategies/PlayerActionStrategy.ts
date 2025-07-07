/**
 * PlayerActionStrategy - プレイヤーアクションアニメーション戦略
 * フォールド、チェック、ベットなどのプレイヤーアクションのアニメーションを実装
 */

import { IAnimationStrategy, ExtendedAnimationConfig, Action } from '../../types';

/**
 * プレイヤーアクションアニメーション戦略
 */
export class PlayerActionStrategy implements IAnimationStrategy {
  readonly name = 'Player Action Animation';
  readonly version = '1.0.0';

  /**
   * アクションがアニメーション可能かチェック
   */
  canAnimate(action: Action): boolean {
    return ['fold', 'check', 'bet', 'call', 'raise'].includes(action.type);
  }

  /**
   * デフォルト設定を取得
   */
  getDefaultConfig(): ExtendedAnimationConfig {
    return {
      duration: 400,
      easing: 'ease-in-out',
      delay: 0,
      fillMode: 'forwards',
      customProperties: {
        highlightColor: '#fbbf24',
        foldOpacity: 0.5,
        pulseScale: 1.05,
        actionTextDisplay: true,
      },
    };
  }

  /**
   * プレイヤーアクションアニメーションを実行
   */
  async animate(
    element: HTMLElement,
    action: Action,
    config: ExtendedAnimationConfig
  ): Promise<void> {
    switch (action.type) {
      case 'fold':
        return this.animateFold(element, config);
      case 'check':
        return this.animateCheck(element, config);
      case 'bet':
      case 'call':
      case 'raise':
        return this.animateBetting(element, action, config);
      default:
        return Promise.resolve();
    }
  }

  /**
   * フォールドアニメーション
   */
  private async animateFold(element: HTMLElement, config: ExtendedAnimationConfig): Promise<void> {
    return new Promise(resolve => {
      const foldOpacity = config.customProperties?.foldOpacity || 0.5;

      // 元の状態を保存
      // const originalOpacity = element.style.opacity || '1';
      // const originalFilter = element.style.filter || '';

      element.style.transition = `all ${config.duration}ms ${config.easing}`;

      setTimeout(() => {
        // フォールド状態に変更
        element.style.opacity = foldOpacity.toString();
        element.style.filter = 'grayscale(1)';
        element.classList.add('folded');

        // アクションテキストを表示
        if (config.customProperties?.actionTextDisplay) {
          this.showActionText(element, 'FOLD', '#ef4444', config.duration);
        }

        setTimeout(resolve, config.duration);
      }, config.delay || 0);
    });
  }

  /**
   * チェックアニメーション
   */
  private async animateCheck(element: HTMLElement, config: ExtendedAnimationConfig): Promise<void> {
    return new Promise(resolve => {
      const pulseScale = config.customProperties?.pulseScale || 1.05;

      element.style.transition = `transform ${config.duration}ms ${config.easing}`;

      setTimeout(() => {
        // チェックハイライト
        element.style.transform = `scale(${pulseScale})`;
        element.classList.add('checking');

        // アクションテキストを表示
        if (config.customProperties?.actionTextDisplay) {
          this.showActionText(element, 'CHECK', '#10b981', config.duration);
        }

        // 元のサイズに戻る
        setTimeout(() => {
          element.style.transform = 'scale(1)';
          element.classList.remove('checking');
          setTimeout(resolve, config.duration * 0.3);
        }, config.duration * 0.7);
      }, config.delay || 0);
    });
  }

  /**
   * ベッティングアニメーション（bet, call, raise）
   */
  private async animateBetting(
    element: HTMLElement,
    action: Action,
    config: ExtendedAnimationConfig
  ): Promise<void> {
    return new Promise(resolve => {
      const highlightColor = (config.customProperties?.highlightColor as string) || '#fbbf24';
      const pulseScale = (config.customProperties?.pulseScale as number) || 1.05;

      // 元の状態を保存
      const originalBoxShadow = element.style.boxShadow || '';
      const originalTransform = element.style.transform || '';

      element.style.transition = `all ${config.duration}ms ${config.easing}`;

      setTimeout(() => {
        // ベットハイライト
        element.style.boxShadow = `0 0 20px ${highlightColor}`;
        element.style.transform = `${originalTransform} scale(${pulseScale})`;
        element.classList.add('betting');

        // アクションテキストとベット額を表示
        if (config.customProperties?.actionTextDisplay) {
          const actionText = this.getActionText(action);
          this.showActionText(element, actionText, highlightColor, config.duration);
        }

        // 元の状態に戻る
        setTimeout(() => {
          element.style.boxShadow = originalBoxShadow;
          element.style.transform = originalTransform;
          element.classList.remove('betting');
          setTimeout(resolve, config.duration * 0.2);
        }, config.duration * 0.8);
      }, config.delay || 0);
    });
  }

  /**
   * アクションテキストを生成
   */
  private getActionText(action: Action): string {
    switch (action.type) {
      case 'bet':
        return `BET $${action.amount || 0}`;
      case 'call':
        return `CALL $${action.amount || 0}`;
      case 'raise':
        return `RAISE $${action.amount || 0}`;
      default:
        return action.type.toUpperCase();
    }
  }

  /**
   * アクションテキストを表示
   */
  private showActionText(
    element: HTMLElement,
    text: string,
    color: string,
    duration: number
  ): void {
    const textElement = document.createElement('div');
    textElement.className = 'action-text-animation';
    textElement.textContent = text;

    // スタイルを設定
    textElement.style.position = 'absolute';
    textElement.style.top = '-30px';
    textElement.style.left = '50%';
    textElement.style.transform = 'translateX(-50%)';
    textElement.style.backgroundColor = color;
    textElement.style.color = 'white';
    textElement.style.padding = '4px 8px';
    textElement.style.borderRadius = '4px';
    textElement.style.fontSize = '12px';
    textElement.style.fontWeight = 'bold';
    textElement.style.zIndex = '1001';
    textElement.style.opacity = '0';
    textElement.style.transform = 'translateX(-50%) translateY(10px)';
    textElement.style.transition = 'all 200ms ease-out';
    textElement.style.pointerEvents = 'none';

    // 要素に追加
    const container = element.parentElement || element;
    container.style.position = 'relative';
    container.appendChild(textElement);

    // アニメーション実行
    setTimeout(() => {
      textElement.style.opacity = '1';
      textElement.style.transform = 'translateX(-50%) translateY(0)';
    }, 50);

    // テキストを削除
    setTimeout(() => {
      textElement.style.opacity = '0';
      textElement.style.transform = 'translateX(-50%) translateY(-10px)';
      setTimeout(() => {
        if (textElement.parentNode) {
          textElement.parentNode.removeChild(textElement);
        }
      }, 200);
    }, duration - 200);
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup(): void {
    // アクションテキスト要素をクリーンアップ
    const actionTexts = document.querySelectorAll('.action-text-animation');
    actionTexts.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  }
}
