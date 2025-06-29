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

export const Pot: React.FC<PotProps> = ({
  pot,
  showDetails = false,
  className = ''
}) => {
  const potTypeClass = pot.isSide ? 'side-pot' : 'main-pot';
  
  return (
    <div className={`pot ${potTypeClass} ${pot.isSplit ? 'split-pot' : ''} ${className}`}>
      <div className="pot-amount">${pot.amount}</div>
      
      {pot.isSide && pot.sidePotLevel && (
        <div className="pot-label">Side Pot {pot.sidePotLevel}</div>
      )}
      
      {pot.isSplit && (
        <div className="pot-label">Split</div>
      )}
      
      {showDetails && (
        <div className="pot-details">
          {pot.players.length > 0 && (
            <div className="pot-winners">
              Winners: {pot.players.join(', ')}
            </div>
          )}
          
          {pot.eligiblePlayers && pot.eligiblePlayers.length > 0 && (
            <div className="pot-eligible">
              Eligible: {pot.eligiblePlayers.join(', ')}
            </div>
          )}
          
          {pot.oddChipWinner && (
            <div className="odd-chip">
              Odd chip: {pot.oddChipWinner}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Pot;