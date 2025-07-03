import {
  Pot,
  CollectedAction,
  PotCalculation,
  Action,
  AnimationConfig,
  PokerHand,
  NumericConstraints,
} from '../types';

/**
 * Interface for pot calculation functionality
 */
export interface IPotCalculator {
  /**
   * Calculate pot structure based on all-in amounts and total contributions
   */
  calculatePotStructure(
    allInAmounts: number[],
    totalContributions: number,
    activePlayers: Set<string>,
    allInPlayers?: Map<string, number>
  ): PotCalculation;

  /**
   * Get list of players eligible for a specific pot level
   */
  getEligiblePlayers(
    sidePotLevel: number,
    allInPlayers: Map<string, number>,
    activePlayers: Set<string>
  ): string[];

  /**
   * Validate pot mathematics against collected actions
   */
  validatePotMath(pots: Pot[], collectedActions: CollectedAction[], rake?: number): void;

  /**
   * Enhance pots with split pot information and odd chip winners
   */
  enhancePots(pots: Pot[], collectedActions: CollectedAction[]): void;
}

/**
 * Interface for player state tracking functionality
 */
export interface IPlayerStateTracker {
  /**
   * Update player chip amount
   */
  trackPlayerChips(player: string, amount: number): void;

  /**
   * Mark player as all-in with specified amount
   */
  markPlayerAllIn(player: string, amount: number): void;

  /**
   * Remove player from active players (folded)
   */
  removeActivePlayer(player: string): void;

  /**
   * Get current chips for a player
   */
  getPlayerChips(player: string): number;

  /**
   * Get all players who went all-in and their amounts
   */
  getAllInPlayers(): Map<string, number>;

  /**
   * Get all players who are still active (not folded)
   */
  getActivePlayers(): Set<string>;

  /**
   * Reset all tracking state
   */
  reset(): void;

  /**
   * Initialize player chips
   */
  initializePlayer(player: string, chips: number): void;

  /**
   * Check if a player is currently all-in
   */
  isPlayerAllIn(player: string): boolean;

  /**
   * Check if a player is currently active
   */
  isPlayerActive(player: string): boolean;
}

/**
 * Interface for action parsing functionality
 */
export interface IActionParser {
  /**
   * Parse a single line into an Action object
   */
  parseAction(line: string, street: string): any | null;

  /**
   * Create an Action object with specified parameters
   */
  createAction(type: string, player: string, amount?: number, street?: string): any;

  /**
   * Extract collected actions from hand history lines
   */
  extractCollectedActions(lines: string[]): CollectedAction[];

  /**
   * Reset action index for new hand parsing
   */
  reset(): void;
}

/**
 * Interface for hand history validation functionality
 */
export interface IHandHistoryValidator {
  /**
   * Validate overall hand structure and consistency
   */
  validateHandStructure(hand: any): { isValid: boolean; errors: string[] };

  /**
   * Validate player state consistency throughout the hand
   */
  validatePlayerConsistency(players: any[], actions: any[]): { isValid: boolean; errors: string[] };

  /**
   * Validate that pot totals match action amounts
   */
  validatePotTotals(pots: Pot[], actions: any[]): { isValid: boolean; errors: string[] };
}

/**
 * Game state for the replay controller
 */
export interface GameState {
  isPlaying: boolean;
  currentActionIndex: number;
  canStepForward: boolean;
  canStepBackward: boolean;
  totalActions: number;
}

/**
 * Interface for game flow control functionality
 */
export interface IGameController {
  /**
   * Start automatic playback
   */
  play(): void;

  /**
   * Pause automatic playback
   */
  pause(): void;

  /**
   * Stop playback and reset to beginning
   */
  stop(): void;

  /**
   * Step forward one action
   */
  stepForward(): boolean;

  /**
   * Step backward one action
   */
  stepBackward(): boolean;

  /**
   * Go to a specific action index
   */
  goToAction(index: number): void;

  /**
   * Get the current action being displayed
   */
  getCurrentAction(): Action | null;

  /**
   * Check if can step forward
   */
  canStepForward(): boolean;

  /**
   * Check if can step backward
   */
  canStepBackward(): boolean;

  /**
   * Get current game state
   */
  getGameState(): GameState;

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: GameState) => void): () => void;
}

