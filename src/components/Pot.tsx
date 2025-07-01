/**
 * Pot display component for showing pot amounts and types
 */

import React from 'react';

import { Pot as PotType } from '../types';

export interface PotProps {
  /** Pot data to display */
  pot: PotType;
  /** Whether to show detailed information */
  showDetails?: boolean;
  /** Custom CSS class */
  className?: string;
}

const PotComponent: React.FC<PotProps> = ({ pot, showDetails = false, className = '' }) => {
  const potTypeClass = pot.isSide ? 'side-pot' : 'main-pot';

  return (
    <div className={`pot ${potTypeClass} ${pot.isSplit ? 'split-pot' : ''} ${className}`}>
      <div className="pot-amount">${pot.amount}</div>

      {pot.isSide && pot.sidePotLevel && (
        <div className="pot-label">Side Pot {pot.sidePotLevel}</div>
      )}

      {pot.isSplit && <div className="pot-label">Split</div>}

      {showDetails && (
        <div className="pot-details">
          {pot.players.length > 0 && (
            <div className="pot-winners">Winners: {pot.players.join(', ')}</div>
          )}

          {pot.eligiblePlayers && pot.eligiblePlayers.length > 0 && (
            <div className="pot-eligible">Eligible: {pot.eligiblePlayers.join(', ')}</div>
          )}

          {pot.oddChipWinner && <div className="odd-chip">Odd chip: {pot.oddChipWinner}</div>}
        </div>
      )}
    </div>
  );
};

/**
 * Custom comparison function for React.memo
 * Only re-render if pot-related props have actually changed
 */
function arePotPropsEqual(prevProps: PotProps, nextProps: PotProps): boolean {
  // Compare basic props
  if (
    prevProps.showDetails !== nextProps.showDetails ||
    prevProps.className !== nextProps.className
  ) {
    return false;
  }

  // Compare pot object by reference first (fast check)
  if (prevProps.pot === nextProps.pot) {
    return true;
  }

  // Deep comparison of pot properties
  const prevPot = prevProps.pot;
  const nextPot = nextProps.pot;

  if (
    prevPot.amount !== nextPot.amount ||
    prevPot.isSide !== nextPot.isSide ||
    prevPot.isSplit !== nextPot.isSplit ||
    prevPot.sidePotLevel !== nextPot.sidePotLevel ||
    prevPot.oddChipWinner !== nextPot.oddChipWinner
  ) {
    return false;
  }

  // Compare player arrays
  if (prevPot.players.length !== nextPot.players.length) {
    return false;
  }
  for (let i = 0; i < prevPot.players.length; i++) {
    if (prevPot.players[i] !== nextPot.players[i]) {
      return false;
    }
  }

  // Compare eligible players arrays
  const prevEligible = prevPot.eligiblePlayers || [];
  const nextEligible = nextPot.eligiblePlayers || [];
  if (prevEligible.length !== nextEligible.length) {
    return false;
  }
  for (let i = 0; i < prevEligible.length; i++) {
    if (prevEligible[i] !== nextEligible[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Memoized Pot component for optimal performance
 * Prevents unnecessary re-renders when pot props haven't changed
 */
export const Pot = React.memo(PotComponent, arePotPropsEqual);

export default Pot;
