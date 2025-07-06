/**
 * BaseHandHistoryParser - 抽象基底クラス
 *
 * Open/Closed Principle に従い、新しいパーサーの実装を容易にする
 * Liskov Substitution Principle に従い、すべての派生クラスが同じ契約を満たす
 *
 * LSP契約:
 * - parse(): null/undefinedで例外、有効/無効文字列でParserResultを返す
 * - getSupportedFormat(): 常に有効なPokerSiteFormatを返す
 * - validateFormat(): 常にブール値を返す
 * - getParserInfo(): 一貫した構造のメタデータを返す
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
   *
   * LSP契約:
   * - 前提条件: handHistoryはnull/undefinedではない文字列であること
   * - 事後条件: 成功時はhand付きのresult、失敗時はerror付きのresultを返す
   * - 例外: null/undefinedの場合のみ例外を投げる
   */
  public parse(handHistory: string): ParserResult {
    // LSP契約: 前提条件の検証 - null/undefinedは例外を投げる
    if (handHistory == null) {
      throw new Error('HandHistory cannot be null or undefined');
    }

    try {
      this.reset();
      this.validateFormatContract(handHistory);
      this.lines = this.preprocessHandHistory(handHistory);

      const hand = this.parseHandInternal();
      return { success: true, hand };
    } catch (error) {
      return this.createError(error instanceof Error ? error.message : 'Unknown parsing error');
    }
  }

  /**
   * フォーマット契約を検証する（派生クラスでオーバーライド可能）
   * LSP契約: 派生クラスは前提条件を強化してはならない
   */
  protected validateFormatContract(_handHistory: string): void {
    // 基底クラスでは特別な検証は行わない
    // 派生クラスが前提条件を強化することを防ぐ
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
