/**
 * Main poker hand replay component (refactored to use smaller components)
 * This component has been split into smaller, reusable components as part of Phase 2
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { PokerStarsParser } from '../parser/PokerStarsParser';
import { PokerHand, ReplayConfig, ActionChangeCallback, ReplayEventCallback } from '../types';
import {
  applyTheme,
  applySize,
  applyTableShape,
  applyCardDesign,
  applyAnimationConfig,
  getSystemColorScheme,
} from '../utils/customization';
import { useLoading } from '../utils/loading';
import { useRetry, retryPredicates } from '../utils/retry';

import { ActionHistory } from './ActionHistory';
import { Controls } from './Controls';
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
import { LoadingSpinner, ProgressSpinner, Skeleton } from './LoadingSpinner';
import { ParserErrorBoundary } from './ParserErrorBoundary';
import { Table } from './Table';

export interface PokerHandReplayProps {
  /** Raw hand history string to parse and replay */
  handHistory: string;
  /** Configuration options for the replay */
  config?: ReplayConfig;
  /** Callback fired when the current action changes */
  onActionChange?: ActionChangeCallback;
  /** Callback fired for replay events (start, pause, etc.) */
  onReplayEvent?: ReplayEventCallback;
  /** Custom CSS class for styling */
  className?: string;
  /** Enable loading states and progress indicators */
  enableLoadingStates?: boolean;
  /** Enable automatic error recovery */
  enableErrorRecovery?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ComponentType<{ message?: string }>;
  /** Custom error fallback component */
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export const PokerHandReplay: React.FC<PokerHandReplayProps> = ({
  handHistory,
  config = {},
  onActionChange,
  onReplayEvent,
  className = '',
  enableLoadingStates = true,
  enableErrorRecovery = true,
  loadingComponent,
  errorComponent,
}) => {
  // Configuration with defaults and enhanced customization support
  const {
    autoPlay = false,
    animationSpeed = 1.0,
    theme = 'dark',
    showAllCards = false,
    enableSounds: _enableSounds = false,
    size = 'medium',
    customColors,
    tableShape = 'oval',
    cardDesign = 'standard',
    animations,
  } = config;

  // Refs for DOM manipulation
  const replayRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // State management
  const [hand, setHand] = useState<PokerHand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Loading and retry state management
  const loading = useLoading({
    initialMessage: 'Parsing hand history...',
    timeout: 30000, // 30 second timeout
    trackProgress: true,
    estimateTime: true,
  });

  const retryState = useRetry({
    maxAttempts: 3,
    initialDelay: 1000,
    exponentialBackoff: true,
    isRetryable: retryPredicates.parserErrors,
    onRetry: (attempt, error) => {
      // eslint-disable-next-line no-console
      console.log(`Retry attempt ${attempt} for parsing error:`, error.message);
      onReplayEvent?.('retry', { attempt, error });
    },
    onMaxAttemptsExceeded: error => {
      console.error('Max retry attempts exceeded:', error);
      onReplayEvent?.('error', { error, maxAttemptsExceeded: true });
    },
  });

  // Remove redundant asyncOperation - we'll use retryState directly

  // Enhanced parsing with loading states and error recovery
  const parseHandHistory = useCallback(
    async (handHistoryText: string) => {
      if (!enableLoadingStates) {
        // Fallback to synchronous parsing for backward compatibility
        const parser = new PokerStarsParser();
        const result = parser.parse(handHistoryText);

        if (result.success) {
          setHand(result.hand);
          setError(null);
          setIsInitialLoad(false);

          if (autoPlay) {
            setIsPlaying(true);
            onReplayEvent?.('start');
          }
        } else {
          setError(result.error.message);
          setHand(null);
          setIsInitialLoad(false);
        }
        return;
      }

      // Enhanced parsing with unified retry and loading state
      const result = await retryState.executeWithRetry(async () => {
        loading.startLoading('Parsing hand history...');
        loading.updateProgress(10, 'Initializing parser...');

        const parser = new PokerStarsParser();

        loading.updateProgress(30, 'Parsing hand history...');
        const parseResult = parser.parse(handHistoryText);

        if (!parseResult.success) {
          loading.finishLoading(new Error(parseResult.error.message));
          throw new Error(parseResult.error.message);
        }

        loading.updateProgress(60, 'Validating hand data...');

        // Simulate validation steps for better UX
        await new Promise(resolve => setTimeout(resolve, 100));

        loading.updateProgress(80, 'Processing actions...');
        await new Promise(resolve => setTimeout(resolve, 100));

        loading.updateProgress(100, 'Hand ready!');
        loading.finishLoading();

        return parseResult.hand;
      });

      if (result.success && result.data) {
        setHand(result.data);
        setError(null);
        setIsInitialLoad(false);

        if (autoPlay) {
          setIsPlaying(true);
          onReplayEvent?.('start');
        }
        onReplayEvent?.('parseSuccess', { hand: result.data });
      } else {
        const errorMessage = result.error?.message || 'Unknown parsing error';
        setError(errorMessage);
        setHand(null);
        setIsInitialLoad(false);
        onReplayEvent?.('parseError', { error: result.error });
      }
    },
    [retryState, loading, autoPlay, onReplayEvent, enableLoadingStates]
  );

  // Parse hand history on mount or when handHistory changes
  useEffect(() => {
    if (handHistory) {
      setIsInitialLoad(true);
      parseHandHistory(handHistory);
    }
  }, [handHistory, parseHandHistory]);

  // Auto-advance actions when playing
  useEffect(() => {
    if (!isPlaying || !hand) return;

    const timer = setTimeout(() => {
      if (currentActionIndex < hand.actions.length - 1) {
        setCurrentActionIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        onReplayEvent?.('end');
      }
    }, 1000 / animationSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentActionIndex, hand, animationSpeed, onReplayEvent]);

  // Notify when action changes
  useEffect(() => {
    if (hand && currentActionIndex >= 0 && currentActionIndex < hand.actions.length) {
      const currentAction = hand.actions[currentActionIndex];
      onActionChange?.(currentAction, currentActionIndex);
    }
  }, [currentActionIndex, hand, onActionChange]);

  // Memoize expensive player state calculations
  const currentPlayers = useMemo(() => {
    if (!hand) return [];

    const newPlayers = hand.players.map(p => ({
      ...p,
      currentChips: p.chips,
    }));
    const playerMap = new Map(newPlayers.map(p => [p.name, p]));

    // Apply actions up to current index
    for (let i = 0; i <= currentActionIndex; i++) {
      const action = hand.actions[i];

      if (action.player && action.amount) {
        const player = playerMap.get(action.player);
        if (player) {
          if (['bet', 'raise', 'call', 'blind', 'ante'].includes(action.type)) {
            player.currentChips = Math.max(0, player.currentChips - action.amount);
            if (action.isAllIn) {
              player.isAllIn = true;
              player.allInAmount = action.amount;
            }
          }
        }
      }
    }

    return newPlayers;
  }, [currentActionIndex, hand]);

  // Apply customization options to DOM elements
  useEffect(() => {
    if (!replayRef.current) return;

    // Apply theme
    applyTheme(replayRef.current, theme, customColors);

    // Apply size
    applySize(replayRef.current, size);

    // Apply card design
    applyCardDesign(replayRef.current, cardDesign);

    // Apply animation configuration
    applyAnimationConfig(replayRef.current, animations || {}, animationSpeed);
  }, [theme, customColors, size, cardDesign, animations, animationSpeed]);

  // Apply table shape to table element
  useEffect(() => {
    if (!tableRef.current) return;
    applyTableShape(tableRef.current, tableShape);
  }, [tableShape]);

  // Auto theme detection for 'auto' theme
  useEffect(() => {
    if (theme === 'auto' && replayRef.current) {
      const _systemTheme = getSystemColorScheme();

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (replayRef.current && theme === 'auto') {
          applyTheme(replayRef.current, 'auto', customColors);
        }
      };

      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }

    // Return undefined for other code paths
    return undefined;
  }, [theme, customColors]);

  // Control functions
  const playPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      onReplayEvent?.('pause');
    } else {
      setIsPlaying(true);
      onReplayEvent?.(currentActionIndex === -1 ? 'start' : 'resume');
    }
  }, [isPlaying, currentActionIndex, onReplayEvent]);

  const previousAction = useCallback(() => {
    setCurrentActionIndex(prev => Math.max(-1, prev - 1));
    setIsPlaying(false);
  }, []);

  const nextAction = useCallback(() => {
    if (!hand) return;
    setCurrentActionIndex(prev => Math.min(hand.actions.length - 1, prev + 1));
    setIsPlaying(false);
  }, [hand]);

  const reset = useCallback(() => {
    setCurrentActionIndex(-1);
    setIsPlaying(false);
    onReplayEvent?.('reset');
  }, [onReplayEvent]);

  // Get current board cards based on action index
  const currentBoard = useMemo(() => {
    if (!hand || currentActionIndex < 0) return [];

    const currentAction = hand.actions[currentActionIndex];
    const currentStreet = currentAction.street;

    switch (currentStreet) {
      case 'preflop':
        return [];
      case 'flop':
        return hand.board.slice(0, 3);
      case 'turn':
        return hand.board.slice(0, 4);
      case 'river':
      case 'showdown':
        return hand.board;
      default:
        return [];
    }
  }, [hand, currentActionIndex]);

  // Jump to specific action (for action history clicks)
  const goToAction = useCallback((index: number) => {
    setCurrentActionIndex(index);
    setIsPlaying(false);
  }, []);

  // Enhanced error handling with retry capabilities
  const handleRetry = useCallback(() => {
    setError(null);
    retryState.reset();
    parseHandHistory(handHistory);
  }, [handHistory, parseHandHistory, retryState]);

  // Enhanced loading states
  if (enableLoadingStates && (loading.isLoading || isInitialLoad) && !hand) {
    const LoadingComponent =
      loadingComponent ||
      (() => {
        if (loading.progress !== undefined) {
          return (
            <div className="enhanced-loading">
              <ProgressSpinner progress={loading.progress} message={loading.message} size="large" />
              {loading.estimatedTime && loading.estimatedTime > 1000 && (
                <div className="estimated-time">
                  Estimated time remaining: {Math.ceil(loading.estimatedTime / 1000)}s
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="enhanced-loading">
            <LoadingSpinner
              size="large"
              message={loading.message || 'Loading hand...'}
              variant="card"
              color="primary"
            />
            <div className="loading-skeleton">
              <Skeleton variant="table" width="100%" height={200} />
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <Skeleton variant="rectangular" width={80} height={30} />
                <Skeleton variant="rectangular" width={80} height={30} />
                <Skeleton variant="rectangular" width={80} height={30} />
              </div>
            </div>
          </div>
        );
      });

    return (
      <div ref={replayRef} className={`poker-replay loading ${className}`} data-theme={theme}>
        <LoadingComponent />
      </div>
    );
  }

  // Enhanced error display with retry options
  if (error) {
    const ErrorComponent =
      errorComponent ||
      (() => (
        <div className="enhanced-error">
          <div className="error-header">
            <h3>Failed to parse hand history</h3>
            <p className="error-message">{error}</p>
          </div>

          {enableErrorRecovery && (
            <div className="error-actions">
              <button
                onClick={handleRetry}
                disabled={retryState.isRetrying || retryState.maxAttemptsExceeded}
                className="retry-button"
              >
                {retryState.isRetrying ? 'Retrying...' : 'Try Again'}
              </button>

              {retryState.attempt > 0 && (
                <div className="retry-info">
                  Attempt {retryState.attempt} of 3
                  {retryState.nextDelay > 0 && (
                    <span> (next retry in {Math.ceil(retryState.nextDelay / 1000)}s)</span>
                  )}
                </div>
              )}

              {retryState.maxAttemptsExceeded && (
                <div className="max-attempts-exceeded">
                  Maximum retry attempts exceeded. Please check your hand history format.
                </div>
              )}
            </div>
          )}
        </div>
      ));

    return (
      <div ref={replayRef} className={`poker-replay error ${className}`} data-theme={theme}>
        <ErrorComponent error={new Error(error)} retry={handleRetry} />
      </div>
    );
  }

  // Main component with error boundaries
  // At this point, hand should never be null since we handle loading/error states above
  if (!hand) {
    return (
      <div ref={replayRef} className={`poker-replay error ${className}`} data-theme={theme}>
        <div className="enhanced-error">
          <p>No hand data available</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={replayRef} className={`poker-replay ${className}`} data-theme={theme}>
      <ParserErrorBoundary
        handHistory={handHistory}
        onRetry={handleRetry}
        className="parser-boundary"
      >
        <div className="hand-info">
          <h2>Hand #{hand.id}</h2>
          <div className="hand-details">
            <span className="stakes">{hand.stakes}</span>
            <span className="table">{hand.table.name}</span>
            <span className="date">{hand.date.toLocaleString()}</span>
          </div>
        </div>

        <ErrorBoundary name="TableErrorBoundary" enableRetry={enableErrorRecovery}>
          <div ref={tableRef} className="table-area">
            <Table
              table={hand.table}
              players={hand.players}
              currentPlayers={currentPlayers}
              boardCards={currentBoard}
              pots={hand.pots}
              showAllCards={showAllCards}
            />
          </div>
        </ErrorBoundary>

        <ErrorBoundary name="ControlsErrorBoundary" enableRetry={enableErrorRecovery}>
          <Controls
            isPlaying={isPlaying}
            currentActionIndex={currentActionIndex}
            totalActions={hand.actions.length}
            onPlayPause={playPause}
            onPrevious={previousAction}
            onNext={nextAction}
            onReset={reset}
          />
        </ErrorBoundary>

        <ErrorBoundary name="ActionHistoryErrorBoundary" enableRetry={enableErrorRecovery}>
          <ActionHistory
            actions={hand.actions}
            currentActionIndex={currentActionIndex}
            onActionClick={goToAction}
          />
        </ErrorBoundary>
      </ParserErrorBoundary>

      <style>{`
        .enhanced-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          gap: 20px;
        }

        .estimated-time {
          font-size: 14px;
          color: #666;
          margin-top: 10px;
        }

        .loading-skeleton {
          width: 100%;
          max-width: 600px;
          margin-top: 20px;
        }

        .enhanced-error {
          text-align: center;
          padding: 40px 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .error-header h3 {
          color: #e74c3c;
          margin-bottom: 10px;
        }

        .error-message {
          color: #666;
          margin-bottom: 20px;
        }

        .error-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .retry-button {
          padding: 10px 20px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .retry-button:hover:not(:disabled) {
          background-color: #2980b9;
        }

        .retry-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }

        .retry-info {
          font-size: 12px;
          color: #666;
        }

        .max-attempts-exceeded {
          font-size: 12px;
          color: #e74c3c;
          background-color: #fdf2f2;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #e74c3c;
        }

        .parser-boundary {
          min-height: 200px;
        }
      `}</style>
    </div>
  );
};

// Enhanced component with error boundary wrapper (for internal use)
const _PokerHandReplayWithErrorBoundary = withErrorBoundary(PokerHandReplay, {
  name: 'PokerHandReplayRoot',
  enableRetry: true,
  maxRetries: 2,
});
