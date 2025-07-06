/**
 * Parser Integration テスト
 * Factory と各パーサーの統合動作をテストする
 */

import { PokerSiteFormat } from '../../types';
import { ExtensiblePokerStarsParser } from '../ExtensiblePokerStarsParser';
import { HandHistoryParserFactory } from '../HandHistoryParserFactory';

describe('Parser Integration', () => {
  const samplePokerStarsHand = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 ($200 in chips)
Seat 2: Player2 ($150 in chips)
Player1: posts small blind $1
Player2: posts big blind $2
*** SUMMARY ***`;

  const samplePartyPokerHand = `***** PartyPoker Hand History for Game 1234567890 *****
$1/$2 USD Hold'em No Limit - Saturday, January 01, 2023, 12:00:00 ET
Table Test (Real Money)`;

  describe('Factory と PokerStars Parser の統合', () => {
    test('PokerStars パーサーを Factory に登録して使用できる', () => {
      const factory = new HandHistoryParserFactory();

      // パーサーを登録
      factory.registerParser(PokerSiteFormat.POKERSTARS, ExtensiblePokerStarsParser);

      // パーサーを作成
      const parser = factory.createParser(PokerSiteFormat.POKERSTARS);
      expect(parser).toBeInstanceOf(ExtensiblePokerStarsParser);

      // パーサーを使用してパース
      const result = parser.parse(samplePokerStarsHand);
      expect(result.success).toBe(true);
    });

    test('フォーマット自動検出が動作する', () => {
      const factory = new HandHistoryParserFactory();
      factory.registerParser(PokerSiteFormat.POKERSTARS, ExtensiblePokerStarsParser);

      // フォーマットを自動検出
      const detectedFormat = factory.detectFormat(samplePokerStarsHand);
      expect(detectedFormat).toBe(PokerSiteFormat.POKERSTARS);

      // 検出されたフォーマットでパーサーを作成
      const parser = factory.createParser(detectedFormat);
      const result = parser.parse(samplePokerStarsHand);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.hand.id).toBe('123456789');
      }
    });

    test('サポートされていないフォーマットでは適切にエラーになる', () => {
      const factory = new HandHistoryParserFactory();
      factory.registerParser(PokerSiteFormat.POKERSTARS, ExtensiblePokerStarsParser);

      // PartyPoker フォーマットは登録されていないのでエラー
      expect(() => factory.createParser(PokerSiteFormat.PARTYPOKER)).toThrow(
        'Unsupported format: partypoker'
      );
    });
  });

  describe('複数パーサーの動的登録', () => {
    test('複数のパーサーを登録して適切に使い分けられる', () => {
      const factory = new HandHistoryParserFactory();

      // PokerStars パーサーを登録
      factory.registerParser(PokerSiteFormat.POKERSTARS, ExtensiblePokerStarsParser);

      // Mock PartyPoker パーサーを作成
      class MockPartyPokerParser extends ExtensiblePokerStarsParser {
        getSupportedFormat() {
          return PokerSiteFormat.PARTYPOKER;
        }
        validateFormat(handHistory: string) {
          return handHistory.includes('PartyPoker');
        }
        getParserInfo() {
          return {
            name: 'PartyPoker Parser',
            version: '1.0.0',
            supportedFeatures: [],
            siteFormat: PokerSiteFormat.PARTYPOKER,
          };
        }
      }

      // PartyPoker パーサーも登録
      factory.registerParser(PokerSiteFormat.PARTYPOKER, MockPartyPokerParser);

      // サポートされているフォーマットを確認
      const supportedFormats = factory.getSupportedFormats();
      expect(supportedFormats).toContain(PokerSiteFormat.POKERSTARS);
      expect(supportedFormats).toContain(PokerSiteFormat.PARTYPOKER);

      // 各パーサーを作成して動作確認
      const pokerStarsParser = factory.createParser(PokerSiteFormat.POKERSTARS);
      expect(pokerStarsParser.getSupportedFormat()).toBe(PokerSiteFormat.POKERSTARS);

      const partyPokerParser = factory.createParser(PokerSiteFormat.PARTYPOKER);
      expect(partyPokerParser.getSupportedFormat()).toBe(PokerSiteFormat.PARTYPOKER);
    });

    test('パーサーの上書き登録ができる', () => {
      const factory = new HandHistoryParserFactory();

      // 最初のパーサーを登録
      factory.registerParser(PokerSiteFormat.POKERSTARS, ExtensiblePokerStarsParser);

      const parser1 = factory.createParser(PokerSiteFormat.POKERSTARS);
      expect(parser1.getParserInfo().version).toBe('2.0.0');

      // 新しいバージョンのパーサーを作成
      class UpdatedPokerStarsParser extends ExtensiblePokerStarsParser {
        getParserInfo() {
          const info = super.getParserInfo();
          return { ...info, version: '3.0.0' };
        }
      }

      // パーサーを上書き登録
      factory.registerParser(PokerSiteFormat.POKERSTARS, UpdatedPokerStarsParser);

      const parser2 = factory.createParser(PokerSiteFormat.POKERSTARS);
      expect(parser2.getParserInfo().version).toBe('3.0.0');
    });
  });

  describe('フォーマット検出の精度', () => {
    test('PokerStars フォーマットを正確に検出する', () => {
      const factory = new HandHistoryParserFactory();

      const format = factory.detectFormat(samplePokerStarsHand);
      expect(format).toBe(PokerSiteFormat.POKERSTARS);
    });

    test('PartyPoker フォーマットを正確に検出する', () => {
      const factory = new HandHistoryParserFactory();

      const format = factory.detectFormat(samplePartyPokerHand);
      expect(format).toBe(PokerSiteFormat.PARTYPOKER);
    });

    test('不明なフォーマットは GENERIC として検出される', () => {
      const factory = new HandHistoryParserFactory();

      const unknownFormat = "Some random text that doesn't match any poker site format";
      const format = factory.detectFormat(unknownFormat);
      expect(format).toBe(PokerSiteFormat.GENERIC);
    });
  });

  describe('エンドツーエンドワークフロー', () => {
    test('完全なワークフロー: 検出 → 作成 → パース', () => {
      const factory = new HandHistoryParserFactory();
      factory.registerParser(PokerSiteFormat.POKERSTARS, ExtensiblePokerStarsParser);

      // 1. フォーマットを自動検出
      const detectedFormat = factory.detectFormat(samplePokerStarsHand);
      expect(detectedFormat).toBe(PokerSiteFormat.POKERSTARS);

      // 2. 適切なパーサーを作成
      const parser = factory.createParser(detectedFormat);
      expect(parser).toBeInstanceOf(ExtensiblePokerStarsParser);

      // 3. ハンド履歴をパース
      const result = parser.parse(samplePokerStarsHand);
      expect(result.success).toBe(true);

      // 4. 結果を検証
      if (result.success) {
        const hand = result.hand;
        expect(hand.id).toBe('123456789');
        expect(hand.stakes).toBe('$1/$2 USD');
        expect(hand.table.name).toBe('TestTable');
        expect(hand.players).toHaveLength(2);
        expect(hand.actions.length).toBeGreaterThan(0);
      }
    });

    test('未サポートフォーマットでの適切なエラー処理', () => {
      const factory = new HandHistoryParserFactory();
      // 意図的にパーサーを登録しない

      const detectedFormat = factory.detectFormat(samplePokerStarsHand);
      expect(detectedFormat).toBe(PokerSiteFormat.POKERSTARS);

      // パーサーが登録されていないのでエラー
      expect(() => factory.createParser(detectedFormat)).toThrow('Unsupported format: pokerstars');
    });
  });
});
