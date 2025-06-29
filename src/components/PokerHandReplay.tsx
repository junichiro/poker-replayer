/**
 * Main poker hand replay component (refactored to use smaller components)
 * This component has been split into smaller, reusable components as part of Phase 2
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PokerStarsParser } from '../parser/PokerStarsParser';
import { Table } from './Table';
import { Controls } from './Controls';
import { ActionHistory } from './ActionHistory';
import { 
  PokerHand, 
  ReplayConfig, 
  ActionChangeCallback, 
  ReplayEventCallback
} from '../types';
import { 
  applyTheme, 
  applySize, 
  applyTableShape, 
  applyCardDesign, 
  applyAnimationConfig,
  getSystemColorScheme
} from '../utils/customization';

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
}

export const PokerHandReplay: React.FC<PokerHandReplayProps> = ({
  handHistory,
  config = {},
  onActionChange,
  onReplayEvent,
  className = ''
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
    animations
  } = config;

  // Refs for DOM manipulation
  const replayRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // State management
  const [hand, setHand] = useState<PokerHand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Parse hand history on mount or when handHistory changes
  useEffect(() => {
    const parser = new PokerStarsParser();
    const result = parser.parse(handHistory);
    
    if (result.success) {
      setHand(result.hand);
      setError(null);
      
      if (autoPlay) {
        setIsPlaying(true);
        onReplayEvent?.('start');
      }
    } else {
      setError(result.error.message);
      setHand(null);
    }
  }, [handHistory, autoPlay, onReplayEvent]);

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

    const newPlayers = hand.players.map(p => ({ ...p, currentChips: p.chips }));
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

  if (error) {
    return (
      <div 
        ref={replayRef}
        className={`poker-replay error ${className}`} 
        data-theme={theme}
      >
        <div className="error-message">
          <h3>Error parsing hand history</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!hand) {
    return (
      <div 
        ref={replayRef}
        className={`poker-replay loading ${className}`} 
        data-theme={theme}
      >
        <div className="loading-message">Loading hand...</div>
      </div>
    );
  }

  return (
    <div 
      ref={replayRef}
      className={`poker-replay ${className}`} 
      data-theme={theme}
    >
      <div className="hand-info">
        <h2>Hand #{hand.id}</h2>
        <div className="hand-details">
          <span className="stakes">{hand.stakes}</span>
          <span className="table">{hand.table.name}</span>
          <span className="date">{hand.date.toLocaleString()}</span>
        </div>
      </div>

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

      <Controls
        isPlaying={isPlaying}
        currentActionIndex={currentActionIndex}
        totalActions={hand.actions.length}
        onPlayPause={playPause}
        onPrevious={previousAction}
        onNext={nextAction}
        onReset={reset}
      />

      <ActionHistory
        actions={hand.actions}
        currentActionIndex={currentActionIndex}
        onActionClick={goToAction}
      />
    </div>
  );
};

export default PokerHandReplay;