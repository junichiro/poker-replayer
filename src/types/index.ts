/**
 * @fileoverview TypeScript type definitions for poker hand history parsing and replay
 * 
 * This file contains comprehensive type definitions for all data structures used in
 * the poker hand replay system. It includes interfaces for poker hands, players,
 * actions, pots, and parsing results, along with supporting type definitions.
 * 
 * @author Generated with Claude Code
 * @version 1.0.0
 * @public
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Represents the different streets/phases of a poker hand
 * @public
 */
export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

/**
 * Comprehensive list of all possible poker actions that can occur in a hand
 * @public
 */
export type ActionType = 'blind' | 'ante' | 'deal' | 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'show' | 'uncalled' | 'collected' | 'muck' | 'timeout' | 'disconnect' | 'reconnect' | 'sitout' | 'return';

/**
 * Standard poker table positions
 * BB = Big Blind, SB = Small Blind, BTN = Button, CO = Cutoff, 
 * HJ = Hijack, MP = Middle Position, EP = Early Position, UTG = Under The Gun
 * @public
 */
export type Position = 'BB' | 'SB' | 'BTN' | 'CO' | 'HJ' | 'MP' | 'EP' | 'UTG';

/**
 * Information about the poker table configuration
 * @public
 */
export interface TableInfo {
  /** The name/identifier of the table */
  name: string;
  /** Maximum number of players that can sit at this table */
  maxSeats: number;
  /** The seat number where the dealer button is currently located */
  buttonSeat: number;
}

/**
 * Represents a player in a poker hand with their seat, chips, and status
 * @public
 */
export interface Player {
  /** The seat number (position) of the player at the table */
  seat: number;
  /** The display name of the player */
  name: string;
  /** The starting chip count for this hand */
  chips: number;
  /** The player's hole cards (if known), represented as a tuple of two valid playing cards */
  cards?: [PlayingCard, PlayingCard];
  /** Whether this player is the hero (main player being observed) */
  isHero?: boolean;
  /** The player's position at the table (relative to the button) */
  position?: Position;
  /** Current chip count throughout the hand (updated as actions occur) */
  currentChips?: number;
  /** Whether the player is currently all-in */
  isAllIn?: boolean;
  /** The amount the player went all-in for (if applicable) */
  allInAmount?: number;
}

/**
 * Represents a single action taken during a poker hand
 * @public
 */
export interface Action {
  /** Sequential index of this action in the hand (0-based) */
  index: number;
  /** The street/phase of the hand when this action occurred */
  street: Street;
  /** The type of action performed */
  type: ActionType;
  /** The name of the player who performed this action (if applicable) */
  player?: string;
  /** The monetary amount associated with this action (if applicable) */
  amount?: number;
  /** Cards revealed during this action (for shows, deals, etc.) */
  cards?: string[];
  /** Whether this action resulted in the player being all-in */
  isAllIn?: boolean;
  /** Additional context for special actions (timeouts, disconnects, etc.) */
  reason?: string;
}

/**
 * Represents a pot in a poker hand, including main pots, side pots, and split pots
 * @public
 */
export interface Pot {
  /** The total monetary amount in this pot */
  amount: number;
  /** List of player names who won (or are eligible to win) this pot */
  players: string[];
  /** Whether this is a side pot (true) or main pot (false/undefined) */
  isSide?: boolean;
  /** Whether this pot was split between multiple players */
  isSplit?: boolean;
  /** List of players who are eligible to win this pot based on their actions */
  eligiblePlayers?: string[];
  /** The player who receives the odd chip in case of uneven splits */
  oddChipWinner?: string;
  /** The level of the side pot (1, 2, 3, etc.) for multiple side pot scenarios */
  sidePotLevel?: number;
}

/**
 * Main interface representing a complete poker hand with all its data
 * @public
 */
export interface PokerHand {
  /** Unique identifier for this hand */
  id: string;
  /** Tournament identifier (if this hand is from a tournament) */
  tournamentId?: string;
  /** The stakes of the game (e.g., "$1/$2", "$10+$1") */
  stakes: string;
  /** The date and time when this hand was played */
  date: Date;
  /** Information about the table where this hand was played */
  table: TableInfo;
  /** Array of all players involved in this hand */
  players: Player[];
  /** Chronological sequence of all actions taken during the hand */
  actions: Action[];
  /** Community cards shown on the board (flop, turn, river) */
  board: PlayingCard[];
  /** All pots created during the hand (main pot and any side pots) */
  pots: Pot[];
}

/**
 * Represents an error that occurred during hand history parsing
 * @public
 */
export interface ParserError {
  /** Human-readable error message describing what went wrong */
  message: string;
  /** The line number in the hand history where the error occurred (if known) */
  line?: number;
  /** Additional context around the error (e.g., the problematic line content) */
  context?: string;
}

