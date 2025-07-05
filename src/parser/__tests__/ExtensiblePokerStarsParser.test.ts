/**
 * ExtensiblePokerStarsParser テスト
 * TDD approach - GREEN phase: 新しい OCP 準拠パーサーをテストする
 */

import { PokerSiteFormat, PokerFeature } from '../../types';
import { ExtensiblePokerStarsParser } from '../ExtensiblePokerStarsParser';

describe('ExtensiblePokerStarsParser', () => {
  const samplePokerStarsHand = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 ($200 in chips)
Seat 2: Player2 ($150 in chips)
Player1: posts small blind $1
Player2: posts big blind $2
*** SUMMARY ***
Total pot $3 | Rake $0
Seat 1: Player1 folded before Flop
Seat 2: Player2 collected ($3)`;

  describe('インターフェース実装', () => {
    test('PokerStars フォーマットをサポートする', () => {
      const parser = new ExtensiblePokerStarsParser();
      expect(parser.getSupportedFormat()).toBe(PokerSiteFormat.POKERSTARS);
    });

    test('PokerStars フォーマットを正しく検証する', () => {
      const parser = new ExtensiblePokerStarsParser();
      
      expect(parser.validateFormat(samplePokerStarsHand)).toBe(true);
      expect(parser.validateFormat('PartyPoker hand history')).toBe(false);
      expect(parser.validateFormat('Random text')).toBe(false);
    });

    test('パーサー情報を返す', () => {
      const parser = new ExtensiblePokerStarsParser();
      const info = parser.getParserInfo();
      
      expect(info.name).toBe('PokerStars Parser');
      expect(info.version).toBe('2.0.0');
      expect(info.siteFormat).toBe(PokerSiteFormat.POKERSTARS);
      expect(info.supportedFeatures).toContain(PokerFeature.SIDE_POTS);
      expect(info.supportedFeatures).toContain(PokerFeature.RAKE_TRACKING);
    });
  });

  describe('パース機能', () => {
    test('基本的なハンド履歴をパースできる', () => {
      const parser = new ExtensiblePokerStarsParser();
      const result = parser.parse(samplePokerStarsHand);
      
      expect(result.success).toBe(true);
      expect(result.hand).toBeDefined();
      
      if (result.success) {
        expect(result.hand.id).toBe('123456789');
        expect(result.hand.stakes).toBe('$1/$2 USD');
        expect(result.hand.table.name).toBe('TestTable');
        expect(result.hand.table.maxSeats).toBe(6);
        expect(result.hand.table.buttonSeat).toBe(1);
        expect(result.hand.players).toHaveLength(2);
        expect(result.hand.players[0].name).toBe('Player1');
        expect(result.hand.players[0].chips).toBe(200);
      }
    });

    test('無効なフォーマットの場合はエラーを返す', () => {
      const parser = new ExtensiblePokerStarsParser();
      const result = parser.parse('Invalid hand history');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid hand header format');
    });

    test('プレイヤーアクションを正しくパースする', () => {
      const handWithActions = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 ($200 in chips)
Seat 2: Player2 ($150 in chips)
Player1: posts small blind $1
Player2: posts big blind $2
Player1: calls $1
Player2: checks
*** SUMMARY ***`;

      const parser = new ExtensiblePokerStarsParser();
      const result = parser.parse(handWithActions);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const actions = result.hand.actions;
        expect(actions).toHaveLength(4);
        
        // Small blind action
        expect(actions[0].type).toBe('blind');
        expect(actions[0].player).toBe('Player1');
        expect(actions[0].amount).toBe(1);
        
        // Big blind action
        expect(actions[1].type).toBe('blind');
        expect(actions[1].player).toBe('Player2');
        expect(actions[1].amount).toBe(2);
        
        // Call action
        expect(actions[2].type).toBe('call');
        expect(actions[2].player).toBe('Player1');
        expect(actions[2].amount).toBe(1);
        
        // Check action
        expect(actions[3].type).toBe('check');
        expect(actions[3].player).toBe('Player2');
      }
    });

    test('フロップ、ターン、リバーを正しくパースする', () => {
      const handWithBoard = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 ($200 in chips)
Seat 2: Player2 ($150 in chips)
Player1: posts small blind $1
Player2: posts big blind $2
*** FLOP *** [Ah Kd Qc]
Player1: checks
Player2: bets $5
*** TURN *** [Ah Kd Qc 4s]
Player1: calls $5
*** RIVER *** [Ah Kd Qc 4s 2h]
Player1: folds
*** SUMMARY ***`;

      const parser = new ExtensiblePokerStarsParser();
      const result = parser.parse(handWithBoard);
      
      expect(result.success).toBe(true);
      
      if (result.success) {
        const hand = result.hand;
        
        // ボードカードがパースされている
        expect(hand.board).toHaveLength(5);
        expect(hand.board[0]).toBe('Ah');
        expect(hand.board[1]).toBe('Kd');
        expect(hand.board[2]).toBe('Qc');
        expect(hand.board[3]).toBe('4s');
        expect(hand.board[4]).toBe('2h');
        
        // Deal アクションが追加されている
        const dealActions = hand.actions.filter(action => action.type === 'deal');
        expect(dealActions).toHaveLength(3); // フロップ、ターン、リバー
        
        expect(dealActions[0].street).toBe('flop');
        expect(dealActions[0].cards).toEqual(['Ah', 'Kd', 'Qc']);
        
        expect(dealActions[1].street).toBe('turn');
        expect(dealActions[1].cards).toEqual(['4s']);
        
        expect(dealActions[2].street).toBe('river');
        expect(dealActions[2].cards).toEqual(['2h']);
      }
    });
  });

  describe('エラーハンドリング', () => {
    test('不正なハンドヘッダーでエラーを返す', () => {
      const invalidHand = `Invalid header format
Table 'TestTable' 6-max Seat #1 is the button`;

      const parser = new ExtensiblePokerStarsParser();
      const result = parser.parse(invalidHand);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid hand header format');
    });

    test('不正なテーブル行でエラーを返す', () => {
      const invalidHand = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Invalid table format`;

      const parser = new ExtensiblePokerStarsParser();
      const result = parser.parse(invalidHand);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid table format');
    });

    test('プレイヤーが見つからない場合はエラーを返す', () => {
      const invalidHand = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
*** SUMMARY ***`;

      const parser = new ExtensiblePokerStarsParser();
      const result = parser.parse(invalidHand);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('No players found');
    });
  });

  describe('Factory との統合', () => {
    test('Factory に登録してパーサーを作成できる', () => {
      // このテストは後で HandHistoryParserFactory と組み合わせてテストする
      const parser = new ExtensiblePokerStarsParser();
      expect(parser).toBeInstanceOf(ExtensiblePokerStarsParser);
      expect(parser.getSupportedFormat()).toBe(PokerSiteFormat.POKERSTARS);
    });
  });
});