/**
 * Loading state management utilities
 *
 * Provides hooks and components for managing loading states, progress tracking,
 * and async operation handling with timeout and retry capabilities.
 */

import { useState, useCallback, useRef, useEffect } from "react";

export interface LoadingState {
  /** Whether currently loading */
  isLoading: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Current loading message */
  message?: string;
  /** Loading phase/step */
  phase?: string;
  /** Error that occurred during loading */
  error?: Error;
  /** Timestamp when loading started */
  startTime?: number;
  /** Estimated completion time */
  estimatedTime?: number;
}

export interface LoadingOptions {
  /** Initial loading message */
  initialMessage?: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Enable progress tracking */
  trackProgress?: boolean;
  /** Enable time estimation */
  estimateTime?: boolean;
  /** Retry configuration */
  retry?: {
    /** Maximum retry attempts */
    maxAttempts: number;
    /** Delay between retries (ms) */
    delay: number;
    /** Use exponential backoff */
    exponentialBackoff?: boolean;
  };
}

export interface AsyncOperationResult<T> {
  /** Operation result data */
  data?: T;
  /** Whether operation was successful */
  success: boolean;
  /** Error if operation failed */
  error?: Error;
  /** Duration of operation in milliseconds */
  duration: number;
  /** Number of retry attempts made */
  retryAttempts: number;
}

/**
 * Hook for managing loading states with progress tracking and error handling
 */
export function useLoading(options: LoadingOptions = {}) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: options.initialMessage,
    error: undefined,
    startTime: undefined,
    estimatedTime: undefined,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const startTimeRef = useRef<number>();

  const startLoading = useCallback(
    (message?: string) => {
      const startTime = Date.now();
      startTimeRef.current = startTime;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        progress: 0,
        message: message || prev.message,
        error: undefined,
        startTime,
      }));

      // Set timeout if specified
      if (options.timeout) {
        timeoutRef.current = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: new Error(`Operation timed out after ${options.timeout}ms`),
          }));
        }, options.timeout);
      }
    },
    [options.timeout],
  );

  const updateProgress = useCallback(
    (progress: number, message?: string, phase?: string) => {
      setState((prev) => {
        const elapsed = Date.now() - (prev.startTime || 0);
        let estimatedTime: number | undefined;

        // Estimate remaining time based on progress
        if (options.estimateTime && progress > 0 && progress < 100) {
          const totalEstimated = (elapsed / progress) * 100;
          estimatedTime = totalEstimated - elapsed;
        }

        return {
          ...prev,
          progress: Math.max(0, Math.min(100, progress)),
          message: message || prev.message,
          phase: phase || prev.phase,
          estimatedTime,
        };
      });
    },
    [options.estimateTime],
  );

  const finishLoading = useCallback((error?: Error) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      progress: error ? prev.progress : 100,
      error,
    }));
  }, []);

  const resetLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState({
      isLoading: false,
      progress: 0,
      message: options.initialMessage,
      error: undefined,
      startTime: undefined,
      estimatedTime: undefined,
    });
  }, [options.initialMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startLoading,
    updateProgress,
    finishLoading,
    resetLoading,
  };
}

/**
 * Hook for executing async operations with loading state and retry logic
 */
export function useAsyncOperation<T>(options: LoadingOptions = {}) {
  const loading = useLoading(options);
  const retryCountRef = useRef(0);

  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      loadingMessage?: string,
    ): Promise<AsyncOperationResult<T>> => {
      const startTime = Date.now();
      let retryAttempts = 0;

      const executeWithRetry = async (): Promise<AsyncOperationResult<T>> => {
        try {
          loading.startLoading(loadingMessage);
          const data = await operation();

          const duration = Date.now() - startTime;
          loading.finishLoading();

          return {
            data,
            success: true,
            duration,
            retryAttempts,
          };
        } catch (error) {
          const currentError = error as Error;

          // Check if we should retry
          if (options.retry && retryAttempts < options.retry.maxAttempts) {
            retryAttempts++;

            // Calculate delay with optional exponential backoff
            let delay = options.retry.delay;
            if (options.retry.exponentialBackoff) {
              delay = delay * Math.pow(2, retryAttempts - 1);
            }

            loading.updateProgress(
              (retryAttempts / options.retry.maxAttempts) * 50, // 50% max progress during retries
              `Retrying... (${retryAttempts}/${options.retry.maxAttempts})`,
              "retry",
            );

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));

            return executeWithRetry();
          }

          // No more retries, return error result
          const duration = Date.now() - startTime;
          loading.finishLoading(currentError);

          return {
            success: false,
            error: currentError,
            duration,
            retryAttempts,
          };
        }
      };

      retryCountRef.current = 0;
      return executeWithRetry();
    },
    [loading, options],
  );

  return {
    ...loading,
    execute,
  };
}