/**
 * Animation state for the service
 */
export interface AnimationState {
  isPlaying: boolean;
  currentActionIndex: number;
  totalActions: number;
  speed: number;
  canStepForward: boolean;
  canStepBackward: boolean;
}

/**
 * Animation event data
 */
export interface AnimationEvent {
  type:
    | 'start'
    | 'progress'
    | 'complete'
    | 'pause'
    | 'stop'
    | 'cardDeal'
    | 'chipMovement'
    | 'actionHighlight';
  currentIndex?: number;
  totalActions?: number;
  cards?: string[];
  player?: string;
  amount?: number;
  actionType?: string;
  duration?: number;
}

/**
 * Interface for animation control functionality
 */
export interface IAnimationService {
  /**
   * Start animation playback
   */
  play(): void;

  /**
   * Pause animation playback
   */
  pause(): void;

  /**
   * Stop animation and reset to beginning
   */
  stop(): void;

  /**
   * Step forward one action
   */
  stepForward(): boolean;

  /**
   * Step backward one action
   */
  stepBackward(): boolean;

  /**
   * Go to a specific action index
   */
  goToAction(index: number): void;

  /**
   * Set animation speed
   */
  setSpeed(speed: number): void;

  /**
   * Get current animation speed
   */
  getCurrentSpeed(): number;

  /**
   * Get current action index
   */
  getCurrentActionIndex(): number;

  /**
   * Check if animation is playing
   */
  isPlaying(): boolean;

  /**
   * Get current animation state
   */
  getAnimationState(): AnimationState;

  /**
   * Play card animation for specific action
   */
  playCardAnimation(action: Action): Promise<void>;

  /**
   * Play chip animation for specific action
   */
  playChipAnimation(action: Action): Promise<void>;

  /**
   * Play action highlight animation
   */
  playActionHighlight(action: Action): Promise<void>;

  /**
   * Check if card animations are enabled
   */
  isCardAnimationEnabled(): boolean;

  /**
   * Check if chip animations are enabled
   */
  isChipAnimationEnabled(): boolean;

  /**
   * Check if action highlights are enabled
   */
  isActionHighlightEnabled(): boolean;

  /**
   * Get card deal duration
   */
  getCardDealDuration(): number;

  /**
   * Get action transition duration
   */
  getActionTransitionDuration(): number;

  /**
   * Update animation configuration
   */
  updateConfig(config: Partial<AnimationConfig>): void;

  /**
   * Subscribe to animation events
   */
  subscribe(event: string, listener: (data: AnimationEvent) => void): () => void;

  /**
   * Destroy service and clean up resources
   */
  destroy(): void;
}

/**
 * Action categories for classification
 */
export type ActionCategory = 'forced' | 'aggressive' | 'passive' | 'neutral' | 'system';

/**
 * Action priority levels
 */
export type ActionPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Action formatting options
 */
export interface FormatOptions {
  includeBBMultiple?: boolean;
  includePercentage?: boolean;
  verbose?: boolean;
}

/**
 * Amount formatting context
 */
export interface AmountContext {
  bigBlind: number;
  potSize?: number;
  includePercentage?: boolean;
}

/**
 * Action filtering criteria
 */
export interface FilterCriteria {
  player?: string;
  types?: string[];
  street?: string;
  amountRange?: { min: number; max: number };
  significance?: ActionPriority;
}

/**
 * Action statistics
 */
export interface ActionStatistics {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByStreet: Record<string, number>;
  actionsByPlayer: Record<string, number>;
  totalAmount: number;
  averageAmount: number;
}

/**
 * Player-specific statistics
 */
export interface PlayerStatistics {
  totalActions: number;
  aggressiveActions: number;
  passiveActions: number;
  vpip: boolean;
  pfr: boolean;
  aggression: number;
  winnings?: number;
}

/**
 * Key moments in hand history
 */
export interface KeyMoment {
  type: 'big_raise' | 'all_in' | 'fold_to_raise' | 'bad_beat' | 'bluff' | 'value_bet';
  actionIndex: number;
  description: string;
  significance: ActionPriority;
}

/**
 * Action analyzer configuration
 */
export interface ActionAnalyzerConfig {
  significantRaiseThreshold: number;
  bigBlindSize: number;
  aggressionThreshold: number;
  allInThreshold: number;
}

