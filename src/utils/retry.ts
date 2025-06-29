/**
 * Retry utilities for handling failed operations
 * 
 * Provides configurable retry mechanisms with exponential backoff,
 * circuit breaker patterns, and comprehensive error handling.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay between retries (ms) */
  initialDelay: number;
  /** Use exponential backoff */
  exponentialBackoff?: boolean;
  /** Backoff multiplier */
  backoffMultiplier?: number;
  /** Maximum delay between retries (ms) */
  maxDelay?: number;
  /** Jitter to add randomness to delays */
  jitter?: boolean;
  /** Function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
  /** Callback when retry attempt is made */
  onRetry?: (attempt: number, error: Error) => void;
  /** Callback when max attempts exceeded */
  onMaxAttemptsExceeded?: (error: Error) => void;
}

export interface RetryState {
  /** Current attempt number */
  attempt: number;
  /** Whether currently retrying */
  isRetrying: boolean;
  /** Last error that occurred */
  lastError?: Error;
  /** Whether max attempts have been exceeded */
  maxAttemptsExceeded: boolean;
  /** Next retry delay (ms) */
  nextDelay: number;
  /** Total retry time elapsed (ms) */
  totalRetryTime: number;
}

export interface RetryResult<T> {
  /** Result data if successful */
  data?: T;
  /** Whether operation was successful */
  success: boolean;
  /** Final error if unsuccessful */
  error?: Error;
  /** Total attempts made */
  totalAttempts: number;
  /** Total time taken (ms) */
  totalTime: number;
  /** Whether max attempts were exceeded */
  maxAttemptsExceeded: boolean;
}

/**
 * Default retry configuration
 */
const defaultRetryConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  exponentialBackoff: true,
  backoffMultiplier: 2,
  maxDelay: 30000,
  jitter: true,
  isRetryable: () => true,
  onRetry: () => {},
  onMaxAttemptsExceeded: () => {}
};

/**
 * Calculate delay for next retry attempt
 */
function calculateDelay(
  attempt: number,
  config: Required<RetryConfig>
): number {
  let delay = config.initialDelay;

  if (config.exponentialBackoff) {
    delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  }

  // Apply maximum delay limit
  delay = Math.min(delay, config.maxDelay);

  // Add jitter to prevent thundering herd
  if (config.jitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }

  return Math.round(delay);
}

/**
 * Hook for retry functionality with state management
 */
export function useRetry(config: Partial<RetryConfig> = {}) {
  const fullConfig = { ...defaultRetryConfig, ...config };
  
  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: undefined,
    maxAttemptsExceeded: false,
    nextDelay: fullConfig.initialDelay,
    totalRetryTime: 0
  });

  const startTimeRef = useRef<number>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState({
      attempt: 0,
      isRetrying: false,
      lastError: undefined,
      maxAttemptsExceeded: false,
      nextDelay: fullConfig.initialDelay,
      totalRetryTime: 0
    });

    startTimeRef.current = undefined;
  }, [fullConfig.initialDelay]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<RetryResult<T>> => {
    const operationStartTime = Date.now();
    startTimeRef.current = operationStartTime;

    let currentAttempt = 0;
    let lastError: Error | undefined;

    while (currentAttempt < fullConfig.maxAttempts) {
      currentAttempt++;
      
      setState(prev => ({
        ...prev,
        attempt: currentAttempt,
        isRetrying: currentAttempt > 1
      }));

      try {
        const result = await operation();
        
        // Success - reset state and return result
        const totalTime = Date.now() - operationStartTime;
        reset();
        
        return {
          data: result,
          success: true,
          totalAttempts: currentAttempt,
          totalTime,
          maxAttemptsExceeded: false
        };
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable
        if (!fullConfig.isRetryable(lastError)) {
          setState(prev => ({
            ...prev,
            lastError,
            isRetrying: false
          }));
          
          return {
            success: false,
            error: lastError,
            totalAttempts: currentAttempt,
            totalTime: Date.now() - operationStartTime,
            maxAttemptsExceeded: false
          };
        }

        // Check if we should retry
        if (currentAttempt < fullConfig.maxAttempts) {
          const delay = calculateDelay(currentAttempt, fullConfig);
          
          setState(prev => ({
            ...prev,
            lastError,
            nextDelay: delay,
            totalRetryTime: Date.now() - operationStartTime
          }));

          // Call retry callback
          fullConfig.onRetry(currentAttempt, lastError);

          // Wait before next attempt
          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        }
      }
    }

    // Max attempts exceeded
    const totalTime = Date.now() - operationStartTime;
    
    setState(prev => ({
      ...prev,
      maxAttemptsExceeded: true,
      isRetrying: false,
      totalRetryTime: totalTime
    }));

    if (lastError) {
      fullConfig.onMaxAttemptsExceeded(lastError);
    }

    return {
      success: false,
      error: lastError!,
      totalAttempts: currentAttempt,
      totalTime,
      maxAttemptsExceeded: true
    };
  }, [fullConfig, reset]);

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
    executeWithRetry,
    reset
  };
}

