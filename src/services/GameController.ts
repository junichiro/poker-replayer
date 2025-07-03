import { PokerHand, Action } from '../types';

import { IGameController, GameState } from './interfaces';

/**
 * Service responsible for managing game flow control and replay state.
 * Handles play/pause/step functionality and maintains current game position.
 */
export class GameController implements IGameController {
  private hand: PokerHand;
  private currentActionIndex: number;
  private isPlaying: boolean;
  private listeners: Set<(state: GameState) => void>;

  constructor(hand: PokerHand) {
    this.hand = hand;
    this.currentActionIndex = -1;
    this.isPlaying = false;
    this.listeners = new Set();
  }

  /**
   * Start automatic playback
   */
  play(): void {
    this.isPlaying = true;
    this.notifyStateChange();
  }

  /**
   * Pause automatic playback
   */
  pause(): void {
    this.isPlaying = false;
    this.notifyStateChange();
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    this.isPlaying = false;
    this.currentActionIndex = -1;
    this.notifyStateChange();
  }

  /**
   * Step forward one action
   */
  stepForward(): boolean {
    if (!this.canStepForward()) {
      return false;
    }

    this.currentActionIndex++;
    this.notifyStateChange();
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
    this.notifyStateChange();
    return true;
  }

  /**
   * Go to a specific action index
   */
  goToAction(index: number): void {
    if (index < -1 || index >= this.hand.actions.length) {
      return; // Invalid index, ignore
    }

    this.currentActionIndex = index;
    this.notifyStateChange();
  }

  /**
   * Get the current action being displayed
   */
  getCurrentAction(): Action | null {
    if (this.currentActionIndex < 0 || this.currentActionIndex >= this.hand.actions.length) {
      return null;
    }

    return this.hand.actions[this.currentActionIndex];
  }

  /**
   * Check if can step forward
   */
  canStepForward(): boolean {
    return this.currentActionIndex < this.hand.actions.length - 1;
  }

  /**
   * Check if can step backward
   */
  canStepBackward(): boolean {
    return this.currentActionIndex >= 0;
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return {
      isPlaying: this.isPlaying,
      currentActionIndex: this.currentActionIndex,
      canStepForward: this.canStepForward(),
      canStepBackward: this.canStepBackward(),
      totalActions: this.hand.actions.length,
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyStateChange(): void {
    const state = this.getGameState();
    this.listeners.forEach(listener => listener(state));
  }
}