/**
 * Interface for action analysis functionality
 */
export interface IActionAnalyzer {
  /**
   * Categorize an action by type
   */
  categorizeAction(action: Action): ActionCategory;

  /**
   * Get action priority/importance
   */
  getActionPriority(action: Action, hand: PokerHand): ActionPriority;

  /**
   * Check if action is significant
   */
  isSignificantAction(action: Action, hand: PokerHand): boolean;

  /**
   * Format action for display
   */
  formatAction(action: Action, options?: FormatOptions): string;

  /**
   * Get detailed action description
   */
  getActionDescription(action: Action, hand: PokerHand, verbose?: boolean): string;

  /**
   * Format amount with context
   */
  formatAmount(amount: number, context: AmountContext): string;

  /**
   * Filter actions by criteria
   */
  filterActions(actions: Action[], criteria: FilterCriteria): Action[];

  /**
   * Search actions by query
   */
  searchActions(actions: Action[], query: string): Action[];

  /**
   * Get action statistics
   */
  getActionStats(actions: Action[]): ActionStatistics;

  /**
   * Get player-specific statistics
   */
  getPlayerStats(actions: Action[], player: string): PlayerStatistics;

  /**
   * Identify key moments in hand
   */
  identifyKeyMoments(hand: PokerHand): KeyMoment[];

  /**
   * Update analyzer configuration
   */
  updateConfig(config: Partial<ActionAnalyzerConfig>): void;

  /**
   * Get current configuration
   */
  getConfig(): ActionAnalyzerConfig;
}

/**
 * Action index validation result
 */
export interface ActionIndexValidationResult {
  isValid: boolean;
  isAtStart: boolean;
  isAtEnd: boolean;
  errors: string[];
}

/**
 * Control state validation result
 */
export interface ControlStateValidationResult {
  canGoToPrevious: boolean;
  canGoToNext: boolean;
  canReset: boolean;
  canPlayPause: boolean;
  validationErrors: string[];
}

/**
 * Transition validation result
 */
export interface TransitionValidationResult {
  isValidTransition: boolean;
  reason?: string;
}

/**
 * Playback state validation result
 */
export interface PlaybackStateValidationResult {
  canPlay: boolean;
  canPause: boolean;
  shouldStop: boolean;
  reasons: string[];
}

/**
 * Numeric constraints validation result
 */
export interface NumericValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Game state for validation
 */
export interface GameStateForValidation {
  isPlaying: boolean;
  currentActionIndex: number;
  totalActions: number;
  canStepForward: boolean;
  canStepBackward: boolean;
}

/**
 * Game state validation result
 */
export interface GameStateValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Hand structure validation result
 */
export interface HandStructureValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validation service configuration
 */
export interface ValidationServiceConfig {
  strictValidation: boolean;
  allowIncrementalValidation: boolean;
  maxActionIndex: number;
  enableWarnings: boolean;
}

/**
 * Interface for validation functionality
 */
export interface IValidationService {
  /**
   * Validate action index bounds and position
   */
  validateActionIndex(index: number, totalActions: number): ActionIndexValidationResult;

  /**
   * Validate control state based on current game position
   */
  validateControlState(
    currentActionIndex: number,
    totalActions: number,
    isPlaying: boolean,
    disabled?: boolean
  ): ControlStateValidationResult;

  /**
   * Validate transition between action indices
   */
  validateTransition(from: number, to: number, totalActions: number): TransitionValidationResult;

  /**
   * Validate playback state
   */
  validatePlaybackState(
    isPlaying: boolean,
    currentIndex: number,
    totalActions: number
  ): PlaybackStateValidationResult;

  /**
   * Validate numeric constraints
   */
  validateNumericConstraints(
    value: number,
    constraints: NumericConstraints
  ): NumericValidationResult;

  /**
   * Validate game state consistency
   */
  validateGameState(state: GameStateForValidation): GameStateValidationResult;

  /**
   * Validate hand structure and data integrity
   */
  validateHandStructure(hand: PokerHand): HandStructureValidationResult;

  /**
   * Update validation configuration
   */
  updateConfig(config: Partial<ValidationServiceConfig>): void;

  /**
   * Get current validation configuration
   */
  getConfig(): ValidationServiceConfig;
}
