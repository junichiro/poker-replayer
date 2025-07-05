/**
 * BaseHandHistoryParser Abstract Class テスト  
 * TDD approach - GREEN phase: 実装をテストする
 */

import { PokerSiteFormat, PokerHand, ParserResult, ParserInfo } from '../../types';
import { BaseHandHistoryParser } from '../BaseHandHistoryParser';

// テスト用の具象クラス
class TestConcreteParser extends BaseHandHistoryParser {
  getSupportedFormat(): PokerSiteFormat {
    return PokerSiteFormat.POKERSTARS;
  }

  validateFormat(handHistory: string): boolean {
    return handHistory.includes('PokerStars');
  }

  getParserInfo(): ParserInfo {
    return {
      name: 'Test Parser',
      version: '1.0.0',
      supportedFeatures: [],
      siteFormat: PokerSiteFormat.POKERSTARS,
    };
  }

  protected preprocessHandHistory(handHistory: string): string[] {
    return handHistory.split('\n').filter(line => line.trim() !== '');
  }

  protected parseHandInternal(): PokerHand {
    const mockHand: PokerHand = {
      id: 'test-hand',
      stakes: '$1/$2',
      date: new Date(),
      table: { name: 'Test Table', maxSeats: 6, buttonSeat: 1 },
      players: [],
      actions: [],
      board: [],
      pots: [],
    };
    return mockHand;
  }

  protected createError(message: string): ParserResult {
    return {
      success: false,
      error: {
        message,
        line: this.currentLineIndex,
      },
    };
  }

  // テスト用のpublicアクセサー
  public testGetLine(): string {
    return this.getLine();
  }

  public testNextLine(): void {
    this.nextLine();
  }

  public testHasMoreLines(): boolean {
    return this.hasMoreLines();
  }

  public testReset(): void {
    this.reset();
  }

  // テスト用のプロパティアクセサー
  public get testLines(): string[] {
    return this.lines;
  }

  public get testCurrentLineIndex(): number {
    return this.currentLineIndex;
  }

  // テスト用の protected メソッドアクセサー
  public testPreprocessHandHistory(handHistory: string): string[] {
    return this.preprocessHandHistory(handHistory);
  }

  public testParseHandInternal(): PokerHand {
    return this.parseHandInternal();
  }

  public testCreateError(message: string): ParserResult {
    return this.createError(message);
  }
}

