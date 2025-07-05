/**
 * ExtensiblePokerStarsParser - OCP 準拠の PokerStars パーサー
 * BaseHandHistoryParser を継承し、Open/Closed Principle に従って実装
 */

import {
  PokerHand,
  Player,
  Action,
  TableInfo,
  Pot,
  Street,
  ActionType,
  ParserResult,
  PlayingCard,
  PLAYING_CARD_REGEX,
  PokerSiteFormat,
  ParserInfo,
  PokerFeature,
} from '../types';
import { BaseHandHistoryParser } from './BaseHandHistoryParser';

/**
 * Validates if a string is a valid playing card and returns it as PlayingCard type
 */
function toPlayingCard(cardString: string): PlayingCard {
  if (!PLAYING_CARD_REGEX.test(cardString)) {
    throw new Error(
      `Invalid card format: ${cardString}. Expected format: rank + suit (e.g., "As", "Kh")`
    );
  }
  return cardString as PlayingCard;
}

/**
 * Safely converts an array of strings to PlayingCard array
 */
function toPlayingCardArray(cardStrings: string[]): PlayingCard[] {
  return cardStrings.map(toPlayingCard);
}

/**
 * PokerStars 専用のハンド履歴パーサー
 * Open/Closed Principle に従い、新しいサイトサポートを容易にする
 */
export class ExtensiblePokerStarsParser extends BaseHandHistoryParser {
  private actionIndex: number;
  private playerChips: Map<string, number>; // Track current chips per player
  private allInPlayers: Map<string, number>; // Track all-in amounts
  private activePlayers: Set<string>; // Track players still in hand (not folded)
  private totalPotContributions: number; // Track total money put into pot

  constructor() {
    super();
    this.actionIndex = 0;
    this.playerChips = new Map();
    this.allInPlayers = new Map();
    this.activePlayers = new Set();
    this.totalPotContributions = 0;
  }

  /**
   * サポートするフォーマットを返す
   */
  getSupportedFormat(): PokerSiteFormat {
    return PokerSiteFormat.POKERSTARS;
  }

  /**
   * PokerStars フォーマットかどうかを検証
   */
  validateFormat(handHistory: string): boolean {
    return handHistory.includes('PokerStars Hand #') && 
           handHistory.includes('Table \'');
  }

  /**
   * パーサー情報を返す
   */
  getParserInfo(): ParserInfo {
    return {
      name: 'PokerStars Parser',
      version: '2.0.0',
      supportedFeatures: [
        PokerFeature.SIDE_POTS,
        PokerFeature.RAKE_TRACKING,
        PokerFeature.TOURNAMENT_SUPPORT,
        PokerFeature.ANTES,
      ],
      siteFormat: PokerSiteFormat.POKERSTARS,
    };
  }

  /**
   * ハンド履歴を前処理して行の配列に変換
   */
  protected preprocessHandHistory(handHistory: string): string[] {
    return handHistory
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  /**
   * エラー結果を作成
   */
  protected createError(message: string): ParserResult {
    return {
      success: false,
      error: {
        message,
        line: this.currentLineIndex,
        context: this.hasMoreLines() ? this.getLine() : undefined,
      },
    };
  }

  /**
   * 内部パースロジック - PokerStars 専用実装
   */
  protected parseHandInternal(): PokerHand {
    // パーサー状態をリセット
    this.actionIndex = 0;
    this.playerChips.clear();
    this.allInPlayers.clear();
    this.activePlayers.clear();
    this.totalPotContributions = 0;
    this.currentLineIndex = 0;

    // ハンド情報をパース
    const handInfo = this.parseHandInfo();
    const tableInfo = this.parseTableInfo();
    const players = this.parsePlayers();
    
    // プレイヤーの初期チップを記録
    players.forEach(player => {
      this.playerChips.set(player.name, player.chips);
      this.activePlayers.add(player.name);
    });

    // アクションをパース
    const actions = this.parseActions();
    
    // ボードカードをパース
    const board = this.parseBoardCards(actions);
    
    // ポットをパース
    const pots = this.parsePots();

    return {
      id: handInfo.id,
      tournamentId: handInfo.tournamentId,
      stakes: handInfo.stakes,
      date: handInfo.date,
      table: tableInfo,
      players,
      actions,
      board,
      pots,
      rake: handInfo.rake,
    };
  }

  /**
   * ハンド基本情報をパース
   */
  private parseHandInfo() {
    const handLine = this.getLine();
    this.nextLine();

    // PokerStars Hand #123456789: Tournament #987654321, $10+$1 USD Hold'em No Limit - Level II (15/30) - 2023/01/01 12:00:00 ET
    // または
    // PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD) - 2023/01/01 12:00:00 ET
    
    const handMatch = handLine.match(/PokerStars Hand #(\d+):/);
    if (!handMatch) {
      throw new Error(`Invalid hand header format: ${handLine}`);
    }

    const handId = handMatch[1];
    
    // トーナメントかキャッシュゲームかを判定
    const tournamentMatch = handLine.match(/Tournament #(\d+)/);
    const tournamentId = tournamentMatch ? tournamentMatch[1] : undefined;

    // ステークスをパース
    let stakes: string;
    if (tournamentId) {
      const stakesMatch = handLine.match(/\$([^-]+)/);
      stakes = stakesMatch ? `$${stakesMatch[1].trim()}` : 'Tournament';
    } else {
      const stakesMatch = handLine.match(/\(([^)]+)\)/);
      stakes = stakesMatch ? stakesMatch[1] : 'Unknown';
    }

    // 日付をパース
    const dateMatch = handLine.match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) ET/);
    let date = new Date();
    if (dateMatch) {
      date = new Date(dateMatch[1] + ' GMT-0500'); // ET timezone
    }

    return {
      id: handId,
      tournamentId,
      stakes,
      date,
      rake: undefined, // 後でパース
    };
  }

