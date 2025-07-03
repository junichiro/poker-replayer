import { PokerHand, Player, Action, Pot } from '../types';

import { IHandHistoryValidator } from './interfaces';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Service responsible for validating poker hand history data
 * and ensuring data consistency and integrity
 */
export class HandHistoryValidator implements IHandHistoryValidator {
  /**
   * Validate overall hand structure and consistency
   */
  validateHandStructure(hand: PokerHand): ValidationResult {
    const errors: string[] = [];

    // Check required fields
    if (!hand.id || hand.id.trim() === '') {
      errors.push('Hand ID is required');
    }

    if (!hand.stakes || hand.stakes.trim() === '') {
      errors.push('Stakes information is required');
    }

    if (!hand.date) {
      errors.push('Hand date is required');
    }

    if (!hand.table) {
      errors.push('Table information is required');
    } else {
      if (!hand.table.name || hand.table.name.trim() === '') {
        errors.push('Table name is required');
      }
      if (!hand.table.maxSeats || hand.table.maxSeats < 2) {
        errors.push('Table must have at least 2 seats');
      }
    }

    // Check players
    if (!hand.players || hand.players.length < 2) {
      errors.push('At least 2 players are required');
    }

    // Check actions array exists
    if (!hand.actions) {
      errors.push('Actions array is required');
    }

    // Check board array exists
    if (!hand.board) {
      errors.push('Board array is required');
    }

    // Check pots array exists
    if (!hand.pots) {
      errors.push('Pots array is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate player state consistency throughout the hand
   */
  validatePlayerConsistency(players: Player[], actions: Action[]): ValidationResult {
    const errors: string[] = [];

    if (!players || !actions) {
      errors.push('Players and actions arrays are required');
      return { isValid: false, errors };
    }

    // Check for duplicate seat numbers
    const seatNumbers = new Set<number>();
    for (const player of players) {
      if (seatNumbers.has(player.seat)) {
        errors.push(`Duplicate seat number: ${player.seat}`);
      }
      seatNumbers.add(player.seat);
    }

    // Check for duplicate player names
    const playerNames = new Set<string>();
    for (const player of players) {
      if (playerNames.has(player.name)) {
        errors.push(`Duplicate player name: ${player.name}`);
      }
      playerNames.add(player.name);
    }

    // Check that all actions reference valid players
    const validPlayerNames = new Set(players.map(p => p.name));
    for (const action of actions) {
      if (action.player && !validPlayerNames.has(action.player)) {
        errors.push(`Action by unknown player: ${action.player}`);
      }
    }

    // Check player chip amounts are non-negative
    for (const player of players) {
      if (player.chips < 0) {
        errors.push(`Player ${player.name} has negative chips: ${player.chips}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate that pot totals match action amounts
   */
  validatePotTotals(pots: Pot[], actions: Action[]): ValidationResult {
    const errors: string[] = [];

    if (!pots || !actions) {
      errors.push('Pots and actions arrays are required');
      return { isValid: false, errors };
    }

    // Calculate total pot amount
    const totalPotAmount = pots.reduce((sum, pot) => sum + pot.amount, 0);

    // Calculate total contributions from actions (excluding collection and uncalled bets)
    const contributionActions = actions.filter(
      action =>
        action.amount && action.amount > 0 && !['collected', 'uncalled'].includes(action.type)
    );

    const totalContributions = contributionActions.reduce(
      (sum, action) => sum + (action.amount || 0),
      0
    );

    // Allow for small floating point differences
    const tolerance = 0.01;
    if (Math.abs(totalPotAmount - totalContributions) > tolerance) {
      errors.push(`Pot total mismatch: expected ${totalContributions}, got ${totalPotAmount}`);
    }

    // Validate individual pot structures
    for (const pot of pots) {
      if (pot.amount < 0) {
        errors.push(`Pot has negative amount: ${pot.amount}`);
      }

      if (!pot.eligiblePlayers || pot.eligiblePlayers.length === 0) {
        errors.push('Pot must have at least one eligible player');
      }

      if (pot.players && pot.players.length === 0) {
        errors.push('Pot with winners must have at least one player');
      }

      // Check side pot consistency
      if (pot.isSide && typeof pot.sidePotLevel !== 'number') {
        errors.push('Side pot must have a valid side pot level');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate all aspects of a hand in one call
   */
  validateCompleteHand(hand: PokerHand): ValidationResult {
    const structureResult = this.validateHandStructure(hand);
    const playerResult = this.validatePlayerConsistency(hand.players, hand.actions);
    const potResult = this.validatePotTotals(hand.pots, hand.actions);

    const allErrors = [...structureResult.errors, ...playerResult.errors, ...potResult.errors];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }
}
