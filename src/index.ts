/**
 * Main entry point for the poker hand replay package
 */

// Export the main component
export { PokerHandReplay, type PokerHandReplayProps } from './components/PokerHandReplay';

// Export individual components for advanced usage
export { Card, type CardProps } from './components/Card';
export { PlayerComponent, type PlayerProps } from './components/Player';
export { Controls, type ControlsProps } from './components/Controls';
export { Table, type TableProps } from './components/Table';
export { ActionHistory, type ActionHistoryProps } from './components/ActionHistory';
export { Pot, type PotProps } from './components/Pot';

// Export the parser
export { PokerStarsParser } from './parser/PokerStarsParser';

// Export all types
export * from './types';