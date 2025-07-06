/**
 * AnimationComposer - アニメーションコンポジションシステム
 * 複数のアニメーションを組み合わせて実行する
 */

import { IAnimationComposer, IAnimationManager, AnimationStep } from '../types';

/**
 * アニメーションコンポーザークラス
 * 複数のアニメーションを順次実行、並列実行、またはカスタムロジックで実行
 */
export class AnimationComposer implements IAnimationComposer {
  constructor(private animationManager: IAnimationManager) {}

  /**
   * アニメーションを順次実行
   */
  async composeSequential(animations: AnimationStep[]): Promise<void> {
    for (const animation of animations) {
      if (animation.delay) {
        await this.delay(animation.delay);
      }

      await this.animationManager.executeAnimation(
        animation.type,
        animation.element,
        animation.action,
        animation.config
      );
    }
  }

  /**
   * アニメーションを並列実行
   */
  async composeParallel(animations: AnimationStep[]): Promise<void> {
    const promises = animations.map(animation => {
      if (animation.delay) {
        return this.delayedExecution(animation);
      }

      return this.animationManager.executeAnimation(
        animation.type,
        animation.element,
        animation.action,
        animation.config
      );
    });

    await Promise.all(promises);
  }

  /**
   * カスタムコンポジションロジックで実行
   */
  async composeCustom(
    animations: AnimationStep[],
    composer: (animations: AnimationStep[]) => Promise<void>
  ): Promise<void> {
    await composer(animations);
  }

  /**
   * 遅延付きでアニメーションを実行
   */
  private async delayedExecution(animation: AnimationStep): Promise<void> {
    if (animation.delay) {
      await this.delay(animation.delay);
    }

    return this.animationManager.executeAnimation(
      animation.type,
      animation.element,
      animation.action,
      animation.config
    );
  }

  /**
   * 指定時間待機
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 高度なコンポジション - ステージング（段階的実行）
   */
  async composeStaged(animationGroups: AnimationStep[][]): Promise<void> {
    for (const group of animationGroups) {
      await this.composeParallel(group);
    }
  }

  /**
   * 高度なコンポジション - カスケード（連鎖実行）
   */
  async composeCascade(animations: AnimationStep[], cascadeDelay: number = 100): Promise<void> {
    const promises = animations.map((animation, index) => {
      const totalDelay = (animation.delay || 0) + index * cascadeDelay;

      return this.animationManager.executeAnimation(
        animation.type,
        animation.element,
        animation.action,
        { ...animation.config, delay: totalDelay }
      );
    });

    await Promise.all(promises);
  }

  /**
   * 高度なコンポジション - 条件付き実行
   */
  async composeConditional(
    animations: AnimationStep[],
    condition: (animation: AnimationStep) => boolean
  ): Promise<void> {
    const filteredAnimations = animations.filter(condition);
    await this.composeParallel(filteredAnimations);
  }

  /**
   * 高度なコンポジション - 重要度ベース実行
   */
  async composePriority(animations: (AnimationStep & { priority: number })[]): Promise<void> {
    // 優先度でソート（高い順）
    const sortedAnimations = animations.sort((a, b) => b.priority - a.priority);

    // 優先度グループに分けて実行
    const priorityGroups = new Map<number, AnimationStep[]>();

    sortedAnimations.forEach(animation => {
      const group = priorityGroups.get(animation.priority) || [];
      group.push(animation);
      priorityGroups.set(animation.priority, group);
    });

    // 優先度順に実行（同じ優先度は並列）
    for (const [, group] of Array.from(priorityGroups.entries()).sort((a, b) => b[0] - a[0])) {
      await this.composeParallel(group);
    }
  }
}
