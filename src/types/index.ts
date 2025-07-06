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
export type ActionType =
  | 'blind'
  | 'ante'
  | 'deal'
  | 'fold'
  | 'check'
  | 'call'
  | 'bet'
  | 'raise'
  | 'show'
  | 'uncalled'
  | 'collected'
  | 'muck'
  | 'timeout'
  | 'disconnect'
  | 'reconnect'
  | 'sitout'
  | 'return';

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
  /** Amount of rake taken from the hand (if any) */
  rake?: number;
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
 * @public
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
 * Interface for calculating pot distributions in complex scenarios
 * @public
 */
export interface PotCalculation {
  /** The total amount of money in all pots combined */
  totalPot: number;
  /** The amount in the main pot (if side pots exist) */
  mainPot?: number;
  /** Array of side pots with their levels and amounts */
  sidePots: { level: number; amount: number }[];
  /** Detailed distribution breakdown for complex scenarios */
  distributions: {
    player: string;
    amount: number;
    from: 'main' | `side-${number}`;
  }[];
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
  theme?: ComponentTheme | CustomTheme;
  /** Whether to show all players' hole cards */
  showAllCards?: boolean;
  /** Whether to enable sound effects */
  enableSounds?: boolean;
  /** Overall size variant for the component */
  size?: ComponentSize;
  /** Custom color scheme override */
  customColors?: Partial<ThemeColors>;
  /** Table shape preference */
  tableShape?: TableShape;
  /** Card design variant */
  cardDesign?: CardDesign;
  /** Animation configuration */
  animations?: AnimationConfig;
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
export type ReplayEventCallback = (
  event:
    | 'start'
    | 'pause'
    | 'resume'
    | 'end'
    | 'reset'
    | 'retry'
    | 'error'
    | 'parseSuccess'
    | 'parseError',
  data?: {
    /** Additional event data */
    [key: string]: unknown;
    /** Hand data for parseSuccess event */
    hand?: PokerHand;
    /** Error data for error events */
    error?: Error;
    /** Retry attempt number */
    attempt?: number;
    /** Whether max attempts exceeded */
    maxAttemptsExceeded?: boolean;
  }
) => void;

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
export type ComponentSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';

/**
 * Visual theme options for components
 * @public
 */
export type ComponentTheme = 'light' | 'dark' | 'auto' | 'casino' | 'professional';

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

// =============================================================================
// ADVANCED CUSTOMIZATION TYPES
// =============================================================================

/**
 * Theme color palette definition
 * @public
 */
export interface ThemeColors {
  /** Primary background color */
  bgPrimary: string;
  /** Secondary background color */
  bgSecondary: string;
  /** Table background color */
  bgTable: string;
  /** Primary text color */
  textPrimary: string;
  /** Secondary text color */
  textSecondary: string;
  /** Border color */
  border: string;
  /** Card background color */
  cardBg: string;
  /** Card text color */
  cardText: string;
  /** Hero player highlight color */
  heroHighlight: string;
  /** All-in player indicator color */
  allInIndicator: string;
  /** Action highlight color */
  actionHighlight: string;
  /** Pot color */
  potColor: string;
}

/**
 * Custom theme definition
 * @public
 */
export interface CustomTheme {
  /** Theme name/identifier */
  name: string;
  /** Complete color palette */
  colors: ThemeColors;
  /** Optional CSS class for additional styling */
  className?: string;
}

/**
 * Table shape options
 * @public
 */
export type TableShape = 'oval' | 'rectangle' | 'circle' | 'hexagon';

/**
 * Card design variants
 * @public
 */
export type CardDesign = 'standard' | 'four-color' | 'large-indices' | 'minimal' | 'classic';

/**
 * Animation configuration options
 * @public
 */
export interface AnimationConfig {
  /** Enable/disable card dealing animations */
  enableCardAnimations?: boolean;
  /** Enable/disable chip movement animations */
  enableChipAnimations?: boolean;
  /** Enable/disable action highlighting */
  enableActionHighlight?: boolean;
  /** Card dealing animation duration (ms) */
  cardDealDuration?: number;
  /** Action transition duration (ms) */
  actionTransitionDuration?: number;
  /** Easing function for animations */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Extended animation configuration for OCP animation system
 * @public
 */
export interface ExtendedAnimationConfig {
  /** Animation duration in milliseconds */
  duration: number;
  /** CSS easing function */
  easing: string;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Number of iterations (1 = once, Infinity = infinite) */
  iterations?: number;
  /** Fill mode for animation */
  fillMode?: 'forwards' | 'backwards' | 'both' | 'none';
  /** Custom properties for specific strategies */
  customProperties?: Record<string, any>;
}

/**
 * Animation strategy types
 * @public
 */
export enum AnimationType {
  CARD_DEAL = 'card-deal',
  CHIP_MOVE = 'chip-move',
  PLAYER_ACTION = 'player-action',
  POT_COLLECTION = 'pot-collection',
  FOLD_ANIMATION = 'fold-animation',
  ALL_IN_ANIMATION = 'all-in-animation',
  CUSTOM = 'custom',
}

/**
 * 2D Point interface for animation paths
 * @public
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Animation strategy interface
 * @public
 */
export interface IAnimationStrategy {
  /** Strategy name */
  readonly name: string;
  /** Strategy version */
  readonly version: string;

