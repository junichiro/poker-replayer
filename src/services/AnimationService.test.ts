import { AnimationService } from './AnimationService';
import { Action, AnimationConfig } from '../types';

// Mock requestAnimationFrame and setTimeout
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

// Mock hand actions for testing
const createMockActions = (): Action[] => [
  { index: 0, street: 'preflop', type: 'blind', player: 'Player1', amount: 10 },
  { index: 1, street: 'preflop', type: 'blind', player: 'Player2', amount: 20 },
  { index: 2, street: 'preflop', type: 'call', player: 'Player1', amount: 10 },
  { index: 3, street: 'flop', type: 'check', player: 'Player1' },
  { index: 4, street: 'flop', type: 'bet', player: 'Player2', amount: 30 },
];

const createMockConfig = (): AnimationConfig => ({
  enableCardAnimations: true,
  enableChipAnimations: true,
  enableActionHighlight: true,
  cardDealDuration: 300,
  actionTransitionDuration: 200,
  easing: 'ease-out',
});

describe('AnimationService', () => {
  let animationService: AnimationService;
  let mockActions: Action[];
  let mockConfig: AnimationConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    mockActions = createMockActions();
    mockConfig = createMockConfig();
    animationService = new AnimationService(mockActions, mockConfig);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('アニメーション基本機能', () => {
    test('初期状態では停止している', () => {
      expect(animationService.isPlaying()).toBe(false);
      expect(animationService.getCurrentSpeed()).toBe(1.0);
      expect(animationService.getCurrentActionIndex()).toBe(-1);
    });

    test('プレイ開始でアニメーションが開始される', () => {
      const onStartCallback = jest.fn();
      animationService.subscribe('start', onStartCallback);

      animationService.play();

      expect(animationService.isPlaying()).toBe(true);
      expect(onStartCallback).toHaveBeenCalledWith({
        type: 'start',
        currentIndex: -1,
        totalActions: 5,
      });
    });

    test('一時停止でアニメーションが停止される', () => {
      const onProgressCallback = jest.fn();
      animationService.subscribe('progress', onProgressCallback);

      animationService.play();
      animationService.pause();

      expect(animationService.isPlaying()).toBe(false);
      expect(onProgressCallback).toHaveBeenCalledWith({
        type: 'pause',
        currentIndex: -1,
        totalActions: 5,
      });
    });

    test('停止でアニメーションが初期状態にリセットされる', () => {
      animationService.play();
      jest.advanceTimersByTime(1000);
      animationService.stop();

      expect(animationService.isPlaying()).toBe(false);
      expect(animationService.getCurrentActionIndex()).toBe(-1);
    });
  });

  describe('アニメーション速度制御', () => {
    test('速度を変更できる', () => {
      animationService.setSpeed(2.0);
      expect(animationService.getCurrentSpeed()).toBe(2.0);
    });

    test('無効な速度は無視される', () => {
      animationService.setSpeed(0);
      expect(animationService.getCurrentSpeed()).toBe(1.0);

      animationService.setSpeed(-1);
      expect(animationService.getCurrentSpeed()).toBe(1.0);
    });

    test('速度変更でタイマー間隔が更新される', () => {
      animationService.setSpeed(2.0);
      animationService.play();

      // 2.0倍速の場合、500ms間隔で進行するはず
      jest.advanceTimersByTime(500);
      expect(animationService.getCurrentActionIndex()).toBe(0);
    });
  });

  describe('アニメーションステップ制御', () => {
    test('前進でアクションインデックスが増加する', () => {
      const result = animationService.stepForward();

      expect(result).toBe(true);
      expect(animationService.getCurrentActionIndex()).toBe(0);
    });

    test('最後のアクションから前進できない', () => {
      animationService.goToAction(mockActions.length - 1);
      const result = animationService.stepForward();

      expect(result).toBe(false);
      expect(animationService.getCurrentActionIndex()).toBe(mockActions.length - 1);
    });

    test('後退でアクションインデックスが減少する', () => {
      animationService.stepForward();
      animationService.stepForward();
      const result = animationService.stepBackward();

      expect(result).toBe(true);
      expect(animationService.getCurrentActionIndex()).toBe(0);
    });

    test('最初のアクションから後退できない', () => {
      const result = animationService.stepBackward();

      expect(result).toBe(false);
      expect(animationService.getCurrentActionIndex()).toBe(-1);
    });

    test('特定のアクションに移動できる', () => {
      animationService.goToAction(3);
      expect(animationService.getCurrentActionIndex()).toBe(3);
    });
  });

  describe('アニメーション種類別制御', () => {
    test('カードアニメーションを個別に制御できる', async () => {
      const cardAction = { index: 0, street: 'preflop', type: 'deal', cards: ['As', 'Kh'] };
      const onCardAnimationCallback = jest.fn();
      animationService.subscribe('cardAnimation', onCardAnimationCallback);

      const animationPromise = animationService.playCardAnimation(cardAction);
      
      // Fast-forward through the animation duration
      jest.advanceTimersByTime(300);
      
      await animationPromise;

      expect(onCardAnimationCallback).toHaveBeenCalledWith({
        type: 'cardDeal',
        cards: ['As', 'Kh'],
        duration: 300,
      });
    });

    test('チップアニメーションを個別に制御できる', async () => {
      const chipAction = { index: 0, street: 'preflop', type: 'bet', player: 'Player1', amount: 50 };
      const onChipAnimationCallback = jest.fn();
      animationService.subscribe('chipAnimation', onChipAnimationCallback);

      const animationPromise = animationService.playChipAnimation(chipAction);
      
      // Fast-forward through the animation duration
      jest.advanceTimersByTime(200);
      
      await animationPromise;

      expect(onChipAnimationCallback).toHaveBeenCalledWith({
        type: 'chipMovement',
        player: 'Player1',
        amount: 50,
        duration: 200,
      });
    });

    test('アクションハイライトを個別に制御できる', async () => {
      const action = mockActions[0];
      const onHighlightCallback = jest.fn();
      animationService.subscribe('highlight', onHighlightCallback);

      const animationPromise = animationService.playActionHighlight(action);
      
      // Fast-forward through the animation duration
      jest.advanceTimersByTime(200);
      
      await animationPromise;

      expect(onHighlightCallback).toHaveBeenCalledWith({
        type: 'actionHighlight',
        player: 'Player1',
        actionType: 'blind',
        duration: 200,
      });
    });
  });

  describe('アニメーション設定', () => {
    test('設定に基づいてアニメーションが有効化される', () => {
      expect(animationService.isCardAnimationEnabled()).toBe(true);
      expect(animationService.isChipAnimationEnabled()).toBe(true);
      expect(animationService.isActionHighlightEnabled()).toBe(true);
    });

    test('設定を動的に変更できる', () => {
      const newConfig = { ...mockConfig, enableCardAnimations: false };
      animationService.updateConfig(newConfig);

      expect(animationService.isCardAnimationEnabled()).toBe(false);
      expect(animationService.isChipAnimationEnabled()).toBe(true);
    });

    test('アニメーション継続時間を取得できる', () => {
      expect(animationService.getCardDealDuration()).toBe(300);
      expect(animationService.getActionTransitionDuration()).toBe(200);
    });
  });

  describe('イベント通知システム', () => {
    test('アニメーション開始時にイベントが発火される', () => {
      const onStartCallback = jest.fn();
      animationService.subscribe('start', onStartCallback);

      animationService.play();

      expect(onStartCallback).toHaveBeenCalledWith({
        type: 'start',
        currentIndex: -1,
        totalActions: 5,
      });
    });

    test('アニメーション進行時にイベントが発火される', () => {
      const onProgressCallback = jest.fn();
      animationService.subscribe('progress', onProgressCallback);

      animationService.play();
      jest.advanceTimersByTime(1000);

      expect(onProgressCallback).toHaveBeenCalledWith({
        type: 'progress',
        currentIndex: 0,
        totalActions: 5,
      });
    });

    test('アニメーション完了時にイベントが発火される', () => {
      const onCompleteCallback = jest.fn();
      animationService.subscribe('complete', onCompleteCallback);

      animationService.play();
      jest.advanceTimersByTime(6000); // 全てのアクションを進める

      expect(onCompleteCallback).toHaveBeenCalledWith({
        type: 'complete',
        currentIndex: 4,
        totalActions: 5,
      });
    });

    test('購読解除が正常に動作する', () => {
      const onProgressCallback = jest.fn();
      const unsubscribe = animationService.subscribe('progress', onProgressCallback);

      unsubscribe();
      animationService.play();
      jest.advanceTimersByTime(1000);

      expect(onProgressCallback).not.toHaveBeenCalled();
    });
  });

  describe('アニメーション状態管理', () => {
    test('現在のアニメーション状態を取得できる', () => {
      const state = animationService.getAnimationState();

      expect(state).toEqual({
        isPlaying: false,
        currentActionIndex: -1,
        totalActions: 5,
        speed: 1.0,
        canStepForward: true,
        canStepBackward: false,
      });
    });

    test('アニメーション中の状態を正確に反映する', () => {
      animationService.play();
      jest.advanceTimersByTime(1000);

      const state = animationService.getAnimationState();

      expect(state.isPlaying).toBe(true);
      expect(state.currentActionIndex).toBe(0);
      expect(state.canStepForward).toBe(true);
      expect(state.canStepBackward).toBe(true);
    });
  });

  describe('パフォーマンス最適化', () => {
    test('アニメーション中断時にタイマーがクリアされる', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      animationService.play();
      animationService.pause();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    test('サービス破棄時にリソースがクリーンアップされる', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      animationService.play();
      animationService.destroy();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(animationService.isPlaying()).toBe(false);
    });
  });

  describe('エラー処理', () => {
    test('無効なアクションでもエラーが発生しない', () => {
      expect(() => {
        animationService.goToAction(-1);
      }).not.toThrow();

      expect(() => {
        animationService.goToAction(999);
      }).not.toThrow();
    });

    test('空のアクション配列でも正常に動作する', () => {
      const emptyService = new AnimationService([], mockConfig);

      expect(emptyService.isPlaying()).toBe(false);
      expect(emptyService.getCurrentActionIndex()).toBe(-1);
      expect(emptyService.stepForward()).toBe(false);
    });
  });
});