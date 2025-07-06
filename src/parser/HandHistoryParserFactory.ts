/**
 * HandHistoryParserFactory - Factory Pattern Implementation
 * Open/Closed Principle に従い、新しいパーサーを動的に登録可能
 */

import { PokerSiteFormat, IHandHistoryParser, IHandHistoryParserFactory } from '../types';

import { ExtensiblePokerStarsParser } from './ExtensiblePokerStarsParser';

/**
 * ハンド履歴パーサーのファクトリークラス
 * パーサーの作成、フォーマット検出、動的登録を管理
 */
export class HandHistoryParserFactory implements IHandHistoryParserFactory {
  private parsers = new Map<PokerSiteFormat, new () => IHandHistoryParser>();

  constructor() {
    // デフォルトパーサーの登録は後で実装
    // this.registerParser(PokerSiteFormat.POKERSTARS, ExtensiblePokerStarsParser);
  }

  /**
   * 指定されたフォーマット用のパーサーを作成
   */
  createParser(format: PokerSiteFormat): IHandHistoryParser {
    const ParserClass = this.parsers.get(format);
    if (!ParserClass) {
      throw new Error(`Unsupported format: ${format}`);
    }
    return new ParserClass();
  }

  /**
   * ハンド履歴からフォーマットを自動検出
   */
  detectFormat(handHistory: string): PokerSiteFormat {
    // 登録されているパーサーを使用してフォーマットを検出
    for (const [format, ParserClass] of this.parsers.entries()) {
      const parser = new ParserClass();
      if (parser.validateFormat(handHistory)) {
        return format;
      }
    }

    // 不明なフォーマットの場合は GENERIC を返す
    return PokerSiteFormat.GENERIC;
  }

  /**
   * 新しいパーサーを登録
   */
  registerParser(format: PokerSiteFormat, parserClass: new () => IHandHistoryParser): void {
    this.parsers.set(format, parserClass);
  }

  /**
   * サポートされているフォーマットのリストを取得
   */
  getSupportedFormats(): PokerSiteFormat[] {
    return Array.from(this.parsers.keys());
  }

  /**
   * デフォルトパーサーが登録されたファクトリーを作成
   */
  static createWithDefaultParsers(): HandHistoryParserFactory {
    const factory = new HandHistoryParserFactory();
    factory.registerParser(PokerSiteFormat.POKERSTARS, ExtensiblePokerStarsParser);
    return factory;
  }
}
