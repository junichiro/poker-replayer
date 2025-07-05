/**
 * AnimationService テスト
 * TDD approach - RED phase: テストを先に書く
 */

import { Action, AnimationConfig } from '../../types';
import { AnimationService } from '../AnimationService';

describe('AnimationService', () => {
  const mockActions: Action[] = [
    { index: 0, street: 'preflop', type: 'blind', player: 'Player1', amount: 1 },
    { index: 1, street: 'preflop', type: 'blind', player: 'Player2', amount: 2 },
    { index: 2, street: 'preflop', type: 'deal', cards: ['As', 'Kh'] },
    { index: 3, street: 'preflop', type: 'fold', player: 'Player1' },
  ];

  const defaultConfig: AnimationConfig = {
    enableCardAnimations: true,
    enableChipAnimations: true,
    enableActionHighlight: true,
    cardDealDuration: 300,
    actionTransitionDuration: 150,
    easing: 'ease-in-out',
  };

  describe('初期化', () => {
    test('デフォルト設定で初期化できる', () => {
      const service = new AnimationService(mockActions);
      const state = service.getAnimationState();

      expect(state.isPlaying).toBe(false);
      expect(state.currentActionIndex).toBe(-1);
      expect(state.totalActions).toBe(4);
      expect(state.speed).toBe(1.0);
    });

    test('カスタム設定で初期化できる', () => {
      const customConfig = { ...defaultConfig, cardDealDuration: 500 };
      const service = new AnimationService(mockActions, customConfig);

      expect(service.getCardDealDuration()).toBe(500);
    });
  });

  describe('再生制御', () => {
    describe('play()', () => {
      test('アニメーションを開始できる', () => {
        const service = new AnimationService(mockActions);
        service.play();

        expect(service.isPlaying()).toBe(true);
      });

      test('既に再生中の場合は何もしない', () => {
        const service = new AnimationService(mockActions);
        service.play();
        const firstState = service.getAnimationState();

        service.play();
        const secondState = service.getAnimationState();

        expect(firstState).toEqual(secondState);
      });
    });

    describe('pause()', () => {
      test('アニメーションを一時停止できる', () => {
        const service = new AnimationService(mockActions);
        service.play();
        service.pause();

        expect(service.isPlaying()).toBe(false);
      });
    });

    describe('stop()', () => {
      test('アニメーションを停止して最初に戻る', () => {
        const service = new AnimationService(mockActions);
        service.stepForward();
        service.play();

        service.stop();

        expect(service.isPlaying()).toBe(false);
        expect(service.getCurrentActionIndex()).toBe(-1);
      });
    });
  });

  describe('ステップ制御', () => {
    describe('stepForward()', () => {
      test('次のアクションに進める', () => {
        const service = new AnimationService(mockActions);
        const result = service.stepForward();

        expect(result).toBe(true);
        expect(service.getCurrentActionIndex()).toBe(0);
      });

      test('最後のアクションでは進めない', () => {
        const service = new AnimationService(mockActions);
        // 最後まで進める
        while (service.stepForward()) {
          // 空のループ
        }

        const result = service.stepForward();
        expect(result).toBe(false);
      });
    });

    describe('stepBackward()', () => {
      test('前のアクションに戻れる', () => {
        const service = new AnimationService(mockActions);
        service.stepForward();
        service.stepForward();

        const result = service.stepBackward();

        expect(result).toBe(true);
        expect(service.getCurrentActionIndex()).toBe(0);
      });

      test('最初のアクション前では戻れない', () => {
        const service = new AnimationService(mockActions);
        const result = service.stepBackward();

        expect(result).toBe(false);
        expect(service.getCurrentActionIndex()).toBe(-1);
      });
    });

    describe('goToAction()', () => {
      test('指定したアクションにジャンプできる', () => {
        const service = new AnimationService(mockActions);
        service.goToAction(2);

        expect(service.getCurrentActionIndex()).toBe(2);
      });

      test('無効なインデックスは無視される', () => {
        const service = new AnimationService(mockActions);
        service.goToAction(-2);
        expect(service.getCurrentActionIndex()).toBe(-1);

        service.goToAction(100);
        expect(service.getCurrentActionIndex()).toBe(-1);
      });
    });
  });

  describe('アニメーション速度制御', () => {
    test('アニメーション速度を設定できる', () => {
      const service = new AnimationService(mockActions);
      service.setSpeed(2.0);

      expect(service.getCurrentSpeed()).toBe(2.0);
      expect(service.getAnimationState().speed).toBe(2.0);
    });

    test('無効な速度は無視される', () => {
      const service = new AnimationService(mockActions);
      service.setSpeed(-1);
      expect(service.getCurrentSpeed()).toBe(1.0);

      service.setSpeed(0);
      expect(service.getCurrentSpeed()).toBe(1.0);
    });
  });

  describe('個別アニメーション', () => {
    describe('playCardAnimation()', () => {
      test('カードアニメーションを再生できる', async () => {
        const service = new AnimationService(mockActions, defaultConfig);
        const dealAction = mockActions[2]; // deal action

        const promise = service.playCardAnimation(dealAction);
        expect(promise).toBeInstanceOf(Promise);

        await promise; // アニメーション完了まで待機
      });

      test('カードアニメーションが無効の場合は即座に完了', async () => {
        const configWithoutCards = { ...defaultConfig, enableCardAnimations: false };
        const service = new AnimationService(mockActions, configWithoutCards);
        const dealAction = mockActions[2];

        const startTime = Date.now();
        await service.playCardAnimation(dealAction);
        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(50); // 即座に完了
      });
    });

    describe('playChipAnimation()', () => {
      test('チップアニメーションを再生できる', async () => {
        const service = new AnimationService(mockActions, defaultConfig);
        const betAction = mockActions[0]; // blind action

        const promise = service.playChipAnimation(betAction);
        expect(promise).toBeInstanceOf(Promise);

        await promise;
      });

      test('チップアニメーションが無効の場合は即座に完了', async () => {
        const configWithoutChips = { ...defaultConfig, enableChipAnimations: false };
        const service = new AnimationService(mockActions, configWithoutChips);
        const betAction = mockActions[0];

        const startTime = Date.now();
        await service.playChipAnimation(betAction);
        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(50);
      });
    });

    describe('playActionHighlight()', () => {
      test('アクションハイライトアニメーションを再生できる', async () => {
        const service = new AnimationService(mockActions, defaultConfig);
        const foldAction = mockActions[3];

        await service.playActionHighlight(foldAction);
      });
    });
  });

  describe('設定', () => {
    describe('isCardAnimationEnabled()', () => {
      test('カードアニメーション有効状態を取得できる', () => {
        const service = new AnimationService(mockActions, defaultConfig);
        expect(service.isCardAnimationEnabled()).toBe(true);

        const disabledConfig = { ...defaultConfig, enableCardAnimations: false };
        const disabledService = new AnimationService(mockActions, disabledConfig);
        expect(disabledService.isCardAnimationEnabled()).toBe(false);
      });
    });

    describe('updateConfig()', () => {
      test('設定を更新できる', () => {
        const service = new AnimationService(mockActions, defaultConfig);
        expect(service.getCardDealDuration()).toBe(300);

        service.updateConfig({ cardDealDuration: 600 });
        expect(service.getCardDealDuration()).toBe(600);
      });
    });
  });

  describe('イベント購読', () => {
    test('アニメーションイベントを購読できる', () => {
      const service = new AnimationService(mockActions);
      const listener = jest.fn();

      const unsubscribe = service.subscribe('start', listener);

      service.play();
      expect(listener).toHaveBeenCalled();

      unsubscribe();
      service.stop();
      service.play();
      expect(listener).toHaveBeenCalledTimes(1); // 購読解除後は呼ばれない
    });
  });

  describe('リソース管理', () => {
    test('destroyでリソースを解放できる', () => {
      const service = new AnimationService(mockActions);
      const listener = jest.fn();

      service.subscribe('start', listener);
      service.destroy();

      // destroy後は動作しない
      service.play();
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    test('アクションが空の場合でも動作する', () => {
      const service = new AnimationService([]);
      expect(service.getCurrentActionIndex()).toBe(-1);
      expect(service.stepForward()).toBe(false);
      expect(service.stepBackward()).toBe(false);
    });
  });
});
