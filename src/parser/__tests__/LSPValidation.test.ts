/**
 * LSP (Liskov Substitution Principle) Validation Tests
 * TDD approach - RED phase: すべての継承関係がLSPに準拠していることをテストする
 */

import { IHandHistoryParser, ParserResult, PokerSiteFormat, ParserInfo } from '../../types';
import { BaseHandHistoryParser } from '../BaseHandHistoryParser';
import { ExtensiblePokerStarsParser } from '../ExtensiblePokerStarsParser';

// テスト用の具象実装
class TestConcreteParser extends BaseHandHistoryParser {
  getSupportedFormat(): PokerSiteFormat {
    return PokerSiteFormat.POKERSTARS;
  }

  validateFormat(handHistory: string): boolean {
    return handHistory.includes('PokerStars');
  }

  getParserInfo(): ParserInfo {
    return {
      name: 'TestParser',
      version: '1.0.0',
      supportedFormats: [PokerSiteFormat.POKERSTARS],
      features: [],
    };
  }

  protected preprocessHandHistory(handHistory: string): string[] {
    return handHistory.split('\n').filter(line => line.trim().length > 0);
  }

  protected parseHandInternal() {
    // Simple test implementation
    return {
      id: 'test-hand',
      tournamentId: undefined,
      stakes: 'test',
      date: new Date(),
      table: {
        name: 'test',
        seats: 6,
        button: 1,
      },
      players: [],
      actions: [],
      board: [],
      pots: [],
    };
  }

  protected createError(message: string): ParserResult {
    return {
      success: false,
      error: {
        message,
        line: 0,
        details: {},
      },
    };
  }
}

// LSP違反をするバッドパーサー（テスト用）
class BadLSPParser extends BaseHandHistoryParser {
  getSupportedFormat(): PokerSiteFormat {
    return PokerSiteFormat.POKERSTARS;
  }

  validateFormat(handHistory: string): boolean {
    return handHistory.includes('PokerStars');
  }

  getParserInfo(): ParserInfo {
    return {
      name: 'BadLSPParser',
      version: '1.0.0',
      supportedFormats: [PokerSiteFormat.POKERSTARS],
      features: [],
    };
  }

  protected preprocessHandHistory(handHistory: string): string[] {
    return handHistory.split('\n').filter(line => line.trim().length > 0);
  }

  protected parseHandInternal() {
    return {
      id: 'bad-hand',
      tournamentId: undefined,
      stakes: 'bad',
      date: new Date(),
      table: {
        name: 'bad',
        seats: 6,
        button: 1,
      },
      players: [],
      actions: [],
      board: [],
      pots: [],
    };
  }

  protected createError(message: string): ParserResult {
    return {
      success: false,
      error: {
        message,
        line: 0,
        details: {},
      },
    };
  }

  // LSP違反: 前提条件を強化している
  protected validateFormatContract(handHistory: string): void {
    if (handHistory.length < 100) {
      throw new Error('HandHistory must be at least 100 characters long');
    }
  }

  // さらなるLSP違反: parseメソッドで追加の前提条件を強化
  parse(handHistory: string): ParserResult {
    if (handHistory.length < 100) {
      throw new Error('HandHistory must be at least 100 characters long');
    }
    return super.parse(handHistory);
  }
}

