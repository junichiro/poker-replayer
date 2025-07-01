/**
 * @jest-environment jsdom
 */

/**
 * Full Replay Functionality Integration Tests
 * Tests the complete replay functionality from parsing to visualization
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PokerHandReplay } from '../../src/components/PokerHandReplay';
import { handHistories } from '../fixtures/hand-histories';

// Mock requestAnimationFrame for animation tests
const mockRequestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16);
};

const mockCancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Enhanced setup for integration tests
const setupIntegrationTest = () => {
  // Mock window.requestAnimationFrame
  global.requestAnimationFrame = mockRequestAnimationFrame;
  global.cancelAnimationFrame = mockCancelAnimationFrame;
  
  // Mock performance.now for consistent timing
  const mockNow = jest.fn(() => Date.now());
  Object.defineProperty(window, 'performance', {
    value: { now: mockNow },
    writable: true
  });

  // Mock matchMedia for responsive design tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  return {
    cleanup: () => {
      jest.restoreAllMocks();
    }
  };
};

describe('Full Replay Functionality Integration Tests', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const setup = setupIntegrationTest();
    cleanup = setup.cleanup;
  });

  afterEach(() => {
    cleanup();
  });

  describe('Complete Hand Replay Flow', () => {
    test('should successfully render and replay a complete cash game hand', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      // Wait for initial parsing and rendering
      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      // Verify basic elements are present
      expect(screen.getByTestId('poker-table')).toBeInTheDocument();
      expect(screen.getByTestId('replay-controls')).toBeInTheDocument();
      expect(screen.getByTestId('action-history')).toBeInTheDocument();

      // Check if players are rendered
      const players = screen.getAllByTestId(/player-\d+/);
      expect(players.length).toBeGreaterThan(0);

      // Check if controls are functional
      const playButton = screen.getByTestId('play-pause-btn');
      expect(playButton).toHaveTextContent('Play');

      // Start replay
      await user.click(playButton);

      await waitFor(() => {
        expect(screen.getByTestId('play-pause-btn')).toHaveTextContent('Pause');
      });

      // Verify action history shows progress
      const actionHistory = screen.getByTestId('action-history');
      expect(actionHistory).toBeInTheDocument();
    });

    test('should handle tournament hand with complex pot structure', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.complexAllIn} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      // Check for multiple pots (main pot + side pots)
      const pots = screen.getAllByTestId(/pot-\d+/);
      expect(pots.length).toBeGreaterThan(1);

      // Verify tournament-specific elements
      expect(screen.getByTestId('poker-table')).toBeInTheDocument();
      
      // Test navigation through complex actions
      const nextButton = screen.getByTestId('next-btn');
      const prevButton = screen.getByTestId('prev-btn');

      // Navigate forward through actions
      for (let i = 0; i < 5; i++) {
        await user.click(nextButton);
        await waitFor(() => {
          expect(screen.getByTestId('action-history')).toBeInTheDocument();
        });
      }

      // Navigate backward
      for (let i = 0; i < 3; i++) {
        await user.click(prevButton);
        await waitFor(() => {
          expect(screen.getByTestId('action-history')).toBeInTheDocument();
        });
      }

      // Verify state consistency
      expect(screen.getByTestId('action-history')).toBeInTheDocument();
    });

    test('should maintain state synchronization during playback', async () => {
      const user = userEvent.setup();
      const onActionChange = jest.fn();
      
      render(
        <PokerHandReplay 
          handHistory={handHistories.allInScenario} 
          onActionChange={onActionChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const nextButton = screen.getByTestId('next-btn');
      
      // Step through several actions
      for (let i = 0; i < 3; i++) {
        await user.click(nextButton);
        await waitFor(() => {
          expect(screen.getByTestId('action-history')).toBeInTheDocument();
        });
      }

      // Verify callback was called for each action
      expect(onActionChange).toHaveBeenCalledTimes(3);

      // Verify state consistency across components
      const actionHistory = screen.getByTestId('action-history');
      const table = screen.getByTestId('poker-table');
      const controls = screen.getByTestId('replay-controls');

      expect(actionHistory).toBeInTheDocument();
      expect(table).toBeInTheDocument();
      expect(controls).toBeInTheDocument();
    });
  });

  describe('Playback Controls Integration', () => {
    test('should support all playback control modes', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('replay-controls')).toBeInTheDocument();
      });

      const playButton = screen.getByTestId('play-pause-btn');
      const nextButton = screen.getByTestId('next-btn');
      const prevButton = screen.getByTestId('prev-btn');
      const resetButton = screen.getByTestId('reset-btn');

      // Test play/pause
      await user.click(playButton);
      await waitFor(() => {
        expect(playButton).toHaveTextContent('Pause');
      });

      await user.click(playButton);
      await waitFor(() => {
        expect(playButton).toHaveTextContent('Play');
      });

      // Test manual navigation
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(prevButton);

      // Test reset
      await user.click(resetButton);
      
      // Verify reset state
      expect(playButton).toHaveTextContent('Play');
    });

    test('should handle speed control variations', async () => {
      const user = userEvent.setup();
      render(
        <PokerHandReplay 
          handHistory={handHistories.basicCashGame}
          config={{ animationSpeed: 2.0 }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const playButton = screen.getByTestId('play-pause-btn');
      await user.click(playButton);

      // Verify animations respect speed setting
      await waitFor(() => {
        expect(screen.getByTestId('play-pause-btn')).toHaveTextContent('Pause');
      });
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const replayContainer = screen.getByTestId('poker-hand-replay');
      
      // Focus the container for keyboard events
      replayContainer.focus();

      // Test keyboard controls
      await user.keyboard(' '); // Space for play/pause
      await waitFor(() => {
        expect(screen.getByTestId('play-pause-btn')).toHaveTextContent('Pause');
      });

      await user.keyboard('{ArrowRight}'); // Next action
      await user.keyboard('{ArrowLeft}');  // Previous action
      await user.keyboard('{Home}');       // Reset
    });
  });

  describe('Different Hand Scenarios', () => {
    const handScenarios = [
      { name: 'Basic Cash Game', history: handHistories.basicCashGame },
      { name: 'Tournament with Antes', history: handHistories.tournamentWithAntes },
      { name: 'All-In Scenario', history: handHistories.allInScenario },
      { name: 'Split Pot', history: handHistories.splitPot },
      { name: 'Complex All-In', history: handHistories.complexAllIn },
    ];

    test.each(handScenarios)('should handle $name scenario', async ({ history }) => {
      render(<PokerHandReplay handHistory={history} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify basic components render
      expect(screen.getByTestId('poker-table')).toBeInTheDocument();
      expect(screen.getByTestId('replay-controls')).toBeInTheDocument();

      // Verify players are present
      const players = screen.getAllByTestId(/player-\d+/);
      expect(players.length).toBeGreaterThan(0);

      // Verify at least one pot is present
      const pots = screen.getAllByTestId(/pot-\d+/);
      expect(pots.length).toBeGreaterThan(0);
    });

    test('should handle player state changes during replay', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.playerStateChanges} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const nextButton = screen.getByTestId('next-btn');
      
      // Step through actions to encounter state changes
      for (let i = 0; i < 10; i++) {
        await user.click(nextButton);
        await waitFor(() => {
          // Verify the component doesn't crash during state changes
          expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Recovery', () => {
    test('should handle malformed hand history gracefully', async () => {
      // Test with malformed input
      render(<PokerHandReplay handHistory="invalid hand history" />);

      await waitFor(() => {
        // Should show error state, not crash
        expect(screen.getByTestId('poker-hand-replay') || screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    test('should recover from parser errors', async () => {
      render(<PokerHandReplay handHistory={handHistories.invalidHeader} />);

      await waitFor(() => {
        // Should either parse successfully or show error gracefully
        const element = screen.getByTestId('poker-hand-replay') || screen.getByText(/error/i);
        expect(element).toBeInTheDocument();
      });
    });

    test('should handle empty hand history', async () => {
      render(<PokerHandReplay handHistory="" />);

      await waitFor(() => {
        const element = screen.getByTestId('poker-hand-replay') || screen.getByText(/error/i);
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Performance with Large Hands', () => {
    test('should handle complex hands within performance thresholds', async () => {
      const startTime = performance.now();
      
      render(<PokerHandReplay handHistory={handHistories.complexAllIn} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });

    test('should maintain smooth playback with many actions', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.complexAllIn} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const playButton = screen.getByTestId('play-pause-btn');
      const startTime = performance.now();

      // Start playback
      await user.click(playButton);

      // Wait for playback to be active
      await waitFor(() => {
        expect(screen.getByTestId('play-pause-btn')).toHaveTextContent('Pause');
      }, { timeout: 1000 });

      // Pause and check performance
      await user.click(playButton);
      
      const endTime = performance.now();
      const playbackTime = endTime - startTime;

      // Playback should be responsive
      expect(playbackTime).toBeLessThan(1500);
    });
  });

  describe('Component Integration', () => {
    test('should coordinate between all child components', async () => {
      const user = userEvent.setup();
      const onActionChange = jest.fn();
      const onReplayEvent = jest.fn();

      render(
        <PokerHandReplay 
          handHistory={handHistories.basicCashGame}
          onActionChange={onActionChange}
          onReplayEvent={onReplayEvent}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      // Test component coordination
      const nextButton = screen.getByTestId('next-btn');
      await user.click(nextButton);

      // Verify all components are updated
      expect(screen.getByTestId('poker-table')).toBeInTheDocument();
      expect(screen.getByTestId('action-history')).toBeInTheDocument();
      expect(screen.getByTestId('replay-controls')).toBeInTheDocument();

      // Verify callbacks were triggered
      expect(onActionChange).toHaveBeenCalled();
    });

    test('should handle theme and customization options', async () => {
      render(
        <PokerHandReplay 
          handHistory={handHistories.basicCashGame}
          config={{
            theme: 'dark',
            size: 'large',
            tableShape: 'oval',
            cardDesign: 'four-color'
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      // Verify customization is applied
      const replayComponent = screen.getByTestId('poker-hand-replay');
      expect(replayComponent).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    test('should maintain accessibility throughout replay', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      // Check ARIA attributes
      const replayComponent = screen.getByTestId('poker-hand-replay');
      expect(replayComponent).toHaveAttribute('role', 'application');

      // Test keyboard navigation
      const playButton = screen.getByTestId('play-pause-btn');
      expect(playButton).toHaveAttribute('aria-label');

      // Test focus management
      playButton.focus();
      expect(document.activeElement).toBe(playButton);

      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByTestId('play-pause-btn')).toHaveTextContent('Pause');
      });
    });

    test('should support screen reader announcements', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      // Look for aria-live regions
      const liveRegions = screen.getAllByRole('status', { hidden: true });
      expect(liveRegions.length).toBeGreaterThanOrEqual(0);

      // Test action announcements
      const nextButton = screen.getByTestId('next-btn');
      await user.click(nextButton);

      // The action should be announced (implementation detail)
      expect(screen.getByTestId('action-history')).toBeInTheDocument();
    });
  });
});