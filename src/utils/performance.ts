/**
 * Performance monitoring utilities for poker hand replay component
 *
 * This module provides utilities for monitoring component performance,
 * tracking re-renders, and identifying performance bottlenecks.
 */

import React from 'react';

export interface PerformanceMetrics {
  /** Component name being measured */
  componentName: string;
  /** Number of renders */
  renderCount: number;
  /** Total time spent rendering (ms) */
  totalRenderTime: number;
  /** Average time per render (ms) */
  averageRenderTime: number;
  /** Timestamp of last render */
  lastRenderTime: number;
  /** Props that caused the last render */
  lastRenderReason?: string[];
}

export interface RenderInfo {
  /** Component name */
  componentName: string;
  /** Render start time */
  startTime: number;
  /** Render duration in milliseconds */
  duration?: number;
  /** Props that caused this render */
  reason?: string[];
}

// Global performance tracking store
const performanceStore = new Map<string, PerformanceMetrics>();

/**
 * Hook for tracking component render performance
 * Usage: const trackRender = useRenderTracker('ComponentName');
 */
export function useRenderTracker(componentName: string) {
  if (typeof window === 'undefined' || !window.performance) {
    // Return no-op functions in environments without performance API
    return {
      startRender: () => {},
      endRender: () => {},
      getRenderInfo: () => null,
    };
  }

  const startRender = (reason?: string[]) => {
    const startTime = performance.now();

    return {
      componentName,
      startTime,
      reason,
    } as RenderInfo;
  };

  const endRender = (renderInfo: RenderInfo) => {
    const endTime = performance.now();
    const duration = endTime - renderInfo.startTime;

    renderInfo.duration = duration;

    // Update performance metrics
    updatePerformanceMetrics(renderInfo);

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      logRenderPerformance(renderInfo);
    }
  };

  const getRenderInfo = () => performanceStore.get(componentName) || null;

  return {
    startRender,
    endRender,
    getRenderInfo,
  };
}

/**
 * Custom hook for tracking expensive calculations
 */
export function useCalculationTracker<T>(
  calculationName: string,
  calculation: () => T,
  dependencies: any[]
): T {
  if (typeof window === 'undefined' || !window.performance) {
    // Fallback for environments without performance API
    return React.useMemo(calculation, dependencies);
  }

  return React.useMemo(() => {
    const startTime = performance.now();
    const result = calculation();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (process.env.NODE_ENV === 'development' && duration > 5) {
      // eslint-disable-next-line no-console
      console.log(`[Performance] ${calculationName}: ${duration.toFixed(2)}ms`);
    }

    return result;
  }, dependencies);
}

/**
 * Higher-order component for automatic performance tracking
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const displayName = componentName || Component.displayName || Component.name || 'Component';

  const WrappedComponent = React.memo((props: P) => {
    const { startRender, endRender } = useRenderTracker(displayName);
    const renderInfoRef = React.useRef<RenderInfo>();

    // This must run on every render to capture the correct start time.
    renderInfoRef.current = startRender() || {
      componentName: displayName,
      startTime: 0,
    };

    // Track render end
    React.useEffect(() => {
      if (renderInfoRef.current) {
        endRender(renderInfoRef.current);
      }
    });

    return React.createElement(Component, props);
  });

  WrappedComponent.displayName = `withPerformanceTracking(${displayName})`;

  return WrappedComponent as unknown as React.ComponentType<P>;
}

/**
 * Update performance metrics for a component
 */
function updatePerformanceMetrics(renderInfo: RenderInfo): void {
  const { componentName, duration = 0 } = renderInfo;

  const existing = performanceStore.get(componentName);

  if (existing) {
    existing.renderCount += 1;
    existing.totalRenderTime += duration;
    existing.averageRenderTime = existing.totalRenderTime / existing.renderCount;
    existing.lastRenderTime = Date.now();
    existing.lastRenderReason = renderInfo.reason;
  } else {
    performanceStore.set(componentName, {
      componentName,
      renderCount: 1,
      totalRenderTime: duration,
      averageRenderTime: duration,
      lastRenderTime: Date.now(),
      lastRenderReason: renderInfo.reason,
    });
  }
}

/**
 * Log render performance in development
 */
function logRenderPerformance(renderInfo: RenderInfo): void {
  const { componentName, duration = 0, reason } = renderInfo;

  // Only log slow renders or frequent renders
  if (duration > 10) {
    // eslint-disable-next-line no-console
    console.warn(
      `[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms`,
      reason ? `Reason: ${reason.join(', ')}` : ''
    );
  }
}

/**
 * Get performance metrics for all tracked components
 */
export function getAllPerformanceMetrics(): PerformanceMetrics[] {
  return Array.from(performanceStore.values());
}

/**
 * Get performance metrics for a specific component
 */
export function getComponentMetrics(componentName: string): PerformanceMetrics | null {
  return performanceStore.get(componentName) || null;
}

/**
 * Reset performance metrics (useful for testing)
 */
export function resetPerformanceMetrics(): void {
  performanceStore.clear();
}

/**
 * Generate a performance report
 */
export function generatePerformanceReport(): string {
  const metrics = getAllPerformanceMetrics();

  if (metrics.length === 0) {
    return 'No performance data available.';
  }

  const sortedMetrics = metrics.sort((a, b) => b.averageRenderTime - a.averageRenderTime);

  let report = '📊 Component Performance Report\n';
  report += '================================\n\n';

  sortedMetrics.forEach(metric => {
    report += `${metric.componentName}:\n`;
    report += `  Renders: ${metric.renderCount}\n`;
    report += `  Avg Time: ${metric.averageRenderTime.toFixed(2)}ms\n`;
    report += `  Total Time: ${metric.totalRenderTime.toFixed(2)}ms\n`;
    if (metric.lastRenderReason) {
      report += `  Last Reason: ${metric.lastRenderReason.join(', ')}\n`;
    }
    report += '\n';
  });

  return report;
}

/**
 * Performance-optimized memo with automatic tracking
 */
export function performanceMemo<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean,
  componentName?: string
): React.ComponentType<P> {
  const displayName = componentName || Component.displayName || Component.name || 'Component';

  const MemoComponent = React.memo(Component, areEqual);

  // Add performance tracking in development
  if (process.env.NODE_ENV === 'development') {
    return withPerformanceTracking(MemoComponent, displayName) as React.ComponentType<P>;
  }

  return MemoComponent as unknown as React.ComponentType<P>;
}

/**
 * Development-only performance logger
 * Logs component re-render information to console
 */
export function useDevPerformanceLogger(componentName: string, props?: any): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const renderCount = React.useRef(0);
  const lastProps = React.useRef(props);

  React.useEffect(() => {
    renderCount.current += 1;

    if (renderCount.current > 1) {
      // eslint-disable-next-line no-console
      console.log(`[Re-render] ${componentName} (#${renderCount.current})`);

      // Try to identify what changed
      if (props && lastProps.current) {
        const changedProps = Object.keys(props).filter(
          key => props[key] !== lastProps.current[key]
        );

        if (changedProps.length > 0) {
          // eslint-disable-next-line no-console
          console.log(`  Changed props: ${changedProps.join(', ')}`);
        }
      }
    }

    lastProps.current = props;
  });
}
