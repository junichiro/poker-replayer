/**
 * Test setup configuration for React Testing Library
 * Enhanced with performance monitoring for test optimization
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia for components that use CSS media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver for components that might use it
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock requestAnimationFrame for animation tests
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();

// Suppress console warnings in tests unless they're being tested
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      args[0]?.includes?.('Warning: ReactDOM.render is deprecated') ||
      args[0]?.includes?.('Warning: React.createFactory is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    if (args[0]?.includes?.('componentWillReceiveProps has been renamed')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Performance monitoring setup
const testStartTimes = new Map<string, number>();

// Track slow tests for optimization
beforeEach(() => {
  const testName = expect.getState().currentTestName || 'unknown';
  testStartTimes.set(testName, Date.now());
});

afterEach(() => {
  const testName = expect.getState().currentTestName || 'unknown';
  const startTime = testStartTimes.get(testName);

  if (startTime) {
    const duration = Date.now() - startTime;
    testStartTimes.delete(testName);

    // Log tests that take longer than 500ms
    if (duration > 500 && process.env.NODE_ENV !== 'production') {
      console.log(`⚠️  Slow test: ${testName} took ${duration}ms`);
    }
  }
});
