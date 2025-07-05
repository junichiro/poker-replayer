import { PokerHand, Action } from '../types';

/**
 * ゲームの状態を表す型
 */
export type GameStatus = 'ready' | 'playing' | 'paused' | 'ended';

/**
 * ゲームの状態
 */
export interface GameState {
  hand: PokerHand;
  currentActionIndex: number;
  isPlaying: boolean;
  status: GameStatus;
}

/**
 * GameControllerのインターフェース
 */
export interface IGameController {
  play(): void;
  pause(): void;
  stop(): void;
  stepForward(): boolean;
  stepBackward(): boolean;
  goToAction(index: number): void;
  getCurrentAction(): Action | null;
  canStepForward(): boolean;
  canStepBackward(): boolean;
  getGameState(): GameState;
  subscribe(listener: (state: GameState) => void): () => void;
}

/**
 * Service responsible for managing game flow control and replay state.
 * Handles play/pause/step functionality and maintains current game position.
 */
export class GameController implements IGameController {
  private hand: PokerHand;
  private currentActionIndex: number;
  private isPlaying: boolean;
  private status: GameStatus;
  private listeners: Set<(state: GameState) => void>;

  constructor(hand: PokerHand) {
    this.hand = hand;
    this.currentActionIndex = -1;
    this.isPlaying = false;
    this.status = hand.actions.length === 0 ? 'ended' : 'ready';
    this.listeners = new Set();
  }

  /**
   * Start automatic playback
   */
  play(): void {
    // 最後のアクションに達している場合は再生しない
    if (!this.canStepForward()) {
      return;
    }

    // 既に再生中の場合は何もしない
    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.status = 'playing';
    this.notifyStateChange();
  }

  /**
   * Pause automatic playback
   */
  pause(): void {
    if (!this.isPlaying) {
      return;
    }

    this.isPlaying = false;
    this.status = 'paused';
    this.notifyStateChange();
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    this.isPlaying = false;
    this.currentActionIndex = -1;
    this.status = this.hand.actions.length === 0 ? 'ended' : 'ready';
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
    this.isPlaying = false;
    this.updateStatusAfterStep();
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
    this.isPlaying = false;
    this.updateStatusAfterStep();
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
    this.isPlaying = false;
    this.updateStatusAfterStep();
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
    return this.currentActionIndex > -1;
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return {
      hand: this.hand,
      currentActionIndex: this.currentActionIndex,
      isPlaying: this.isPlaying,
      status: this.status,
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

  /**
   * Update game status after step operations
   */
  private updateStatusAfterStep(): void {
    if (!this.canStepForward()) {
      this.status = 'ended';
    } else if (!this.canStepBackward()) {
      this.status = 'ready';
    } else if (this.status === 'playing') {
      this.status = 'paused';
    } else if (this.status === 'ended') {
      this.status = 'ready';
    }
  }
}
