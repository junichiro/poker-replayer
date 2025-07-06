/**
 * Animation System Exports
 * OCP対応のアニメーションシステムのエクスポート
 */

// Core classes
export { AnimationManager } from './AnimationManager';
export { AnimationComposer } from './AnimationComposer';

// Strategy implementations
export { CardDealStrategy } from './strategies/CardDealStrategy';
export { ChipMoveStrategy } from './strategies/ChipMoveStrategy';
export { PlayerActionStrategy } from './strategies/PlayerActionStrategy';

// Types are exported from main types file
export type {
  IAnimationStrategy,
  IAnimationManager,
  IAnimationComposer,
  ExtendedAnimationConfig,
  AnimationStep,
  AnimationType,
  Point,
} from '../types';
