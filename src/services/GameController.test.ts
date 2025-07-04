import { PokerHand } from '../types';

import { GameController } from './GameController';

// Mock hand data for testing
const createMockHand = (): PokerHand => ({
  id: 'test-hand',
  stakes: '$1/$2',
  date: new Date(),
  table: {
    name: 'Test Table',
    maxSeats: 6,
    buttonSeat: 1,
  },
  players: [
    { seat: 1, name: 'Player1', chips: 100 },
    { seat: 2, name: 'Player2', chips: 200 },
  ],
  actions: [
    { index: 0, street: 'preflop', type: 'blind', player: 'Player1', amount: 1 },
    { index: 1, street: 'preflop', type: 'blind', player: 'Player2', amount: 2 },
    { index: 2, street: 'preflop', type: 'call', player: 'Player1', amount: 1 },
    { index: 3, street: 'preflop', type: 'check', player: 'Player2' },
  ],
  board: [],
  pots: [{ amount: 4, players: ['Player1'], eligiblePlayers: ['Player1', 'Player2'] }],
});

describe('GameController', () => {
  let gameController: GameController;
  let mockHand: PokerHand;

  beforeEach(() => {
    mockHand = createMockHand();
    gameController = new GameController(mockHand);
  });

  describe('ゲーム制御の基本機能', () => {
    test('初期状態では停止している', () => {
      const state = gameController.getGameState();

      expect(state.isPlaying).toBe(false);
      expect(state.currentActionIndex).toBe(-1);
      expect(state.canStepForward).toBe(true);
      expect(state.canStepBackward).toBe(false);
    });

    test('プレイ開始で状態が変更される', () => {
      gameController.play();
      const state = gameController.getGameState();

      expect(state.isPlaying).toBe(true);
    });

    test('一時停止で状態が変更される', () => {
      gameController.play();
      gameController.pause();
      const state = gameController.getGameState();

      expect(state.isPlaying).toBe(false);
    });

    test('停止でゲームが初期状態にリセットされる', () => {
      gameController.stepForward();
      gameController.stepForward();
      gameController.stop();

      const state = gameController.getGameState();
      expect(state.currentActionIndex).toBe(-1);
      expect(state.isPlaying).toBe(false);
    });
  });

  describe('アクション進行制御', () => {
    test('前進できる場合はtrueを返し、インデックスが増加する', () => {
      const result = gameController.stepForward();

      expect(result).toBe(true);
      expect(gameController.getGameState().currentActionIndex).toBe(0);
    });

    test('最後のアクションから前進できない', () => {
      // 全てのアクションを進める
      for (let i = 0; i < mockHand.actions.length; i++) {
        gameController.stepForward();
      }

      const result = gameController.stepForward();
      expect(result).toBe(false);
      expect(gameController.getGameState().currentActionIndex).toBe(mockHand.actions.length - 1);
    });

    test('後退できる場合はtrueを返し、インデックスが減少する', () => {
      gameController.stepForward();
      gameController.stepForward();

      const result = gameController.stepBackward();

      expect(result).toBe(true);
      expect(gameController.getGameState().currentActionIndex).toBe(0);
    });

    test('最初のアクションから後退できない', () => {
      const result = gameController.stepBackward();

      expect(result).toBe(false);
      expect(gameController.getGameState().currentActionIndex).toBe(-1);
    });
  });

  describe('特定アクションへの移動', () => {
    test('有効なインデックスに移動できる', () => {
      gameController.goToAction(2);

      expect(gameController.getGameState().currentActionIndex).toBe(2);
    });

    test('無効なインデックスは無視される', () => {
      const originalIndex = gameController.getGameState().currentActionIndex;

      gameController.goToAction(-1);
      expect(gameController.getGameState().currentActionIndex).toBe(originalIndex);

      gameController.goToAction(999);
      expect(gameController.getGameState().currentActionIndex).toBe(originalIndex);
    });

    test('インデックス移動により移動可能状態が更新される', () => {
      gameController.goToAction(0);
      let state = gameController.getGameState();
      expect(state.canStepBackward).toBe(true); // Can go back to -1
      expect(state.canStepForward).toBe(true);

      gameController.goToAction(mockHand.actions.length - 1);
      state = gameController.getGameState();
      expect(state.canStepBackward).toBe(true);
      expect(state.canStepForward).toBe(false);
    });
  });

  describe('現在のアクション取得', () => {
    test('初期状態ではnullを返す', () => {
      expect(gameController.getCurrentAction()).toBeNull();
    });

    test('有効なアクションインデックスで正しいアクションを返す', () => {
      gameController.stepForward();

      const currentAction = gameController.getCurrentAction();
      expect(currentAction).toEqual(mockHand.actions[0]);
    });

    test('最後のアクションでも正しく取得できる', () => {
      gameController.goToAction(mockHand.actions.length - 1);

      const currentAction = gameController.getCurrentAction();
      expect(currentAction).toEqual(mockHand.actions[mockHand.actions.length - 1]);
    });
  });

  describe('状態変更通知', () => {
    test('状態変更時にリスナーが呼び出される', () => {
      const listener = jest.fn();
      gameController.subscribe(listener);

      gameController.play();

      expect(listener).toHaveBeenCalledWith(gameController.getGameState());
    });

    test('複数リスナーが登録・通知される', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      gameController.subscribe(listener1);
      gameController.subscribe(listener2);

      gameController.stepForward();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    test('購読解除により通知が停止する', () => {
      const listener = jest.fn();
      const unsubscribe = gameController.subscribe(listener);

      unsubscribe();
      gameController.play();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('移動可能性判定', () => {
    test('canStepForwardが正しく計算される', () => {
      expect(gameController.canStepForward()).toBe(true);

      gameController.goToAction(mockHand.actions.length - 1);
      expect(gameController.canStepForward()).toBe(false);
    });

    test('canStepBackwardが正しく計算される', () => {
      expect(gameController.canStepBackward()).toBe(false);

      gameController.stepForward();
      expect(gameController.canStepBackward()).toBe(true);
    });
  });

  describe('異なるハンドでの動作', () => {
    test('空のアクション配列でも正常に動作する', () => {
      const emptyHand = { ...mockHand, actions: [] };
      const controller = new GameController(emptyHand);

      expect(controller.canStepForward()).toBe(false);
      expect(controller.canStepBackward()).toBe(false);
      expect(controller.getCurrentAction()).toBeNull();
    });

    test('単一アクションのハンドで正常に動作する', () => {
      const singleActionHand = {
        ...mockHand,
        actions: [mockHand.actions[0]],
      };
      const controller = new GameController(singleActionHand);

      expect(controller.canStepForward()).toBe(true);
      controller.stepForward();
      expect(controller.canStepForward()).toBe(false);
      expect(controller.canStepBackward()).toBe(true); // Can go back to -1
    });
  });
});
