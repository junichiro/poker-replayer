/**
 * Card display component for showing individual playing cards
 */

import React from 'react';

export interface CardProps {
  /** Card string in format like "As", "Kh", "2c", etc. */
  card?: string;
  /** Whether to show the card face-down */
  isHidden?: boolean;
  /** Size variant of the card */
  size?: 'small' | 'medium' | 'large';
  /** Custom CSS class */
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  isHidden = false,
  size = 'medium',
  className = ''
}) => {
  if (isHidden || !card) {
    return (
      <div className={`card card-hidden card-${size} ${className}`}>
        <div className="card-back"></div>
      </div>
    );
  }

  const suit = card.slice(-1);
  const rank = card.slice(0, -1);
  const isRed = ['h', 'd'].includes(suit);
  
  const suitSymbol = {
    'h': '♥',
    'd': '♦',
    'c': '♣',
    's': '♠'
  }[suit] || suit;

  return (
    <div className={`card card-${size} ${isRed ? 'red' : 'black'} ${className}`}>
      <div className="card-rank">{rank}</div>
      <div className="card-suit">{suitSymbol}</div>
    </div>
  );
};

export default Card;