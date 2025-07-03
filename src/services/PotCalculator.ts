import { Pot, CollectedAction, PotCalculation } from '../types';

import { IPotCalculator } from './interfaces';

/**
 * Service responsible for calculating poker pot structures, including side pots
 * and handling complex all-in scenarios
 */
export class PotCalculator implements IPotCalculator {
  /**
   * Calculate pot structure based on all-in amounts and contributions
   */
  calculatePotStructure(
    allInAmounts: number[],
    totalContributions: number,
    activePlayers: Set<string>,
    allInPlayers?: Map<string, number>
  ): PotCalculation {
    const calculation: PotCalculation = {
      totalPot: totalContributions,
      sidePots: [],
      distributions: [],
    };

    // If no all-in players, return simple structure
    if (allInAmounts.length === 0) {
      return calculation;
    }

    // Sort all-in amounts from smallest to largest
    const sortedAmounts = [...allInAmounts].sort((a, b) => a - b);

    let prevAmount = 0;
    const totalPlayers = sortedAmounts.length + activePlayers.size;

    sortedAmounts.forEach((amount, index) => {
      // Calculate how many players contribute to this level
      const contributingPlayers = totalPlayers - index;
      const potAmount = (amount - prevAmount) * contributingPlayers;

      if (index === 0) {
        calculation.mainPot = potAmount;
      } else {
        calculation.sidePots.push({
          level: index,
          amount: potAmount,
        });
      }

      prevAmount = amount;
    });

    // Calculate remaining side pot for active players (if any remain after all-ins)
    if (activePlayers.size > 0 && sortedAmounts.length > 0) {
      const mainPotUsed = calculation.mainPot || 0;
      const sidePotUsed = calculation.sidePots.reduce((sum, pot) => sum + pot.amount, 0);
      const remainingAmount = totalContributions - mainPotUsed - sidePotUsed;

      if (remainingAmount > 0) {
        // Only add side pot if there's actually remaining money for active players
        // This happens when active players contribute more than the highest all-in amount
        calculation.sidePots.push({
          level: sortedAmounts.length,
          amount: remainingAmount,
        });
      }
    }

    return calculation;
  }

  /**
   * Get list of players eligible for a specific pot level
   */
  getEligiblePlayers(
    sidePotLevel: number,
    allInPlayers: Map<string, number>,
    activePlayers: Set<string>
  ): string[] {
    const eligible = new Set<string>();

    // For main pot (level 0), include all players
    if (sidePotLevel === 0) {
      // Add all active players
      activePlayers.forEach(player => eligible.add(player));
      // Add all all-in players
      allInPlayers.forEach((_, player) => eligible.add(player));
      return Array.from(eligible);
    }

    // For side pots, only players who contributed more than the level amount
    const allInEntries = Array.from(allInPlayers.entries()).sort(([_, a], [__, b]) => a - b);

    if (sidePotLevel <= allInEntries.length) {
      // Add all-in players who went all-in for more than this level's amount
      allInEntries.slice(sidePotLevel).forEach(([player, _]) => eligible.add(player));

      // Add active players (they can contest all side pots)
      activePlayers.forEach(player => eligible.add(player));
    }

    return Array.from(eligible);
  }

  /**
   * Validate that pot mathematics are correct
   */
  validatePotMath(pots: Pot[], collectedActions: CollectedAction[], rake = 0): void {
    const errors: string[] = [];

    for (const pot of pots) {
      // Find relevant collected actions for this pot
      const relevantActions = this.getRelevantCollectedActions(pot, collectedActions);
      const totalCollected = relevantActions.reduce((sum, action) => sum + action.amount, 0);

      // Calculate expected amount (subtract rake only from main pot or single pot)
      const isMainOrSinglePot = !pot.isSide || pots.length === 1;
      const rakeToSubtract = isMainOrSinglePot ? rake : 0;
      const expectedCollected = pot.amount - rakeToSubtract;

      // Allow small floating point differences
      if (Math.abs(totalCollected - expectedCollected) > 0.01) {
        errors.push(
          `Pot amount mismatch: expected ${expectedCollected} (${pot.amount} - ${rakeToSubtract} rake), collected ${totalCollected}`
        );
      }
    }

    if (errors.length > 0) {
      throw new Error(`Pot math validation failed: ${errors.join('; ')}`);
    }
  }

  /**
   * Enhance pots with split pot information and odd chip winners
   */
  enhancePots(pots: Pot[], collectedActions: CollectedAction[]): void {
    for (const pot of pots) {
      const relevantActions = this.getRelevantCollectedActions(pot, collectedActions);

      // Update pot players based on collected actions
      pot.players = relevantActions.map(action => action.player);

      // Check for split pots
      if (relevantActions.length > 1) {
        pot.isSplit = true;

        // Check for odd chip scenarios
        const hasOddChip = pot.amount % relevantActions.length !== 0;

        if (hasOddChip) {
          // Find who gets the odd chip (player with highest collected amount)
          const maxAmount = Math.max(...relevantActions.map(a => a.amount));
          const oddChipWinner = relevantActions.find(a => a.amount === maxAmount);

          if (oddChipWinner) {
            pot.oddChipWinner = oddChipWinner.player;
          }
        }
      }
    }
  }

  /**
   * Get collected actions relevant to a specific pot
   */
  private getRelevantCollectedActions(
    pot: Pot,
    collectedActions: CollectedAction[]
  ): CollectedAction[] {
    return collectedActions.filter(action => {
      if (pot.isSide && action.type === 'side') {
        return !action.sidePotLevel || action.sidePotLevel === pot.sidePotLevel;
      } else if (!pot.isSide && (action.type === 'main' || action.type === 'single')) {
        return true;
      }
      return false;
    });
  }
}
