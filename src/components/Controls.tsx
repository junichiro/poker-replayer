/**
 * Playback controls component for replay functionality
 *
 * @example
 * ```tsx
 * <Controls
 *   isPlaying={false}
 *   currentActionIndex={5}
 *   totalActions={20}
 *   onPlayPause={() => console.log('play/pause')}
 *   onPrevious={() => console.log('previous')}
 *   onNext={() => console.log('next')}
 *   onReset={() => console.log('reset')}
 * />
 * ```
 */

import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import React, { useMemo, memo } from 'react';

import { BaseComponentProps, NumericConstraints } from '../types';

/**
 * Callback function signatures for control actions
 * @public
 */
export interface ControlCallbacks {
  /**
   * Callback for play/pause button
   * @param isPlaying - Current playing state before the action
   */
  onPlayPause: (isPlaying: boolean) => void;
  /**
   * Callback for previous action button
   * @param currentIndex - Current action index before going to previous
   */
  onPrevious: (currentIndex: number) => void;
  /**
   * Callback for next action button
   * @param currentIndex - Current action index before going to next
   */
  onNext: (currentIndex: number) => void;
  /**
   * Callback for reset button
   * @param currentIndex - Current action index before reset
   */
  onReset: (currentIndex: number) => void;
}

/**
 * Enhanced props interface for Controls component with validation
 * @public
 */
export interface ControlsProps extends BaseComponentProps {
  /**
   * Whether playback is currently active
   */
  isPlaying: boolean;

  /**
   * Current action index (-1 means before first action)
   * Must be >= -1 and < totalActions
   * @constraint integer, >= -1
   */
  currentActionIndex: number & NumericConstraints;

  /**
   * Total number of actions in the hand
   * Must be a positive integer
   * @constraint integer, > 0
   */
  totalActions: number & NumericConstraints;

  /** Callback functions for control actions */
  callbacks: ControlCallbacks;

  /**
   * Size of the control icons
   * @default 20
   */
  iconSize?: number;

  /**
   * Whether to show action counter
   * @default true
   */
  showCounter?: boolean;

  /**
   * Custom labels for buttons (for internationalization)
   */
  labels?: {
    play?: string;
    pause?: string;
    previous?: string;
    next?: string;
    reset?: string;
  };