/**
 * Represents a pot collection action parsed from hand history
 * @internal
 */
export interface CollectedAction {
  /** The name of the player who collected from this pot */
  player: string;
  /** The amount collected by the player */
  amount: number;
  /** The type of pot this collection came from */
  type: 'main' | 'side' | 'single';
  /** The level of the side pot (if this is a side pot collection) */
  sidePotLevel?: number;
}

/**
 * Internal interface for calculating pot distributions in complex scenarios
 * @internal
 */
export interface PotCalculation {
  /** The total amount of money in all pots combined */
  totalPot: number;
  /** The amount in the main pot (if side pots exist) */
  mainPot?: number;
  /** Array of side pots with their levels and amounts */
  sidePots: { level: number; amount: number }[];
  /** Detailed distribution breakdown for complex scenarios */
  distributions: { player: string; amount: number; from: 'main' | `side-${number}` }[];
}

/**
 * Result wrapper for hand history parsing operations.
 * This is a discriminated union based on the `success` property.
 * @public
 */
export type ParserResult =
  | {
      /** Indicates a successful parsing operation. */
      success: true;
      /** The parsed poker hand data. */
      hand: PokerHand;
    }
  | {
      /** Indicates a failed parsing operation. */
      success: false;
      /** Error information. */
      error: ParserError;
    };

/**
 * Configuration options for the poker hand replay component
 * @public
 */
export interface ReplayConfig {
  /** Whether to start playback automatically */
  autoPlay?: boolean;
  /** Animation speed multiplier (1.0 = normal speed) */
  animationSpeed?: number;
  /** Visual theme for the component */
  theme?: 'light' | 'dark' | 'auto';
  /** Whether to show all players' hole cards */
  showAllCards?: boolean;
  /** Whether to enable sound effects */
  enableSounds?: boolean;
}

/**
 * Callback function type for action change events
 * @public
 */
export type ActionChangeCallback = (action: Action, index: number) => void;

/**
 * Callback function type for hand replay events
 * @public
 */
export type ReplayEventCallback = (event: 'start' | 'pause' | 'resume' | 'end' | 'reset') => void;

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/**
 * Common base props that most components can accept
 * @public
 */
export interface BaseComponentProps {
  /** Custom CSS class name for styling */
  className?: string;
  /** React children elements */
  children?: ReactNode;
  /** Data test ID for testing purposes */
  'data-testid'?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * Size variants for components that support different sizes
 * @public
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * Visual theme options for components
 * @public
 */
export type ComponentTheme = 'light' | 'dark' | 'auto';

/**
 * Animation speed variants for components with animations
 * @public
 */
export type AnimationSpeed = 'slow' | 'normal' | 'fast' | number;

/**
 * Playing card representation with strict validation
 * @public
 */
export type PlayingCard = `${CardRank}${CardSuit}`;

/**
 * Valid card ranks in poker
 * @public
 */
export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

/**
 * Valid card suits in poker
 * @public
 */
export type CardSuit = 'h' | 'd' | 'c' | 's';

/**
 * Regular expression pattern for validating playing card format
 * Matches format: rank + suit (e.g., "As", "Kh", "2c", "Tc")
 * @public
 */
export const PLAYING_CARD_REGEX = /^[2-9TJQKA][hdcs]$/;

/**
 * Card display variants using discriminated union
 * @public
 */
export type CardVariant = 
  | { variant: 'visible'; card: PlayingCard }
  | { variant: 'hidden' }
  | { variant: 'placeholder' };

/**
 * Player state variants using discriminated union
 * @public
 */
export type PlayerState = 
  | { state: 'active'; chips: number }
  | { state: 'all-in'; chips: 0; allInAmount: number }
  | { state: 'folded'; chips: number }
  | { state: 'disconnected'; chips: number; reason?: string }
  | { state: 'timeout'; chips: number; reason?: string };

/**
 * Control button states and their associated data
 * @public
 */
export type ControlState = 
  | { type: 'play'; enabled: boolean }
  | { type: 'pause'; enabled: boolean }
  | { type: 'step'; direction: 'forward' | 'backward'; enabled: boolean }
  | { type: 'reset'; enabled: boolean };

/**
 * Validation constraints for numeric props
 * @public
 */
export interface NumericConstraints {
  /** Minimum allowed value (inclusive) */
  min?: number;
  /** Maximum allowed value (inclusive) */
  max?: number;
  /** Value must be an integer */
  integer?: boolean;
  /** Value must be positive (> 0) */
  positive?: boolean;
  /** Value must be non-negative (>= 0) */
  nonNegative?: boolean;
}