/**
 * Table layout component for positioning players and showing community cards
 */

import React, { useMemo, memo } from 'react';

import { Player as PlayerType, Pot as PotType, TableInfo, PlayingCard } from '../types';

import { Card } from './Card';
import { Player } from './Player';
import { Pot } from './Pot';

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
  className = '',
}) => {
  const currentPlayersMap = useMemo(
    () => new Map(currentPlayers.map(p => [p.name, p])),
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
  if (
    prevProps.table !== nextProps.table ||
    prevProps.showAllCards !== nextProps.showAllCards ||
    prevProps.className !== nextProps.className
  ) {
    return false;
  }

  // Compare arrays by reference first (fast check)
  if (
    prevProps.players === nextProps.players &&
    prevProps.currentPlayers === nextProps.currentPlayers &&
    prevProps.boardCards === nextProps.boardCards &&
    prevProps.pots === nextProps.pots
  ) {
    return true;
  }

  // Compare array lengths
  if (
    prevProps.players.length !== nextProps.players.length ||
    (prevProps.currentPlayers?.length ?? 0) !== (nextProps.currentPlayers?.length ?? 0) ||
    prevProps.boardCards.length !== nextProps.boardCards.length ||
    prevProps.pots.length !== nextProps.pots.length
  ) {
    return false;
  }

  // Shallowly compare array contents regardless of length to ensure correctness
  if (prevProps.players.some((p, i) => p !== nextProps.players[i])) return false;
  if ((prevProps.currentPlayers ?? []).some((p, i) => p !== (nextProps.currentPlayers ?? [])[i]))
    return false;
  if (prevProps.boardCards.some((c, i) => c !== nextProps.boardCards[i])) return false;
  if (prevProps.pots.some((p, i) => p !== nextProps.pots[i])) return false;

  return true;
}

/**
 * Memoized Table component for optimal performance
 * Prevents unnecessary re-renders when table props haven't changed
 */
export const Table = memo(TableComponent, areTablePropsEqual);
