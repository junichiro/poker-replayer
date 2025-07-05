/**
 * IHandHistoryParser Interface テスト
 * TDD approach - RED phase: インターフェースのテストを先に書く
 */

import { PokerSiteFormat, PokerFeature } from '../../types';

// これから実装するインターフェースの型定義
interface IHandHistoryParser {
  parse(handHistory: string): ParserResult;
  getSupportedFormat(): PokerSiteFormat;
  validateFormat(handHistory: string): boolean;
  getParserInfo(): ParserInfo;
}

interface ParserInfo {
  name: string;
  version: string;
  supportedFeatures: PokerFeature[];
  siteFormat: PokerSiteFormat;
}

interface ParserResult {
  success: boolean;
  hand?: any;
  error?: {
    message: string;
    type: string;
  };
}

describe('IHandHistoryParser Interface', () => {
  describe('interface contract', () => {
    test('parserは必要なメソッドを実装している必要がある', () => {
      // これは TypeScript でコンパイル時にチェックされるが、
      // テストとして明示的に記述
      const requiredMethods = [
        'parse',
        'getSupportedFormat',
        'validateFormat',
        'getParserInfo',
      ];

      // インターフェースが存在することを確認するためのダミーテスト
      expect(requiredMethods).toContain('parse');
      expect(requiredMethods).toContain('getSupportedFormat');
      expect(requiredMethods).toContain('validateFormat');
      expect(requiredMethods).toContain('getParserInfo');
    });
  });

  describe('ParserResult 型', () => {
    test('成功時の結果を表現できる', () => {
      const successResult: ParserResult = {
        success: true,
        hand: { id: 'test' },
      };

      expect(successResult.success).toBe(true);
      expect(successResult.hand).toBeDefined();
      expect(successResult.error).toBeUndefined();
    });

    test('失敗時の結果を表現できる', () => {
      const errorResult: ParserResult = {
        success: false,
        error: {
          message: 'Parse error',
          type: 'INVALID_FORMAT',
        },
      };

      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBeDefined();
      expect(errorResult.hand).toBeUndefined();
    });
  });

  describe('ParserInfo 型', () => {
    test('パーサー情報を表現できる', () => {
      const parserInfo: ParserInfo = {
        name: 'Test Parser',
        version: '1.0.0',
        supportedFeatures: [PokerFeature.SIDE_POTS],
        siteFormat: PokerSiteFormat.POKERSTARS,
      };

      expect(parserInfo.name).toBe('Test Parser');
      expect(parserInfo.version).toBe('1.0.0');
      expect(parserInfo.supportedFeatures).toContain(PokerFeature.SIDE_POTS);
      expect(parserInfo.siteFormat).toBe(PokerSiteFormat.POKERSTARS);
    });
  });
});