  /**
   * Execute animation for given element and action
   */
  animate(element: HTMLElement, action: Action, config: ExtendedAnimationConfig): Promise<void>;

  /**
   * Check if strategy can animate the given action
   */
  canAnimate(action: Action): boolean;

  /**
   * Get default configuration for this strategy
   */
  getDefaultConfig(): ExtendedAnimationConfig;

  /**
   * Cleanup resources used by strategy
   */
  cleanup(): void;
}

/**
 * Animation manager interface
 * @public
 */
export interface IAnimationManager {
  /**
   * Register animation strategy for a type
   */
  registerStrategy(type: AnimationType, strategy: IAnimationStrategy): void;

  /**
   * Unregister animation strategy for a type
   */
  unregisterStrategy(type: AnimationType): void;

  /**
   * Execute animation for given type
   */
  executeAnimation(
    type: AnimationType,
    element: HTMLElement,
    action: Action,
    config?: Partial<ExtendedAnimationConfig>
  ): Promise<void>;

  /**
   * Get map of available strategies
   */
  getAvailableStrategies(): Map<AnimationType, IAnimationStrategy>;

  /**
   * Set global configuration that applies to all animations
   */
  setGlobalConfig(config: Partial<ExtendedAnimationConfig>): void;

  /**
   * Check if any animations are currently running
   */
  isAnimating(): boolean;

  /**
   * Stop all running animations
   */
  stopAllAnimations(): void;
}

/**
 * Animation step for composition
 * @public
 */
export interface AnimationStep {
  type: AnimationType;
  element: HTMLElement;
  action: Action;
  config?: Partial<ExtendedAnimationConfig>;
  delay?: number;
}

/**
 * Animation composer interface
 * @public
 */
export interface IAnimationComposer {
  /**
   * Execute animations sequentially
   */
  composeSequential(animations: AnimationStep[]): Promise<void>;

  /**
   * Execute animations in parallel
   */
  composeParallel(animations: AnimationStep[]): Promise<void>;

