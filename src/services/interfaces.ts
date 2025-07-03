import { Pot, CollectedAction, PotCalculation } from '../types';

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