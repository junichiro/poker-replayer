import { IAnimationService, AnimationState, AnimationEvent } from './interfaces';
import { Action, AnimationConfig } from '../types';

/**
 * Service responsible for managing animation timing, sequencing, and control.
 * Handles animation playback, speed control, and different animation types.
 */
export class AnimationService implements IAnimationService {
  private actions: Action[];
  private config: AnimationConfig;
  private currentActionIndex: number;
  private isPlayingState: boolean;
  private speed: number;
  private animationTimer: number | null;
  private listeners: Map<string, Set<(data: AnimationEvent) => void>>;

  constructor(actions: Action[], config: AnimationConfig) {
    this.actions = actions;
    this.config = config;
    this.currentActionIndex = -1;
    this.isPlayingState = false;
    this.speed = 1.0;
    this.animationTimer = null;
    this.listeners = new Map();
  }

  /**
   * Start animation playback
   */
  play(): void {
    if (this.isPlayingState) {
      return;
    }

    this.isPlayingState = true;
    this.emit('start', {
      type: 'start',
      currentIndex: this.currentActionIndex,
      totalActions: this.actions.length,
    });

    this.scheduleNextAction();
  }

  /**
   * Pause animation playback
   */
  pause(): void {
    if (!this.isPlayingState) {
      return;
    }

    this.isPlayingState = false;
    this.clearTimer();
    this.emit('progress', {
      type: 'pause',
      currentIndex: this.currentActionIndex,
      totalActions: this.actions.length,
    });
  }

  /**
   * Stop animation and reset to beginning
   */
  stop(): void {
    this.isPlayingState = false;
    this.clearTimer();
    this.currentActionIndex = -1;
    this.emit('progress', {
      type: 'stop',
      currentIndex: this.currentActionIndex,
      totalActions: this.actions.length,
    });
  }

  /**
   * Step forward one action
   */
  stepForward(): boolean {
    if (!this.canStepForward()) {
      return false;
    }

    this.currentActionIndex++;
    this.emit('progress', {
      type: 'progress',
      currentIndex: this.currentActionIndex,
      totalActions: this.actions.length,
    });

    return true;
  }

  /**
   * Step backward one action
   */
  stepBackward(): boolean {
    if (!this.canStepBackward()) {
      return false;
    }

    this.currentActionIndex--;
    this.emit('progress', {
      type: 'progress',
      currentIndex: this.currentActionIndex,
      totalActions: this.actions.length,
    });

    return true;
  }

  /**
   * Go to a specific action index
   */
  goToAction(index: number): void {
    if (index < -1 || index >= this.actions.length) {
      return;
    }

    this.currentActionIndex = index;
    this.emit('progress', {
      type: 'progress',
      currentIndex: this.currentActionIndex,
      totalActions: this.actions.length,
    });
  }

  /**
   * Set animation speed
   */
  setSpeed(speed: number): void {
    if (speed <= 0) {
      return;
    }

    this.speed = speed;
    
    // If playing, restart timer with new speed
    if (this.isPlayingState) {
      this.clearTimer();
      this.scheduleNextAction();
    }
  }

  /**
   * Get current animation speed
   */
  getCurrentSpeed(): number {
    return this.speed;
  }

  /**
   * Get current action index
   */
  getCurrentActionIndex(): number {
    return this.currentActionIndex;
  }

  /**
   * Check if animation is playing
   */
  isPlaying(): boolean {
    return this.isPlayingState;
  }

  /**
   * Get current animation state
   */
  getAnimationState(): AnimationState {
    return {
      isPlaying: this.isPlayingState,
      currentActionIndex: this.currentActionIndex,
      totalActions: this.actions.length,
      speed: this.speed,
      canStepForward: this.canStepForward(),
      canStepBackward: this.canStepBackward(),
    };
  }

  /**
   * Play card animation for specific action
   */
  async playCardAnimation(action: Action): Promise<void> {
    if (!this.isCardAnimationEnabled()) {
      return;
    }

    const event: AnimationEvent = {
      type: 'cardDeal',
      cards: action.cards,
      duration: this.getCardDealDuration(),
    };

    this.emit('cardAnimation', event);

    // Return promise that resolves after animation duration
    return new Promise((resolve) => {
      setTimeout(resolve, this.getCardDealDuration());
    });
  }

  /**
   * Play chip animation for specific action
   */
  async playChipAnimation(action: Action): Promise<void> {
    if (!this.isChipAnimationEnabled()) {
      return;
    }

    const event: AnimationEvent = {
      type: 'chipMovement',
      player: action.player,
      amount: action.amount,
      duration: this.getActionTransitionDuration(),
    };

    this.emit('chipAnimation', event);

    // Return promise that resolves after animation duration
    return new Promise((resolve) => {
      setTimeout(resolve, this.getActionTransitionDuration());
    });
  }

  /**
   * Play action highlight animation
   */
  async playActionHighlight(action: Action): Promise<void> {
    if (!this.isActionHighlightEnabled()) {
      return;
    }

    const event: AnimationEvent = {
      type: 'actionHighlight',
      player: action.player,
      actionType: action.type,
      duration: this.getActionTransitionDuration(),
    };

    this.emit('highlight', event);

    // Return promise that resolves after animation duration
    return new Promise((resolve) => {
      setTimeout(resolve, this.getActionTransitionDuration());
    });
  }

  /**
   * Check if card animations are enabled
   */
  isCardAnimationEnabled(): boolean {
    return this.config.enableCardAnimations ?? true;
  }

  /**
   * Check if chip animations are enabled
   */
  isChipAnimationEnabled(): boolean {
    return this.config.enableChipAnimations ?? true;
  }

  /**
   * Check if action highlights are enabled
   */
  isActionHighlightEnabled(): boolean {
    return this.config.enableActionHighlight ?? true;
  }

  /**
   * Get card deal duration
   */
  getCardDealDuration(): number {
    return this.config.cardDealDuration ?? 300;
  }

  /**
   * Get action transition duration
   */
  getActionTransitionDuration(): number {
    return this.config.actionTransitionDuration ?? 200;
  }

  /**
   * Update animation configuration
   */
  updateConfig(config: AnimationConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Subscribe to animation events
   */
  subscribe(event: string, listener: (data: AnimationEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    eventListeners.add(listener);

    // Return unsubscribe function
    return () => {
      eventListeners.delete(listener);
    };
  }

  /**
   * Destroy service and clean up resources
   */
  destroy(): void {
    this.clearTimer();
    this.isPlayingState = false;
    this.listeners.clear();
  }

  /**
   * Check if can step forward
   */
  private canStepForward(): boolean {
    return this.currentActionIndex < this.actions.length - 1;
  }

  /**
   * Check if can step backward
   */
  private canStepBackward(): boolean {
    return this.currentActionIndex >= 0;
  }

  /**
   * Schedule next action in animation sequence
   */
  private scheduleNextAction(): void {
    if (!this.isPlayingState) {
      return;
    }

    if (!this.canStepForward()) {
      // Animation complete
      this.isPlayingState = false;
      this.emit('complete', {
        type: 'complete',
        currentIndex: this.currentActionIndex,
        totalActions: this.actions.length,
      });
      return;
    }

    const interval = 1000 / this.speed;
    this.animationTimer = window.setTimeout(() => {
      if (this.isPlayingState) {
        this.stepForward();
        this.scheduleNextAction();
      }
    }, interval);
  }

  /**
   * Clear animation timer
   */
  private clearTimer(): void {
    if (this.animationTimer !== null) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: AnimationEvent): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}