  /**
   * Execute animations with custom composition logic
   */
  composeCustom(composer: (animations: AnimationStep[]) => Promise<void>): Promise<void>;
}

/**
 * Size scaling configuration
 * @public
 */
export interface SizeConfig {
  /** Card size scaling factor */
  cardScale?: number;
  /** Table size scaling factor */
  tableScale?: number;
  /** Font size scaling factor */
  fontScale?: number;
  /** Spacing scaling factor */
  spacingScale?: number;
}

/**
 * Extended component size variants with scaling
 * @public
 */
export type ExtendedComponentSize = ComponentSize | 'extra-small' | 'extra-large' | SizeConfig;

// =============================================================================
// PARSER ARCHITECTURE TYPES (OPEN/CLOSED PRINCIPLE)
// =============================================================================

/**
 * Supported poker site formats for extensible parser architecture
 * @public
 */
export enum PokerSiteFormat {
  POKERSTARS = 'pokerstars',
  PARTYPOKER = 'partypoker',
  EIGHT88POKER = '888poker',
  WINAMAX = 'winamax',
  GENERIC = 'generic',
}

/**
 * Supported poker features that can vary by site
 * @public
 */
export enum PokerFeature {
  SIDE_POTS = 'side_pots',
  RAKE_TRACKING = 'rake_tracking',
  TOURNAMENT_SUPPORT = 'tournament_support',
  MULTI_TABLE = 'multi_table',
  ANTES = 'antes',
  STRADDLES = 'straddles',
  RUN_IT_TWICE = 'run_it_twice',
  TIME_BANKS = 'time_banks',
}

/**
 * Information about a parser implementation
 * @public
 */
export interface ParserInfo {
  /** Human-readable name of the parser */
  name: string;
  /** Version of the parser implementation */
  version: string;
  /** List of features supported by this parser */
  supportedFeatures: PokerFeature[];
  /** The poker site format this parser handles */
  siteFormat: PokerSiteFormat;
}

/**
 * Core interface that all hand history parsers must implement
 * Enables Open/Closed Principle by allowing new parsers to be added
 * without modifying existing code
 * @public
 */
export interface IHandHistoryParser {
  /**
   * Parse a hand history string into a structured PokerHand object
   * @param handHistory - Raw hand history text to parse
   * @returns Parsing result with success/error information
   */
  parse(handHistory: string): ParserResult;

  /**
   * Get the poker site format that this parser supports
   * @returns The supported format enum value
   */
  getSupportedFormat(): PokerSiteFormat;

  /**
   * Validate if a hand history string matches this parser's format
   * @param handHistory - Raw hand history text to validate
   * @returns True if the format is supported, false otherwise
   */
  validateFormat(handHistory: string): boolean;

  /**
   * Get information about this parser implementation
   * @returns Parser metadata including name, version, and features
   */
  getParserInfo(): ParserInfo;
}

/**
 * Factory interface for creating parser instances
 * Implements Factory pattern for extensible parser creation
 * @public
 */
export interface IHandHistoryParserFactory {
  /**
   * Create a parser instance for the specified format
   * @param format - The poker site format to create a parser for
   * @returns Parser instance capable of handling the specified format
   * @throws Error if the format is not supported
   */
  createParser(format: PokerSiteFormat): IHandHistoryParser;

  /**
   * Detect the poker site format from a hand history string
   * @param handHistory - Raw hand history text to analyze
   * @returns The detected format, or GENERIC if unknown
   */
  detectFormat(handHistory: string): PokerSiteFormat;

  /**
   * Register a new parser implementation for a specific format
   * @param format - The format this parser handles
   * @param parserClass - Constructor for the parser class
   */
  registerParser(format: PokerSiteFormat, parserClass: new () => IHandHistoryParser): void;

  /**
   * Get a list of all currently supported formats
   * @returns Array of supported poker site formats
   */
  getSupportedFormats(): PokerSiteFormat[];
}

/**
 * Configuration options for parser behavior
 * @public
 */
export interface ParserConfiguration {
  /** Whether to track rake information */
  enableRakeTracking: boolean;
  /** Whether to calculate side pots */
  enableSidePots: boolean;
  /** Whether to support tournament-specific features */
  enableTournamentSupport: boolean;
  /** Date format parsing pattern */
  dateFormat: string;
  /** Currency format for monetary amounts */
  currencyFormat: string;
  /** Custom regex patterns for site-specific parsing */
  customRegexPatterns?: Record<string, RegExp>;
}

/**
 * Interface for parsers that support configuration
 * @public
 */
export interface IConfigurableParser extends IHandHistoryParser {
  /**
   * Configure the parser with specific options
   * @param config - Configuration options to apply
   */
  configure(config: ParserConfiguration): void;

  /**
   * Get the current parser configuration
   * @returns Current configuration object
   */
  getConfiguration(): ParserConfiguration;
}