describe('BaseHandHistoryParser', () => {
  const sampleHandHistory = `PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD)
Table 'TestTable' 6-max Seat #1 is the button
Seat 1: Player1 ($200 in chips)
Seat 2: Player2 ($150 in chips)
Player1: posts small blind $1
Player2: posts big blind $2`;

  describe('抽象メソッド', () => {
    test('getSupportedFormat() は具象クラスで実装される', () => {
      const parser = new TestConcreteParser();
      expect(parser.getSupportedFormat()).toBe(PokerSiteFormat.POKERSTARS);
    });

    test('validateFormat() は具象クラスで実装される', () => {
      const parser = new TestConcreteParser();
      expect(parser.validateFormat(sampleHandHistory)).toBe(true);
      expect(parser.validateFormat('Invalid hand')).toBe(false);
    });

    test('getParserInfo() は具象クラスで実装される', () => {
      const parser = new TestConcreteParser();
      const info = parser.getParserInfo();
      expect(info.name).toBe('Test Parser');
      expect(info.version).toBe('1.0.0');
      expect(info.siteFormat).toBe(PokerSiteFormat.POKERSTARS);
    });
  });

  describe('テンプレートメソッドパターン', () => {
    test('parse() メソッドが定義されたテンプレートに従って実行される', () => {
      const parser = new TestConcreteParser();
      const result = parser.parse(sampleHandHistory);
      
      expect(result.success).toBe(true);
      expect(result.hand).toBeDefined();
      expect(result.hand?.id).toBe('test-hand');
    });

    test('preprocessHandHistory() は具象クラスで実装される', () => {
      const parser = new TestConcreteParser();
      const lines = parser.testPreprocessHandHistory(sampleHandHistory);
      
      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines).not.toContain(''); // 空行は除去される
    });

    test('parseHandInternal() は具象クラスで実装される', () => {
      const parser = new TestConcreteParser();
      const hand = parser.testParseHandInternal();
      
      expect(hand).toBeDefined();
      expect(hand.id).toBe('test-hand');
      expect(hand.stakes).toBe('$1/$2');
    });

    test('createError() は具象クラスで実装される', () => {
      const parser = new TestConcreteParser();
      const errorResult = parser.testCreateError('Test error message');
      
      expect(errorResult.success).toBe(false);
      expect(errorResult.error?.message).toBe('Test error message');
    });
  });

  describe('共通ユーティリティメソッド', () => {
    test('getLine() でカレント行を取得できる', () => {
      const parser = new TestConcreteParser();
      // まず parse を実行して lines を設定
      parser.parse(sampleHandHistory);
      
      // カレント行を取得
      const line = parser.testGetLine();
      expect(typeof line).toBe('string');
      expect(line.length).toBeGreaterThan(0);
    });

    test('nextLine() で次の行に進める', () => {
      const parser = new TestConcreteParser();
      parser.parse(sampleHandHistory);
      
      const initialIndex = parser.testCurrentLineIndex;
      parser.testNextLine();
      expect(parser.testCurrentLineIndex).toBe(initialIndex + 1);
    });

    test('hasMoreLines() で行の残りがあるかチェックできる', () => {
      const parser = new TestConcreteParser();
      parser.parse(sampleHandHistory);
      
      // パース後、通常は最後まで読んでいるはず
      const hasMore = parser.testHasMoreLines();
      expect(typeof hasMore).toBe('boolean');
    });

    test('reset() でパーサー状態をリセットできる', () => {
      const parser = new TestConcreteParser();
      parser.parse(sampleHandHistory);
      
      // リセット前は何かしらのデータがある
      expect(parser.testLines.length).toBeGreaterThan(0);
      expect(parser.testCurrentLineIndex).toBeGreaterThanOrEqual(0);
      
      // リセット実行
      parser.testReset();
      
      // リセット後は初期状態
      expect(parser.testLines).toEqual([]);
      expect(parser.testCurrentLineIndex).toBe(0);
    });
  });

  describe('行の管理', () => {
    test('lines配列と currentLineIndex が初期化される', () => {
      const parser = new TestConcreteParser();
      expect(parser.testLines).toEqual([]);
      expect(parser.testCurrentLineIndex).toBe(0);
    });

    test('行インデックスが範囲外の場合はエラーが発生する', () => {
      const parser = new TestConcreteParser();
      // 空の状態でgetLineを呼ぶとエラー
      expect(() => parser.testGetLine()).toThrow('Unexpected end of hand history');
    });

    test('parse後は適切に行が設定される', () => {
      const parser = new TestConcreteParser();
      parser.parse(sampleHandHistory);
      
      expect(parser.testLines.length).toBeGreaterThan(0);
      expect(parser.testCurrentLineIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('エラーハンドリング', () => {
    test('パース中の例外が適切にキャッチされる', () => {
      // エラーを発生させるパーサー
      class ErrorParser extends BaseHandHistoryParser {
        getSupportedFormat(): PokerSiteFormat { return PokerSiteFormat.POKERSTARS; }
        validateFormat(): boolean { return true; }
        getParserInfo(): ParserInfo {
          return { name: 'Error Parser', version: '1.0.0', supportedFeatures: [], siteFormat: PokerSiteFormat.POKERSTARS };
        }
        protected preprocessHandHistory(): string[] { return ['line1']; }
        protected parseHandInternal(): PokerHand {
          throw new Error('Parse failed');
        }
        protected createError(message: string): ParserResult {
          return { success: false, error: { message } };
        }
      }

      const parser = new ErrorParser();
      const result = parser.parse('test');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Parse failed');
    });

    test('エラー結果が正しい形式で返される', () => {
      const parser = new TestConcreteParser();
      const errorResult = parser.testCreateError('Test error message');
      
      expect(errorResult.success).toBe(false);
      expect(errorResult.error?.message).toBe('Test error message');
      expect(errorResult.hand).toBeUndefined();
    });
  });
});