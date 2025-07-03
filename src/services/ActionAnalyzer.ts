import {
  IActionAnalyzer,
  ActionCategory,
  ActionPriority,
  FormatOptions,
  AmountContext,
  FilterCriteria,
  ActionStatistics,
  PlayerStatistics,
  KeyMoment,
  ActionAnalyzerConfig,
} from './interfaces';
import { Action, PokerHand } from '../types';

/**
 * Service responsible for analyzing, categorizing, and processing poker actions.
 * Provides functionality for action analysis, formatting, filtering, and statistics.
 */
export class ActionAnalyzer implements IActionAnalyzer {
  private config: ActionAnalyzerConfig;

  constructor() {
    this.config = {
      significantRaiseThreshold: 2.5, // 2.5x pot size
      bigBlindSize: 2,
      aggressionThreshold: 1.5,
      allInThreshold: 0.9, // 90% of stack
    };
  }

  /**
   * Categorize an action by type
   */
  categorizeAction(action: Action): ActionCategory {
    switch (action.type) {
      case 'blind':
      case 'ante':
        return 'forced';
      case 'raise':
      case 'bet':
        return 'aggressive';
      case 'call':
      case 'check':
        return 'passive';
      case 'fold':
        return 'passive';
      case 'show':
      case 'muck':
      case 'collected':
      case 'uncalled':
        return 'neutral';
      case 'timeout':
      case 'disconnect':
      case 'reconnect':
      case 'sitout':
      case 'return':
      case 'deal':
        return 'system';
      default:
        return 'neutral';
    }
  }

  /**
   * Get action priority/importance
   */
  getActionPriority(action: Action, hand: PokerHand): ActionPriority {
    // System actions are low priority
    if (this.categorizeAction(action) === 'system') {
      return 'low';
    }

    // Forced actions are low priority
    if (this.categorizeAction(action) === 'forced') {
      return 'low';
    }

    // All-in actions are critical
    if (action.isAllIn) {
      return 'critical';
    }

    // Large raises are high priority
    if (action.type === 'raise' && action.amount) {
      const potSize = this.calculatePotSizeAtAction(action, hand);
      if (action.amount >= potSize * this.config.significantRaiseThreshold) {
        return 'high';
      }
    }

    // Big bets relative to pot are high priority
    if (action.type === 'bet' && action.amount) {
      const potSize = this.calculatePotSizeAtAction(action, hand);
      if (action.amount >= potSize * this.config.aggressionThreshold) {
        return 'high';
      }
    }

    // Folds to significant action are medium priority
    if (action.type === 'fold') {
      return 'medium';
    }

    // Other actions are low priority
    return 'low';
  }

  /**
   * Check if action is significant
   */
  isSignificantAction(action: Action, hand: PokerHand): boolean {
    const priority = this.getActionPriority(action, hand);
    return priority === 'high' || priority === 'critical';
  }

  /**
   * Format action for display
   */
  formatAction(action: Action, options: FormatOptions = {}): string {
    let result = '';

    if (action.player) {
      result += action.player;
    }

    // Add action verb
    switch (action.type) {
      case 'blind':
        result += action.amount === this.config.bigBlindSize / 2 ? ' posts small blind' : ' posts big blind';
        break;
      case 'raise':
        result += ' raises';
        break;
      case 'bet':
        result += ' bets';
        break;
      case 'call':
        result += ' calls';
        break;
      case 'check':
        result += ' checks';
        break;
      case 'fold':
        result += ' folds';
        break;
      default:
        result += ` ${action.type}s`;
        break;
    }

    // Add amount
    if (action.amount) {
      result += ` $${action.amount}`;

      if (options.includeBBMultiple) {
        const bbMultiple = Math.round((action.amount / this.config.bigBlindSize) * 10) / 10;
        result += ` (${bbMultiple}BB)`;
      }
    }

    return result;
  }

  /**
   * Get detailed action description
   */
  getActionDescription(action: Action, hand: PokerHand, verbose = false): string {
    let description = this.formatAction(action, { includeBBMultiple: true });

    if (verbose) {
      description += ` on ${action.street}`;
      
      if (action.isAllIn) {
        description += ' (ALL-IN)';
      }

      const priority = this.getActionPriority(action, hand);
      if (priority === 'high' || priority === 'critical') {
        description += ` [${priority.toUpperCase()}]`;
      }
    }

    return description;
  }

  /**
   * Format amount with context
   */
  formatAmount(amount: number, context: AmountContext): string {
    let result = `$${amount}`;

    // Add big blind multiple
    const bbMultiple = Math.round((amount / context.bigBlind) * 10) / 10;
    result += ` (${bbMultiple}BB)`;

    // Add pot percentage if requested and pot size is available
    if (context.includePercentage && context.potSize) {
      const percentage = Math.round((amount / context.potSize) * 100);
      result += ` ${percentage}% pot`;
    }

    return result;
  }

