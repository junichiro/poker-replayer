/**
 * @jest-environment jsdom
 */

/**
 * Browser Compatibility Integration Tests
 * Tests cross-browser functionality and responsive design
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PokerHandReplay } from '../../src/components/PokerHandReplay';
import { handHistories } from '../fixtures/hand-histories';

// Mock different browser environments
const mockBrowserEnvironments = {
  chrome: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    features: {
      requestAnimationFrame: true,
      matchMedia: true,
      ResizeObserver: true,
      IntersectionObserver: true
    }
  },
  firefox: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    features: {
      requestAnimationFrame: true,
      matchMedia: true,
      ResizeObserver: true,
      IntersectionObserver: true
    }
  },
  safari: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    features: {
      requestAnimationFrame: true,
      matchMedia: true,
      ResizeObserver: false, // Safari has limited support
      IntersectionObserver: true
    }
  },
  edge: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    features: {
      requestAnimationFrame: true,
      matchMedia: true,
      ResizeObserver: true,
      IntersectionObserver: true
    }
  }
};

// Mock different screen sizes
const mockScreenSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  ultrawide: { width: 3440, height: 1440 }
};

const setupBrowserEnvironment = (browser: keyof typeof mockBrowserEnvironments) => {
  const env = mockBrowserEnvironments[browser];
  
  // Mock user agent
  Object.defineProperty(window.navigator, 'userAgent', {
    value: env.userAgent,
    configurable: true
  });

  // Mock browser features
  if (env.features.requestAnimationFrame) {
    global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
    global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));
  }

  if (env.features.matchMedia) {
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
  }

  if (env.features.ResizeObserver) {
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  }

  if (env.features.IntersectionObserver) {
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  }

  return {
    cleanup: () => {
      jest.restoreAllMocks();
    }
  };
};

const setupScreenSize = (size: keyof typeof mockScreenSizes) => {
  const { width, height } = mockScreenSizes[size];
  
  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Mock screen object
  Object.defineProperty(window, 'screen', {
    writable: true,
    configurable: true,
    value: {
      width,
      height,
      availWidth: width,
      availHeight: height,
    },
  });

  // Trigger resize event
  const resizeEvent = new Event('resize');
  window.dispatchEvent(resizeEvent);
};

describe('Browser Compatibility Integration Tests', () => {
  let cleanup: () => void;

  afterEach(() => {
    if (cleanup) {
      cleanup();
    }
  });

  describe('Cross-Browser Functionality', () => {
    const browsers = Object.keys(mockBrowserEnvironments) as Array<keyof typeof mockBrowserEnvironments>;

    test.each(browsers)('should render correctly in %s', async (browser) => {
      const setup = setupBrowserEnvironment(browser);
      cleanup = setup.cleanup;

      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      // Verify core components render
      expect(screen.getByTestId('poker-table')).toBeInTheDocument();
      expect(screen.getByTestId('replay-controls')).toBeInTheDocument();

      // Verify functionality works
      const playButton = screen.getByTestId('play-pause-btn');
      expect(playButton).toBeInTheDocument();
    });

    test.each(browsers)('should handle animations in %s', async (browser) => {
      const setup = setupBrowserEnvironment(browser);
      cleanup = setup.cleanup;

      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const playButton = screen.getByTestId('play-pause-btn');
      await user.click(playButton);

      // Should handle animations gracefully regardless of browser
      await waitFor(() => {
        expect(screen.getByTestId('play-pause-btn')).toHaveTextContent('Pause');
      });
    });

    test.each(browsers)('should support keyboard navigation in %s', async (browser) => {
      const setup = setupBrowserEnvironment(browser);
      cleanup = setup.cleanup;

      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const replayComponent = screen.getByTestId('poker-hand-replay');
      replayComponent.focus();

      // Test keyboard controls work across browsers
      await user.keyboard(' '); // Space for play/pause
      await waitFor(() => {
        expect(screen.getByTestId('play-pause-btn')).toHaveTextContent('Pause');
      });
    });
  });

  describe('Responsive Design', () => {
    const screenSizes = Object.keys(mockScreenSizes) as Array<keyof typeof mockScreenSizes>;

    test.each(screenSizes)('should adapt to %s screen size', async (screenSize) => {
      setupScreenSize(screenSize);
      
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const replayComponent = screen.getByTestId('poker-hand-replay');
      expect(replayComponent).toBeInTheDocument();

      // Verify components are still functional at different sizes
      expect(screen.getByTestId('poker-table')).toBeInTheDocument();
      expect(screen.getByTestId('replay-controls')).toBeInTheDocument();
    });

    test('should handle orientation changes on mobile', async () => {
      // Start in portrait
      setupScreenSize('mobile');
      
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      // Simulate landscape orientation
      Object.defineProperty(window, 'innerWidth', { value: 667, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, configurable: true });
      
      const orientationEvent = new Event('orientationchange');
      window.dispatchEvent(orientationEvent);

      // Component should still work
      expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
    });

    test('should maintain functionality across screen size changes', async () => {
      const user = userEvent.setup();
      
      // Start with desktop
      setupScreenSize('desktop');
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const playButton = screen.getByTestId('play-pause-btn');
      await user.click(playButton);

      await waitFor(() => {
        expect(playButton).toHaveTextContent('Pause');
      });

      // Resize to mobile
      setupScreenSize('mobile');

      // Should still be functional
      expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      expect(playButton).toHaveTextContent('Pause');
    });
  });

  describe('Touch Device Support', () => {
    test('should support touch interactions on mobile devices', async () => {
      setupScreenSize('mobile');
      
      // Mock touch events
      const mockTouchStart = jest.fn();
      const mockTouchEnd = jest.fn();
      
      Element.prototype.addEventListener = jest.fn((event, handler) => {
        if (typeof handler === 'function') {
          if (event === 'touchstart') mockTouchStart.mockImplementation(handler);
          if (event === 'touchend') mockTouchEnd.mockImplementation(handler);
        }
      });

      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const playButton = screen.getByTestId('play-pause-btn');
      expect(playButton).toBeInTheDocument();

      // Simulate touch interaction
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      
      playButton.dispatchEvent(touchEvent);
      
      // Should handle touch events gracefully
      expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
    });

    test('should handle swipe gestures for navigation', async () => {
      setupScreenSize('mobile');
      
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const replayComponent = screen.getByTestId('poker-hand-replay');
      
      // Simulate swipe left (next action)
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      replayComponent.dispatchEvent(touchStart);
      replayComponent.dispatchEvent(touchMove);
      replayComponent.dispatchEvent(touchEnd);

      // Should handle gestures gracefully
      expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
    });
  });

  describe('Performance Across Browsers', () => {
    test('should maintain performance standards in different browsers', async () => {
      const browsers = Object.keys(mockBrowserEnvironments) as Array<keyof typeof mockBrowserEnvironments>;
      
      for (const browser of browsers) {
        const setup = setupBrowserEnvironment(browser);
        
        const startTime = performance.now();
        
        render(<PokerHandReplay handHistory={handHistories.complexAllIn} />);

        await waitFor(() => {
          expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
        });

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Should render within reasonable time across all browsers
        expect(renderTime).toBeLessThan(3000);

        setup.cleanup();
      }
    });

    test('should handle memory management across different environments', async () => {
      const browsers = Object.keys(mockBrowserEnvironments) as Array<keyof typeof mockBrowserEnvironments>;
      
      for (const browser of browsers) {
        const setup = setupBrowserEnvironment(browser);
        
        // Render multiple instances
        const { unmount } = render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

        await waitFor(() => {
          expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
        });

        // Unmount and re-render to test cleanup
        unmount();
        
        render(<PokerHandReplay handHistory={handHistories.tournamentWithAntes} />);

        await waitFor(() => {
          expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
        });

        setup.cleanup();
      }
    });
  });

  describe('Feature Detection and Graceful Degradation', () => {
    test('should work when ResizeObserver is not available', async () => {
      const setup = setupBrowserEnvironment('safari'); // Safari has limited ResizeObserver
      cleanup = setup.cleanup;
      
      // Remove ResizeObserver entirely
      delete (global as any).ResizeObserver;

      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      // Should still render and function
      expect(screen.getByTestId('poker-table')).toBeInTheDocument();
      expect(screen.getByTestId('replay-controls')).toBeInTheDocument();
    });

    test('should degrade gracefully without requestAnimationFrame', async () => {
      // Remove requestAnimationFrame
      delete (global as any).requestAnimationFrame;

      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const playButton = screen.getByTestId('play-pause-btn');
      await user.click(playButton);

      // Should still work, just without smooth animations
      await waitFor(() => {
        expect(playButton).toHaveTextContent('Pause');
      });
    });

    test('should handle CSS feature detection', async () => {
      // Mock CSS supports
      const mockSupports = jest.fn().mockImplementation((property, value) => {
        // Simulate older browser without modern CSS features
        if (property === 'display' && value === 'grid') return false;
        if (property === 'display' && value === 'flex') return true;
        return false;
      });

      Object.defineProperty(window.CSS, 'supports', {
        value: mockSupports,
        configurable: true
      });

      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      // Should render with fallback layouts
      expect(screen.getByTestId('poker-table')).toBeInTheDocument();
    });
  });
});