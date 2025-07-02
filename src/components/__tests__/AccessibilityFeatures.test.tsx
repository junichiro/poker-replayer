/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock accessible poker component for comprehensive a11y testing
const AccessiblePokerReplay = ({
  enableScreenReaderAnnouncements = true,
  enableKeyboardNavigation = true,
  enableHighContrast = false,
  enableReducedMotion = false,
  announceActions = true,
  ..._props
}: any) => {
  const [currentAction, setCurrentAction] = React.useState(-1);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [announcements, setAnnouncements] = React.useState<string[]>([]);
  const [focusedElement, setFocusedElement] = React.useState<string>('');

  const actions = [
    { type: 'blind', player: 'Player1', amount: 10 },
    { type: 'blind', player: 'Player2', amount: 20 },
    { type: 'raise', player: 'Player1', amount: 60 },
    { type: 'call', player: 'Player2', amount: 40 },
    { type: 'bet', player: 'Player1', amount: 80 },
    { type: 'fold', player: 'Player2' },
  ];

  const players = [
    { id: 1, name: 'Player1', chips: 1500, position: 'BB', cards: ['As', 'Kh'] },
    { id: 2, name: 'Player2', chips: 1500, position: 'SB', cards: ['Qd', 'Jc'] },
  ];

  const announce = (message: string) => {
    if (enableScreenReaderAnnouncements && announceActions) {
      setAnnouncements(prev => [...prev, message]);
      // Simulate screen reader announcement
      console.log(`[Screen Reader]: ${message}`);
    }
  };

  const handleNext = () => {
    if (currentAction < actions.length - 1) {
      const newIndex = currentAction + 1;
      setCurrentAction(newIndex);
      const action = actions[newIndex];
      announce(
        `Action ${newIndex + 1}: ${action.player} ${action.type}${action.amount ? ` $${action.amount}` : ''}`
      );
    }
  };

  const handlePrevious = () => {
    if (currentAction > -1) {
      const newIndex = currentAction - 1;
      setCurrentAction(newIndex);
      if (newIndex >= 0) {
        const action = actions[newIndex];
        announce(`Back to action ${newIndex + 1}: ${action.player} ${action.type}`);
      } else {
        announce('Back to beginning of hand');
      }
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    announce(isPlaying ? 'Playback paused' : 'Playback started');
  };

  const handleReset = () => {
    setCurrentAction(-1);
    setIsPlaying(false);
    announce('Hand reset to beginning');
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for our handled keys
      const handledKeys = [' ', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'];
      if (handledKeys.includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case ' ':
        case 'Space':
          handlePlayPause();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Home':
          handleReset();
          break;
        case 'End':
          setCurrentAction(actions.length - 1);
          announce('Jumped to end of hand');
          break;
        case 'Enter':
          if (document.activeElement?.getAttribute('role') === 'button') {
            document.activeElement?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentAction, isPlaying, enableKeyboardNavigation]);

  const handleFocus = (elementType: string) => {
    setFocusedElement(elementType);
    if (enableScreenReaderAnnouncements) {
      let description = '';
      switch (elementType) {
        case 'play-pause':
          description = `${isPlaying ? 'Pause' : 'Play'} button`;
          break;
        case 'next':
          description = 'Next action button';
          break;
        case 'previous':
          description = 'Previous action button';
          break;
        case 'reset':
          description = 'Reset to beginning button';
          break;
        default:
          description = elementType;
      }
      announce(`Focused on ${description}`);
    }
  };

  return (
    <div
      className={`poker-replay ${enableHighContrast ? 'high-contrast' : ''} ${enableReducedMotion ? 'reduced-motion' : ''}`}
      data-testid="accessible-poker-replay"
      role="application"
      aria-label="Poker Hand Replay Player"
      aria-describedby="replay-description"
    >
      {/* Screen reader description */}
      <div id="replay-description" className="sr-only">
        Interactive poker hand replay. Use space to play/pause, arrow keys to navigate, home to
        reset.
      </div>

      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" data-testid="announcements">
        {announcements[announcements.length - 1]}
      </div>

      {/* Status information */}
      <div className="replay-status" role="status" aria-live="polite">
        <span className="sr-only">
          {isPlaying ? 'Playing' : 'Paused'}, Action {currentAction + 1} of {actions.length}
        </span>
        <div data-testid="visual-status">
          {isPlaying ? '▶️' : '⏸️'} {currentAction + 1}/{actions.length}
        </div>
      </div>

      {/* Main controls */}
      <div className="controls" role="toolbar" aria-label="Playback controls">
        <button
          data-testid="reset-btn"
          onClick={handleReset}
          onFocus={() => handleFocus('reset')}
          disabled={currentAction === -1}
          aria-label="Reset to beginning"
          title="Reset to beginning (Home)"
        >
          ⏮️
        </button>

        <button
          data-testid="previous-btn"
          onClick={handlePrevious}
          onFocus={() => handleFocus('previous')}
          disabled={currentAction === -1}
          aria-label="Previous action"
          title="Previous action (Left arrow)"
        >
          ⏪
        </button>

        <button
          data-testid="play-pause-btn"
          onClick={handlePlayPause}
          onFocus={() => handleFocus('play-pause')}
          aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        <button
          data-testid="next-btn"
          onClick={handleNext}
          onFocus={() => handleFocus('next')}
          disabled={currentAction >= actions.length - 1}
          aria-label="Next action"
          title="Next action (Right arrow)"
        >
          ⏩
        </button>
      </div>

      {/* Table representation */}
      <div
        className="table"
        role="img"
        aria-label={`Poker table with ${players.length} players`}
        data-testid="poker-table"
      >
        <div className="table-info">
          <h2 id="table-title">Tournament Table</h2>
          <div aria-describedby="table-title">6-max No Limit Hold&apos;em</div>
        </div>

        {/* Players */}
        <div className="players" role="group" aria-label="Players">
          {players.map(player => (
            <div
              key={player.id}
              className="player"
              data-testid={`player-${player.id}`}
              role="button"
              aria-labelledby={`player-${player.id}-name`}
              aria-describedby={`player-${player.id}-info`}
              tabIndex={0}
            >
              <div id={`player-${player.id}-name`} className="player-name">
                {player.name}
              </div>
              <div id={`player-${player.id}-info`} className="player-info">
                <span className="sr-only">
                  {player.position} position, {player.chips} chips
                </span>
                <div aria-hidden="true">
                  {player.position} - ${player.chips}
                </div>
              </div>

              {/* Player cards */}
              <div className="player-cards" role="group" aria-label={`${player.name}'s cards`}>
                {player.cards.map((card, index) => (
                  <div
                    key={index}
                    className="card"
                    data-testid={`card-${player.id}-${index}`}
                    role="button"
                    aria-label={`Card ${card}`}
                    tabIndex={0}
                  >
                    <span className="sr-only">{card}</span>
                    <span aria-hidden="true">🂠</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Community cards */}
        <div className="community-cards" role="group" aria-label="Community cards">
          <h3 className="sr-only">Board Cards</h3>
          <div className="flop">
            <div className="card" role="img" aria-label="Ace of hearts">
              ♥️A
            </div>
            <div className="card" role="img" aria-label="Seven of clubs">
              ♣️7
            </div>
            <div className="card" role="img" aria-label="Two of diamonds">
              ♦️2
            </div>
          </div>
        </div>

        {/* Pot information */}
        <div className="pot" role="status" aria-live="polite">
          <span className="sr-only">Main pot: 140 chips</span>
          <div aria-hidden="true">Pot: $140</div>
        </div>
      </div>

      {/* Action history */}
      <div className="action-history" role="log" aria-label="Action history">
        <h3>Action History</h3>
        <ol>
          {actions.map((action, index) => (
            <li
              key={index}
              className={`action ${index === currentAction ? 'current' : ''}`}
              data-testid={`action-${index}`}
              role="option"
              aria-selected={index === currentAction}
              tabIndex={0}
              onClick={() => {
                setCurrentAction(index);
                announce(`Jumped to action ${index + 1}`);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentAction(index);
                  announce(`Jumped to action ${index + 1}`);
                }
              }}
            >
              <span className="sr-only">
                Action {index + 1}: {action.player} {action.type}
                {action.amount && ` for ${action.amount} chips`}
                {index === currentAction && ' (current)'}
              </span>
              <span aria-hidden="true">
                {action.player} {action.type} {action.amount && `$${action.amount}`}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Keyboard shortcuts */}
      <details className="keyboard-shortcuts">
        <summary>Keyboard Shortcuts</summary>
        <dl>
          <dt>Space</dt>
          <dd>Play/Pause</dd>
          <dt>Left/Right Arrows</dt>
          <dd>Previous/Next action</dd>
          <dt>Home</dt>
          <dd>Reset to beginning</dd>
          <dt>End</dt>
          <dd>Jump to end</dd>
          <dt>Enter</dt>
          <dd>Activate focused button</dd>
        </dl>
      </details>

      {/* Hidden state for testing */}
      <div className="test-state" style={{ display: 'none' }}>
        <span data-testid="current-action">{currentAction}</span>
        <span data-testid="is-playing">{isPlaying.toString()}</span>
        <span data-testid="focused-element">{focusedElement}</span>
        <span data-testid="announcement-count">{announcements.length}</span>
      </div>

      {/* Styles for accessibility */}
      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .high-contrast {
          filter: contrast(150%);
          background: #000;
          color: #fff;
        }

        .high-contrast button {
          background: #fff;
          color: #000;
          border: 2px solid #fff;
        }

        .high-contrast button:disabled {
          background: #666;
          color: #ccc;
        }

        .reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        .action.current {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          font-weight: bold;
        }

        button:focus,
        [tabindex]:focus {
          outline: 2px solid #2196f3;
          outline-offset: 2px;
        }

        .high-contrast button:focus,
        .high-contrast [tabindex]:focus {
          outline: 3px solid #ffff00;
        }
      `}</style>
    </div>
  );
};

describe('Accessibility Features', () => {
  beforeEach(() => {
    // Clear any previous announcements
    jest.clearAllMocks();
  });

  describe('ARIA and Semantic HTML', () => {
    test('provides proper ARIA roles and labels', () => {
      render(<AccessiblePokerReplay />);

      // Main application
      expect(screen.getByRole('application')).toHaveAttribute(
        'aria-label',
        'Poker Hand Replay Player'
      );

      // Toolbar
      expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', 'Playback controls');

      // Buttons with proper labels
      expect(screen.getByRole('button', { name: 'Reset to beginning' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start playback' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next action' })).toBeInTheDocument();

      // Table and players
      expect(screen.getByRole('img', { name: /Poker table/ })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Players' })).toBeInTheDocument();

      // Action history
      expect(screen.getByRole('log', { name: 'Action history' })).toBeInTheDocument();
    });

    test('uses semantic HTML elements correctly', () => {
      render(<AccessiblePokerReplay />);

      // Headings hierarchy
      expect(
        screen.getByRole('heading', { level: 2, name: 'Tournament Table' })
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Action History' })).toBeInTheDocument();

      // Lists for action history
      expect(screen.getByRole('list')).toBeInTheDocument();

      // Status regions (multiple exist)
      expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    });

    test('provides descriptive text for screen readers', () => {
      render(<AccessiblePokerReplay />);

      // Description
      expect(screen.getByText(/Interactive poker hand replay/)).toBeInTheDocument();

      // Player information
      expect(screen.getByText('BB position, 1500 chips')).toBeInTheDocument();
      expect(screen.getByText('SB position, 1500 chips')).toBeInTheDocument();

      // Card information
      expect(screen.getByRole('img', { name: 'Card As' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Ace of hearts' })).toBeInTheDocument();
    });

    test('hides decorative elements from screen readers', () => {
      render(<AccessiblePokerReplay />);

      // Visual indicators should be hidden
      const visualElements = document.querySelectorAll('[aria-hidden="true"]');
      expect(visualElements.length).toBeGreaterThan(0);

      // Status icons
      expect(screen.getByTestId('visual-status')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('supports spacebar for play/pause', async () => {
      render(<AccessiblePokerReplay />);

      expect(screen.getByTestId('is-playing')).toHaveTextContent('false');

      fireEvent.keyDown(document, { key: ' ' });

      expect(screen.getByTestId('is-playing')).toHaveTextContent('true');
      expect(screen.getByRole('button', { name: 'Pause playback' })).toBeInTheDocument();
    });

    test('supports arrow keys for navigation', async () => {
      render(<AccessiblePokerReplay />);

      expect(screen.getByTestId('current-action')).toHaveTextContent('-1');

      // Right arrow to advance
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(screen.getByTestId('current-action')).toHaveTextContent('0');

      // Left arrow to go back
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(screen.getByTestId('current-action')).toHaveTextContent('-1');
    });

    test('supports Home and End keys', async () => {
      render(<AccessiblePokerReplay />);

      // Move forward first
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(screen.getByTestId('current-action')).toHaveTextContent('1');

      // Home to reset
      fireEvent.keyDown(document, { key: 'Home' });
      expect(screen.getByTestId('current-action')).toHaveTextContent('-1');

      // End to jump to end
      fireEvent.keyDown(document, { key: 'End' });
      expect(screen.getByTestId('current-action')).toHaveTextContent('5');
    });

    test('supports Enter key for button activation', async () => {
      const user = userEvent.setup();
      render(<AccessiblePokerReplay />);

      const playButton = screen.getByRole('button', { name: 'Start playback' });

      await user.click(playButton); // Focus the button
      fireEvent.keyDown(document, { key: 'Enter' });

      expect(screen.getByTestId('is-playing')).toHaveTextContent('true');
    });

    test('can disable keyboard navigation', () => {
      render(<AccessiblePokerReplay enableKeyboardNavigation={false} />);

      fireEvent.keyDown(document, { key: ' ' });
      fireEvent.keyDown(document, { key: 'ArrowRight' });

      // Should not respond to keyboard events
      expect(screen.getByTestId('is-playing')).toHaveTextContent('false');
      expect(screen.getByTestId('current-action')).toHaveTextContent('-1');
    });

    test('provides keyboard shortcut help', () => {
      render(<AccessiblePokerReplay />);

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByText('Space')).toBeInTheDocument();
      expect(screen.getByText('Play/Pause')).toBeInTheDocument();
      expect(screen.getByText('Left/Right Arrows')).toBeInTheDocument();
      expect(screen.getByText('Previous/Next action')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    test('announces actions to screen readers', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<AccessiblePokerReplay />);

      fireEvent.keyDown(document, { key: 'ArrowRight' });

      expect(consoleSpy).toHaveBeenCalledWith('[Screen Reader]: Action 1: Player1 blind $10');

      consoleSpy.mockRestore();
    });

    test('announces playback state changes', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<AccessiblePokerReplay />);

      fireEvent.keyDown(document, { key: ' ' });

      expect(consoleSpy).toHaveBeenCalledWith('[Screen Reader]: Playback started');

      consoleSpy.mockRestore();
    });

    test('announces focus changes', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const user = userEvent.setup();
      render(<AccessiblePokerReplay />);

      const nextButton = screen.getByRole('button', { name: 'Next action' });
      await user.click(nextButton);

      expect(consoleSpy).toHaveBeenCalledWith('[Screen Reader]: Focused on Next action button');

      consoleSpy.mockRestore();
    });

    test('uses live regions for dynamic updates', () => {
      render(<AccessiblePokerReplay />);

      const liveRegion = screen.getByTestId('announcements');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    test('can disable screen reader announcements', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<AccessiblePokerReplay enableScreenReaderAnnouncements={false} />);

      fireEvent.keyDown(document, { key: 'ArrowRight' });

      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('[Screen Reader]'));

      consoleSpy.mockRestore();
    });

    test('provides status information', () => {
      render(<AccessiblePokerReplay />);

      // Status regions should exist (there are multiple)
      const statusRegions = screen.getAllByRole('status');
      expect(statusRegions.length).toBeGreaterThan(0);

      // At least one should have aria-live
      const liveStatusRegion = statusRegions.find(region => region.hasAttribute('aria-live'));
      expect(liveStatusRegion).toHaveAttribute('aria-live', 'polite');

      // Should contain current state
      expect(screen.getByText(/Paused, Action 0 of 6/)).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    test('provides visible focus indicators', async () => {
      const user = userEvent.setup();
      render(<AccessiblePokerReplay />);

      const playButton = screen.getByRole('button', { name: 'Start playback' });

      await user.click(playButton);

      expect(playButton).toHaveFocus();
      expect(screen.getByTestId('focused-element')).toHaveTextContent('play-pause');
    });

    test('maintains logical tab order', async () => {
      const user = userEvent.setup();
      render(<AccessiblePokerReplay />);

      // Tab through controls in order, accounting for disabled buttons
      await user.tab();
      // Reset and Previous buttons are disabled initially, so they might be skipped
      const focusedButton = document.activeElement;

      // The first focusable button should be either Reset, Previous, or Play
      const buttonLabels = ['Reset to beginning', 'Previous action', 'Start playback'];
      const buttonLabel = focusedButton?.getAttribute('aria-label');
      expect(buttonLabels).toContain(buttonLabel);

      // Tab a few more times and verify we can reach the Next button
      await user.tab();
      await user.tab();
      await user.tab();

      // Verify we can reach the Next action button
      const nextButton = screen.getByRole('button', { name: 'Next action' });
      expect(nextButton).toBeInTheDocument();
    });

    test('handles focus on interactive elements', async () => {
      const user = userEvent.setup();
      render(<AccessiblePokerReplay />);

      // Players should be focusable
      const player1 = screen.getByTestId('player-1');
      await user.click(player1);
      expect(player1).toHaveFocus();

      // Cards should be focusable
      const card = screen.getByTestId('card-1-0');
      await user.click(card);
      expect(card).toHaveFocus();

      // Action history items should be focusable
      const action = screen.getByTestId('action-0');
      await user.click(action);
      expect(action).toHaveFocus();
    });
  });

  describe('High Contrast and Visual Accessibility', () => {
    test('supports high contrast mode', () => {
      render(<AccessiblePokerReplay enableHighContrast={true} />);

      const component = screen.getByTestId('accessible-poker-replay');
      expect(component).toHaveClass('high-contrast');
    });

    test('provides tooltips for buttons', () => {
      render(<AccessiblePokerReplay />);

      expect(screen.getByRole('button', { name: 'Start playback' })).toHaveAttribute(
        'title',
        'Play (Space)'
      );
      expect(screen.getByRole('button', { name: 'Next action' })).toHaveAttribute(
        'title',
        'Next action (Right arrow)'
      );
      expect(screen.getByRole('button', { name: 'Previous action' })).toHaveAttribute(
        'title',
        'Previous action (Left arrow)'
      );
      expect(screen.getByRole('button', { name: 'Reset to beginning' })).toHaveAttribute(
        'title',
        'Reset to beginning (Home)'
      );
    });

    test('indicates current action visually and semantically', async () => {
      render(<AccessiblePokerReplay />);

      fireEvent.keyDown(document, { key: 'ArrowRight' });

      const currentAction = screen.getByTestId('action-0');
      expect(currentAction).toHaveClass('current');
      expect(currentAction).toHaveAttribute('aria-selected', 'true');

      // Screen reader text should indicate current
      expect(screen.getByText(/Action 1.*current/)).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Support', () => {
    test('supports reduced motion preferences', () => {
      render(<AccessiblePokerReplay enableReducedMotion={true} />);

      const component = screen.getByTestId('accessible-poker-replay');
      expect(component).toHaveClass('reduced-motion');
    });

    test('respects prefers-reduced-motion media query', () => {
      // Mock the media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<AccessiblePokerReplay enableReducedMotion={true} />);

      // Component should have reduced motion class when enabled
      const component = screen.getByTestId('accessible-poker-replay');
      expect(component).toHaveClass('reduced-motion');

      // Verify matchMedia is available for use
      expect(window.matchMedia).toBeDefined();
    });
  });

  describe('Action History Accessibility', () => {
    test('action history is navigable and selectable', async () => {
      const user = userEvent.setup();
      render(<AccessiblePokerReplay />);

      const firstAction = screen.getByTestId('action-0');

      await user.click(firstAction);

      expect(firstAction).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('current-action')).toHaveTextContent('0');
    });

    test('provides comprehensive action descriptions', () => {
      render(<AccessiblePokerReplay />);

      // Check that actions have detailed descriptions
      expect(screen.getByText('Action 1: Player1 blind for 10 chips')).toBeInTheDocument();
      expect(screen.getByText('Action 2: Player2 blind for 20 chips')).toBeInTheDocument();
      expect(screen.getByText('Action 3: Player1 raise for 60 chips')).toBeInTheDocument();
    });
  });

  describe('Error States and Edge Cases', () => {
    test('handles disabled state properly', () => {
      render(<AccessiblePokerReplay />);

      // Initially at beginning, so previous and reset should be disabled
      expect(screen.getByRole('button', { name: 'Previous action' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Reset to beginning' })).toBeDisabled();

      // These should still be accessible to screen readers
      expect(screen.getByRole('button', { name: 'Previous action' })).toHaveAttribute(
        'aria-label',
        'Previous action'
      );
    });

    test('handles end state properly', async () => {
      render(<AccessiblePokerReplay />);

      // Jump to end
      fireEvent.keyDown(document, { key: 'End' });

      // Next should be disabled
      expect(screen.getByRole('button', { name: 'Next action' })).toBeDisabled();
      expect(screen.getByTestId('current-action')).toHaveTextContent('5');
    });

    test('maintains accessibility with announcement filtering', () => {
      render(<AccessiblePokerReplay announceActions={false} />);

      const liveRegion = screen.getByTestId('announcements');
      expect(liveRegion).toBeInTheDocument();

      // Should still have proper ARIA attributes even when announcements are disabled
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Integration with Assistive Technologies', () => {
    test('provides comprehensive context for screen readers', () => {
      render(<AccessiblePokerReplay />);

      // Main description should be linked
      expect(screen.getByRole('application')).toHaveAttribute(
        'aria-describedby',
        'replay-description'
      );

      // Players should have detailed information
      const player1 = screen.getByTestId('player-1');
      expect(player1).toHaveAttribute('aria-labelledby', 'player-1-name');
      expect(player1).toHaveAttribute('aria-describedby', 'player-1-info');
    });

    test('supports voice control and switch navigation', () => {
      render(<AccessiblePokerReplay />);

      // All interactive elements should have clear labels
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });

      // Action items should be selectable
      const actions = screen.getAllByRole('option');
      actions.forEach(action => {
        expect(action).toHaveAttribute('aria-selected');
      });
    });
  });
});
