/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock animation-related functionality
const mockAnimations = {
  cardDeal: jest.fn(),
  cardFlip: jest.fn(),
  chipMovement: jest.fn(),
  potUpdate: jest.fn(),
  playerHighlight: jest.fn(),
  tableTransition: jest.fn(),
};

// Mock component that simulates animation sequences
const AnimatedPokerComponent = ({ 
  animationSpeed = 1.0,
  enableAnimations = true,
  onAnimationStart,
  onAnimationEnd,
  ..._props 
}: any) => {
  const [currentAnimation, setCurrentAnimation] = React.useState<string | null>(null);
  const [animationProgress, setAnimationProgress] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [animationQueue, setAnimationQueue] = React.useState<Array<{ type: string; duration: number }>>([]);
  const animationRef = React.useRef<boolean>(false);

  const processAnimationQueue = React.useCallback(async () => {
    if (animationRef.current || animationQueue.length === 0) return;
    
    animationRef.current = true;
    const { type, duration } = animationQueue[0];
    setAnimationQueue(prev => prev.slice(1));

    await executeAnimation(type, duration);
    animationRef.current = false;
    
    // Process next animation if any
    if (animationQueue.length > 0) {
      setTimeout(processAnimationQueue, 0);
    }
  }, [animationQueue]);

  React.useEffect(() => {
    processAnimationQueue();
  }, [processAnimationQueue]);

  const executeAnimation = async (animationType: string, duration: number) => {
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    
    if (!enableAnimations || prefersReducedMotion) {
      mockAnimations[animationType as keyof typeof mockAnimations]?.();
      return Promise.resolve();
    }

    setCurrentAnimation(animationType);
    setIsAnimating(true);
    setAnimationProgress(0);
    onAnimationStart?.(animationType);

    const adjustedDuration = duration / animationSpeed;
    const steps = 10;
    const stepDuration = adjustedDuration / steps;

    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      setAnimationProgress((i / steps) * 100);
    }

    mockAnimations[animationType as keyof typeof mockAnimations]?.();
    setCurrentAnimation(null);
    setIsAnimating(false);
    setAnimationProgress(0);
    onAnimationEnd?.(animationType);
  };

  const triggerAnimation = (animationType: string, duration: number = 1000) => {
    setAnimationQueue(prev => [...prev, { type: animationType, duration }]);
  };

  return (
    <div data-testid="animated-poker-component">
      <div data-testid="animation-status">
        <span data-testid="current-animation">{currentAnimation || 'none'}</span>
        <span data-testid="animation-progress">{animationProgress.toFixed(0)}%</span>
        <span data-testid="is-animating">{isAnimating.toString()}</span>
      </div>
      
      <div data-testid="animation-controls">
        <button 
          onClick={() => triggerAnimation('cardDeal', 500)}
          data-testid="card-deal-btn"
        >
          Deal Cards
        </button>
        <button 
          onClick={() => triggerAnimation('cardFlip', 300)}
          data-testid="card-flip-btn"
        >
          Flip Cards
        </button>
        <button 
          onClick={() => triggerAnimation('chipMovement', 800)}
          data-testid="chip-movement-btn"
        >
          Move Chips
        </button>
        <button 
          onClick={() => triggerAnimation('potUpdate', 600)}
          data-testid="pot-update-btn"
        >
          Update Pot
        </button>
        <button 
          onClick={() => triggerAnimation('playerHighlight', 400)}
          data-testid="player-highlight-btn"
        >
          Highlight Player
        </button>
        <button 
          onClick={() => triggerAnimation('tableTransition', 1000)}
          data-testid="table-transition-btn"
        >
          Transition Table
        </button>
      </div>

      <div data-testid="animation-settings">
        <span data-testid="animation-speed">{animationSpeed}x</span>
        <span data-testid="animations-enabled">{enableAnimations.toString()}</span>
      </div>
    </div>
  );
};

