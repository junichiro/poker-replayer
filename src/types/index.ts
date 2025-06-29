export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type ActionType = 'blind' | 'ante' | 'deal' | 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'show' | 'uncalled' | 'collected' | 'muck' | 'timeout' | 'disconnect' | 'reconnect' | 'sitout' | 'return';
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
  currentChips?: number; // Track chips throughout hand
  isAllIn?: boolean; // Current all-in status
  allInAmount?: number; // Amount when went all-in
}

export interface Action {
  index: number;
  street: Street;
  type: ActionType;
  player?: string;
  amount?: number;
  cards?: string[];
  isAllIn?: boolean;
  reason?: string; // For timeouts, disconnects, etc.
}

export interface Pot {
  amount: number;
  players: string[];
  isSide?: boolean;
  isSplit?: boolean; // Mark split pots
  eligiblePlayers?: string[]; // Track who can win this pot
  oddChipWinner?: string; // Who gets the odd chip in splits
  sidePotLevel?: number; // For multiple side pots (1, 2, 3, etc.)
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

export interface CollectedAction {
  player: string;
  amount: number;
  type: 'main' | 'side' | 'single';
  sidePotLevel?: number;
}

export interface PotCalculation {
  totalPot: number;
  mainPot?: number;
  sidePots: { level: number; amount: number }[];
  distributions: { player: string; amount: number; from: string }[];
}

export interface ParserResult {
  success: boolean;
  hand?: PokerHand;
  error?: ParserError;
}