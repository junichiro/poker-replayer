import { IPlayerStateTracker } from './interfaces';

/**
 * Service responsible for tracking player state throughout a poker hand,
 * including chip counts, all-in status, and active player management
 */
export class PlayerStateTracker implements IPlayerStateTracker {
  private playerChips: Map<string, number>;
  private allInPlayers: Map<string, number>;
  private activePlayers: Set<string>;

  constructor() {
    this.playerChips = new Map();
    this.allInPlayers = new Map();
    this.activePlayers = new Set();
  }

  /**
   * Initialize a player with starting chip amount
   */
  initializePlayer(player: string, chips: number): void {
    this.playerChips.set(player, chips);
    this.activePlayers.add(player);
  }

  /**
   * Update player chip amount
   */
  trackPlayerChips(player: string, amount: number): void {
    // Ensure chip amount doesn't go below 0
    const adjustedAmount = Math.max(0, amount);
    this.playerChips.set(player, adjustedAmount);
  }

  /**
   * Mark player as all-in with specified amount
   */
  markPlayerAllIn(player: string, amount: number): void {
    this.allInPlayers.set(player, amount);
    // All-in players are no longer active for betting actions
    this.activePlayers.delete(player);
  }

  /**
   * Remove player from active players (typically when folding)
   */
  removeActivePlayer(player: string): void {
    this.activePlayers.delete(player);
  }

  /**
   * Get current chips for a player
   */
  getPlayerChips(player: string): number {
    return this.playerChips.get(player) || 0;
  }

  /**
   * Get all players who went all-in and their amounts
   */
  getAllInPlayers(): Map<string, number> {
    return new Map(this.allInPlayers);
  }

  /**
   * Get all players who are still active (not folded or all-in)
   */
  getActivePlayers(): Set<string> {
    return new Set(this.activePlayers);
  }

  /**
   * Check if a player is currently all-in
   */
  isPlayerAllIn(player: string): boolean {
    return this.allInPlayers.has(player);
  }

  /**
   * Check if a player is currently active
   */
  isPlayerActive(player: string): boolean {
    return this.activePlayers.has(player);
  }

  /**
   * Reset all tracking state
   */
  reset(): void {
    this.playerChips.clear();
    this.allInPlayers.clear();
    this.activePlayers.clear();
  }
}