import { PlayerStateTracker } from './PlayerStateTracker';

describe('PlayerStateTracker', () => {
  let tracker: PlayerStateTracker;

  beforeEach(() => {
    tracker = new PlayerStateTracker();
  });

  describe('プレイヤー初期化', () => {
    test('プレイヤーを初期チップ量で初期化できる', () => {
      tracker.initializePlayer('Player1', 1000);
      
      expect(tracker.getPlayerChips('Player1')).toBe(1000);
      expect(tracker.getActivePlayers()).toContain('Player1');
    });

    test('複数のプレイヤーを初期化できる', () => {
      tracker.initializePlayer('Player1', 1000);
      tracker.initializePlayer('Player2', 2000);
      
      expect(tracker.getPlayerChips('Player1')).toBe(1000);
      expect(tracker.getPlayerChips('Player2')).toBe(2000);
      expect(tracker.getActivePlayers().size).toBe(2);
    });
  });

  describe('チップ追跡', () => {
    test('プレイヤーのチップ量を更新できる', () => {
      tracker.initializePlayer('Player1', 1000);
      tracker.trackPlayerChips('Player1', 800);
      
      expect(tracker.getPlayerChips('Player1')).toBe(800);
    });

    test('存在しないプレイヤーのチップを取得すると0が返される', () => {
      expect(tracker.getPlayerChips('NonExistent')).toBe(0);
    });

    test('負のチップ量は0に制限される', () => {
      tracker.initializePlayer('Player1', 100);
      tracker.trackPlayerChips('Player1', -50);
      
      expect(tracker.getPlayerChips('Player1')).toBe(0);
    });
  });

  describe('オールイン追跡', () => {
    test('プレイヤーをオールインとしてマークできる', () => {
      tracker.initializePlayer('Player1', 1000);
      tracker.markPlayerAllIn('Player1', 500);
      
      expect(tracker.getAllInPlayers().get('Player1')).toBe(500);
      expect(tracker.getActivePlayers()).not.toContain('Player1');
    });

    test('複数のプレイヤーのオールインを追跡できる', () => {
      tracker.initializePlayer('Player1', 1000);
      tracker.initializePlayer('Player2', 2000);
      
      tracker.markPlayerAllIn('Player1', 500);
      tracker.markPlayerAllIn('Player2', 1000);
      
      expect(tracker.getAllInPlayers().size).toBe(2);
      expect(tracker.getAllInPlayers().get('Player1')).toBe(500);
      expect(tracker.getAllInPlayers().get('Player2')).toBe(1000);
    });
  });

  describe('アクティブプレイヤー管理', () => {
    test('プレイヤーをアクティブリストから削除できる', () => {
      tracker.initializePlayer('Player1', 1000);
      tracker.initializePlayer('Player2', 2000);
      
      tracker.removeActivePlayer('Player1');
      
      expect(tracker.getActivePlayers()).not.toContain('Player1');
      expect(tracker.getActivePlayers()).toContain('Player2');
    });

    test('フォールドしたプレイヤーはアクティブリストから削除される', () => {
      tracker.initializePlayer('Player1', 1000);
      expect(tracker.getActivePlayers()).toContain('Player1');
      
      tracker.removeActivePlayer('Player1');
      expect(tracker.getActivePlayers()).not.toContain('Player1');
    });
  });

  describe('状態リセット', () => {
    test('リセット後、全ての状態がクリアされる', () => {
      tracker.initializePlayer('Player1', 1000);
      tracker.markPlayerAllIn('Player1', 500);
      tracker.initializePlayer('Player2', 2000);
      tracker.removeActivePlayer('Player2');
      
      tracker.reset();
      
      expect(tracker.getPlayerChips('Player1')).toBe(0);
      expect(tracker.getAllInPlayers().size).toBe(0);
      expect(tracker.getActivePlayers().size).toBe(0);
    });
  });

  describe('状態確認', () => {
    test('プレイヤーがオールインかどうか確認できる', () => {
      tracker.initializePlayer('Player1', 1000);
      tracker.initializePlayer('Player2', 2000);
      
      tracker.markPlayerAllIn('Player1', 500);
      
      expect(tracker.isPlayerAllIn('Player1')).toBe(true);
      expect(tracker.isPlayerAllIn('Player2')).toBe(false);
    });

    test('プレイヤーがアクティブかどうか確認できる', () => {
      tracker.initializePlayer('Player1', 1000);
      tracker.initializePlayer('Player2', 2000);
      
      tracker.removeActivePlayer('Player1');
      
      expect(tracker.isPlayerActive('Player1')).toBe(false);
      expect(tracker.isPlayerActive('Player2')).toBe(true);
    });
  });
});