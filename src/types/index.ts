export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type ActionType = 'blind' | 'ante' | 'deal' | 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'show' | 'uncalled' | 'collected';
export type Position = 'BB' | 'SB' | 'BTN' | 'CO' | 'HJ' | 'MP' | 'EP' | 'UTG';

export interface TableInfo {
  name: string;
  maxSeats: number;
  buttonSeat: number;
}

export interface Player {
  seat: number;
  name: string;
  chips: number;
  cards?: [string, string];
  isHero?: boolean;
  position?: Position;
}

export interface Action {
  index: number;
  street: Street;
  type: ActionType;
  player?: string;
  amount?: number;
  cards?: string[];
}

export interface Pot {
  amount: number;
  players: string[];
  isSide?: boolean;
}

export interface PokerHand {
  id: string;
  tournamentId?: string;
  stakes: string;
  date: Date;
  table: TableInfo;
  players: Player[];
  actions: Action[];
  board: string[];
  pots: Pot[];
}

export interface ParserError {
  message: string;
  line?: number;
  context?: string;
}

export interface ParserResult {
  success: boolean;
  hand?: PokerHand;
  error?: ParserError;
}