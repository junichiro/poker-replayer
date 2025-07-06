/**
 * HandHistoryParserFactory テスト
 * TDD approach - GREEN phase: 実装をテストする
 */

import { PokerSiteFormat, IHandHistoryParser } from '../../types';
import { HandHistoryParserFactory } from '../HandHistoryParserFactory';

describe('HandHistoryParserFactory', () => {
  const samplePokerStarsHand = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD)
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 ($200 in chips)
Seat 2: Player2 ($150 in chips)`;

  const samplePartyPokerHand = `***** PartyPoker Hand History for Game 1234567890 *****
$1/$2 USD Hold'em No Limit - Saturday, January 01, 2023, 12:00:00 ET
Table Test (Real Money)`;

  // Mock parser class for testing
  class MockParser implements IHandHistoryParser {
    parse(_handHistory: string): any {
      return { success: true, hand: { id: 'test' } };
    }
    getSupportedFormat(): PokerSiteFormat {
      return PokerSiteFormat.POKERSTARS;
    }
    validateFormat(_handHistory: string): boolean {
      return true;
    }
    getParserInfo(): any {
      return { name: 'Mock Parser', version: '1.0.0' };
    }
  }

  // Mock PokerStars parser for testing
  class MockPokerStarsParser implements IHandHistoryParser {
    parse(_handHistory: string): any {
      return { success: true, hand: { id: 'pokerstars' } };
    }
    getSupportedFormat(): PokerSiteFormat {
      return PokerSiteFormat.POKERSTARS;
    }
    validateFormat(handHistory: string): boolean {
      return handHistory.includes('PokerStars Hand #');
    }
    getParserInfo(): any {
      return { name: 'Mock PokerStars Parser', version: '1.0.0' };
    }
  }

  // Mock PartyPoker parser for testing
  class MockPartyPokerParser implements IHandHistoryParser {
    parse(_handHistory: string): any {
      return { success: true, hand: { id: 'partypoker' } };
    }
    getSupportedFormat(): PokerSiteFormat {
      return PokerSiteFormat.PARTYPOKER;
    }
    validateFormat(handHistory: string): boolean {
      return handHistory.includes('***** PartyPoker Hand History');
    }
    getParserInfo(): any {
      return { name: 'Mock PartyPoker Parser', version: '1.0.0' };
    }
  }

  describe('createParser()', () => {
    test('登録されたパーサーを作成できる', () => {
      const factory = new HandHistoryParserFactory();
      factory.registerParser(PokerSiteFormat.POKERSTARS, MockParser);

      const parser = factory.createParser(PokerSiteFormat.POKERSTARS);
      expect(parser).toBeInstanceOf(MockParser);
    });

    test('サポートされていないフォーマットの場合はエラーを投げる', () => {
      const factory = new HandHistoryParserFactory();

      expect(() => factory.createParser(PokerSiteFormat.POKERSTARS)).toThrow(
        'Unsupported format: pokerstars'
      );
    });
  });

  describe('detectFormat()', () => {
    test('PokerStars のハンド履歴フォーマットを検出できる', () => {
      const factory = new HandHistoryParserFactory();
      factory.registerParser(PokerSiteFormat.POKERSTARS, MockPokerStarsParser);
      const format = factory.detectFormat(samplePokerStarsHand);
      expect(format).toBe(PokerSiteFormat.POKERSTARS);
    });

    test('PartyPoker のハンド履歴フォーマットを検出できる', () => {
      const factory = new HandHistoryParserFactory();
      factory.registerParser(PokerSiteFormat.PARTYPOKER, MockPartyPokerParser);
      const format = factory.detectFormat(samplePartyPokerHand);
      expect(format).toBe(PokerSiteFormat.PARTYPOKER);
    });

    test('不明なフォーマットの場合は GENERIC を返す', () => {
      const factory = new HandHistoryParserFactory();
      factory.registerParser(PokerSiteFormat.POKERSTARS, MockPokerStarsParser);
      factory.registerParser(PokerSiteFormat.PARTYPOKER, MockPartyPokerParser);
      const format = factory.detectFormat('Unknown format');
      expect(format).toBe(PokerSiteFormat.GENERIC);
    });
  });

  describe('registerParser()', () => {
    test('新しいパーサーを登録できる', () => {
      const factory = new HandHistoryParserFactory();

      // 登録前はサポートされていない
      expect(factory.getSupportedFormats()).not.toContain(PokerSiteFormat.POKERSTARS);

      // パーサーを登録
      factory.registerParser(PokerSiteFormat.POKERSTARS, MockParser);

      // 登録後はサポートされている
      expect(factory.getSupportedFormats()).toContain(PokerSiteFormat.POKERSTARS);
    });

    test('同じフォーマットのパーサーを上書き登録できる', () => {
      const factory = new HandHistoryParserFactory();

      class MockParser1 implements IHandHistoryParser {
        parse(_handHistory: string): any {
          return {};
        }
        getSupportedFormat(): PokerSiteFormat {
          return PokerSiteFormat.POKERSTARS;
        }
        validateFormat(_handHistory: string): boolean {
          return true;
        }
        getParserInfo(): any {
          return { name: 'Parser1' };
        }
      }

      class MockParser2 implements IHandHistoryParser {
        parse(_handHistory: string): any {
          return {};
        }
        getSupportedFormat(): PokerSiteFormat {
          return PokerSiteFormat.POKERSTARS;
        }
        validateFormat(_handHistory: string): boolean {
          return true;
        }
        getParserInfo(): any {
          return { name: 'Parser2' };
        }
      }

      // 最初のパーサーを登録
      factory.registerParser(PokerSiteFormat.POKERSTARS, MockParser1);
      let parser = factory.createParser(PokerSiteFormat.POKERSTARS);
      expect(parser).toBeInstanceOf(MockParser1);

      // 上書き登録
      factory.registerParser(PokerSiteFormat.POKERSTARS, MockParser2);
      parser = factory.createParser(PokerSiteFormat.POKERSTARS);
      expect(parser).toBeInstanceOf(MockParser2);
    });
  });

  describe('getSupportedFormats()', () => {
    test('サポートされているフォーマットのリストを取得できる', () => {
      const factory = new HandHistoryParserFactory();

      // 初期状態では空
      expect(factory.getSupportedFormats()).toEqual([]);

      // パーサーを登録
      factory.registerParser(PokerSiteFormat.POKERSTARS, MockParser);
      factory.registerParser(PokerSiteFormat.PARTYPOKER, MockParser);

      const formats = factory.getSupportedFormats();
      expect(formats).toContain(PokerSiteFormat.POKERSTARS);
      expect(formats).toContain(PokerSiteFormat.PARTYPOKER);
      expect(formats).toHaveLength(2);
    });

    test('初期状態では空のリストが返される', () => {
      const factory = new HandHistoryParserFactory();
      expect(factory.getSupportedFormats()).toEqual([]);
    });
  });
});
