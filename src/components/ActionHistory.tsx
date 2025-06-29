/**
 * Action history component for displaying the sequence of actions in the hand
 */

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
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
  /** Enable virtualization for large action lists (default: true if > 50 actions) */
  enableVirtualization?: boolean;
  /** Height of each action item in pixels (for virtualization) */
  itemHeight?: number;
  /** Maximum height of the action list container */
  maxHeight?: number;
}

// Individual action item component for optimal memoization
interface ActionItemProps {
  action: Action;
  index: number;
  currentActionIndex: number;
  onActionClick?: (index: number) => void;
  isClickable: boolean;
}

const ActionItem = React.memo<ActionItemProps>(({
  action,
  index,
  currentActionIndex,
  onActionClick,
  isClickable
}) => {
  const handleClick = useCallback(() => {
    if (onActionClick && isClickable) {
      onActionClick(index);
    }
  }, [onActionClick, isClickable, index]);

  const className = useMemo(() => {
    const classes = ['action'];
    if (index <= currentActionIndex) classes.push('played');
    if (index === currentActionIndex) classes.push('current');
    if (isClickable) classes.push('clickable');
    return classes.join(' ');
  }, [index, currentActionIndex, isClickable]);

  return (
    <div 
      className={className}
      onClick={handleClick}
      style={{ minHeight: '24px' }} // Consistent height for virtualization
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
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.action === nextProps.action &&
    prevProps.index === nextProps.index &&
    prevProps.currentActionIndex === nextProps.currentActionIndex &&
    prevProps.onActionClick === nextProps.onActionClick &&
    prevProps.isClickable === nextProps.isClickable
  );
});

ActionItem.displayName = 'ActionItem';

// Virtual scrolling implementation for performance with large action lists
const VirtualizedActionList: React.FC<{
  actions: Action[];
  currentActionIndex: number;
  onActionClick?: (index: number) => void;
  itemHeight: number;
  maxHeight: number;
}> = ({ actions, currentActionIndex, onActionClick, itemHeight, maxHeight }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const visibleRange = useMemo(() => {
    const containerHeight = maxHeight;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      actions.length
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, maxHeight, actions.length]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Auto-scroll to current action
  useEffect(() => {
    if (containerRef.current && currentActionIndex >= 0) {
      const targetScrollTop = currentActionIndex * itemHeight;
      const currentScrollTop = containerRef.current.scrollTop;
      const containerHeight = containerRef.current.clientHeight;
      
      // Only scroll if the current action is not visible
      if (targetScrollTop < currentScrollTop || 
          targetScrollTop > currentScrollTop + containerHeight - itemHeight) {
        containerRef.current.scrollTo({
          top: Math.max(0, targetScrollTop - containerHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [currentActionIndex, itemHeight]);

  const visibleActions = useMemo(() => {
    return actions.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [actions, visibleRange.startIndex, visibleRange.endIndex]);

  const isClickable = !!onActionClick;

  return (
    <div 
      ref={containerRef}
      className="action-list virtualized"
      style={{ 
        height: maxHeight, 
        overflowY: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      {/* Spacer for items before visible range */}
      <div style={{ height: visibleRange.startIndex * itemHeight }} />
      
      {/* Visible action items */}
      {visibleActions.map((action, relativeIndex) => {
        const absoluteIndex = visibleRange.startIndex + relativeIndex;
        return (
          <ActionItem
            key={action.index}
            action={action}
            index={absoluteIndex}
            currentActionIndex={currentActionIndex}
            onActionClick={onActionClick}
            isClickable={isClickable}
          />
        );
      })}
      
      {/* Spacer for items after visible range */}
      <div style={{ height: (actions.length - visibleRange.endIndex) * itemHeight }} />
    </div>
  );
};

const ActionHistoryComponent: React.FC<ActionHistoryProps> = ({
  actions,
  currentActionIndex,
  visible = true,
  className = '',
  onActionClick,
  enableVirtualization,
  itemHeight = 24,
  maxHeight = 200
}) => {
  if (!visible) return null;

  // Determine if virtualization should be enabled
  const shouldVirtualize = useMemo(() => {
    if (enableVirtualization !== undefined) {
      return enableVirtualization;
    }
    // Auto-enable virtualization for large lists
    return actions.length > 50;
  }, [enableVirtualization, actions.length]);

  // Memoize the action click handler to prevent unnecessary re-renders
  const stableOnActionClick = useCallback((index: number) => {
    onActionClick?.(index);
  }, [onActionClick]);

  const isClickable = !!onActionClick;

  return (
    <div className={`action-history ${className}`}>
      <h3>Actions ({actions.length})</h3>
      
      {shouldVirtualize ? (
        <VirtualizedActionList
          actions={actions}
          currentActionIndex={currentActionIndex}
          onActionClick={stableOnActionClick}
          itemHeight={itemHeight}
          maxHeight={maxHeight}
        />
      ) : (
        <div className="action-list" style={{ maxHeight, overflowY: 'auto' }}>
          {actions.map((action, index) => (
            <ActionItem
              key={action.index}
              action={action}
              index={index}
              currentActionIndex={currentActionIndex}
              onActionClick={stableOnActionClick}
              isClickable={isClickable}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Custom comparison function for React.memo
 * Only re-render if action history props have actually changed
 */
function areActionHistoryPropsEqual(
  prevProps: ActionHistoryProps, 
  nextProps: ActionHistoryProps
): boolean {
  // Compare basic props
  if (prevProps.currentActionIndex !== nextProps.currentActionIndex ||
      prevProps.visible !== nextProps.visible ||
      prevProps.className !== nextProps.className ||
      prevProps.onActionClick !== nextProps.onActionClick ||
      prevProps.enableVirtualization !== nextProps.enableVirtualization ||
      prevProps.itemHeight !== nextProps.itemHeight ||
      prevProps.maxHeight !== nextProps.maxHeight) {
    return false;
  }

  // Deep compare actions array (reference equality first for performance)
  if (prevProps.actions === nextProps.actions) {
    return true;
  }

  // If arrays are different references, compare length and content
  if (prevProps.actions.length !== nextProps.actions.length) {
    return false;
  }

  // Always compare array content regardless of length to ensure correctness
  for (let i = 0; i < prevProps.actions.length; i++) {
    if (prevProps.actions[i] !== nextProps.actions[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Memoized ActionHistory component for optimal performance
 * Includes virtualization for large action lists and optimized re-rendering
 */
export const ActionHistory = React.memo(ActionHistoryComponent, areActionHistoryPropsEqual);

export default ActionHistory;