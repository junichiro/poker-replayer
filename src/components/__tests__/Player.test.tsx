/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Player } from '../Player';
import type { PlayerProps } from '../Player';
import type { Player as PlayerType } from '../../types';

// Mock the Card component
jest.mock('../Card', () => ({
  Card: ({ card, isHidden, size, ...props }: any) => (
    <div 
      data-testid={`card-${card || 'hidden'}-${size}`}
      data-hidden={isHidden}
      {...props}
    >
      {card && !isHidden ? `Card: ${card}` : 'Hidden Card'}
    </div>
  ),
}));

describe('Player Component', () => {
  const mockPlayer: PlayerType = {
    seat: 1,
    name: 'TestPlayer',
    chips: 1000,
    currentChips: 850,
    isAllIn: false,
    position: 'BB',
    cards: ['As', 'Kh'] as [string, string],
    isHero: false,
  };

  const defaultProps: PlayerProps = {
    player: mockPlayer,
  };

  describe('Basic Rendering', () => {
    test('renders player name and chips', () => {
      render(<Player {...defaultProps} />);
      
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
      expect(screen.getByText('$850')).toBeInTheDocument(); // currentChips takes precedence
    });

    test('displays starting chips when currentChips not available', () => {
      const playerWithoutCurrentChips: PlayerType = {
        ...mockPlayer,
        currentChips: undefined,
      };
      
      render(<Player player={playerWithoutCurrentChips} />);
      expect(screen.getByText('$1000')).toBeInTheDocument();
    });

    test('displays currentChips prop when provided', () => {
      render(<Player {...defaultProps} currentChips={500} />);
      expect(screen.getByText('$500')).toBeInTheDocument();
    });

    test('displays player position when available', () => {
      render(<Player {...defaultProps} />);
      expect(screen.getByText('BB')).toBeInTheDocument();
    });

    test('does not display position when not available', () => {
      const playerWithoutPosition: PlayerType = {
        ...mockPlayer,
        position: undefined,
      };
      
      render(<Player player={playerWithoutPosition} />);
      expect(screen.queryByText('BB')).not.toBeInTheDocument();
    });
  });

  describe('Card Display', () => {
    test('shows hidden cards by default', () => {
      render(<Player {...defaultProps} />);
      
      const hiddenCards = screen.getAllByText('Hidden Card');
      expect(hiddenCards).toHaveLength(2);
    });

    test('shows cards when player is hero', () => {
      const heroPlayer: PlayerType = {
        ...mockPlayer,
        isHero: true,
      };
      
      render(<Player player={heroPlayer} />);
      
      expect(screen.getByText('Card: As')).toBeInTheDocument();
      expect(screen.getByText('Card: Kh')).toBeInTheDocument();
    });

    test('shows cards when showCards prop is true', () => {
      render(<Player {...defaultProps} showCards />);
      
      expect(screen.getByText('Card: As')).toBeInTheDocument();
      expect(screen.getByText('Card: Kh')).toBeInTheDocument();
    });

    test('does not render cards when player has no cards', () => {
      const playerWithoutCards: PlayerType = {
        ...mockPlayer,
        cards: undefined,
      };
      
      render(<Player player={playerWithoutCards} />);
      
      expect(screen.queryByText('Card:')).not.toBeInTheDocument();
      expect(screen.queryByText('Hidden Card')).not.toBeInTheDocument();
    });

    test('renders cards with correct size', () => {
      render(<Player {...defaultProps} showCards />);
      
      expect(screen.getByTestId('card-As-small')).toBeInTheDocument();
      expect(screen.getByTestId('card-Kh-small')).toBeInTheDocument();
    });
  });

  describe('Player States', () => {
    test('applies hero class when player is hero', () => {
      const heroPlayer: PlayerType = {
        ...mockPlayer,
        isHero: true,
      };
      
      render(<Player player={heroPlayer} />);
      
      const playerElement = screen.getByText('TestPlayer').closest('.player');
      expect(playerElement).toHaveClass('hero');
    });

    test('applies all-in class when player is all-in', () => {
      render(<Player {...defaultProps} isAllIn />);
      
      const playerElement = screen.getByText('TestPlayer').closest('.player');
      expect(playerElement).toHaveClass('all-in');
    });

    test('displays all-in indicator when player is all-in', () => {
      render(<Player {...defaultProps} isAllIn />);
      expect(screen.getByText('ALL IN')).toBeInTheDocument();
    });

    test('does not display all-in indicator when player is not all-in', () => {
      render(<Player {...defaultProps} />);
      expect(screen.queryByText('ALL IN')).not.toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(<Player {...defaultProps} className="custom-player" />);
      
      const playerElement = screen.getByText('TestPlayer').closest('.player');
      expect(playerElement).toHaveClass('custom-player');
    });
  });

  describe('Positioning and Styling', () => {
    test('applies seat position CSS variables', () => {
      render(<Player {...defaultProps} seatPosition={3} maxSeats={9} />);
      
      const playerElement = screen.getByText('TestPlayer').closest('.player');
      expect(playerElement).toHaveStyle({
        '--seat': '3',
        '--max-seats': '9',
      });
    });

    test('does not apply positioning when seatPosition not provided', () => {
      render(<Player {...defaultProps} />);
      
      const playerElement = screen.getByText('TestPlayer').closest('.player');
      expect(playerElement).not.toHaveStyle({
        '--seat': expect.anything(),
      });
    });

    test('uses default maxSeats when not provided', () => {
      render(<Player {...defaultProps} seatPosition={1} />);
      
      const playerElement = screen.getByText('TestPlayer').closest('.player');
      expect(playerElement).toHaveStyle({
        '--seat': '1',
        '--max-seats': '6', // default value
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles zero chips', () => {
      const brokePlayer: PlayerType = {
        ...mockPlayer,
        chips: 0,
        currentChips: 0,
      };
      
      render(<Player player={brokePlayer} />);
      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    test('handles very large chip amounts', () => {
      const richPlayer: PlayerType = {
        ...mockPlayer,
        chips: 1000000,
        currentChips: 1500000,
      };
      
      render(<Player player={richPlayer} />);
      expect(screen.getByText('$1500000')).toBeInTheDocument();
    });

    test('handles player names with special characters', () => {
      const specialPlayer: PlayerType = {
        ...mockPlayer,
        name: 'Test-Player_123',
      };
      
      render(<Player player={specialPlayer} />);
      expect(screen.getByText('Test-Player_123')).toBeInTheDocument();
    });

    test('handles empty player name', () => {
      const namelessPlayer: PlayerType = {
        ...mockPlayer,
        name: '',
      };
      
      render(<Player player={namelessPlayer} />);
      const playerNameElement = document.querySelector('.player-name');
      expect(playerNameElement).toBeInTheDocument();
      expect(playerNameElement).toHaveTextContent('');
    });
  });

  describe('Card Combinations', () => {
    test('displays mixed cards correctly when shown', () => {
      const playerWithMixedCards: PlayerType = {
        ...mockPlayer,
        cards: ['2c', 'Ah'] as [string, string],
        isHero: true,
      };
      
      render(<Player player={playerWithMixedCards} />);
      
      expect(screen.getByText('Card: 2c')).toBeInTheDocument();
      expect(screen.getByText('Card: Ah')).toBeInTheDocument();
    });

    test('handles single card gracefully', () => {
      // This is an edge case that shouldn't normally happen
      const playerWithOneCard: PlayerType = {
        ...mockPlayer,
        cards: ['As'] as any, // Force single card
      };
      
      render(<Player player={playerWithOneCard} showCards />);
      
      // Component should still render without crashing
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    });
  });

  describe('Performance and Memoization', () => {
    test('does not re-render when unrelated props change', () => {
      let renderCount = 0;
      
      const TestPlayer = React.memo((props: PlayerProps & { irrelevant?: string }) => {
        renderCount++;
        const { irrelevant, ...playerProps } = props;
        return <Player {...playerProps} />;
      });

      const { rerender } = render(<TestPlayer {...defaultProps} irrelevant="value1" />);
      const initialRenderCount = renderCount;

      rerender(<TestPlayer {...defaultProps} irrelevant="value2" />);
      
      // Should not cause unnecessary re-renders
      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    });

    test('re-renders when player chips change', () => {
      const { rerender } = render(<Player {...defaultProps} currentChips={1000} />);
      
      expect(screen.getByText('$1000')).toBeInTheDocument();

      rerender(<Player {...defaultProps} currentChips={500} />);
      
      expect(screen.getByText('$500')).toBeInTheDocument();
      expect(screen.queryByText('$1000')).not.toBeInTheDocument();
    });

    test('re-renders when player cards change', () => {
      const { rerender } = render(<Player {...defaultProps} showCards />);
      
      expect(screen.getByText('Card: As')).toBeInTheDocument();
      expect(screen.getByText('Card: Kh')).toBeInTheDocument();

      const updatedPlayer: PlayerType = {
        ...mockPlayer,
        cards: ['Qd', 'Jc'] as [string, string],
      };

      rerender(<Player player={updatedPlayer} showCards />);
      
      expect(screen.getByText('Card: Qd')).toBeInTheDocument();
      expect(screen.getByText('Card: Jc')).toBeInTheDocument();
      expect(screen.queryByText('Card: As')).not.toBeInTheDocument();
      expect(screen.queryByText('Card: Kh')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure', () => {
      render(<Player {...defaultProps} />);
      
      // Player container
      const playerElement = screen.getByText('TestPlayer').closest('.player');
      expect(playerElement).toBeInTheDocument();
      
      // Player info section
      expect(screen.getByText('TestPlayer').closest('.player-info')).toBeInTheDocument();
      
      // Player cards section  
      expect(document.querySelector('.player-cards')).toBeInTheDocument();
    });

    test('provides clear visual indicators for player states', () => {
      render(<Player {...defaultProps} isAllIn />);
      
      const allInIndicator = screen.getByText('ALL IN');
      expect(allInIndicator).toHaveClass('all-in-indicator');
    });
  });

  describe('Different Position Types', () => {
    const positions = ['BB', 'SB', 'BTN', 'CO', 'MP', 'EP', 'UTG'];
    
    test.each(positions)('displays position %s correctly', (position) => {
      const positionPlayer: PlayerType = {
        ...mockPlayer,
        position: position as any,
      };
      
      render(<Player player={positionPlayer} />);
      expect(screen.getByText(position)).toBeInTheDocument();
    });
  });
});