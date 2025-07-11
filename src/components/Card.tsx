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

import React, { memo } from 'react';

import {
  BaseComponentProps,
  ComponentSize,
  PlayingCard,
  CardVariant,
  CardRank,
  CardSuit,
  PLAYING_CARD_REGEX,
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
interface CardPropsVariant extends BaseComponentProps {
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
 * Constant mappings for card suits and ranks - moved outside component for performance
 */
const suitSymbol: Record<CardSuit, string> = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
};

const suitName: Record<CardSuit, string> = {
  h: 'hearts',
  d: 'diamonds',
  c: 'clubs',
  s: 'spades',
};

const rankName: Record<string, string> = {
  A: 'Ace',
  K: 'King',
  Q: 'Queen',
  J: 'Jack',
  T: 'Ten',
  '9': 'Nine',
  '8': 'Eight',
  '7': 'Seven',
  '6': 'Six',
  '5': 'Five',
  '4': 'Four',
  '3': 'Three',
  '2': 'Two',
};

/**
 * Type guard to check if props use the variant approach
 */
function isVariantProps(props: CardProps): props is CardPropsVariant {
  return 'variant' in props;
}

/**
 * Card component with enhanced TypeScript prop typing and performance optimization
 * Supports both traditional props and discriminated union variants
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const CardComponent: React.FC<CardProps> = props => {
  const {
    size = defaultProps.size,
    className = defaultProps.className,
    style,
    'data-testid': testId,
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
        role="img"
        aria-label="Hidden card"
      >
        <div className="card-back"></div>
      </div>
    );
  }

  // Validate card format
  if (!PLAYING_CARD_REGEX.test(cardValue)) {
    console.warn(
      `Invalid card format: ${cardValue}. Expected format: rank + suit (e.g., "As", "Kh")`
    );
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

  const cardLabel = `${rankName[rank] || rank} of ${suitName[suit]}`;
  const shortCardLabel = `Card ${cardValue}`;

  return (
    <div
      className={`card card-${size} ${isRed ? 'red' : 'black'} ${className}`}
      style={style}
      data-testid={testId}
      data-suit={suit}
      role="img"
      aria-label={cardLabel}
      title={shortCardLabel}
    >
      <div className="card-rank">{rank}</div>
      <div className="card-suit">{suitSymbol[suit]}</div>
    </div>
  );
};

/**
 * Custom comparison function for React.memo
 * Only re-render if card-specific props have actually changed
 */
function areCardPropsEqual(prevProps: CardProps, nextProps: CardProps): boolean {
  // Compare basic props
  if (
    prevProps.size !== nextProps.size ||
    prevProps.className !== nextProps.className ||
    prevProps['data-testid'] !== nextProps['data-testid']
  ) {
    return false;
  }

  // Handle discriminated union comparison
  if (isVariantProps(prevProps) && isVariantProps(nextProps)) {
    const prevVariant = prevProps.variant;
    const nextVariant = nextProps.variant;

    if (prevVariant.variant !== nextVariant.variant) {
      return false;
    }

    if (prevVariant.variant === 'visible' && nextVariant.variant === 'visible') {
      return prevVariant.card === nextVariant.card;
    }

    return true; // Both hidden or placeholder
  }

  // Handle traditional props comparison
  if (!isVariantProps(prevProps) && !isVariantProps(nextProps)) {
    return prevProps.card === nextProps.card && prevProps.isHidden === nextProps.isHidden;
  }

  // Mixed prop types - they're different
  return false;
}

/**
 * Memoized Card component for optimal performance
 * Prevents unnecessary re-renders when card props haven't changed
 */
export const Card = memo(CardComponent, areCardPropsEqual);
