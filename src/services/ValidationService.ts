import {
  IValidationService,
  ActionIndexValidationResult,
  ControlStateValidationResult,
  TransitionValidationResult,
  PlaybackStateValidationResult,
  NumericValidationResult,
  GameStateForValidation,
  GameStateValidationResult,
  HandStructureValidationResult,
  ValidationServiceConfig,
} from './interfaces';
import { PokerHand, NumericConstraints } from '../types';

/**
 * Service responsible for validating game state, user interactions, and data integrity.
 * Provides centralized validation logic for controls, actions, and hand data.
 */
export class ValidationService implements IValidationService {
  private config: ValidationServiceConfig;

  constructor() {
    this.config = {
      strictValidation: false,
      allowIncrementalValidation: true,
      maxActionIndex: 10000,
      enableWarnings: true,
    };
  }

  /**
   * Validate action index bounds and position
   */
  validateActionIndex(index: number, totalActions: number): ActionIndexValidationResult {
    const errors: string[] = [];
    
    // Handle invalid numbers
    if (!Number.isFinite(index)) {
      errors.push(`Action index ${index} is not a valid number`);
      return {
        isValid: false,
        isAtStart: false,
        isAtEnd: false,
        errors,
      };
    }

    const minIndex = -1;
    const maxIndex = totalActions - 1;

    // Check bounds
    if (index < minIndex) {
      errors.push(`Action index ${index} is below minimum (${minIndex})`);
    }

    if (index > maxIndex) {
      errors.push(`Action index ${index} exceeds maximum (${maxIndex})`);
    }

    const isValid = errors.length === 0;
    const isAtStart = index === -1;
    const isAtEnd = totalActions === 0 ? index === -1 : index === maxIndex;

    return {
      isValid,
      isAtStart,
      isAtEnd,
      errors,
    };
  }

  /**
   * Validate control state based on current game position
   */
  validateControlState(
    currentActionIndex: number,
    totalActions: number,
    isPlaying: boolean,
    disabled = false
  ): ControlStateValidationResult {
    const validationErrors: string[] = [];

    // Validate action index
    const indexValidation = this.validateActionIndex(currentActionIndex, totalActions);
    if (!indexValidation.isValid) {
      validationErrors.push(`Current action index (${currentActionIndex}) is invalid`);
    }

    // If disabled, all controls should be disabled
    if (disabled) {
      return {
        canGoToPrevious: false,
        canGoToNext: false,
        canReset: false,
        canPlayPause: false,
        validationErrors,
      };
    }

    const { isAtStart, isAtEnd } = indexValidation;

    // Determine control states
    const canGoToPrevious = !isAtStart;
    const canGoToNext = !isAtEnd;
    const canReset = !isAtStart;
    const canPlayPause = !isAtEnd || isPlaying; // Can pause if playing, can play if not at end

    return {
      canGoToPrevious,
      canGoToNext,
      canReset,
      canPlayPause,
      validationErrors,
    };
  }

  /**
   * Validate transition between action indices
   */
  validateTransition(from: number, to: number, totalActions: number): TransitionValidationResult {
    // Validate target index
    const toValidation = this.validateActionIndex(to, totalActions);
    if (!toValidation.isValid) {
      return {
        isValidTransition: false,
        reason: `Target index ${to} is out of range (valid: -1 to ${totalActions - 1})`,
      };
    }

    // All valid index transitions are allowed (no restriction on jump size)
    return {
      isValidTransition: true,
    };
  }

  /**
   * Validate playback state
   */
  validatePlaybackState(
    isPlaying: boolean,
    currentIndex: number,
    totalActions: number
  ): PlaybackStateValidationResult {
    const reasons: string[] = [];

    // Check if there are actions to play
    if (totalActions === 0) {
      reasons.push('No actions to play');
      return {
        canPlay: false,
        canPause: false,
        shouldStop: true,
        reasons,
      };
    }

    // Check if at end
    const atEnd = currentIndex >= totalActions - 1;
    if (atEnd) {
      reasons.push('At end of hand');
      return {
        canPlay: false,
        canPause: isPlaying, // Can pause if currently playing
        shouldStop: true,
        reasons,
      };
    }

    // Normal playback state
    return {
      canPlay: !isPlaying,
      canPause: isPlaying,
      shouldStop: false,
      reasons,
    };
  }

