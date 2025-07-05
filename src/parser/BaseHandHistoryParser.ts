/**
 * BaseHandHistoryParser - 抽象基底クラス
 * Open/Closed Principle に従い、新しいパーサーの実装を容易にする
 */

import { PokerHand, ParserResult, PokerSiteFormat, ParserInfo, IHandHistoryParser } from '../types';

/**
 * すべてのハンド履歴パーサーの抽象基底クラス
 * テンプレートメソッドパターンを実装し、共通の処理フローを提供
 */
export abstract class BaseHandHistoryParser implements IHandHistoryParser {
  protected lines: string[] = [];
  protected currentLineIndex: number = 0;

  // 抽象メソッド - 具象クラスで実装される必要がある
  abstract getSupportedFormat(): PokerSiteFormat;
  abstract validateFormat(handHistory: string): boolean;
  abstract getParserInfo(): ParserInfo;
  protected abstract preprocessHandHistory(handHistory: string): string[];
  protected abstract parseHandInternal(): PokerHand;
  protected abstract createError(message: string): ParserResult;

  /**
   * ハンド履歴をパースするメインメソッド
   * テンプレートメソッドパターンを実装
   */
  public parse(handHistory: string): ParserResult {
    try {
      this.reset();
      this.lines = this.preprocessHandHistory(handHistory);
      
      const hand = this.parseHandInternal();
      return { success: true, hand };
    } catch (error) {
      return this.createError(error instanceof Error ? error.message : 'Unknown parsing error');
    }
  }

  /**
   * 現在の行を取得
   */
  protected getLine(): string {
    if (this.currentLineIndex >= this.lines.length) {
      throw new Error('Unexpected end of hand history');
    }
    return this.lines[this.currentLineIndex];
  }

  /**
   * 次の行に進む
   */
  protected nextLine(): void {
    this.currentLineIndex++;
  }

  /**
   * まだ読む行があるかチェック
   */
  protected hasMoreLines(): boolean {
    return this.currentLineIndex < this.lines.length;
  }

  /**
   * パーサー状態をリセット
   */
  protected reset(): void {
    this.lines = [];
    this.currentLineIndex = 0;
  }
}