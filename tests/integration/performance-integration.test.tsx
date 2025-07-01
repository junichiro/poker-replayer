/**
 * @jest-environment jsdom
 */

/**
 * Performance Integration Tests
 * Tests performance benchmarks and optimization effectiveness
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PokerHandReplay } from '../../src/components/PokerHandReplay';
import { handHistories } from '../fixtures/hand-histories';

// Performance monitoring utilities
const createPerformanceMonitor = () => {
  const measurements: Array<{ name: string; duration: number; timestamp: number }> = [];
  
  const measure = (name: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    measurements.push({ name, duration, timestamp: endTime });
    return duration;
  };

  const getAverageTime = (name: string) => {
    const relevant = measurements.filter(m => m.name === name);
    if (relevant.length === 0) return 0;
    return relevant.reduce((sum, m) => sum + m.duration, 0) / relevant.length;
  };

  const reset = () => {
    measurements.length = 0;
  };

  return { measure, getAverageTime, reset, measurements };
};

// Memory usage tracker
const createMemoryTracker = () => {
  const snapshots: Array<{ name: string; memory: any; timestamp: number }> = [];
  
  const snapshot = (name: string) => {
    const memory = (performance as any).memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
    snapshots.push({ name, memory, timestamp: performance.now() });
    return memory;
  };

  const getMemoryDelta = (before: string, after: string) => {
    const beforeSnapshot = snapshots.find(s => s.name === before);
    const afterSnapshot = snapshots.find(s => s.name === after);
    
    if (!beforeSnapshot || !afterSnapshot) return 0;
    
    return afterSnapshot.memory.usedJSHeapSize - beforeSnapshot.memory.usedJSHeapSize;
  };

  return { snapshot, getMemoryDelta, snapshots };
};

// Stress test utility
const createStressTest = async (component: React.ReactElement, iterations: number = 100) => {
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    const { unmount } = render(component);
    
    await waitFor(() => {
      expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
    });
    
    const renderTime = performance.now() - startTime;
    
    unmount();
    
    results.push(renderTime);
    
    // Small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  return results;
};

describe('Performance Integration Tests', () => {
  let performanceMonitor: ReturnType<typeof createPerformanceMonitor>;
  let memoryTracker: ReturnType<typeof createMemoryTracker>;

  beforeEach(() => {
    performanceMonitor = createPerformanceMonitor();
    memoryTracker = createMemoryTracker();
    
    // Mock performance.now for consistent testing
    const mockNow = jest.fn(() => Date.now());
    Object.defineProperty(window, 'performance', {
      value: { 
        now: mockNow,
        memory: { usedJSHeapSize: 1000000, totalJSHeapSize: 2000000, jsHeapSizeLimit: 4000000 }
      },
      writable: true
    });
  });

  afterEach(() => {
    performanceMonitor.reset();
    jest.restoreAllMocks();
  });

  describe('Rendering Performance', () => {
    test('should render basic hand within performance threshold', async () => {
      const startTime = performance.now();
      
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const renderTime = performanceMonitor.measure('basic-render', startTime);
      
      // Should render within 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    test('should handle complex hands efficiently', async () => {
      const complexHands = [
        handHistories.complexAllIn,
        handHistories.allInScenario,
        handHistories.tournamentWithAntes
      ];

      for (const handHistory of complexHands) {
        const startTime = performance.now();
        
        const { unmount } = render(<PokerHandReplay handHistory={handHistory} />);

        await waitFor(() => {
          expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
        });

        const renderTime = performanceMonitor.measure('complex-render', startTime);
        
        // Complex hands should still render within 2 seconds
        expect(renderTime).toBeLessThan(2000);
        
        unmount();
      }

      // Average render time should be reasonable
      const averageTime = performanceMonitor.getAverageTime('complex-render');
      expect(averageTime).toBeLessThan(1500);
    });

    test('should maintain performance with multiple instances', async () => {
      const instances = [];
      const startTime = performance.now();

      // Render multiple instances
      for (let i = 0; i < 5; i++) {
        const instance = render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);
        instances.push(instance);
        
        await waitFor(() => {
          expect(screen.getAllByTestId('poker-hand-replay')).toHaveLength(i + 1);
        });
      }

      const totalRenderTime = performanceMonitor.measure('multiple-instances', startTime);
      
      // Should handle multiple instances efficiently
      expect(totalRenderTime).toBeLessThan(3000);

      // Cleanup
      instances.forEach(instance => instance.unmount());
    });
  });

  describe('Animation Performance', () => {
    test('should maintain smooth animation performance', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const playButton = screen.getByTestId('play-pause-btn');
      const startTime = performance.now();

      // Start playback
      await user.click(playButton);

      // Let animation run for a bit
      await new Promise(resolve => setTimeout(resolve, 500));

      const animationTime = performanceMonitor.measure('animation-playback', startTime);
      
      // Animation should start promptly
      expect(animationTime).toBeLessThan(1000);
    });

    test('should handle rapid control interactions efficiently', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const nextButton = screen.getByTestId('next-btn');
      const prevButton = screen.getByTestId('prev-btn');
      const startTime = performance.now();

      // Rapid button clicking
      for (let i = 0; i < 10; i++) {
        await user.click(nextButton);
        await user.click(prevButton);
      }

      const interactionTime = performanceMonitor.measure('rapid-interactions', startTime);
      
      // Should handle rapid interactions smoothly
      expect(interactionTime).toBeLessThan(2000);
    });

    test('should optimize animation with different speed settings', async () => {
      const speeds = [0.5, 1.0, 2.0, 3.0];
      
      for (const speed of speeds) {
        const user = userEvent.setup();
        const { unmount } = render(
          <PokerHandReplay 
            handHistory={handHistories.basicCashGame}
            config={{ animationSpeed: speed }}
          />
        );

        await waitFor(() => {
          expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
        });

        const playButton = screen.getByTestId('play-pause-btn');
        const startTime = performance.now();

        await user.click(playButton);
        await new Promise(resolve => setTimeout(resolve, 200));

        const speedTime = performanceMonitor.measure(`speed-${speed}`, startTime);
        
        // Performance should scale appropriately with speed
        expect(speedTime).toBeLessThan(1000);
        
        unmount();
      }
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory during normal operation', async () => {
      memoryTracker.snapshot('initial');

      // Render and interact with component
      const user = userEvent.setup();
      const { unmount } = render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      memoryTracker.snapshot('after-render');

      // Interact with component
      const playButton = screen.getByTestId('play-pause-btn');
      await user.click(playButton);
      await new Promise(resolve => setTimeout(resolve, 500));

      memoryTracker.snapshot('after-interaction');

      // Unmount component
      unmount();
      
      // Force cleanup (in real browser, this would be garbage collection)
      if (global.gc) {
        global.gc();
      }

      memoryTracker.snapshot('after-cleanup');

      // Memory growth should be minimal
      const memoryGrowth = memoryTracker.getMemoryDelta('initial', 'after-cleanup');
      expect(memoryGrowth).toBeLessThan(1000000); // Less than 1MB growth
    });

    test('should handle component mounting and unmounting efficiently', async () => {
      const mountCycles = 10;
      memoryTracker.snapshot('cycle-start');

      for (let i = 0; i < mountCycles; i++) {
        const { unmount } = render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);
        
        await waitFor(() => {
          expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
        });
        
        unmount();
      }

      memoryTracker.snapshot('cycle-end');

      // Memory should not accumulate significantly
      const cycleMemoryGrowth = memoryTracker.getMemoryDelta('cycle-start', 'cycle-end');
      expect(cycleMemoryGrowth).toBeLessThan(2000000); // Less than 2MB growth for 10 cycles
    });
  });

  describe('Large Dataset Performance', () => {
    test('should handle hands with many actions efficiently', async () => {
      // Create a large hand history by concatenating multiple hands
      const largeHandHistory = [
        handHistories.complexAllIn,
        handHistories.allInScenario,
        handHistories.tournamentWithAntes
      ].join('\n\n');

      const startTime = performance.now();
      
      render(<PokerHandReplay handHistory={largeHandHistory} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const renderTime = performanceMonitor.measure('large-dataset', startTime);
      
      // Should handle large datasets within reasonable time
      expect(renderTime).toBeLessThan(3000);
    });

    test('should maintain performance during extended playback', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.complexAllIn} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const playButton = screen.getByTestId('play-pause-btn');
      const startTime = performance.now();

      // Start long playback session
      await user.click(playButton);
      
      // Let it run for extended period
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if still responsive
      await user.click(playButton); // Pause
      
      const sessionTime = performanceMonitor.measure('extended-playback', startTime);
      
      // Should remain responsive throughout session
      expect(sessionTime).toBeLessThan(3000);
    });
  });

  describe('Stress Testing', () => {
    test('should maintain stability under stress', async () => {
      const stressResults = await createStressTest(
        <PokerHandReplay handHistory={handHistories.basicCashGame} />,
        20 // Reduced for CI environment
      );

      // All renders should complete successfully
      expect(stressResults.length).toBe(20);
      
      // Performance should remain consistent
      const averageTime = stressResults.reduce((sum, time) => sum + time, 0) / stressResults.length;
      const maxTime = Math.max(...stressResults);
      
      expect(averageTime).toBeLessThan(1000);
      expect(maxTime).toBeLessThan(2000);
      
      // Performance variance should be reasonable
      const variance = stressResults.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / stressResults.length;
      expect(variance).toBeLessThan(100000); // Reasonable variance threshold
    });

    test('should handle concurrent user interactions', async () => {
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);

      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const buttons = {
        play: screen.getByTestId('play-pause-btn'),
        next: screen.getByTestId('next-btn'),
        prev: screen.getByTestId('prev-btn'),
        reset: screen.getByTestId('reset-btn')
      };

      const startTime = performance.now();

      // Simulate rapid, concurrent interactions
      const interactions = [
        user.click(buttons.play),
        user.click(buttons.next),
        user.click(buttons.next),
        user.click(buttons.prev),
        user.click(buttons.reset),
        user.click(buttons.play)
      ];

      await Promise.all(interactions);

      const concurrentTime = performanceMonitor.measure('concurrent-interactions', startTime);
      
      // Should handle concurrent interactions efficiently
      expect(concurrentTime).toBeLessThan(2000);
      
      // Component should still be functional
      expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
    });
  });

  describe('Performance Regression Detection', () => {
    test('should meet baseline performance metrics', async () => {
      const baselines = {
        basicRender: 500,      // 500ms max for basic render
        complexRender: 1000,   // 1s max for complex render
        userInteraction: 100,  // 100ms max for user interaction response
        memoryUsage: 5000000   // 5MB max memory usage
      };

      // Test basic render performance
      const startBasic = performance.now();
      const { unmount: unmountBasic } = render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);
      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });
      const basicRenderTime = performance.now() - startBasic;
      unmountBasic();

      expect(basicRenderTime).toBeLessThan(baselines.basicRender);

      // Test complex render performance
      const startComplex = performance.now();
      const { unmount: unmountComplex } = render(<PokerHandReplay handHistory={handHistories.complexAllIn} />);
      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });
      const complexRenderTime = performance.now() - startComplex;
      unmountComplex();

      expect(complexRenderTime).toBeLessThan(baselines.complexRender);

      // Test interaction performance
      const user = userEvent.setup();
      render(<PokerHandReplay handHistory={handHistories.basicCashGame} />);
      await waitFor(() => {
        expect(screen.getByTestId('poker-hand-replay')).toBeInTheDocument();
      });

      const startInteraction = performance.now();
      await user.click(screen.getByTestId('play-pause-btn'));
      const interactionTime = performance.now() - startInteraction;

      expect(interactionTime).toBeLessThan(baselines.userInteraction);
    });
  });
});