  /**
   * Validate numeric constraints
   */
  validateNumericConstraints(
    value: number,
    constraints: NumericConstraints
  ): NumericValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if value is a valid number
    if (!Number.isFinite(value)) {
      errors.push(`Value ${value} is not a valid number`);
      return { isValid: false, errors, warnings };
    }

    // Check minimum constraint
    if (constraints.min !== undefined && value < constraints.min) {
      errors.push(`Value ${value} is below minimum ${constraints.min}`);
    }

    // Check maximum constraint
    if (constraints.max !== undefined && value > constraints.max) {
      errors.push(`Value ${value} exceeds maximum ${constraints.max}`);
    }

    // Check integer constraint
    if (constraints.integer && !Number.isInteger(value)) {
      errors.push(`Value ${value} must be an integer`);
    }

    // Check positive constraint
    if (constraints.positive && value <= 0) {
      errors.push(`Value ${value} must be positive (> 0)`);
    }

    // Check non-negative constraint
    if (constraints.nonNegative && value < 0) {
      errors.push(`Value ${value} must be non-negative (>= 0)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate game state consistency
   */
  validateGameState(state: GameStateForValidation): GameStateValidationResult {
    const errors: string[] = [];

    // Validate action index
    const indexValidation = this.validateActionIndex(state.currentActionIndex, state.totalActions);
    if (!indexValidation.isValid) {
      errors.push(...indexValidation.errors);
    }

    // Check consistency of canStepForward
    const expectedCanStepForward = state.currentActionIndex < state.totalActions - 1;
    if (state.canStepForward !== expectedCanStepForward) {
      if (state.currentActionIndex >= state.totalActions - 1) {
        errors.push('canStepForward should be false at end of hand');
      } else {
        errors.push('canStepForward should be true when not at end');
      }
    }

    // Check consistency of canStepBackward
    const expectedCanStepBackward = state.currentActionIndex >= 0;
    if (state.canStepBackward !== expectedCanStepBackward) {
      if (state.currentActionIndex < 0) {
        errors.push('canStepBackward should be false at start of hand');
      } else {
        errors.push('canStepBackward should be true when not at start');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate hand structure and data integrity
   */
  validateHandStructure(hand: PokerHand): HandStructureValidationResult {
    const errors: string[] = [];

    // Check if hand exists
    if (!hand) {
      errors.push('Hand data is null or undefined');
      return { isValid: false, errors };
    }

    // Check required fields
    if (!hand.id) {
      errors.push('Hand must have an ID');
    }

    if (!hand.players || hand.players.length === 0) {
      errors.push('Hand must have at least one player');
    }

    if (!hand.actions) {
      errors.push('Hand must have actions array');
    }

    // Validate actions if they exist
    if (hand.actions && Array.isArray(hand.actions)) {
      // Check action index continuity
      for (let i = 0; i < hand.actions.length; i++) {
        const action = hand.actions[i];
        
        if (action.index !== i) {
          errors.push(`Action index gap detected: expected ${i}, found ${action.index}`);
        }

        // Check if player exists
        if (action.player && hand.players) {
          const playerExists = hand.players.some(p => p.name === action.player);
          if (!playerExists) {
            errors.push(`Action references unknown player: ${action.player}`);
          }
        }
      }
    }

    // Validate table info
    if (hand.table) {
      if (hand.table.maxSeats <= 0) {
        errors.push('Table maxSeats must be positive');
      }

      if (hand.players && hand.players.length > hand.table.maxSeats) {
        errors.push('More players than table seats');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Update validation configuration
   */
  updateConfig(config: Partial<ValidationServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current validation configuration
   */
  getConfig(): ValidationServiceConfig {
    return { ...this.config };
  }
}