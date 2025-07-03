import { ActionParser } from './ActionParser';
import { ActionType, Street } from '../types';

describe('ActionParser', () => {
  let actionParser: ActionParser;

  beforeEach(() => {
    actionParser = new ActionParser();
  });

  describe('標準アクション解析', () => {
    test('フォールドアクションを正しく解析できる', () => {
      const line = 'Player1: folds';
      const action = actionParser.parseAction(line, 'preflop');

      expect(action).not.toBeNull();
      expect(action?.type).toBe('fold');
      expect(action?.player).toBe('Player1');
      expect(action?.amount).toBeUndefined();
    });

    test('チェックアクションを正しく解析できる', () => {
      const line = 'Player2: checks';
      const action = actionParser.parseAction(line, 'flop');

      expect(action?.type).toBe('check');
      expect(action?.player).toBe('Player2');
      expect(action?.street).toBe('flop');
    });

    test('コールアクションを正しく解析できる', () => {
      const line = 'Player3: calls $50';
      const action = actionParser.parseAction(line, 'preflop');

      expect(action?.type).toBe('call');
      expect(action?.player).toBe('Player3');
      expect(action?.amount).toBe(50);
    });

    test('ベットアクションを正しく解析できる', () => {
      const line = 'Player4: bets $100.50';
      const action = actionParser.parseAction(line, 'turn');

      expect(action?.type).toBe('bet');
      expect(action?.player).toBe('Player4');
      expect(action?.amount).toBe(100.50);
    });

    test('レイズアクションを正しく解析できる', () => {
      const line = 'Player5: raises $25 to $75';
      const action = actionParser.parseAction(line, 'river');

      expect(action?.type).toBe('raise');
      expect(action?.player).toBe('Player5');
      expect(action?.amount).toBe(75);
    });
  });

  describe('オールインアクション解析', () => {
    test('オールインコールを正しく解析できる', () => {
      const line = 'Player1: calls $200 and is all-in';
      const action = actionParser.parseAction(line, 'preflop');

      expect(action?.type).toBe('call');
      expect(action?.player).toBe('Player1');
      expect(action?.amount).toBe(200);
      expect(action?.isAllIn).toBe(true);
    });

    test('オールインベットを正しく解析できる', () => {
      const line = 'Player2: bets $150 and is all-in';
      const action = actionParser.parseAction(line, 'flop');

      expect(action?.type).toBe('bet');
      expect(action?.isAllIn).toBe(true);
    });

    test('オールインレイズを正しく解析できる', () => {
      const line = 'Player3: raises $50 to $300 and is all-in';
      const action = actionParser.parseAction(line, 'turn');

      expect(action?.type).toBe('raise');
      expect(action?.amount).toBe(300);
      expect(action?.isAllIn).toBe(true);
    });
  });

  describe('特殊アクション解析', () => {
    test('アンコールベットを正しく解析できる', () => {
      const line = 'Uncalled bet ($50) returned to Player1';
      const action = actionParser.parseAction(line, 'river');

      expect(action?.type).toBe('uncalled');
      expect(action?.player).toBe('Player1');
      expect(action?.amount).toBe(50);
    });

    test('ポット回収を正しく解析できる', () => {
      const line = 'Player2 collected $200 from pot';
      const action = actionParser.parseAction(line, 'showdown');

      expect(action?.type).toBe('collected');
      expect(action?.player).toBe('Player2');
      expect(action?.amount).toBe(200);
    });

    test('マックを正しく解析できる', () => {
      const line = 'Player3: mucks hand';
      const action = actionParser.parseAction(line, 'showdown');

      expect(action?.type).toBe('muck');
      expect(action?.player).toBe('Player3');
    });

    test('タイムアウトを正しく解析できる', () => {
      const line = 'Player4 has timed out';
      const action = actionParser.parseAction(line, 'preflop');

      expect(action?.type).toBe('timeout');
      expect(action?.player).toBe('Player4');
      expect(action?.reason).toBe('Player timed out');
    });
  });

  describe('無効な行の処理', () => {
    test('認識できない行はnullを返す', () => {
      const line = 'Some random text that is not an action';
      const action = actionParser.parseAction(line, 'preflop');

      expect(action).toBeNull();
    });

    test('空の行はnullを返す', () => {
      const action = actionParser.parseAction('', 'preflop');

      expect(action).toBeNull();
    });
  });

  describe('アクション作成', () => {
    test('基本的なアクションを作成できる', () => {
      const action = actionParser.createAction('fold', 'Player1', undefined, 'preflop');

      expect(action.type).toBe('fold');
      expect(action.player).toBe('Player1');
      expect(action.street).toBe('preflop');
      expect(action.index).toBe(0);
    });

    test('金額付きアクションを作成できる', () => {
      const action = actionParser.createAction('bet', 'Player2', 100, 'flop');

      expect(action.type).toBe('bet');
      expect(action.player).toBe('Player2');
      expect(action.amount).toBe(100);
      expect(action.street).toBe('flop');
    });

    test('連続したアクションのインデックスが増加する', () => {
      const action1 = actionParser.createAction('fold', 'Player1');
      const action2 = actionParser.createAction('call', 'Player2');

      expect(action1.index).toBe(0);
      expect(action2.index).toBe(1);
    });
  });

  describe('コレクションアクション抽出', () => {
    test('ハンドヒストリーからコレクションアクションを抽出できる', () => {
      const lines = [
        'Player1 collected $100 from main pot',
        'Player2 collected $50 from side pot',
        'Player3 collected $75 from pot',
        'Seat 1: Player4 (button) collected ($25)',
      ];

      const collectedActions = actionParser.extractCollectedActions(lines);

      expect(collectedActions).toHaveLength(4);
      expect(collectedActions[0]).toEqual({
        player: 'Player1',
        amount: 100,
        type: 'main'
      });
      expect(collectedActions[1]).toEqual({
        player: 'Player2',
        amount: 50,
        type: 'side'
      });
      expect(collectedActions[2]).toEqual({
        player: 'Player3',
        amount: 75,
        type: 'single'
      });
      expect(collectedActions[3]).toEqual({
        player: 'Player4',
        amount: 25,
        type: 'single'
      });
    });

    test('サイドポットレベルを正しく抽出できる', () => {
      const lines = [
        'Player1 collected $100 from side pot-2'
      ];

      const collectedActions = actionParser.extractCollectedActions(lines);

      expect(collectedActions[0].sidePotLevel).toBe(2);
    });

    test('重複するコレクションアクションは除外される', () => {
      const lines = [
        'Player1 collected $100 from pot',
        'Player1 collected $100 from pot', // 重複
      ];

      const collectedActions = actionParser.extractCollectedActions(lines);

      expect(collectedActions).toHaveLength(1);
    });
  });
});