  /**
   * Whether controls are disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Legacy props interface for backward compatibility
 * @deprecated Use ControlsProps instead
 */
export interface ControlsPropsLegacy extends BaseComponentProps {
  /** Whether playback is currently active */
  isPlaying: boolean;
  /** Current action index (-1 means before first action) */
  currentActionIndex: number;
  /** Total number of actions in the hand */
  totalActions: number;
  /** Callback for play/pause button */
  onPlayPause: () => void;
  /** Callback for previous action button */
  onPrevious: () => void;
  /** Callback for next action button */
  onNext: () => void;
  /** Callback for reset button */
  onReset: () => void;
}

/**
 * Combined props type supporting both new and legacy APIs
 */
type ControlsAllProps = ControlsProps | ControlsPropsLegacy;

/**
 * Default props for the Controls component
 */
const defaultProps = {
  iconSize: 20,
  showCounter: true,
  disabled: false,
  className: '',
  labels: {
    play: 'Play',
    pause: 'Pause',
    previous: 'Previous action',
    next: 'Next action',
    reset: 'Reset to beginning',
  },
} satisfies Partial<ControlsProps>;

/**
 * Type guard to check if props use the legacy API
 */
function isLegacyProps(props: ControlsAllProps): props is ControlsPropsLegacy {
  return 'onPlayPause' in props && typeof props.onPlayPause === 'function';
}

/**
 * Runtime validation for numeric constraints
 */
function validateNumericProp(
  value: number,
  propName: string,
  constraints: {
    min?: number;
    max?: number;
    integer?: boolean;
  }
): void {
  if (constraints.integer && !Number.isInteger(value)) {
    console.warn(`${propName} must be an integer, got: ${value}`);
  }
  if (constraints.min !== undefined && value < constraints.min) {
    console.warn(`${propName} must be >= ${constraints.min}, got: ${value}`);
  }
  if (constraints.max !== undefined && value > constraints.max) {
    console.warn(`${propName} must be <= ${constraints.max}, got: ${value}`);
  }
}

/**
 * Enhanced Controls component with improved TypeScript typing and performance optimization
 */
const ControlsComponent: React.FC<ControlsAllProps> = props => {
  const {
    isPlaying,
    currentActionIndex,
    totalActions,
    className = defaultProps.className,
    style,
    'data-testid': testId,
  } = props;

  // Memoize callbacks and props based on API version to prevent unnecessary re-renders
  const { callbacks, iconSize, showCounter, labels, disabled } = useMemo(() => {
    let callbacksResult: ControlCallbacks;
    let iconSizeResult: number;
    let showCounterResult: boolean;
    let labelsResult: NonNullable<ControlsProps['labels']>;
    let disabledResult: boolean;

    if (isLegacyProps(props)) {
      // Legacy API - convert to new callback format
      callbacksResult = {
        onPlayPause: () => props.onPlayPause(),
        onPrevious: () => props.onPrevious(),
        onNext: () => props.onNext(),
        onReset: () => props.onReset(),
      };
      iconSizeResult = defaultProps.iconSize;
      showCounterResult = defaultProps.showCounter;
      labelsResult = defaultProps.labels;
      disabledResult = defaultProps.disabled;
    } else {
      // New API
      callbacksResult = props.callbacks;
      iconSizeResult = props.iconSize ?? defaultProps.iconSize;
      showCounterResult = props.showCounter ?? defaultProps.showCounter;
      labelsResult = { ...defaultProps.labels, ...props.labels };
      disabledResult = props.disabled ?? defaultProps.disabled;
    }

    return {
      callbacks: callbacksResult,
      iconSize: iconSizeResult,
      showCounter: showCounterResult,
      labels: labelsResult,
      disabled: disabledResult,
    };
  }, [props]);

  // Runtime validation
  validateNumericProp(currentActionIndex, 'currentActionIndex', {
    min: -1,
    integer: true,
    max: totalActions - 1,
  });
  validateNumericProp(totalActions, 'totalActions', {
    min: 1,
    integer: true,
  });

  // Memoize computed button states to prevent unnecessary calculations
  const buttonStates = useMemo(
    () => ({
      isAtStart: currentActionIndex === -1,
      isAtEnd: currentActionIndex >= totalActions - 1,
    }),
    [currentActionIndex, totalActions]
  );

  return (
    <div className={`controls ${className}`} style={style} data-testid={testId}>
      <button
        onClick={() => callbacks.onReset(currentActionIndex)}
        disabled={disabled || buttonStates.isAtStart}
        title={labels.reset}
        aria-label={labels.reset}
      >
        <RotateCcw size={iconSize} />
      </button>

      <button
        onClick={() => callbacks.onPrevious(currentActionIndex)}
        disabled={disabled || buttonStates.isAtStart}
        title={labels.previous}
        aria-label={labels.previous}
      >
        <SkipBack size={iconSize} />
      </button>

      <button
        onClick={() => callbacks.onPlayPause(isPlaying)}
        disabled={disabled}
        title={isPlaying ? labels.pause : labels.play}
        aria-label={isPlaying ? labels.pause : labels.play}
      >
        {isPlaying ? <Pause size={iconSize} /> : <Play size={iconSize} />}
      </button>

      <button
        onClick={() => callbacks.onNext(currentActionIndex)}
        disabled={disabled || buttonStates.isAtEnd}
        title={labels.next}
        aria-label={labels.next}
      >
        <SkipForward size={iconSize} />
      </button>

      {showCounter && (
        <div
          className="action-counter"
          aria-label={`Action ${currentActionIndex + 1} of ${totalActions}`}
        >
          {currentActionIndex + 1} / {totalActions}
        </div>
      )}
    </div>
  );
};

/**
 * Custom comparison function for React.memo
 * Only re-render if control-related props have actually changed
 */
function areControlsPropsEqual(prevProps: ControlsAllProps, nextProps: ControlsAllProps): boolean {
  // Compare basic state
  if (
    prevProps.isPlaying !== nextProps.isPlaying ||
    prevProps.currentActionIndex !== nextProps.currentActionIndex ||
    prevProps.totalActions !== nextProps.totalActions ||
    prevProps.className !== nextProps.className ||
    prevProps['data-testid'] !== nextProps['data-testid']
  ) {
    return false;
  }

  // For legacy props, compare callback references (they should be stable)
  if (isLegacyProps(prevProps) && isLegacyProps(nextProps)) {
    return (
      prevProps.onPlayPause === nextProps.onPlayPause &&
      prevProps.onPrevious === nextProps.onPrevious &&
      prevProps.onNext === nextProps.onNext &&
      prevProps.onReset === nextProps.onReset
    );
  }

  // For new props, compare the callbacks object and optional props
  if (!isLegacyProps(prevProps) && !isLegacyProps(nextProps)) {
    return (
      prevProps.callbacks === nextProps.callbacks &&
      prevProps.iconSize === nextProps.iconSize &&
      prevProps.showCounter === nextProps.showCounter &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.labels === nextProps.labels
    );
  }

  // Mixed API versions - they're different
  return false;
}

/**
 * Memoized Controls component for optimal performance
 * Prevents unnecessary re-renders when control props haven't changed
 */
export const Controls = memo(ControlsComponent, areControlsPropsEqual);