  /**
   * テーブル情報をパース
   */
  private parseTableInfo(): TableInfo {
    const tableLine = this.getLine();
    this.nextLine();

    // Table 'Cresentia II' 6-max Seat #1 is the button
    const tableMatch = tableLine.match(/Table '([^']+)' (\d+)-max Seat #(\d+) is the button/);
    if (!tableMatch) {
      throw new Error(`Invalid table format: ${tableLine}`);
    }

    return {
      name: tableMatch[1],
      maxSeats: parseInt(tableMatch[2], 10),
      buttonSeat: parseInt(tableMatch[3], 10),
    };
  }

  /**
   * プレイヤー情報をパース
   */
  private parsePlayers(): Player[] {
    const players: Player[] = [];

    while (this.hasMoreLines()) {
      const line = this.getLine();
      
      // Seat 1: PlayerName ($100 in chips)
      const seatMatch = line.match(/^Seat (\d+): ([^(]+) \(\$?([0-9.]+) in chips\)/);
      if (!seatMatch) {
        break; // プレイヤー行の終了
      }

      const seat = parseInt(seatMatch[1], 10);
      const name = seatMatch[2].trim();
      const chips = parseFloat(seatMatch[3]);

      players.push({
        seat,
        name,
        chips,
      });

      this.nextLine();
    }

    if (players.length === 0) {
      throw new Error('No players found in hand history');
    }

    return players;
  }

  /**
   * アクションをパース
   */
  private parseActions(): Action[] {
    const actions: Action[] = [];
    let currentStreet: Street = 'preflop';

    while (this.hasMoreLines()) {
      const line = this.getLine();
      
      // ストリートの変更をチェック
      if (line.startsWith('*** FLOP ***')) {
        currentStreet = 'flop';
        // フロップカードのパース
        const cardMatch = line.match(/\[(.*?)\]/);
        if (cardMatch) {
          const cards = cardMatch[1].split(' ');
          actions.push({
            index: this.actionIndex++,
            street: currentStreet,
            type: 'deal',
            cards,
          });
        }
        this.nextLine();
        continue;
      }

      if (line.startsWith('*** TURN ***')) {
        currentStreet = 'turn';
        const cardMatch = line.match(/\[(.*?)\]/);
        if (cardMatch) {
          const allCards = cardMatch[1].split(' ');
          const turnCard = allCards[allCards.length - 1]; // 最後のカードがターン
          actions.push({
            index: this.actionIndex++,
            street: currentStreet,
            type: 'deal',
            cards: [turnCard],
          });
        }
        this.nextLine();
        continue;
      }

      if (line.startsWith('*** RIVER ***')) {
        currentStreet = 'river';
        const cardMatch = line.match(/\[(.*?)\]/);
        if (cardMatch) {
          const allCards = cardMatch[1].split(' ');
          const riverCard = allCards[allCards.length - 1]; // 最後のカードがリバー
          actions.push({
            index: this.actionIndex++,
            street: currentStreet,
            type: 'deal',
            cards: [riverCard],
          });
        }
        this.nextLine();
        continue;
      }

      if (line.startsWith('*** SHOW DOWN ***')) {
        currentStreet = 'showdown';
        this.nextLine();
        continue;
      }

      // 通常のアクション行をパース
      const action = this.parseActionLine(line, currentStreet);
      if (action) {
        actions.push(action);
      }

      this.nextLine();

      // サマリー行が始まったら終了
      if (line.startsWith('*** SUMMARY ***')) {
        break;
      }
    }

    return actions;
  }

  /**
   * 個別のアクション行をパース
   */
  private parseActionLine(line: string, street: Street): Action | null {
    // PlayerName: posts small blind $1
    const blindMatch = line.match(/^([^:]+): posts (small blind|big blind|ante) \$?([0-9.]+)/);
    if (blindMatch) {
      const player = blindMatch[1].trim();
      const amount = parseFloat(blindMatch[3]);
      const type = blindMatch[2].includes('ante') ? 'ante' : 'blind';
      
      this.updatePlayerChips(player, amount);
      
      return {
        index: this.actionIndex++,
        street,
        type: type as ActionType,
        player,
        amount,
      };
    }

    // PlayerName: folds
    const foldMatch = line.match(/^([^:]+): folds/);
    if (foldMatch) {
      const player = foldMatch[1].trim();
      this.activePlayers.delete(player);
      
      return {
        index: this.actionIndex++,
        street,
        type: 'fold',
        player,
      };
    }

    // PlayerName: checks
    const checkMatch = line.match(/^([^:]+): checks/);
    if (checkMatch) {
      return {
        index: this.actionIndex++,
        street,
        type: 'check',
        player: checkMatch[1].trim(),
      };
    }

    // PlayerName: calls $10
    const callMatch = line.match(/^([^:]+): calls \$?([0-9.]+)/);
    if (callMatch) {
      const player = callMatch[1].trim();
      const amount = parseFloat(callMatch[2]);
      
      const isAllIn = this.updatePlayerChips(player, amount);
      
      return {
        index: this.actionIndex++,
        street,
        type: 'call',
        player,
        amount,
        isAllIn,
      };
    }

    // PlayerName: bets $10
    const betMatch = line.match(/^([^:]+): bets \$?([0-9.]+)/);
    if (betMatch) {
      const player = betMatch[1].trim();
      const amount = parseFloat(betMatch[2]);
      
      const isAllIn = this.updatePlayerChips(player, amount);
      
      return {
        index: this.actionIndex++,
        street,
        type: 'bet',
        player,
        amount,
        isAllIn,
      };
    }

    // PlayerName: raises $10 to $20
    const raiseMatch = line.match(/^([^:]+): raises \$?([0-9.]+) to \$?([0-9.]+)/);
    if (raiseMatch) {
      const player = raiseMatch[1].trim();
      const totalAmount = parseFloat(raiseMatch[3]);
      
      const isAllIn = this.updatePlayerChips(player, totalAmount);
      
      return {
        index: this.actionIndex++,
        street,
        type: 'raise',
        player,
        amount: totalAmount,
        isAllIn,
      };
    }

    // その他の特殊アクション（uncalled bet, collected等）は後で実装

    return null; // 認識できない行
  }

  /**
   * プレイヤーのチップを更新し、オールインかどうかを返す
   */
  private updatePlayerChips(player: string, amount: number): boolean {
    const currentChips = this.playerChips.get(player) || 0;
    const newChips = currentChips - amount;
    this.playerChips.set(player, Math.max(0, newChips));
    this.totalPotContributions += amount;

    const isAllIn = newChips <= 0;
    if (isAllIn) {
      this.allInPlayers.set(player, amount);
    }

    return isAllIn;
  }

  /**
   * ボードカードをアクションから抽出
   */
  private parseBoardCards(actions: Action[]): PlayingCard[] {
    const boardCards: string[] = [];

    actions.forEach(action => {
      if (action.type === 'deal' && action.cards) {
        boardCards.push(...action.cards);
      }
    });

    return toPlayingCardArray(boardCards);
  }

  /**
   * ポット情報をパース（簡略版）
   */
  private parsePots(): Pot[] {
    // 簡略版：単一のポットを返す
    // 実際の実装では、サマリーセクションから詳細なポット情報をパースする
    return [{
      amount: this.totalPotContributions,
      players: Array.from(this.activePlayers),
    }];
  }
}