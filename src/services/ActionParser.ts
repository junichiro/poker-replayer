import { Action, ActionType, Street, CollectedAction } from '../types';

import { IActionParser } from './interfaces';

/**
 * Service responsible for parsing action lines from poker hand histories
 * and creating Action objects
 */
export class ActionParser implements IActionParser {
  private actionIndex: number;

  constructor() {
    this.actionIndex = 0;
  }

  /**
   * Parse a single line into an Action object
   */
  parseAction(line: string, street: Street): Action | null {
    if (!line || line.trim() === '') {
      return null;
    }

    // All-in action patterns (highest priority)
    const allInPatterns = [
      {
        regex: /([^:]+): raises \$?([\d.]+) to \$?([\d.]+) and is all-in/,
        type: 'raise' as ActionType,
      },
      {
        regex: /([^:]+): calls \$?([\d.]+) and is all-in/,
        type: 'call' as ActionType,
      },
      {
        regex: /([^:]+): bets \$?([\d.]+) and is all-in/,
        type: 'bet' as ActionType,
      },
    ];

    // Check for all-in actions first
    for (const pattern of allInPatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const player = match[1];
        let amount: number;

        if (pattern.type === 'raise') {
          amount = parseFloat(match[3]);
        } else {
          amount = parseFloat(match[2]);
        }

        const action = this.createAction(pattern.type, player, amount, street);
        action.isAllIn = true;
        return action;
      }
    }

    // Player state and special action patterns
    const specialPatterns = [
      { regex: /([^:]+): mucks hand/, type: 'muck' as ActionType },
      { regex: /([^:]+) has timed out/, type: 'timeout' as ActionType },
      { regex: /([^:]+) is disconnected/, type: 'disconnect' as ActionType },
      { regex: /([^:]+) is connected/, type: 'reconnect' as ActionType },
      { regex: /([^:]+): sits out/, type: 'sitout' as ActionType },
      { regex: /([^:]+) is sitting out/, type: 'sitout' as ActionType },
      { regex: /([^:]+) has returned/, type: 'return' as ActionType },
    ];

    // Check for special actions
    for (const pattern of specialPatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const player = match[1];
        const action = this.createAction(pattern.type, player, undefined, street);

        // Add reason for timeout/disconnect actions
        if (pattern.type === 'timeout') {
          action.reason = 'Player timed out';
        } else if (pattern.type === 'disconnect') {
          action.reason = 'Player disconnected';
        }

        return action;
      }
    }

    // Standard action patterns
    const standardPatterns = [
      { regex: /([^:]+): folds/, type: 'fold' as ActionType },
      { regex: /([^:]+): checks/, type: 'check' as ActionType },
      { regex: /([^:]+): calls \$?([\d.]+)/, type: 'call' as ActionType },
      { regex: /([^:]+): bets \$?([\d.]+)/, type: 'bet' as ActionType },
      {
        regex: /([^:]+): raises \$?([\d.]+) to \$?([\d.]+)/,
        type: 'raise' as ActionType,
      },
      {
        regex: /Uncalled bet \(\$?([\d.]+)\) returned to ([^\s]+)/,
        type: 'uncalled' as ActionType,
      },
      {
        regex: /([^:]+) collected \$?([\d.]+) from (?:side |main )?pot/,
        type: 'collected' as ActionType,
      },
    ];

    // Check for standard actions
    for (const pattern of standardPatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const player = pattern.type === 'uncalled' ? match[2] : match[1];
        let amount: number | undefined;

        if (pattern.type === 'raise') {
          amount = parseFloat(match[3]);
        } else if (
          pattern.type === 'call' ||
          pattern.type === 'bet' ||
          pattern.type === 'collected'
        ) {
          amount = parseFloat(match[2]);
        } else if (pattern.type === 'uncalled') {
          amount = parseFloat(match[1]);
        }

        return this.createAction(pattern.type, player, amount, street);
      }
    }

    return null;
  }

  /**
   * Create an Action object with specified parameters
   */
  createAction(
    type: ActionType,
    player: string,
    amount?: number,
    street: Street = 'preflop'
  ): Action {
    return {
      index: this.actionIndex++,
      street,
      type,
      player,
      amount,
    };
  }

  /**
   * Extract collected actions from hand history lines
   */
  extractCollectedActions(lines: string[]): CollectedAction[] {
    const collectedActions: CollectedAction[] = [];

    for (const line of lines) {
      // Parse various collection patterns
      const patterns = [
        {
          regex: /([^:]+) collected \$?([\d.]+) from main pot/,
          type: 'main' as const,
        },
        {
          regex: /([^:]+) collected \$?([\d.]+) from side pot(?:-(\d+))?/,
          type: 'side' as const,
        },
        {
          regex: /([^:]+) collected \$?([\d.]+) from pot/,
          type: 'single' as const,
        },
        {
          // Handle summary lines like "Seat 1: Player1 (button) (small blind) collected (8)"
          regex: /Seat \d+: (.*?) \([^)]*\) (?:\([^)]*\) )?collected \(\$?([\d.]+)\)/,
          type: 'single' as const,
        },
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern.regex);
        if (match) {
          const action: CollectedAction = {
            player: match[1],
            amount: parseFloat(match[2]),
            type: pattern.type,
          };

          // Extract side pot level if present
          if (pattern.type === 'side' && match[3]) {
            action.sidePotLevel = parseInt(match[3]);
          }

          // Check if we already have a collection action for this player and amount
          const existingAction = collectedActions.find(
            existing => existing.player === action.player && existing.amount === action.amount
          );

          if (!existingAction) {
            collectedActions.push(action);
          }
          break;
        }
      }
    }

    return collectedActions;
  }

  /**
   * Reset action index (useful for new hand parsing)
   */
  reset(): void {
    this.actionIndex = 0;
  }
}
