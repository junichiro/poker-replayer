/**
 * Table layout component for positioning players and showing community cards
 */

import React, { useMemo } from 'react';
import { Card } from './Card';
import { Player } from './Player';
import { Pot } from './Pot';
import { Player as PlayerType, Pot as PotType, TableInfo, PlayingCard } from '../types';

export interface TableProps {
  /** Table configuration */
  table: TableInfo;
  /** List of players to display */
  players: PlayerType[];
  /** Current chip counts for each player */
  currentPlayers?: PlayerType[];
  /** Community cards to display */
  boardCards: PlayingCard[];
  /** Pots to display */
  pots: PotType[];
  /** Whether to show all players' cards */
  showAllCards?: boolean;
  /** Custom CSS class */
  className?: string;
}

const TableComponent: React.FC<TableProps> = ({
  table,
  players,
  currentPlayers = [],
  boardCards,
  pots,
  showAllCards = false,
  className = ''
}) => {
  const currentPlayersMap = useMemo(() => 
    new Map(currentPlayers.map(p => [p.name, p])),
    [currentPlayers]
  );

  return (
    <div className={`table-area ${className}`}>
      <div className="table">
        <div className="table-center">
          <div className="board">
            {boardCards.map((card, index) => (
              <div key={index} className="board-card">
                <Card card={card} />
              </div>
            ))}
          </div>
          
          <div className="pots">
            {pots.map((pot, index) => (
              <Pot key={index} pot={pot} />
            ))}
          </div>
        </div>
        
        <div className="players">
          {players.map(player => {
            const currentPlayer = currentPlayersMap.get(player.name) || player;
            return (
              <Player
                key={player.seat}
                player={player}
                currentChips={currentPlayer.currentChips}
                isAllIn={currentPlayer.isAllIn}
                showCards={showAllCards}
                seatPosition={player.seat}
                maxSeats={table.maxSeats}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Custom comparison function for React.memo
 * Only re-render if table-related props have actually changed
 */
function areTablePropsEqual(prevProps: TableProps, nextProps: TableProps): boolean {
  // Compare basic props
  if (prevProps.table !== nextProps.table ||
      prevProps.showAllCards !== nextProps.showAllCards ||
      prevProps.className !== nextProps.className) {
    return false;
  }

  // Compare arrays by reference first (fast check)
  if (prevProps.players === nextProps.players &&
      prevProps.currentPlayers === nextProps.currentPlayers &&
      prevProps.boardCards === nextProps.boardCards &&
      prevProps.pots === nextProps.pots) {
    return true;
  }

  // Compare array lengths
  if (prevProps.players.length !== nextProps.players.length ||
      prevProps.currentPlayers?.length !== nextProps.currentPlayers?.length ||
      prevProps.boardCards.length !== nextProps.boardCards.length ||
      prevProps.pots.length !== nextProps.pots.length) {
    return false;
  }

  // For board cards, do a shallow comparison (they're string primitives)
  if (prevProps.boardCards.some((card, i) => card !== nextProps.boardCards[i])) {
    return false;
  }

  // For small arrays, do reference comparison of items
  if (prevProps.players.length < 10) {
    for (let i = 0; i < prevProps.players.length; i++) {
      if (prevProps.players[i] !== nextProps.players[i]) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Memoized Table component for optimal performance
 * Prevents unnecessary re-renders when table props haven't changed
 */
export const Table = React.memo(TableComponent, areTablePropsEqual);

export default Table;