describe('LSP Validation Tests', () => {
  describe('BaseHandHistoryParser inheritance contracts', () => {
    let parsers: IHandHistoryParser[];

    beforeEach(() => {
      parsers = [new TestConcreteParser(), new ExtensiblePokerStarsParser()];
    });

    test('すべての派生クラスが基底クラスと置換可能である', () => {
      parsers.forEach(parser => {
        // すべてのパーサーが同じインターフェースを満たすべき
        expect(typeof parser.parse).toBe('function');
        expect(typeof parser.getSupportedFormat).toBe('function');
        expect(typeof parser.validateFormat).toBe('function');
        expect(typeof parser.getParserInfo).toBe('function');
      });
    });

    test('parse メソッドの契約: 有効な入力に対して一貫した動作をする', () => {
      const validInput = 'PokerStars Hand #123456789: Tournament #987654321';

      parsers.forEach(parser => {
        const result = parser.parse(validInput);

        // 契約: 結果は必ずParserResult型である
        expect(result).toHaveProperty('success');
        expect(typeof result.success).toBe('boolean');

        // 契約: 成功時は hand プロパティを持つ
        if (result.success) {
          expect(result).toHaveProperty('hand');
          expect(result.hand).toBeDefined();
        } else {
          // 契約: 失敗時は error プロパティを持つ
          expect(result).toHaveProperty('error');
          expect(result.error).toBeDefined();
        }
      });
    });

    test('parse メソッドの契約: 無効な入力に対して一貫した動作をする', () => {
      const invalidInputs = ['', 'invalid input', '   ', null as unknown, undefined as unknown];

      parsers.forEach(parser => {
        invalidInputs.forEach(input => {
          // 基底クラスの契約: 例外を投げるか、エラー結果を返すかは一貫している必要がある
          if (input === null || input === undefined) {
            // nullやundefinedの場合は例外を投げることが期待される
            expect(() => parser.parse(input as string)).toThrow();
          } else {
            // 文字列の場合は結果オブジェクトを返すべき
            const result = parser.parse(input as string);
            expect(result).toHaveProperty('success');
            expect(typeof result.success).toBe('boolean');
          }
        });
      });
    });

    test('getSupportedFormat メソッドの契約: 常に有効なフォーマットを返す', () => {
      parsers.forEach(parser => {
        const format = parser.getSupportedFormat();
        expect(Object.values(PokerSiteFormat)).toContain(format);
      });
    });

    test('validateFormat メソッドの契約: 一貫したブール値を返す', () => {
      const testInputs = [
        'PokerStars Hand #123456789',
        'PartyPoker Hand #123456789',
        'invalid input',
        '',
      ];

      parsers.forEach(parser => {
        testInputs.forEach(input => {
          const isValid = parser.validateFormat(input);
          expect(typeof isValid).toBe('boolean');

          // 契約: validateFormatがtrueを返す場合、parseは成功するか適切なエラーを返すべき
          if (isValid) {
            const result = parser.parse(input);
            expect(result).toHaveProperty('success');
          }
        });
      });
    });

    test('getParserInfo メソッドの契約: 一貫した構造のメタデータを返す', () => {
      parsers.forEach(parser => {
        const info = parser.getParserInfo();

        expect(info).toHaveProperty('name');
        expect(typeof info.name).toBe('string');
        expect(info.name.length).toBeGreaterThan(0);

        expect(info).toHaveProperty('version');
        expect(typeof info.version).toBe('string');
        expect(info.version.length).toBeGreaterThan(0);

        expect(info).toHaveProperty('supportedFormats');
        expect(Array.isArray(info.supportedFormats)).toBe(true);
        expect(info.supportedFormats.length).toBeGreaterThan(0);

        expect(info).toHaveProperty('features');
        expect(Array.isArray(info.features)).toBe(true);
      });
    });
  });

  describe('LSP違反の検出テスト', () => {
    test('前提条件を強化するパーサーはLSP違反である', () => {
      const badParser = new BadLSPParser();
      const shortInput = 'PokerStars Hand #123'; // 100文字未満

      // 基底クラスでは動作するが、派生クラスでは例外が投げられる（LSP違反）
      const baseParser = new TestConcreteParser();
      const baseResult = baseParser.parse(shortInput);
      expect(baseResult).toHaveProperty('success');

      // BadLSPParserは前提条件を強化している（LSP違反）
      expect(() => badParser.parse(shortInput)).toThrow(
        'HandHistory must be at least 100 characters long'
      );
    });
  });

  describe('Performance契約の検証', () => {
    test('すべてのパーサーが妥当な時間内で処理を完了する', () => {
      const testInput =
        "PokerStars Hand #123456789: Tournament #987654321, $10+$1 USD Hold'em No Limit";
      const testParsers = [new TestConcreteParser(), new ExtensiblePokerStarsParser()];

      for (const parser of testParsers) {
        const startTime = performance.now();
        parser.parse(testInput);
        const endTime = performance.now();

        const duration = endTime - startTime;
        // 契約: パース処理は1秒以内に完了する
        expect(duration).toBeLessThan(1000);
      }
    });
  });

  describe('例外動作の一貫性テスト', () => {
    test('同じタイプの例外を投げる', () => {
      const testParsers = [new TestConcreteParser(), new ExtensiblePokerStarsParser()];

      testParsers.forEach(parser => {
        // null入力は同じタイプの例外を投げるべき
        expect(() => parser.parse(null as unknown as string)).toThrow();
        expect(() => parser.parse(undefined as unknown as string)).toThrow();
      });
    });
  });
});
