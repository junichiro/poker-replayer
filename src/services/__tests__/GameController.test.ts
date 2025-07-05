/**
 * GameController Service テスト
 * TDD approach - RED phase: テストを先に書く
 */

import { PokerHand } from '../../types';
import { GameController } from '../GameController';

describe('GameController', () => {
  const mockHand: PokerHand = {
    id: 'test-hand-1',
    stakes: '$1/$2',
    date: new Date('2023-01-01'),
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
      { index: 2, street: 'preflop', type: 'deal', cards: ['As', 'Kh'] },
      { index: 3, street: 'preflop', type: 'fold', player: 'Player1' },
    ],
    board: ['Ah', 'Kd', 'Qc', '4s', '2h'],
    pots: [{ amount: 3, players: ['Player2'] }],
  };

  describe('初期化', () => {
    test('PokerHandを受け取って初期化できる', () => {
      const controller = new GameController(mockHand);
      const state = controller.getGameState();

      expect(state.hand).toBe(mockHand);
      expect(state.currentActionIndex).toBe(-1);
      expect(state.isPlaying).toBe(false);
      expect(state.status).toBe('ready');
    });

    test('初期状態では最初のアクション前にいる', () => {
      const controller = new GameController(mockHand);
      expect(controller.getCurrentAction()).toBeNull();
    });
  });

  describe('再生制御', () => {
    describe('play()', () => {
      test('再生を開始できる', () => {
        const controller = new GameController(mockHand);
        controller.play();

        const state = controller.getGameState();
        expect(state.isPlaying).toBe(true);
        expect(state.status).toBe('playing');
      });

      test('既に再生中の場合は何もしない', () => {
        const controller = new GameController(mockHand);
        controller.play();
        const firstState = controller.getGameState();

        controller.play();
        const secondState = controller.getGameState();

        expect(firstState).toEqual(secondState);
      });

      test('最後のアクションに達している場合は再生しない', () => {
        const controller = new GameController(mockHand);
        // 最後まで進める
        while (controller.canStepForward()) {
          controller.stepForward();
        }

        controller.play();
        const state = controller.getGameState();
        expect(state.isPlaying).toBe(false);
        expect(state.status).toBe('ended');
      });
    });

    describe('pause()', () => {
      test('再生を一時停止できる', () => {
        const controller = new GameController(mockHand);
        controller.play();
        controller.pause();

        const state = controller.getGameState();
        expect(state.isPlaying).toBe(false);
        expect(state.status).toBe('paused');
      });

      test('再生していない時は何もしない', () => {
        const controller = new GameController(mockHand);
        controller.pause();

        const state = controller.getGameState();
        expect(state.status).toBe('ready');
      });
    });

    describe('stop()', () => {
      test('再生を停止して最初に戻る', () => {
        const controller = new GameController(mockHand);
        controller.stepForward();
        controller.stepForward();
        controller.play();

        controller.stop();

        const state = controller.getGameState();
        expect(state.isPlaying).toBe(false);
        expect(state.currentActionIndex).toBe(-1);
        expect(state.status).toBe('ready');
        expect(controller.getCurrentAction()).toBeNull();
      });
    });
  });

  describe('アクション移動', () => {
    describe('stepForward()', () => {
      test('次のアクションに進める', () => {
        const controller = new GameController(mockHand);
        const result = controller.stepForward();

        expect(result).toBe(true);
        expect(controller.getGameState().currentActionIndex).toBe(0);
        expect(controller.getCurrentAction()).toEqual(mockHand.actions[0]);
      });

      test('最後のアクションでは進めない', () => {
        const controller = new GameController(mockHand);
        // 最後まで進める
        while (controller.canStepForward()) {
          controller.stepForward();
        }

        const result = controller.stepForward();
        expect(result).toBe(false);
        expect(controller.getGameState().status).toBe('ended');
      });

      test('進むと再生が停止する', () => {
        const controller = new GameController(mockHand);
        controller.play();
        controller.stepForward();

        expect(controller.getGameState().isPlaying).toBe(false);
      });
    });

    describe('stepBackward()', () => {
      test('前のアクションに戻れる', () => {
        const controller = new GameController(mockHand);
        controller.stepForward();
        controller.stepForward();

        const result = controller.stepBackward();

        expect(result).toBe(true);
        expect(controller.getGameState().currentActionIndex).toBe(0);
      });

      test('最初のアクション前では戻れない', () => {
        const controller = new GameController(mockHand);
        const result = controller.stepBackward();

        expect(result).toBe(false);
        expect(controller.getGameState().currentActionIndex).toBe(-1);
      });

      test('戻ると再生が停止する', () => {
        const controller = new GameController(mockHand);
        controller.stepForward();
        controller.play();
        controller.stepBackward();

        expect(controller.getGameState().isPlaying).toBe(false);
      });
    });

    describe('goToAction()', () => {
      test('指定したアクションにジャンプできる', () => {
        const controller = new GameController(mockHand);
        controller.goToAction(2);

        expect(controller.getGameState().currentActionIndex).toBe(2);
        expect(controller.getCurrentAction()).toEqual(mockHand.actions[2]);
      });

      test('無効なインデックスは無視される', () => {
        const controller = new GameController(mockHand);
        controller.goToAction(-2);
        expect(controller.getGameState().currentActionIndex).toBe(-1);

        controller.goToAction(100);
        expect(controller.getGameState().currentActionIndex).toBe(-1);
      });

      test('ジャンプすると再生が停止する', () => {
        const controller = new GameController(mockHand);
        controller.play();
        controller.goToAction(2);

        expect(controller.getGameState().isPlaying).toBe(false);
      });
    });
  });

  describe('状態確認', () => {
    describe('canStepForward()', () => {
      test('次に進めるかを判定できる', () => {
        const controller = new GameController(mockHand);
        expect(controller.canStepForward()).toBe(true);

        // 最後まで進める
        while (controller.canStepForward()) {
          controller.stepForward();
        }

        expect(controller.canStepForward()).toBe(false);
      });
    });

    describe('canStepBackward()', () => {
      test('前に戻れるかを判定できる', () => {
        const controller = new GameController(mockHand);
        expect(controller.canStepBackward()).toBe(false);

        controller.stepForward();
        expect(controller.canStepBackward()).toBe(true);
      });
    });
  });

  describe('イベント購読', () => {
    test('状態変更を購読できる', () => {
      const controller = new GameController(mockHand);
      const listener = jest.fn();

      const unsubscribe = controller.subscribe(listener);

      controller.play();
      expect(listener).toHaveBeenCalledWith(controller.getGameState());

      controller.stepForward();
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      controller.pause();
      expect(listener).toHaveBeenCalledTimes(2); // 購読解除後は呼ばれない
    });

    test('複数のリスナーを登録できる', () => {
      const controller = new GameController(mockHand);
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      controller.subscribe(listener1);
      controller.subscribe(listener2);

      controller.play();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    test('アクションが空のハンドでも動作する', () => {
      const emptyHand: PokerHand = {
        ...mockHand,
        actions: [],
      };

      const controller = new GameController(emptyHand);
      expect(controller.canStepForward()).toBe(false);
      expect(controller.canStepBackward()).toBe(false);
      expect(controller.getGameState().status).toBe('ended');
    });
  });
});