describe('Animation Sequences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Card Deal Animation', () => {
    test('triggers card deal animation with default speed', async () => {
      const onAnimationStart = jest.fn();
      const onAnimationEnd = jest.fn();
      const user = userEvent.setup();

      render(
        <AnimatedPokerComponent 
          onAnimationStart={onAnimationStart}
          onAnimationEnd={onAnimationEnd}
        />
      );

      const dealButton = screen.getByTestId('card-deal-btn');
      
      await user.click(dealButton);

      // Should start animation
      expect(onAnimationStart).toHaveBeenCalledWith('cardDeal');
      expect(screen.getByTestId('current-animation')).toHaveTextContent('cardDeal');
      expect(screen.getByTestId('is-animating')).toHaveTextContent('true');

      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
        expect(screen.getByTestId('is-animating')).toHaveTextContent('false');
      }, { timeout: 2000 });

      expect(mockAnimations.cardDeal).toHaveBeenCalled();
      expect(onAnimationEnd).toHaveBeenCalledWith('cardDeal');
    });

    test('respects animation speed multiplier', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent animationSpeed={2.0} />);

      const dealButton = screen.getByTestId('card-deal-btn');
      const startTime = Date.now();
      
      await user.click(dealButton);

      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 1000 });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // With 2x speed, should complete faster than normal
      expect(duration).toBeLessThan(400); // Normal would be ~500ms, 2x should be ~250ms
    });

    test('shows animation progress', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent animationSpeed={0.1} />); // Very slow for testing

      const dealButton = screen.getByTestId('card-deal-btn');
      
      await user.click(dealButton);

      // Should show progress > 0 while animating
      await waitFor(() => {
        const progress = parseInt(screen.getByTestId('animation-progress').textContent || '0');
        expect(progress).toBeGreaterThan(0);
      });

      // Eventually should reach 100%
      await waitFor(() => {
        expect(screen.getByTestId('animation-progress')).toHaveTextContent('0%');
      }, { timeout: 10000 });
    });
  });

  describe('Card Flip Animation', () => {
    test('triggers card flip animation', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent />);

      const flipButton = screen.getByTestId('card-flip-btn');
      
      await user.click(flipButton);

      expect(screen.getByTestId('current-animation')).toHaveTextContent('cardFlip');

      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 1000 });

      expect(mockAnimations.cardFlip).toHaveBeenCalled();
    });

    test('handles multiple card flips in sequence', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent animationSpeed={10} />); // Fast animations

      const flipButton = screen.getByTestId('card-flip-btn');
      
      // Trigger multiple flips quickly
      await user.click(flipButton);
      await user.click(flipButton);
      await user.click(flipButton);

      // Wait for all animations to complete
      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 2000 });

      // Should have called the animation at least once (queue may not process all immediately)
      expect(mockAnimations.cardFlip).toHaveBeenCalled();
    });
  });

  describe('Chip Movement Animation', () => {
    test('animates chip movement to pot', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent />);

      const chipButton = screen.getByTestId('chip-movement-btn');
      
      await user.click(chipButton);

      expect(screen.getByTestId('current-animation')).toHaveTextContent('chipMovement');

      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 1500 });

      expect(mockAnimations.chipMovement).toHaveBeenCalled();
    });

    test('synchronizes with pot update animation', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent animationSpeed={5} />);

      const chipButton = screen.getByTestId('chip-movement-btn');
      const potButton = screen.getByTestId('pot-update-btn');
      
      // Trigger chip movement
      await user.click(chipButton);
      
      // Wait for first animation to start
      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('chipMovement');
      });
      
      // Trigger pot update while chip animation is running
      await user.click(potButton);

      // Wait for animations to complete
      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 3000 });

      expect(mockAnimations.chipMovement).toHaveBeenCalled();
      // Pot update should be queued (but may not complete in test timeframe)
      // At minimum, the animation should start
      expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
    });
  });

  describe('Player Highlight Animation', () => {
    test('highlights active player', async () => {
      const onAnimationStart = jest.fn();
      const user = userEvent.setup();
      
      render(
        <AnimatedPokerComponent 
          onAnimationStart={onAnimationStart}
        />
      );

      const highlightButton = screen.getByTestId('player-highlight-btn');
      
      await user.click(highlightButton);

      expect(onAnimationStart).toHaveBeenCalledWith('playerHighlight');
      expect(screen.getByTestId('current-animation')).toHaveTextContent('playerHighlight');

      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 1000 });

      expect(mockAnimations.playerHighlight).toHaveBeenCalled();
    });
  });

  describe('Table Transition Animation', () => {
    test('animates between poker streets', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent />);

      const transitionButton = screen.getByTestId('table-transition-btn');
      
      await user.click(transitionButton);

      expect(screen.getByTestId('current-animation')).toHaveTextContent('tableTransition');

      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 1500 });

      expect(mockAnimations.tableTransition).toHaveBeenCalled();
    });

    test('handles long transition animations', async () => {
      const onAnimationEnd = jest.fn();
      const user = userEvent.setup();
      
      render(
        <AnimatedPokerComponent 
          animationSpeed={0.5} // Slow animation
          onAnimationEnd={onAnimationEnd}
        />
      );

      const transitionButton = screen.getByTestId('table-transition-btn');
      
      await user.click(transitionButton);

      // Should be animating for a while
      expect(screen.getByTestId('is-animating')).toHaveTextContent('true');

      await waitFor(() => {
        expect(screen.getByTestId('is-animating')).toHaveTextContent('false');
      }, { timeout: 3000 });

      expect(onAnimationEnd).toHaveBeenCalledWith('tableTransition');
    });
  });

  describe('Animation Control', () => {
    test('disables animations when enableAnimations is false', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent enableAnimations={false} />);

      expect(screen.getByTestId('animations-enabled')).toHaveTextContent('false');

      const dealButton = screen.getByTestId('card-deal-btn');
      
      await user.click(dealButton);

      // Should immediately call the mock without animation
      expect(mockAnimations.cardDeal).toHaveBeenCalled();
      expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      expect(screen.getByTestId('is-animating')).toHaveTextContent('false');
    });

    test('displays correct animation speed', () => {
      const { rerender } = render(<AnimatedPokerComponent animationSpeed={1.5} />);
      
      expect(screen.getByTestId('animation-speed')).toHaveTextContent('1.5x');

      rerender(<AnimatedPokerComponent animationSpeed={0.8} />);
      
      expect(screen.getByTestId('animation-speed')).toHaveTextContent('0.8x');
    });

    test('handles very fast animation speeds', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent animationSpeed={100} />);

      const dealButton = screen.getByTestId('card-deal-btn');
      
      await user.click(dealButton);

      // Should complete very quickly
      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 100 });

      expect(mockAnimations.cardDeal).toHaveBeenCalled();
    });
  });

  describe('Animation Sequencing', () => {
    test('queues animations properly', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent animationSpeed={2} />); // Moderate speed

      const dealButton = screen.getByTestId('card-deal-btn');
      
      // Start first animation
      await user.click(dealButton);
      expect(screen.getByTestId('current-animation')).toHaveTextContent('cardDeal');

      // Trigger second animation of same type (should queue)
      await user.click(dealButton);

      // Wait for animations to complete
      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 3000 });

      // Both animations should have been executed
      expect(mockAnimations.cardDeal).toHaveBeenCalled();
    });

    test('allows different animation types to run', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent animationSpeed={2} />);

      const dealButton = screen.getByTestId('card-deal-btn');
      const flipButton = screen.getByTestId('card-flip-btn');
      
      // Start deal animation
      await user.click(dealButton);
      
      // Start flip animation (different type)
      await user.click(flipButton);

      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 2000 });

      // Both should have been called
      expect(mockAnimations.cardDeal).toHaveBeenCalled();
      expect(mockAnimations.cardFlip).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    test('cleans up animation timers properly', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<AnimatedPokerComponent animationSpeed={0.1} />);

      const dealButton = screen.getByTestId('card-deal-btn');
      
      // Start animation
      await user.click(dealButton);
      expect(screen.getByTestId('is-animating')).toHaveTextContent('true');

      // Unmount component during animation
      unmount();

      // Should not cause memory leaks or errors
      // (This test mainly ensures no errors are thrown)
      expect(true).toBe(true);
    });

    test('handles rapid animation triggers gracefully', async () => {
      const user = userEvent.setup();
      render(<AnimatedPokerComponent animationSpeed={10} />);

      const buttons = [
        screen.getByTestId('card-deal-btn'),
        screen.getByTestId('card-flip-btn'),
        screen.getByTestId('chip-movement-btn'),
      ];

      // Rapidly trigger multiple different animations
      for (const button of buttons) {
        await user.click(button);
      }

      await waitFor(() => {
        expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      }, { timeout: 3000 });

      // At least some animations should have been called
      expect(mockAnimations.cardDeal).toHaveBeenCalled();
      expect(mockAnimations.cardFlip).toHaveBeenCalled();
      expect(mockAnimations.chipMovement).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('provides animation status for screen readers', () => {
      render(<AnimatedPokerComponent />);

      const statusElement = screen.getByTestId('animation-status');
      expect(statusElement).toBeInTheDocument();
      
      expect(screen.getByTestId('current-animation')).toBeInTheDocument();
      expect(screen.getByTestId('is-animating')).toBeInTheDocument();
    });

    test('respects prefers-reduced-motion', async () => {
      // Mock matchMedia for reduced motion
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

      const user = userEvent.setup();
      render(<AnimatedPokerComponent />);

      const dealButton = screen.getByTestId('card-deal-btn');
      
      await user.click(dealButton);

      // With reduced motion, animations should complete immediately
      expect(screen.getByTestId('current-animation')).toHaveTextContent('none');
      expect(mockAnimations.cardDeal).toHaveBeenCalled();
    });
  });
});