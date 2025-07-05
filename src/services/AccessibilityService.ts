/**
 * AccessibilityService
 * アクセシビリティ機能を管理するサービス
 */

import { Action } from '../types';

import { GameState } from './GameController';

/**
 * キーボードショートカット定義
 */
export interface KeyboardShortcut {
  key: string;
  description: string;
  action: string;
}

/**
 * AccessibilityServiceのインターフェース
 */
export interface IAccessibilityService {
  announceAction(action: Action): void;
  announceGameState(state: GameState): void;
  getActionDescription(action: Action, verbose?: boolean): string;
  getKeyboardShortcuts(): KeyboardShortcut[];
  handleKeyboardNavigation(event: KeyboardEvent): boolean;
  setKeyboardHandler(action: string, handler: () => void): () => void;
  formatCardsForAnnouncement(cards: string[]): string;
  formatAmountForAnnouncement(amount: number): string;
  isAnnouncementEnabled(): boolean;
  setAnnouncementEnabled(enabled: boolean): void;
  getAriaLabel(type: string, data: Action): string;
  getAriaLiveText(state: GameState): string;
}

/**
 * アクセシビリティサービスクラス
 */
export class AccessibilityService implements IAccessibilityService {
  private announcementEnabled: boolean;
  private keyboardHandlers: Map<string, () => void>;

  constructor() {
    this.announcementEnabled = true;
    this.keyboardHandlers = new Map();
  }

  /**
   * アクションをアナウンスする
   */
  announceAction(action: Action): void {
    if (!this.announcementEnabled) {
      return;
    }

    const description = this.getActionDescription(action);
    this.announce(description);
  }

  /**
   * ゲーム状態をアナウンスする
   */
  announceGameState(state: GameState): void {
    if (!this.announcementEnabled) {
      return;
    }

    const statusText = state.status === 'playing' ? 'playing' : state.status;
    const description = `Game ${statusText}, currently at action ${state.currentActionIndex + 1}`;
    this.announce(description);
  }

  /**
   * アクションの説明を生成する
   */
  getActionDescription(action: Action, verbose = false): string {
    let description = '';

    if (action.player) {
      description += `${action.player} ${this.getActionVerb(action)}`;
    } else {
      description += `System ${this.getActionVerb(action)}`;
    }

    // 金額を追加
    if (action.amount) {
      description += ` $${action.amount}`;
    }

    // カードを追加
    if (action.cards && action.cards.length > 0) {
      if (action.type === 'deal') {
        const street = action.street === 'preflop' ? 'hole cards' : action.street;
        description += ` ${street}: ${action.cards.join(', ')}`;
      } else {
        description += ` [${action.cards.join(', ')}]`;
      }
    }

    // オールインを追加
    if (action.isAllIn) {
      description += ' and is all-in';
    }

    // 詳細モードの場合はストリート情報を追加
    if (verbose && action.player) {
      description += ` on ${action.street}`;
    }

    return description;
  }

  /**
   * キーボードショートカットリストを取得する
   */
  getKeyboardShortcuts(): KeyboardShortcut[] {
    return [
      { key: 'Space', description: 'Play/Pause', action: 'playPause' },
      { key: 'ArrowLeft', description: 'Previous action', action: 'previous' },
      { key: 'ArrowRight', description: 'Next action', action: 'next' },
      { key: 'r', description: 'Reset to beginning', action: 'reset' },
    ];
  }

  /**
   * キーボードナビゲーションを処理する
   */
  handleKeyboardNavigation(event: KeyboardEvent): boolean {
    const { key } = event;
    let action = '';

    switch (key) {
      case ' ':
      case 'Space':
        action = 'playPause';
        break;
      case 'ArrowLeft':
        action = 'previous';
        break;
      case 'ArrowRight':
        action = 'next';
        break;
      case 'r':
      case 'R':
        action = 'reset';
        break;
      default:
        return false;
    }

    const handler = this.keyboardHandlers.get(action);
    if (handler) {
      handler();
      return true;
    }

    return false;
  }

