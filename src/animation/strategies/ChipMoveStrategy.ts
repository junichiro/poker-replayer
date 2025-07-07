/**
 * ChipMoveStrategy - チップ移動アニメーション戦略
 * チップの移動アニメーションを実装
 */

import { IAnimationStrategy, ExtendedAnimationConfig, Action, Point } from '../../types';

/**
 * チップ移動アニメーション戦略
 */
export class ChipMoveStrategy implements IAnimationStrategy {
  readonly name = 'Chip Movement Animation';
  readonly version = '1.0.0';
  private createdChips: HTMLElement[] = [];

  /**
   * アクションがアニメーション可能かチェック
   */
  canAnimate(action: Action): boolean {
    return (
      ['bet', 'call', 'raise', 'collected'].includes(action.type) &&
      action.amount !== undefined &&
      action.amount > 0
    );
  }

  /**
   * デフォルト設定を取得
   */
  getDefaultConfig(): ExtendedAnimationConfig {
    return {
      duration: 600,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      delay: 0,
      fillMode: 'forwards',
      customProperties: {
        chipScale: 1.0,
        pathCurve: 0.3,
        chipColor: '#2563eb',
        textColor: 'white',
      },
    };
  }

  /**
   * チップ移動アニメーションを実行
   */
  async animate(
    element: HTMLElement,
    action: Action,
    config: ExtendedAnimationConfig
  ): Promise<void> {
    if (!action.amount || action.amount <= 0) {
      return;
    }

    const chipElement = this.createChipElement(action.amount, config);
    const path = this.calculateChipPath(element, action);

    // チップ要素をDOMに追加
    document.body.appendChild(chipElement);

    try {
      await this.animateAlongPath(chipElement, path, config);
    } finally {
      // アニメーション完了後にチップ要素を削除
      if (chipElement.parentNode) {
        chipElement.parentNode.removeChild(chipElement);
      }
      const index = this.createdChips.indexOf(chipElement);
      if (index > -1) {
        this.createdChips.splice(index, 1);
      }
    }
  }

  /**
   * チップ要素を作成
   */
  private createChipElement(amount: number, config: ExtendedAnimationConfig): HTMLElement {
    const chip = document.createElement('div');
    chip.className = 'chip-animation';
    chip.textContent = `$${amount}`;

    // スタイルを設定
    const chipColor = (config.customProperties?.chipColor as string) || '#2563eb';
    const textColor = (config.customProperties?.textColor as string) || 'white';
    const scale = (config.customProperties?.chipScale as number) || 1.0;

    chip.style.position = 'absolute';
    chip.style.width = `${40 * scale}px`;
    chip.style.height = `${40 * scale}px`;
    chip.style.borderRadius = '50%';
    chip.style.backgroundColor = chipColor;
    chip.style.color = textColor;
    chip.style.display = 'flex';
    chip.style.alignItems = 'center';
    chip.style.justifyContent = 'center';
    chip.style.fontSize = `${12 * scale}px`;
    chip.style.fontWeight = 'bold';
    chip.style.zIndex = '1000';
    chip.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    chip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    chip.style.pointerEvents = 'none';

    this.createdChips.push(chip);
    return chip;
  }

  /**
   * チップの移動パスを計算
   */
  private calculateChipPath(element: HTMLElement, action: Action): Point[] {
    const rect = element.getBoundingClientRect();
    const startPoint = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    // ポット位置（画面中央と仮定）
    const potPoint = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    if (action.type === 'collected') {
      // ポットからプレイヤーへ
      return [potPoint, startPoint];
    } else {
      // プレイヤーからポットへ
      return [startPoint, potPoint];
    }
  }

  /**
   * パスに沿ってアニメーション
   */
  private async animateAlongPath(
    element: HTMLElement,
    path: Point[],
    config: ExtendedAnimationConfig
  ): Promise<void> {
    return new Promise(resolve => {
      if (path.length < 2) {
        resolve();
        return;
      }

      const start = path[0];
      const end = path[path.length - 1];

      // 初期位置を設定
      element.style.left = `${start.x}px`;
      element.style.top = `${start.y}px`;
      element.style.opacity = '1';
      element.style.transform = 'scale(0.8)';
      element.style.transition = 'none';

      // 遅延後にアニメーション開始
      setTimeout(() => {
        element.style.transition = `all ${config.duration}ms ${config.easing}`;
        element.style.left = `${end.x}px`;
        element.style.top = `${end.y}px`;
        element.style.transform = 'scale(1)';

        // アニメーション終了時にフェードアウト
        setTimeout(() => {
          element.style.opacity = '0';
          element.style.transform = 'scale(0.6)';
          setTimeout(resolve, 200); // フェードアウト時間
        }, config.duration * 0.8);
      }, config.delay || 0);
    });
  }

  /**
   * リソースのクリーンアップ
   */
  cleanup(): void {
    // 作成されたチップ要素をすべて削除
    this.createdChips.forEach(chip => {
      if (chip.parentNode) {
        chip.parentNode.removeChild(chip);
      }
    });
    this.createdChips = [];
  }
}
