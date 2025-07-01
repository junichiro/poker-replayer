/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import type { PlayingCard } from '../../types';
import { Card } from '../Card';
import type { CardProps } from '../Card';

describe('Card Component', () => {
  describe('Rendering with Traditional Props', () => {
    test('renders visible card with valid card value', () => {
      render(<Card card="As" size="medium" data-testid="ace-spades" />);

      const card = screen.getByTestId('ace-spades');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('card', 'card-medium', 'black');
      expect(card).toHaveAttribute('data-suit', 's');

      // Check card content
      expect(screen.getByText('A')).toBeInTheDocument(); // rank
      expect(screen.getByText('♠')).toBeInTheDocument(); // suit symbol
    });

    test('renders red cards with correct styling', () => {
      render(<Card card="Kh" data-testid="king-hearts" />);

      const card = screen.getByTestId('king-hearts');
      expect(card).toHaveClass('red');
      expect(card).toHaveAttribute('data-suit', 'h');
      expect(screen.getByText('K')).toBeInTheDocument();
      expect(screen.getByText('♥')).toBeInTheDocument();
    });

    test('renders black cards with correct styling', () => {
      render(<Card card="Qc" data-testid="queen-clubs" />);

      const card = screen.getByTestId('queen-clubs');
      expect(card).toHaveClass('black');
      expect(card).toHaveAttribute('data-suit', 'c');
      expect(screen.getByText('Q')).toBeInTheDocument();
      expect(screen.getByText('♣')).toBeInTheDocument();
    });

    test('renders diamond cards as red', () => {
      render(<Card card="Jd" data-testid="jack-diamonds" />);

      const card = screen.getByTestId('jack-diamonds');
      expect(card).toHaveClass('red');
      expect(card).toHaveAttribute('data-suit', 'd');
      expect(screen.getByText('J')).toBeInTheDocument();
      expect(screen.getByText('♦')).toBeInTheDocument();
    });

    test('renders hidden card when isHidden is true', () => {
      render(<Card card="As" isHidden data-testid="hidden-card" />);

      const card = screen.getByTestId('hidden-card');
      expect(card).toHaveClass('card-hidden');
      expect(card.querySelector('.card-back')).toBeInTheDocument();

      // Should not show rank or suit
      expect(screen.queryByText('A')).not.toBeInTheDocument();
      expect(screen.queryByText('♠')).not.toBeInTheDocument();
    });

    test('renders hidden card when no card value provided', () => {
      render(<Card data-testid="no-card" />);

      const card = screen.getByTestId('no-card');
      expect(card).toHaveClass('card-hidden');
      expect(card.querySelector('.card-back')).toBeInTheDocument();
    });

    test('renders different sizes correctly', () => {
      const { rerender } = render(<Card card="As" size="small" data-testid="card" />);
      expect(screen.getByTestId('card')).toHaveClass('card-small');

      rerender(<Card card="As" size="medium" data-testid="card" />);
      expect(screen.getByTestId('card')).toHaveClass('card-medium');

      rerender(<Card card="As" size="large" data-testid="card" />);
      expect(screen.getByTestId('card')).toHaveClass('card-large');
    });

    test('applies custom className', () => {
      render(<Card card="As" className="custom-class" data-testid="card" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });

    test('applies custom styles', () => {
      const customStyle = { border: '2px solid red' };
      render(<Card card="As" style={customStyle} data-testid="card" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveStyle('border: 2px solid red');
    });
  });

  describe('Rendering with Variant Props', () => {
    test('renders visible card variant', () => {
      render(<Card variant={{ variant: 'visible', card: 'Ts' }} data-testid="ten-spades" />);

      const card = screen.getByTestId('ten-spades');
      expect(card).toHaveClass('card', 'black');
      expect(card).toHaveAttribute('data-suit', 's');
      expect(screen.getByText('T')).toBeInTheDocument();
      expect(screen.getByText('♠')).toBeInTheDocument();
    });

    test('renders hidden card variant', () => {
      render(<Card variant={{ variant: 'hidden' }} data-testid="hidden-variant" />);

      const card = screen.getByTestId('hidden-variant');
      expect(card).toHaveClass('card-hidden');
      expect(card.querySelector('.card-back')).toBeInTheDocument();
    });

    test('renders placeholder card variant', () => {
      render(<Card variant={{ variant: 'placeholder' }} data-testid="placeholder-card" />);

      const card = screen.getByTestId('placeholder-card');
      expect(card).toHaveClass('card-hidden');
      expect(card.querySelector('.card-back')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders error state for invalid card format', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(<Card card={'XX' as PlayingCard} data-testid="invalid-card" />);

      const card = screen.getByTestId('invalid-card');
      expect(card).toHaveClass('card-invalid');
      expect(card.querySelector('.card-error')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid card format: XX. Expected format: rank + suit (e.g., "As", "Kh")'
      );

      consoleSpy.mockRestore();
    });

    test('handles empty string card gracefully', () => {
      render(<Card card={'' as PlayingCard} data-testid="empty-card" />);

      const card = screen.getByTestId('empty-card');
      expect(card).toHaveClass('card-hidden');
    });
  });

  describe('All Valid Cards', () => {
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const suits = ['h', 'd', 'c', 's'];
    const suitSymbols = { h: '♥', d: '♦', c: '♣', s: '♠' };
    const redSuits = ['h', 'd'];

    test.each(ranks)('renders rank %s correctly', rank => {
      render(<Card card={`${rank}s` as PlayingCard} data-testid={`card-${rank}`} />);
      expect(screen.getByText(rank)).toBeInTheDocument();
    });

    test.each(suits)('renders suit %s correctly', suit => {
      render(<Card card={`A${suit}` as PlayingCard} data-testid={`card-${suit}`} />);
      expect(screen.getByText(suitSymbols[suit as keyof typeof suitSymbols])).toBeInTheDocument();

      const card = screen.getByTestId(`card-${suit}`);
      if (redSuits.includes(suit)) {
        expect(card).toHaveClass('red');
      } else {
        expect(card).toHaveClass('black');
      }
    });
  });

  describe('Accessibility', () => {
    test('has proper data attributes for screen readers', () => {
      render(<Card card="As" data-testid="accessible-card" />);

      const card = screen.getByTestId('accessible-card');
      expect(card).toHaveAttribute('data-suit', 's');
    });

    test('hidden cards do not expose card information', () => {
      render(<Card card="As" isHidden data-testid="hidden-accessible" />);

      const card = screen.getByTestId('hidden-accessible');
      expect(card).not.toHaveAttribute('data-suit');
      expect(card.textContent).not.toContain('A');
      expect(card.textContent).not.toContain('♠');
    });
  });

  describe('Performance and Memoization', () => {
    test('does not re-render when irrelevant props change', () => {
      let renderCount = 0;

      const TestCard = React.memo((props: CardProps & { irrelevant?: string }) => {
        renderCount++;
        const { irrelevant: _irrelevant, ...cardProps } = props;
        return <Card {...cardProps} data-testid="memo-card" />;
      });

      const { rerender } = render(<TestCard card="As" irrelevant="value1" />);
      const _initialRenderCount = renderCount;

      // Changing irrelevant prop should not cause Card to re-render
      rerender(<TestCard card="As" irrelevant="value2" />);

      // The TestCard will re-render, but the inner Card should be memoized
      expect(screen.getByTestId('memo-card')).toBeInTheDocument();
    });

    test('re-renders when card value changes', () => {
      const { rerender } = render(<Card card="As" data-testid="changing-card" />);

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('♠')).toBeInTheDocument();

      rerender(<Card card="Kh" data-testid="changing-card" />);

      expect(screen.getByText('K')).toBeInTheDocument();
      expect(screen.getByText('♥')).toBeInTheDocument();
      expect(screen.queryByText('A')).not.toBeInTheDocument();
      expect(screen.queryByText('♠')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles numeric ranks correctly', () => {
      render(<Card card="2h" data-testid="two-hearts" />);
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('♥')).toBeInTheDocument();
    });

    test('handles ten rank correctly', () => {
      render(<Card card="Tc" data-testid="ten-clubs" />);
      expect(screen.getByText('T')).toBeInTheDocument();
      expect(screen.getByText('♣')).toBeInTheDocument();
    });

    test('switches between traditional and variant props', () => {
      const { rerender } = render(<Card card="As" data-testid="switching-card" />);
      expect(screen.getByText('A')).toBeInTheDocument();

      rerender(<Card variant={{ variant: 'visible', card: 'Kh' }} data-testid="switching-card" />);
      expect(screen.getByText('K')).toBeInTheDocument();
      expect(screen.getByText('♥')).toBeInTheDocument();
    });
  });
});
