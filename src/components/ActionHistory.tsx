/**
 * Action history component for displaying the sequence of actions in the hand
 */

import React from 'react';
import { Action } from '../types';

export interface ActionHistoryProps {
  /** List of actions to display */
  actions: Action[];
  /** Current action index being replayed */
  currentActionIndex: number;
  /** Whether to show the action history */
  visible?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Callback when an action is clicked */
  onActionClick?: (index: number) => void;
}

export const ActionHistory: React.FC<ActionHistoryProps> = ({
  actions,
  currentActionIndex,
  visible = true,
  className = '',
  onActionClick
}) => {
  if (!visible) return null;

  const handleActionClick = (index: number) => {
    if (onActionClick) {
      onActionClick(index);
    }
  };

  return (
    <div className={`action-history ${className}`}>
      <h3>Actions</h3>
      <div className="action-list">
        {actions.map((action, index) => (
          <div 
            key={action.index}
            className={`action ${index <= currentActionIndex ? 'played' : ''} ${index === currentActionIndex ? 'current' : ''} ${onActionClick ? 'clickable' : ''}`}
            onClick={() => handleActionClick(index)}
          >
            <span className="street">{action.street}</span>
            <span className="player">{action.player || 'System'}</span>
            <span className="action-type">{action.type}</span>
            {action.amount && <span className="amount">${action.amount}</span>}
            {action.isAllIn && <span className="all-in">ALL IN</span>}
            {action.reason && <span className="reason">{action.reason}</span>}
            {action.cards && action.cards.length > 0 && (
              <span className="cards">[{action.cards.join(', ')}]</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionHistory;