/**
 * Player display component for showing player information and cards
 */

import React from 'react';
import { Card } from './Card';
import { Player as PlayerType } from '../types';

export interface PlayerProps {
  /** Player data */
  player: PlayerType;
  /** Current chip count (may differ from starting chips) */
  currentChips?: number;
  /** Whether this player is currently all-in */
  isAllIn?: boolean;
  /** Whether to show the player's hole cards */
  showCards?: boolean;
  /** Seat position for styling */
  seatPosition?: number;
  /** Total seats at table for positioning */
  maxSeats?: number;
  /** Custom CSS class */
  className?: string;
}

export const PlayerComponent: React.FC<PlayerProps> = ({
  player,
  currentChips,
  isAllIn = false,
  showCards = false,
  seatPosition,
  maxSeats = 6,
  className = ''
}) => {
  const displayChips = currentChips ?? player.currentChips ?? player.chips;
  const isHero = player.isHero;
  const shouldShowCards = isHero || showCards;
  
  const style = {} as React.CSSProperties & {
    '--seat'?: number;
    '--max-seats'?: number;
  };
  if (seatPosition !== undefined && maxSeats) {
    style['--seat'] = seatPosition;
    style['--max-seats'] = maxSeats;
  }

  return (
    <div 
      className={`player ${isHero ? 'hero' : ''} ${isAllIn ? 'all-in' : ''} ${className}`}
      style={style}
    >
      <div className="player-info">
        <div className="player-name">{player.name}</div>
        <div className="player-chips">${displayChips}</div>
        {player.position && <div className="player-position">{player.position}</div>}
      </div>
      
      <div className="player-cards">
        {player.cards && shouldShowCards ? (
          <>
            <Card card={player.cards[0]} size="small" />
            <Card card={player.cards[1]} size="small" />
          </>
        ) : player.cards ? (
          <>
            <Card isHidden size="small" />
            <Card isHidden size="small" />
          </>
        ) : null}
      </div>
      
      {isAllIn && (
        <div className="all-in-indicator">ALL IN</div>
      )}
    </div>
  );
};

export default PlayerComponent;