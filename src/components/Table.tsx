/**
 * Table layout component for positioning players and showing community cards
 */

import React, { useMemo } from 'react';
import { Card } from './Card';
import { PlayerComponent } from './Player';
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

export const Table: React.FC<TableProps> = ({
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
              <PlayerComponent
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

export default Table;