  /**
   * キーボードハンドラを設定する
   */
  setKeyboardHandler(action: string, handler: () => void): () => void {
    this.keyboardHandlers.set(action, handler);
    return () => this.keyboardHandlers.delete(action);
  }

  /**
   * カードの読み上げ用フォーマットを生成する
   */
  formatCardsForAnnouncement(cards: string[]): string {
    return cards.map(card => this.formatCardForAnnouncement(card)).join(', ');
  }

  /**
   * 金額の読み上げ用フォーマットを生成する
   */
  formatAmountForAnnouncement(amount: number): string {
    if (amount >= 1000) {
      const thousands = Math.floor(amount / 1000);
      const remainder = amount % 1000;

      let result = `${thousands} thousand`;
      if (remainder > 0) {
        if (remainder < 100) {
          result += ` ${remainder}`;
        } else {
          // Convert hundreds to readable format
          const hundreds = Math.floor(remainder / 100);
          const tens = remainder % 100;
          result += ` ${hundreds} hundred`;
          if (tens > 0) {
            result += ` ${tens}`;
          }
        }
      }
      result += ' dollars';

      return result;
    }

    return `${amount} dollars`;
  }

  /**
   * アナウンス機能の有効状態を取得する
   */
  isAnnouncementEnabled(): boolean {
    return this.announcementEnabled;
  }

  /**
   * アナウンス機能の有効/無効を設定する
   */
  setAnnouncementEnabled(enabled: boolean): void {
    this.announcementEnabled = enabled;
  }

  /**
   * ARIAラベルを生成する
   */
  getAriaLabel(type: string, data: Action): string {
    switch (type) {
      case 'action':
        return `Action: ${this.getActionDescription(data)}`;
      default:
        return '';
    }
  }

  /**
   * ARIAライブ領域用テキストを生成する
   */
  getAriaLiveText(state: GameState): string {
    const statusText = state.status === 'playing' ? 'playing' : state.status;
    return `Game ${statusText}, currently at action ${state.currentActionIndex + 1}`;
  }

  /**
   * アクションの動詞を取得する
   */
  private getActionVerb(action: Action): string {
    switch (action.type) {
      case 'blind':
        return 'posts blind';
      case 'ante':
        return 'posts ante';
      case 'bet':
        return 'bets';
      case 'raise':
        return 'raises';
      case 'call':
        return 'calls';
      case 'check':
        return 'checks';
      case 'fold':
        return 'folds';
      case 'show':
        return 'shows';
      case 'muck':
        return 'mucks';
      case 'deal':
        return 'deals';
      case 'collected':
        return 'collects';
      case 'uncalled':
        return 'returns uncalled bet';
      default:
        return action.type;
    }
  }

  /**
   * 単一カードの読み上げ用フォーマットを生成する
   */
  private formatCardForAnnouncement(card: string): string {
    if (card.length !== 2) {
      return card;
    }

    const rank = card[0];
    const suit = card[1];

    const rankName = this.getRankName(rank);
    const suitName = this.getSuitName(suit);

    return `${rankName} of ${suitName}`;
  }

  /**
   * ランクの名前を取得する
   */
  private getRankName(rank: string): string {
    switch (rank) {
      case 'A':
        return 'Ace';
      case 'K':
        return 'King';
      case 'Q':
        return 'Queen';
      case 'J':
        return 'Jack';
      case 'T':
        return 'Ten';
      default:
        return rank;
    }
  }

  /**
   * スートの名前を取得する
   */
  private getSuitName(suit: string): string {
    switch (suit) {
      case 'h':
        return 'hearts';
      case 'd':
        return 'diamonds';
      case 'c':
        return 'clubs';
      case 's':
        return 'spades';
      default:
        return suit;
    }
  }

  /**
   * 音声アナウンスを実行する
   */
  private announce(text: string): void {
    // 実際の実装では speechSynthesis API を使用するか、
    // screen reader 向けのライブ領域に出力する
    // テスト用にコンソール出力
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.volume = 0.5;
      window.speechSynthesis.speak(utterance);
    }
  }
}
