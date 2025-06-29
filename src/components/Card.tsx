/**
 * Card display component for showing individual playing cards
 * 
 * @example
 * ```tsx
 * // Visible card
 * <Card card="As" size="medium" />
 * 
 * // Hidden card
 * <Card isHidden size="small" />
 * 
 * // Using discriminated union (recommended)
 * <Card variant={{ variant: 'visible', card: 'Kh' }} />
 * <Card variant={{ variant: 'hidden' }} />
 * ```
 */

import React from 'react';
import { 
  BaseComponentProps, 
  ComponentSize, 
  PlayingCard, 
  CardVariant,
  CardRank,
  CardSuit
} from '../types';

/**
 * Props for the Card component using traditional approach
 * @public
 */
export interface CardPropsTraditional extends BaseComponentProps {
  /** 
   * Card string in format like "As", "Kh", "2c", etc.
   * Must be a valid playing card (rank + suit)
   * @example "As", "Kh", "2c", "Tc"
   */
  card?: PlayingCard;
  /** 
   * Whether to show the card face-down
   * @default false
   */
  isHidden?: boolean;
  /** 
   * Size variant of the card
   * @default 'medium'
   */
  size?: ComponentSize;
}

/**
 * Props for the Card component using discriminated union (recommended)
 * @public
 */
export interface CardPropsVariant extends BaseComponentProps {
  /** 
   * Card variant using discriminated union for better type safety
   * @example 
   * { variant: 'visible', card: 'As' }
   * { variant: 'hidden' }
   * { variant: 'placeholder' }
   */
  variant: CardVariant;
  /** 
   * Size variant of the card
   * @default 'medium'
   */
  size?: ComponentSize;
}

/**
 * Combined props type - supports both traditional and variant approaches
 * @public
 */
export type CardProps = CardPropsTraditional | CardPropsVariant;

/**
 * Default props for the Card component
 */
const defaultProps = {
  size: 'medium' as const,
  isHidden: false,
  className: '',
} satisfies Partial<CardPropsTraditional>;

/**
 * Type guard to check if props use the variant approach
 */
function isVariantProps(props: CardProps): props is CardPropsVariant {
  return 'variant' in props;
}

/**
 * Card component with enhanced TypeScript prop typing
 * Supports both traditional props and discriminated union variants
 */
export const Card: React.FC<CardProps> = (props) => {
  const { 
    size = defaultProps.size, 
    className = defaultProps.className,
    style,
    'data-testid': testId
  } = props;

  let cardValue: PlayingCard | undefined;
  let isHidden: boolean;

  // Handle discriminated union variant
  if (isVariantProps(props)) {
    const { variant } = props;
    switch (variant.variant) {
      case 'visible':
        cardValue = variant.card;
        isHidden = false;
        break;
      case 'hidden':
        cardValue = undefined;
        isHidden = true;
        break;
      case 'placeholder':
        cardValue = undefined;
        isHidden = false;
        break;
    }
  } else {
    // Handle traditional props
    cardValue = props.card;
    isHidden = props.isHidden ?? defaultProps.isHidden;
  }

  // Render hidden card
  if (isHidden || !cardValue) {
    return (
      <div 
        className={`card card-hidden card-${size} ${className}`}
        style={style}
        data-testid={testId}
      >
        <div className="card-back"></div>
      </div>
    );
  }

  // Validate card format
  if (!/^[2-9TJQKA][hdcs]$/.test(cardValue)) {
    console.warn(`Invalid card format: ${cardValue}. Expected format: rank + suit (e.g., "As", "Kh")`);
    return (
      <div 
        className={`card card-invalid card-${size} ${className}`}
        style={style}
        data-testid={testId}
      >
        <div className="card-error">?</div>
      </div>
    );
  }

  const suit = cardValue.slice(-1) as CardSuit;
  const rank = cardValue.slice(0, -1) as CardRank;
  const isRed = ['h', 'd'].includes(suit);
  
  const suitSymbol: Record<CardSuit, string> = {
    'h': '♥',
    'd': '♦',
    'c': '♣',
    's': '♠'
  };

  return (
    <div 
      className={`card card-${size} ${isRed ? 'red' : 'black'} ${className}`}
      style={style}
      data-testid={testId}
    >
      <div className="card-rank">{rank}</div>
      <div className="card-suit">{suitSymbol[suit]}</div>
    </div>
  );
};

export default Card;