  /**
   * Filter actions by criteria
   */
  filterActions(actions: Action[], criteria: FilterCriteria): Action[] {
    return actions.filter(action => {
      // Filter by player
      if (criteria.player && action.player !== criteria.player) {
        return false;
      }

      // Filter by action types
      if (criteria.types && !criteria.types.includes(action.type)) {
        return false;
      }

      // Filter by street
      if (criteria.street && action.street !== criteria.street) {
        return false;
      }

      // Filter by amount range
      if (criteria.amountRange) {
        if (!action.amount) {
          return false; // Exclude actions without amounts when filtering by amount
        }
        const { min, max } = criteria.amountRange;
        if (action.amount < min || action.amount > max) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Search actions by query
   */
  searchActions(actions: Action[], query: string): Action[] {
    if (!query.trim()) {
      return [];
    }

    const lowercaseQuery = query.toLowerCase();

    return actions.filter(action => {
      // Search in player name
      if (action.player && action.player.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }

      // Search in action type
      if (action.type.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }

      // Search in amount
      if (action.amount && action.amount.toString().includes(query)) {
        return true;
      }

      // Search in street
      if (action.street.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Get action statistics
   */
  getActionStats(actions: Action[]): ActionStatistics {
    const stats: ActionStatistics = {
      totalActions: actions.length,
      actionsByType: {},
      actionsByStreet: {},
      actionsByPlayer: {},
      totalAmount: 0,
      averageAmount: 0,
    };

    if (actions.length === 0) {
      return stats;
    }

    let totalAmount = 0;
    let actionWithAmountCount = 0;

    actions.forEach(action => {
      // Count by type
      stats.actionsByType[action.type] = (stats.actionsByType[action.type] || 0) + 1;

      // Count by street
      stats.actionsByStreet[action.street] = (stats.actionsByStreet[action.street] || 0) + 1;

      // Count by player
      if (action.player) {
        stats.actionsByPlayer[action.player] = (stats.actionsByPlayer[action.player] || 0) + 1;
      }

      // Sum amounts
      if (action.amount) {
        totalAmount += action.amount;
        actionWithAmountCount++;
      }
    });

    stats.totalAmount = totalAmount;
    stats.averageAmount = actionWithAmountCount > 0 ? totalAmount / actionWithAmountCount : 0;

    return stats;
  }

  /**
   * Get player-specific statistics
   */
  getPlayerStats(actions: Action[], player: string): PlayerStatistics {
    const playerActions = actions.filter(action => action.player === player);

    let aggressiveActions = 0;
    let passiveActions = 0;
    let vpip = false;
    let pfr = false;

    playerActions.forEach(action => {
      const category = this.categorizeAction(action);

      if (category === 'aggressive') {
        aggressiveActions++;
        if (action.street === 'preflop') {
          if (action.type === 'raise') {
            pfr = true;
          }
          if (action.amount && action.amount > 0) {
            vpip = true;
          }
        }
      } else if (category === 'passive') {
        passiveActions++;
        if (action.street === 'preflop' && action.type === 'call' && action.amount && action.amount > 0) {
          vpip = true;
        }
      }
    });

    const totalNonForcedActions = aggressiveActions + passiveActions;
    const aggression = totalNonForcedActions > 0 ? aggressiveActions / totalNonForcedActions : 0;

    return {
      totalActions: playerActions.length,
      aggressiveActions,
      passiveActions,
      vpip,
      pfr,
      aggression,
    };
  }

  /**
   * Identify key moments in hand
   */
  identifyKeyMoments(hand: PokerHand): KeyMoment[] {
    const keyMoments: KeyMoment[] = [];

    for (let i = 0; i < hand.actions.length; i++) {
      const action = hand.actions[i];

      // Big raises
      if (action.type === 'raise' && action.amount) {
        const potSize = this.calculatePotSizeAtAction(action, hand);
        if (action.amount >= potSize * this.config.significantRaiseThreshold) {
          keyMoments.push({
            type: 'big_raise',
            actionIndex: i,
            description: `${action.player} makes a big raise of $${action.amount}`,
            significance: 'high',
          });
        }
      }

      // All-ins
      if (action.isAllIn) {
        keyMoments.push({
          type: 'all_in',
          actionIndex: i,
          description: `${action.player} goes all-in`,
          significance: 'critical',
        });
      }

      // Folds to raises
      if (action.type === 'fold' && i > 0) {
        const previousAction = hand.actions[i - 1];
        if (previousAction.type === 'raise' || previousAction.type === 'bet') {
          keyMoments.push({
            type: 'fold_to_raise',
            actionIndex: i,
            description: `${action.player} folds to ${previousAction.player}'s ${previousAction.type}`,
            significance: 'medium',
          });
        }
      }
    }

    return keyMoments;
  }

  /**
   * Update analyzer configuration
   */
  updateConfig(config: Partial<ActionAnalyzerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ActionAnalyzerConfig {
    return { ...this.config };
  }

  /**
   * Calculate pot size at the time of an action
   */
  private calculatePotSizeAtAction(targetAction: Action, hand: PokerHand): number {
    let potSize = 0;

    for (const action of hand.actions) {
      if (action.index >= targetAction.index) {
        break;
      }

      if (action.amount && (action.type === 'bet' || action.type === 'raise' || action.type === 'call' || action.type === 'blind' || action.type === 'ante')) {
        potSize += action.amount;
      }
    }

    return Math.max(potSize, this.config.bigBlindSize); // Minimum pot size
  }
}