/**
 * Simple retry function without state management
 */
export async function retry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const fullConfig = { ...defaultRetryConfig, ...config };
  const startTime = Date.now();

  let currentAttempt = 0;
  let lastError: Error | undefined;

  while (currentAttempt < fullConfig.maxAttempts) {
    currentAttempt++;

    try {
      const result = await operation();
      
      return {
        data: result,
        success: true,
        totalAttempts: currentAttempt,
        totalTime: Date.now() - startTime,
        maxAttemptsExceeded: false
      };
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (!fullConfig.isRetryable(lastError)) {
        return {
          success: false,
          error: lastError,
          totalAttempts: currentAttempt,
          totalTime: Date.now() - startTime,
          maxAttemptsExceeded: false
        };
      }

      // Check if we should retry
      if (currentAttempt < fullConfig.maxAttempts) {
        const delay = calculateDelay(currentAttempt, fullConfig);
        
        // Call retry callback
        fullConfig.onRetry(currentAttempt, lastError);

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Max attempts exceeded
  if (lastError) {
    fullConfig.onMaxAttemptsExceeded(lastError);
  }

  return {
    success: false,
    error: lastError!,
    totalAttempts: currentAttempt,
    totalTime: Date.now() - startTime,
    maxAttemptsExceeded: true
  };
}

/**
 * Circuit breaker pattern for preventing cascade failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private maxFailures: number = 5,
    private timeout: number = 60000, // 1 minute
    private monitoringPeriod: number = 120000 // 2 minutes
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN - operation blocked');
      }
    }

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.maxFailures) {
      this.state = 'open';
    }

    // Reset failure count after monitoring period
    setTimeout(() => {
      if (Date.now() - this.lastFailureTime >= this.monitoringPeriod) {
        this.failures = 0;
      }
    }, this.monitoringPeriod);
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  getFailureCount(): number {
    return this.failures;
  }

  reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }
}

/**
 * Higher-order function to add retry capability to any async function
 */
export function withRetry<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  config: Partial<RetryConfig> = {}
) {
  return async (...args: TArgs): Promise<RetryResult<TReturn>> => {
    return retry(() => fn(...args), config);
  };
}

/**
 * Common retry predicates for different error types
 */
export const retryPredicates = {
  /** Retry all errors */
  always: () => true,
  
  /** Never retry */
  never: () => false,
  
  /** Retry network errors */
  networkErrors: (error: Error) => {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('connection') ||
           message.includes('fetch');
  },
  
  /** Retry temporary errors */
  temporaryErrors: (error: Error) => {
    const message = error.message.toLowerCase();
    return message.includes('temporary') || 
           message.includes('busy') || 
           message.includes('retry') ||
           message.includes('rate limit');
  },
  
  /** Retry parser errors that might be transient */
  parserErrors: (error: Error) => {
    const message = error.message.toLowerCase();
    // Don't retry syntax or validation errors - they're permanent
    return !message.includes('invalid') && 
           !message.includes('syntax') && 
           !message.includes('malformed') &&
           !message.includes('validation');
  }
};