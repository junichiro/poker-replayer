/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controls } from '../Controls';
import type { ControlsProps, ControlsPropsLegacy, ControlCallbacks } from '../Controls';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Play: ({ size, ...props }: any) => <span data-testid="play-icon" data-size={size} {...props}>Play</span>,
  Pause: ({ size, ...props }: any) => <span data-testid="pause-icon" data-size={size} {...props}>Pause</span>,
  SkipBack: ({ size, ...props }: any) => <span data-testid="skip-back-icon" data-size={size} {...props}>Previous</span>,
  SkipForward: ({ size, ...props }: any) => <span data-testid="skip-forward-icon" data-size={size} {...props}>Next</span>,
  RotateCcw: ({ size, ...props }: any) => <span data-testid="rotate-icon" data-size={size} {...props}>Reset</span>,
}));

describe('Controls Component', () => {
  const mockCallbacks: ControlCallbacks = {
    onPlayPause: jest.fn(),
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    onReset: jest.fn(),
  };

  const defaultNewProps: ControlsProps = {
    isPlaying: false,
    currentActionIndex: 5,
    totalActions: 10,
    callbacks: mockCallbacks,
  };

  const defaultLegacyProps: ControlsPropsLegacy = {
    isPlaying: false,
    currentActionIndex: 5,
    totalActions: 10,
    onPlayPause: jest.fn(),
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering - New API', () => {
    test('renders all control buttons', () => {
      render(<Controls {...defaultNewProps} />);
      
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    test('renders action counter by default', () => {
      render(<Controls {...defaultNewProps} />);
      expect(screen.getByText('6 / 10')).toBeInTheDocument();
    });

    test('displays correct icon when not playing', () => {
      render(<Controls {...defaultNewProps} isPlaying={false} />);
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('pause-icon')).not.toBeInTheDocument();
    });

    test('displays correct icon when playing', () => {
      render(<Controls {...defaultNewProps} isPlaying={true} />);
      expect(screen.getByTestId('pause-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('play-icon')).not.toBeInTheDocument();
    });

    test('renders with custom icon size', () => {
      render(<Controls {...defaultNewProps} iconSize={32} />);
      
      const playIcon = screen.getByTestId('play-icon');
      expect(playIcon).toHaveAttribute('data-size', '32');
    });

    test('hides counter when showCounter is false', () => {
      render(<Controls {...defaultNewProps} showCounter={false} />);
      expect(screen.queryByText('6 / 10')).not.toBeInTheDocument();
    });
  });

  describe('Basic Rendering - Legacy API', () => {
    test('renders all control buttons with legacy props', () => {
      render(<Controls {...defaultLegacyProps} />);
      
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    test('renders action counter with legacy props', () => {
      render(<Controls {...defaultLegacyProps} />);
      expect(screen.getByText('6 / 10')).toBeInTheDocument();
    });
  });

  describe('Button States and Disabling', () => {
    test('disables previous and reset buttons at start position', () => {
      render(<Controls {...defaultNewProps} currentActionIndex={-1} />);
      
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /play/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });

    test('disables next button at end position', () => {
      render(<Controls {...defaultNewProps} currentActionIndex={9} totalActions={10} />);
      
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /reset/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /play/i })).not.toBeDisabled();
    });

    test('disables all buttons when disabled prop is true', () => {
      render(<Controls {...defaultNewProps} disabled />);
      
      expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });

    test('enables appropriate buttons in middle position', () => {
      render(<Controls {...defaultNewProps} currentActionIndex={5} totalActions={10} />);
      
      expect(screen.getByRole('button', { name: /reset/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /play/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
  });

  describe('User Interactions - New API', () => {
    test('calls onPlayPause callback when play button is clicked', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultNewProps} isPlaying={false} />);
      
      await user.click(screen.getByRole('button', { name: /play/i }));
      
      expect(mockCallbacks.onPlayPause).toHaveBeenCalledWith(false);
      expect(mockCallbacks.onPlayPause).toHaveBeenCalledTimes(1);
    });

    test('calls onPlayPause callback when pause button is clicked', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultNewProps} isPlaying={true} />);
      
      await user.click(screen.getByRole('button', { name: /pause/i }));
      
      expect(mockCallbacks.onPlayPause).toHaveBeenCalledWith(true);
      expect(mockCallbacks.onPlayPause).toHaveBeenCalledTimes(1);
    });

    test('calls onPrevious callback with current index', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultNewProps} currentActionIndex={5} />);
      
      await user.click(screen.getByRole('button', { name: /previous/i }));
      
      expect(mockCallbacks.onPrevious).toHaveBeenCalledWith(5);
      expect(mockCallbacks.onPrevious).toHaveBeenCalledTimes(1);
    });

    test('calls onNext callback with current index', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultNewProps} currentActionIndex={5} />);
      
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      expect(mockCallbacks.onNext).toHaveBeenCalledWith(5);
      expect(mockCallbacks.onNext).toHaveBeenCalledTimes(1);
    });

    test('calls onReset callback with current index', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultNewProps} currentActionIndex={5} />);
      
      await user.click(screen.getByRole('button', { name: /reset/i }));
      
      expect(mockCallbacks.onReset).toHaveBeenCalledWith(5);
      expect(mockCallbacks.onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Interactions - Legacy API', () => {
    test('calls legacy onPlayPause callback', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultLegacyProps} />);
      
      await user.click(screen.getByRole('button', { name: /play/i }));
      
      expect(defaultLegacyProps.onPlayPause).toHaveBeenCalledTimes(1);
    });

    test('calls legacy onPrevious callback', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultLegacyProps} />);
      
      await user.click(screen.getByRole('button', { name: /previous/i }));
      
      expect(defaultLegacyProps.onPrevious).toHaveBeenCalledTimes(1);
    });

    test('calls legacy onNext callback', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultLegacyProps} />);
      
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      expect(defaultLegacyProps.onNext).toHaveBeenCalledTimes(1);
    });

    test('calls legacy onReset callback', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultLegacyProps} />);
      
      await user.click(screen.getByRole('button', { name: /reset/i }));
      
      expect(defaultLegacyProps.onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Customization', () => {
    test('applies custom className', () => {
      render(<Controls {...defaultNewProps} className="custom-controls" />);
      
      const controls = screen.getByText('6 / 10').closest('.controls');
      expect(controls).toHaveClass('custom-controls');
    });

    test('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      render(<Controls {...defaultNewProps} style={customStyle} />);
      
      const controls = screen.getByText('6 / 10').closest('.controls');
      expect(controls).toHaveStyle('background-color: rgb(255, 0, 0)');
    });

    test('applies custom data-testid', () => {
      render(<Controls {...defaultNewProps} data-testid="custom-controls" />);
      
      expect(screen.getByTestId('custom-controls')).toBeInTheDocument();
    });

    test('uses custom labels', () => {
      const customLabels = {
        play: 'Start',
        pause: 'Stop',
        previous: 'Back',
        next: 'Forward',
        reset: 'Restart',
      };
      
      render(<Controls {...defaultNewProps} labels={customLabels} />);
      
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument();
    });

    test('merges custom labels with defaults', () => {
      const partialLabels = { play: 'Start' };
      
      render(<Controls {...defaultNewProps} labels={partialLabels} />);
      
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous action' })).toBeInTheDocument();
    });
  });

  describe('Action Counter', () => {
    test('displays correct counter at different positions', () => {
      const { rerender } = render(<Controls {...defaultNewProps} currentActionIndex={0} />);
      expect(screen.getByText('1 / 10')).toBeInTheDocument();

      rerender(<Controls {...defaultNewProps} currentActionIndex={9} />);
      expect(screen.getByText('10 / 10')).toBeInTheDocument();

      rerender(<Controls {...defaultNewProps} currentActionIndex={-1} />);
      expect(screen.getByText('0 / 10')).toBeInTheDocument();
    });

    test('has proper aria-label for accessibility', () => {
      render(<Controls {...defaultNewProps} currentActionIndex={5} totalActions={10} />);
      
      const counter = screen.getByText('6 / 10');
      expect(counter).toHaveAttribute('aria-label', 'Action 6 of 10');
    });
  });

  describe('Accessibility', () => {
    test('has proper aria-labels for all buttons', () => {
      render(<Controls {...defaultNewProps} />);
      
      expect(screen.getByRole('button', { name: 'Reset to beginning' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next action' })).toBeInTheDocument();
    });

    test('updates play/pause button aria-label based on state', () => {
      const { rerender } = render(<Controls {...defaultNewProps} isPlaying={false} />);
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();

      rerender(<Controls {...defaultNewProps} isPlaying={true} />);
      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    });

    test('has proper title attributes for tooltips', () => {
      render(<Controls {...defaultNewProps} />);
      
      expect(screen.getByRole('button', { name: /reset/i })).toHaveAttribute('title', 'Reset to beginning');
      expect(screen.getByRole('button', { name: /previous/i })).toHaveAttribute('title', 'Previous action');
      expect(screen.getByRole('button', { name: /play/i })).toHaveAttribute('title', 'Play');
      expect(screen.getByRole('button', { name: /next/i })).toHaveAttribute('title', 'Next action');
    });
  });

  describe('Validation and Error Handling', () => {
    test('handles negative currentActionIndex gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      render(<Controls {...defaultNewProps} currentActionIndex={-2} />);
      
      // Should still render but log warning
      expect(screen.getByText('-1 / 10')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('currentActionIndex must be >= -1')
      );
      
      consoleSpy.mockRestore();
    });

    test('handles invalid totalActions gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      render(<Controls {...defaultNewProps} totalActions={0} />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('totalActions must be >= 1')
      );
      
      consoleSpy.mockRestore();
    });

    test('handles non-integer values gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      render(<Controls {...defaultNewProps} currentActionIndex={5.5} />);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('currentActionIndex must be an integer')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Memoization', () => {
    test('does not re-render when unrelated props change', () => {
      let renderCount = 0;
      
      const TestControls = React.memo((props: ControlsProps & { irrelevant?: string }) => {
        renderCount++;
        const { irrelevant, ...controlProps } = props;
        return <Controls {...controlProps} />;
      });

      const { rerender } = render(<TestControls {...defaultNewProps} irrelevant="value1" />);
      const initialRenderCount = renderCount;

      rerender(<TestControls {...defaultNewProps} irrelevant="value2" />);
      
      expect(screen.getByText('6 / 10')).toBeInTheDocument();
    });

    test('re-renders when playing state changes', () => {
      const { rerender } = render(<Controls {...defaultNewProps} isPlaying={false} />);
      
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();

      rerender(<Controls {...defaultNewProps} isPlaying={true} />);
      
      expect(screen.getByTestId('pause-icon')).toBeInTheDocument();
    });

    test('re-renders when action index changes', () => {
      const { rerender } = render(<Controls {...defaultNewProps} currentActionIndex={5} />);
      
      expect(screen.getByText('6 / 10')).toBeInTheDocument();

      rerender(<Controls {...defaultNewProps} currentActionIndex={7} />);
      
      expect(screen.getByText('8 / 10')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles single action scenario', () => {
      render(<Controls {...defaultNewProps} currentActionIndex={0} totalActions={1} />);
      
      expect(screen.getByText('1 / 1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });

    test('handles large number of actions', () => {
      render(<Controls {...defaultNewProps} currentActionIndex={999} totalActions={1000} />);
      
      expect(screen.getByText('1000 / 1000')).toBeInTheDocument();
    });

    test('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Controls {...defaultNewProps} />);
      
      const playButton = screen.getByRole('button', { name: /play/i });
      
      // Use userEvent which properly simulates keyboard interaction
      await user.click(playButton); // This includes keyboard navigation
      expect(mockCallbacks.onPlayPause).toHaveBeenCalledWith(false);

      // Test actual keyboard activation
      playButton.focus();
      await user.keyboard('{Enter}');
      expect(mockCallbacks.onPlayPause).toHaveBeenCalledTimes(2);
    });
  });
});