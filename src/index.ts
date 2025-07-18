/**
 * # Poker Hand Replay
 *
 * A React component library for parsing and replaying PokerStars hand histories with beautiful visual animations.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { PokerHandReplay } from 'poker-hand-replay';
 *
 * function App() {
 *   return (
 *     <PokerHandReplay
 *       handHistory={handHistoryString}
 *       config={{ theme: "dark", autoPlay: false }}
 *     />
 *   );
 * }
 * ```
 *
 * ## Main Features
 *
 * - **Parser**: {@link PokerStarsParser} - Parse PokerStars hand history format
 * - **Main Component**: {@link PokerHandReplay} - Complete replay interface
 * - **Individual Components**: {@link Card}, {@link Player}, {@link Table}, etc.
 * - **Error Handling**: {@link ErrorBoundary}, {@link ParserErrorBoundary}
 * - **Loading States**: {@link LoadingSpinner}, {@link ProgressSpinner}, {@link Skeleton}
 * - **Utility Hooks**: {@link useLoading}, {@link useRetry}, {@link useAsyncOperation}
 *
 * @packageDocumentation
 */

/**
 * ## Main Component
 *
 * The primary interface for hand replay functionality.
 *
 * @group Main Components
 */
export { PokerHandReplay, type PokerHandReplayProps } from './components/PokerHandReplay';

/**
 * ## Individual Components
 *
 * Granular components for building custom interfaces.
 *
 * @group Main Components
 */
export { Card, type CardProps } from './components/Card';
export { Player, type PlayerProps } from './components/Player';
export { Controls, type ControlsProps } from './components/Controls';
export { Table, type TableProps } from './components/Table';
export { ActionHistory, type ActionHistoryProps } from './components/ActionHistory';
export { Pot, type PotProps } from './components/Pot';

/**
 * ## Error Handling Components
 *
 * Robust error boundaries and fallback components.
 *
 * @group Error Handling
 */
export {
  ErrorBoundary,
  withErrorBoundary,
  type ErrorBoundaryProps,
  type ErrorInfoData,
} from './components/ErrorBoundary';
export {
  ParserErrorBoundary,
  type ParserErrorBoundaryProps,
} from './components/ParserErrorBoundary';

/**
 * ## Loading Components
 *
 * Progress indicators and skeleton loading states.
 *
 * @group Loading States
 */
export {
  LoadingSpinner,
  ProgressSpinner,
  Skeleton,
  type LoadingSpinnerProps,
  type ProgressSpinnerProps,
  type SkeletonProps,
} from './components/LoadingSpinner';

/**
 * ## Parser
 *
 * Hand history parsing functionality.
 *
 * @group Parser
 */
export { PokerStarsParser } from './parser/PokerStarsParser';

/**
 * ## Refactored Parser (SOLID Architecture)
 *
 * New SOLID-compliant parser with separated concerns.
 *
 * @group Parser
 */
export { RefactoredPokerStarsParser } from './parser/RefactoredPokerStarsParser';

/**
 * ## Extensible Parser Architecture (Open/Closed Principle)
 *
 * Open/Closed Principle compliant parser architecture that allows
 * adding support for new poker sites without modifying existing code.
 *
 * @group Parser
 */
export { HandHistoryParserFactory } from './parser/HandHistoryParserFactory';
export { ExtensiblePokerStarsParser } from './parser/ExtensiblePokerStarsParser';
export { BaseHandHistoryParser } from './parser/BaseHandHistoryParser';

/**
 * ## Parser Services
 *
 * Individual service classes following Single Responsibility Principle.
 *
 * @group Services
 */
export {
  PotCalculator,
  PlayerStateTracker,
  ActionParser,
  HandHistoryValidator,
  type IPotCalculator,
  type IPlayerStateTracker,
  type IActionParser,
  type IHandHistoryValidator,
} from './services';

/**
 * ## Loading Utilities
 *
 * React hooks for managing loading states and async operations.
 *
 * @group Utilities
 */
export {
  useLoading,
  useAsyncOperation,
  useBatchLoading,
  useDebouncedLoading,
} from './utils/loading';

/**
 * ## Retry Utilities
 *
 * Robust retry mechanisms and circuit breaker patterns.
 *
 * @group Utilities
 */
export { useRetry, retry, CircuitBreaker, withRetry, retryPredicates } from './utils/retry';

/**
 * ## Type Definitions
 *
 * Comprehensive TypeScript interfaces and types.
 *
 * @group Types
 */
export type {
  // Core types (avoid conflicts with component names)
  Player as PlayerType,
  Pot as PotType,
  Action,
  PokerHand,
  TableInfo,
  PlayingCard,
  CardRank,
  CardSuit,
  ComponentSize,
  BaseComponentProps,
  Position,
  Street,
  ActionType,
  CardVariant,
  NumericConstraints,
  PLAYING_CARD_REGEX,
  PlayerState,
  PotCalculation,
  // Parser architecture types
  PokerSiteFormat,
  PokerFeature,
  ParserInfo,
  IHandHistoryParser,
  IHandHistoryParserFactory,
  ParserConfiguration,
  IConfigurableParser,
} from './types';
