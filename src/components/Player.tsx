/**
 * Player display component for showing player information and cards
 */

import React, { useMemo } from "react";
import { Card } from "./Card";
import { Player as PlayerType } from "../types";

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

const PlayerComponent: React.FC<PlayerProps> = ({
  player,
  currentChips,
  isAllIn = false,
  showCards = false,
  seatPosition,
  maxSeats = 6,
  className = "",
}) => {
  // Memoize expensive calculations
  const displayChips = useMemo(
    () => currentChips ?? player.currentChips ?? player.chips,
    [currentChips, player.currentChips, player.chips],
  );

  const isHero = player.isHero;
  const shouldShowCards = isHero || showCards;

  // Memoize style object to prevent unnecessary re-renders
  const style = useMemo(() => {
    const styleObj = {} as React.CSSProperties & {
      "--seat"?: number;
      "--max-seats"?: number;
    };
    if (seatPosition !== undefined && maxSeats) {
      styleObj["--seat"] = seatPosition;
      styleObj["--max-seats"] = maxSeats;
    }
    return styleObj;
  }, [seatPosition, maxSeats]);

  return (
    <div
      className={`player ${isHero ? "hero" : ""} ${isAllIn ? "all-in" : ""} ${className}`}
      style={style}
    >
      <div className="player-info">
        <div className="player-name">{player.name}</div>
        <div className="player-chips">${displayChips}</div>
        {player.position && (
          <div className="player-position">{player.position}</div>
        )}
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

      {isAllIn && <div className="all-in-indicator">ALL IN</div>}
    </div>
  );
};

/**
 * Custom comparison function for React.memo
 * Only re-render if player-related props have actually changed
 */
function arePlayerPropsEqual(
  prevProps: PlayerProps,
  nextProps: PlayerProps,
): boolean {
  // Compare player identity (most important)
  if (
    prevProps.player.name !== nextProps.player.name ||
    prevProps.player.seat !== nextProps.player.seat
  ) {
    return false;
  }

  // Compare display state
  if (
    prevProps.currentChips !== nextProps.currentChips ||
    prevProps.isAllIn !== nextProps.isAllIn ||
    prevProps.showCards !== nextProps.showCards
  ) {
    return false;
  }

  // Compare player intrinsic properties that might change
  if (
    prevProps.player.isHero !== nextProps.player.isHero ||
    prevProps.player.position !== nextProps.player.position
  ) {
    return false;
  }

  // Compare cards (deep comparison needed)
  const prevCards = prevProps.player.cards;
  const nextCards = nextProps.player.cards;
  if (prevCards !== nextCards) {
    if (!prevCards || !nextCards) {
      return false; // One has cards, other doesn't
    }
    if (prevCards[0] !== nextCards[0] || prevCards[1] !== nextCards[1]) {
      return false;
    }
  }

  // Compare positioning props
  if (
    prevProps.seatPosition !== nextProps.seatPosition ||
    prevProps.maxSeats !== nextProps.maxSeats ||
    prevProps.className !== nextProps.className
  ) {
    return false;
  }

  return true;
}

/**
 * Memoized Player component for optimal performance
 * Prevents unnecessary re-renders when player props haven't changed
 */
export const Player = React.memo(PlayerComponent, arePlayerPropsEqual);

export default Player;
