/**
 * Performance monitoring utilities for tests
 * Helps identify slow tests and track performance improvements
 */

export class PerformanceMonitor {
  private static testTimes: Map<string, number> = new Map();
  private static slowTestThreshold = 1000; // 1 second

  /**
   * Start timing a test
   */
  static startTest(testName: string): void {
    this.testTimes.set(testName, Date.now());
  }

  /**
   * End timing a test and optionally warn if it's slow
   */
  static endTest(testName: string, warnIfSlow = true): number {
    const startTime = this.testTimes.get(testName);
    if (!startTime) {
      console.warn(`No start time found for test: ${testName}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.testTimes.delete(testName);

    if (warnIfSlow && duration > this.slowTestThreshold) {
      // eslint-disable-next-line no-console
      console.warn(`Slow test detected: ${testName} took ${duration}ms`);
    }

    return duration;
  }

  /**
   * Time a function execution
   */
  static async timeFunction<T>(
    fn: () => T | Promise<T>,
    label?: string
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;

    if (label && duration > 100) {
      // eslint-disable-next-line no-console
      console.log(`${label}: ${duration}ms`);
    }

    return { result, duration };
  }

  /**
   * Create a performance test wrapper
   */
  static createPerformanceTest(
    testName: string,
    testFn: () => void | Promise<void>,
    maxDuration = 1000
  ) {
    return async () => {
      this.startTest(testName);

      try {
        await testFn();
        const duration = this.endTest(testName, false);

        if (duration > maxDuration) {
          const error = new Error(
            `Test ${testName} exceeded max duration: ${duration}ms > ${maxDuration}ms`
          );
          throw error;
        }
      } catch (error) {
        this.endTest(testName, false);
        throw error;
      }
    };
  }

  /**
   * Set the threshold for considering a test slow
   */
  static setSlowTestThreshold(milliseconds: number): void {
    this.slowTestThreshold = milliseconds;
  }

  /**
   * Generate a performance report
   */
  static generateReport(): string {
    const times = Array.from(this.testTimes.entries())
      .map(([name, startTime]) => ({ name, duration: Date.now() - startTime }))
      .sort((a, b) => b.duration - a.duration);

    if (times.length === 0) {
      return 'No performance data available';
    }

    const report = [
      'Performance Report:',
      '==================',
      ...times.map(({ name, duration }) => `${name}: ${duration}ms`),
      '',
      `Total tests monitored: ${times.length}`,
      `Slowest test: ${times[0]?.name} (${times[0]?.duration}ms)`,
      `Fastest test: ${times[times.length - 1]?.name} (${times[times.length - 1]?.duration}ms)`,
    ];

    return report.join('\n');
  }
}

/**
 * Jest helper functions for performance testing
 */
export const performanceTest = {
  /**
   * Wrapper for Jest test that monitors performance
   */
  it: (name: string, testFn: () => void | Promise<void>, timeout?: number) => {
    return it(name, PerformanceMonitor.createPerformanceTest(name, testFn, timeout), timeout);
  },

  /**
   * Performance test that should complete within specified time
   */
  fastTest: (name: string, testFn: () => void | Promise<void>, maxMs = 100) => {
    return it(name, PerformanceMonitor.createPerformanceTest(name, testFn, maxMs), maxMs + 1000);
  },

  /**
   * Performance test for operations that should be very fast
   */
  lightningTest: (name: string, testFn: () => void | Promise<void>) => {
    return performanceTest.fastTest(name, testFn, 50);
  },
};

/**
 * Benchmark utilities for comparing different implementations
 */
export class Benchmark {
  static async compare<T>(
    implementations: Array<{ name: string; fn: () => T | Promise<T> }>,
    iterations = 100
  ): Promise<Array<{ name: string; avgTime: number; totalTime: number }>> {
    const results = [];

    for (const impl of implementations) {
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const { duration } = await PerformanceMonitor.timeFunction(impl.fn);
        times.push(duration);
      }

      const totalTime = times.reduce((sum, time) => sum + time, 0);
      const avgTime = totalTime / iterations;

      results.push({
        name: impl.name,
        avgTime,
        totalTime,
      });
    }

    return results.sort((a, b) => a.avgTime - b.avgTime);
  }

  static logComparison(results: Array<{ name: string; avgTime: number }>) {
    // eslint-disable-next-line no-console
    console.log('\nBenchmark Results:');
    // eslint-disable-next-line no-console
    console.log('==================');

    results.forEach((result, index) => {
      const suffix =
        index === 0
          ? ' (fastest)'
          : ` (${(result.avgTime / results[0].avgTime).toFixed(2)}x slower)`;
      // eslint-disable-next-line no-console
      console.log(`${result.name}: ${result.avgTime.toFixed(2)}ms${suffix}`);
    });
  }
}