/**
 * Hook for batch loading operations with progress tracking
 */
export function useBatchLoading<T>(options: LoadingOptions = {}) {
  const loading = useLoading({ ...options, trackProgress: true });

  const executeBatch = useCallback(
    async (
      operations: Array<() => Promise<T>>,
      loadingMessage?: string,
    ): Promise<AsyncOperationResult<T[]>> => {
      const startTime = Date.now();
      const results: T[] = [];
      const errors: Error[] = [];

      loading.startLoading(loadingMessage || "Processing batch...");

      try {
        for (let i = 0; i < operations.length; i++) {
          const operation = operations[i];
          const progress = ((i + 1) / operations.length) * 100;

          loading.updateProgress(
            progress,
            `Processing item ${i + 1} of ${operations.length}`,
            `batch-${i + 1}`,
          );

          try {
            const result = await operation();
            results.push(result);
          } catch (error) {
            errors.push(error as Error);
          }
        }

        const duration = Date.now() - startTime;
        const hasErrors = errors.length > 0;

        if (hasErrors) {
          const combinedError = new Error(
            `Batch operation completed with ${errors.length} errors: ${errors.map((e) => e.message).join("; ")}`,
          );
          loading.finishLoading(combinedError);

          return {
            data: results,
            success: false,
            error: combinedError,
            duration,
            retryAttempts: 0,
          };
        }

        loading.finishLoading();
        return {
          data: results,
          success: true,
          duration,
          retryAttempts: 0,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        loading.finishLoading(error as Error);

        return {
          success: false,
          error: error as Error,
          duration,
          retryAttempts: 0,
        };
      }
    },
    [loading],
  );

  return {
    ...loading,
    executeBatch,
  };
}

/**
 * Utility to simulate network delay for testing loading states
 */
export function createMockAsync<T>(
  data: T,
  delay: number = 1000,
  failureRate: number = 0,
): () => Promise<T> {
  return () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < failureRate) {
          reject(new Error("Mock operation failed"));
        } else {
          resolve(data);
        }
      }, delay);
    });
}

/**
 * Custom hook for async functions with automatic loading state
 * Use this instead of withLoading to comply with Rules of Hooks
 */
export function useAsyncFunction<TArgs extends unknown[], TReturn>(
  asyncFn: (...args: TArgs) => Promise<TReturn>,
  options: LoadingOptions = {},
) {
  const loading = useLoading(options);

  const execute = useCallback(
    async (...args: TArgs) => {
      loading.startLoading();
      try {
        const result = await asyncFn(...args);
        loading.finishLoading();
        return result;
      } catch (error) {
        loading.finishLoading(error as Error);
        throw error;
      }
    },
    [asyncFn, loading],
  );

  return {
    ...loading,
    execute,
  };
}

/**
 * @deprecated Use useAsyncFunction instead to comply with Rules of Hooks
 */
export function withLoading<TArgs extends unknown[], TReturn>(
  asyncFn: (...args: TArgs) => Promise<TReturn>,
  _options: LoadingOptions = {},
) {
  // This is a simplified fallback that doesn't use hooks
  return (...args: TArgs) => asyncFn(...args);
}

/**
 * Debounced loading state for rapid state changes
 */
export function useDebouncedLoading(
  delay: number = 300,
  options: LoadingOptions = {},
) {
  const loading = useLoading(options);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedStartLoading = useCallback(
    (message?: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        loading.startLoading(message);
      }, delay);
    },
    [loading, delay],
  );

  const debouncedFinishLoading = useCallback(
    (error?: Error) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        loading.finishLoading(error);
      }, delay);
    },
    [loading, delay],
  );

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...loading,
    startLoading: debouncedStartLoading,
    finishLoading: debouncedFinishLoading,
  };
}
