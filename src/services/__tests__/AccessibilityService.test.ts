/**
 * AccessibilityService テスト
 * TDD approach - RED phase: テストを先に書く
 */

import { Action, PokerHand } from '../../types';
import { AccessibilityService } from '../AccessibilityService';

describe('AccessibilityService', () => {
  const mockAction: Action = {
    index: 0,
    street: 'preflop',
    type: 'bet',
    player: 'TestPlayer',
    amount: 100,
  };

  const mockGameState = {
    hand: {} as PokerHand,
    currentActionIndex: 0,
    isPlaying: false,
    status: 'ready' as const,
  };

  describe('初期化', () => {
    test('デフォルト設定で初期化できる', () => {
      const service = new AccessibilityService();
      expect(service).toBeInstanceOf(AccessibilityService);
    });
  });

  describe('announceAction()', () => {
    test('アクションをアナウンスできる', () => {
      const service = new AccessibilityService();
      // アナウンス機能のモック
      const announceSpy = jest.spyOn(service as never, 'announce').mockImplementation();

      service.announceAction(mockAction);

      expect(announceSpy).toHaveBeenCalledWith('TestPlayer bets $100');
    });

    test('プレイヤーがないアクションでもアナウンスできる', () => {
      const service = new AccessibilityService();
      const announceSpy = jest.spyOn(service as never, 'announce').mockImplementation();

      const systemAction: Action = {
        index: 0,
        street: 'flop',
        type: 'deal',
        cards: ['Ah', 'Kd', 'Qc'],
      };

      service.announceAction(systemAction);

      expect(announceSpy).toHaveBeenCalledWith('System deals flop: Ah, Kd, Qc');
    });
  });

  describe('announceGameState()', () => {
    test('ゲーム状態をアナウンスできる', () => {
      const service = new AccessibilityService();
      const announceSpy = jest.spyOn(service as never, 'announce').mockImplementation();

      service.announceGameState(mockGameState);

      expect(announceSpy).toHaveBeenCalledWith('Game ready, currently at action 1');
    });

    test('再生中の状態をアナウンスできる', () => {
      const service = new AccessibilityService();
      const announceSpy = jest.spyOn(service as never, 'announce').mockImplementation();

      const playingState = { ...mockGameState, isPlaying: true, status: 'playing' as const };
      service.announceGameState(playingState);

      expect(announceSpy).toHaveBeenCalledWith('Game playing, currently at action 1');
    });
  });

  describe('getActionDescription()', () => {
    test('ベットアクションの説明を取得できる', () => {
      const service = new AccessibilityService();
      const description = service.getActionDescription(mockAction);

      expect(description).toBe('TestPlayer bets $100');
    });

    test('オールインアクションの説明を取得できる', () => {
      const service = new AccessibilityService();
      const allInAction: Action = {
        ...mockAction,
        isAllIn: true,
      };

      const description = service.getActionDescription(allInAction);

      expect(description).toBe('TestPlayer bets $100 and is all-in');
    });

    test('ディールアクションの説明を取得できる', () => {
      const service = new AccessibilityService();
      const dealAction: Action = {
        index: 0,
        street: 'flop',
        type: 'deal',
        cards: ['Ah', 'Kd', 'Qc'],
      };

      const description = service.getActionDescription(dealAction);

      expect(description).toBe('System deals flop: Ah, Kd, Qc');
    });
  });

  describe('getKeyboardShortcuts()', () => {
    test('キーボードショートカットリストを取得できる', () => {
      const service = new AccessibilityService();
      const shortcuts = service.getKeyboardShortcuts();

      expect(shortcuts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'Space',
            description: 'Play/Pause',
            action: 'playPause',
          }),
          expect.objectContaining({
            key: 'ArrowLeft',
            description: 'Previous action',
            action: 'previous',
          }),
          expect.objectContaining({
            key: 'ArrowRight',
            description: 'Next action',
            action: 'next',
          }),
          expect.objectContaining({
            key: 'r',
            description: 'Reset to beginning',
            action: 'reset',
          }),
        ])
      );
    });
  });

  describe('handleKeyboardNavigation()', () => {
    test('スペースキーでplay/pauseハンドラを呼び出す', () => {
      const service = new AccessibilityService();
      const mockHandler = jest.fn();
      service.setKeyboardHandler('playPause', mockHandler);

      const event = new KeyboardEvent('keydown', { key: ' ' });
      const handled = service.handleKeyboardNavigation(event);

      expect(handled).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    test('左矢印キーでpreviousハンドラを呼び出す', () => {
      const service = new AccessibilityService();
      const mockHandler = jest.fn();
      service.setKeyboardHandler('previous', mockHandler);

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      const handled = service.handleKeyboardNavigation(event);

      expect(handled).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    test('右矢印キーでnextハンドラを呼び出す', () => {
      const service = new AccessibilityService();
      const mockHandler = jest.fn();
      service.setKeyboardHandler('next', mockHandler);

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const handled = service.handleKeyboardNavigation(event);

      expect(handled).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    test('rキーでresetハンドラを呼び出す', () => {
      const service = new AccessibilityService();
      const mockHandler = jest.fn();
      service.setKeyboardHandler('reset', mockHandler);

      const event = new KeyboardEvent('keydown', { key: 'r' });
      const handled = service.handleKeyboardNavigation(event);

      expect(handled).toBe(true);
      expect(mockHandler).toHaveBeenCalled();
    });

    test('未対応のキーでは何もしない', () => {
      const service = new AccessibilityService();

      const event = new KeyboardEvent('keydown', { key: 'z' });
      const handled = service.handleKeyboardNavigation(event);

      expect(handled).toBe(false);
    });

    test('ハンドラが設定されていない場合は何もしない', () => {
      const service = new AccessibilityService();

      const event = new KeyboardEvent('keydown', { key: ' ' });
      const handled = service.handleKeyboardNavigation(event);

      expect(handled).toBe(false);
    });
  });

  describe('スクリーンリーダー対応', () => {
    test('アクションの詳細な説明を生成できる', () => {
      const service = new AccessibilityService();
      const verboseDescription = service.getActionDescription(mockAction, true);

      expect(verboseDescription).toContain('TestPlayer');
      expect(verboseDescription).toContain('bets');
      expect(verboseDescription).toContain('$100');
      expect(verboseDescription).toContain('preflop');
    });

    test('カードの読み上げ用フォーマットを生成できる', () => {
      const service = new AccessibilityService();
      const formattedCards = service.formatCardsForAnnouncement(['Ah', 'Kd', 'Qc']);

      expect(formattedCards).toBe('Ace of hearts, King of diamonds, Queen of clubs');
    });

    test('ポット金額の読み上げ用フォーマットを生成できる', () => {
      const service = new AccessibilityService();
      const formattedAmount = service.formatAmountForAnnouncement(1500);

      expect(formattedAmount).toBe('1 thousand 5 hundred dollars');
    });
  });

  describe('音声アナウンス設定', () => {
    test('音声アナウンスを有効/無効にできる', () => {
      const service = new AccessibilityService();

      expect(service.isAnnouncementEnabled()).toBe(true); // デフォルトは有効

      service.setAnnouncementEnabled(false);
      expect(service.isAnnouncementEnabled()).toBe(false);

      service.setAnnouncementEnabled(true);
      expect(service.isAnnouncementEnabled()).toBe(true);
    });

    test('音声アナウンスが無効の場合はアナウンスしない', () => {
      const service = new AccessibilityService();
      service.setAnnouncementEnabled(false);

      const announceSpy = jest.spyOn(service as never, 'announce').mockImplementation();

      service.announceAction(mockAction);

      expect(announceSpy).not.toHaveBeenCalled();
    });
  });

  describe('ARIA対応', () => {
    test('適切なARIAラベルを生成できる', () => {
      const service = new AccessibilityService();
      const ariaLabel = service.getAriaLabel('action', mockAction);

      expect(ariaLabel).toBe('Action: TestPlayer bets $100');
    });

    test('ゲーム状態のARIAライブ領域テキストを生成できる', () => {
      const service = new AccessibilityService();
      const liveText = service.getAriaLiveText(mockGameState);

      expect(liveText).toBe('Game ready, currently at action 1');
    });
  });
});
