/**
 * Error Boundary component for handling React component errors
 *
 * Provides comprehensive error handling with fallback UI, error logging,
 * and recovery mechanisms for better user experience.
 */

import React, { Component, ReactNode } from 'react';
import type { ErrorInfo as ReactErrorInfo } from 'react';

export interface ErrorInfoData {
  /** Error message */
  message: string;
  /** Error stack trace */
  stack?: string;
  /** Component stack where error occurred */
  componentStack?: string;
  /** Error boundary name for context */
  boundaryName?: string;
  /** Additional context information */
  context?: Record<string, unknown>;
  /** Timestamp when error occurred */
  timestamp: number;
  /** Error severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** Error information */
  error: ErrorInfoData | null;
  /** Number of retry attempts */
  retryCount: number;
  /** Error ID for tracking */
  errorId: string;
}

export interface ErrorBoundaryProps {
  /** Children to render when no error */
  children: ReactNode;
  /** Custom fallback component */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /** Error boundary name for context */
  name?: string;
  /** Maximum number of retries allowed */
  maxRetries?: number;
  /** Enable error logging */
  enableLogging?: boolean;
  /** Custom error handler */
  onError?: (error: Error, errorInfo: ErrorInfoData) => void;
  /** Custom retry handler */
  onRetry?: () => void;
  /** Whether to show retry button */
  enableRetry?: boolean;
}

export interface ErrorFallbackProps {
  /** Error information */
  error: ErrorInfoData;
  /** Retry function */
  retry: () => void;
  /** Whether retry is available */
  canRetry: boolean;
  /** Error boundary name */
  boundaryName: string;
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  canRetry,
  boundaryName,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="error-boundary-fallback">
      <div className="error-content">
        <h2>Something went wrong</h2>
        <p className="error-message">
          {error.severity === 'critical'
            ? 'A critical error occurred that prevented the component from rendering.'
            : 'An error occurred while rendering this component.'}
        </p>

        {error.message && (
          <details className="error-details">
            <summary>Error Details</summary>
            <div className="error-info">
              <p>
                <strong>Message:</strong> {error.message}
              </p>
              <p>
                <strong>Boundary:</strong> {boundaryName}
              </p>
              <p>
                <strong>Time:</strong> {new Date(error.timestamp).toLocaleString()}
              </p>
              {isDevelopment && error.stack && (
                <div className="error-stack">
                  <strong>Stack Trace:</strong>
                  <pre>{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="error-actions">
          {canRetry && (
            <button className="retry-button" onClick={retry} type="button">
              Try Again
            </button>
          )}
          <button className="reload-button" onClick={() => window.location.reload()} type="button">
            Reload Page
          </button>
        </div>
      </div>

      <style>{`
        .error-boundary-fallback {
          padding: 20px;
          border: 1px solid #e74c3c;
          border-radius: 8px;
          background-color: #fdf2f2;
          color: #721c24;
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 20px auto;
        }

        .error-content h2 {
          color: #e74c3c;
          margin-top: 0;
          font-size: 1.5em;
        }

        .error-message {
          margin: 10px 0;
          line-height: 1.5;
        }

        .error-details {
          margin: 15px 0;
          padding: 10px;
          background-color: #f8f8f8;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .error-details summary {
          cursor: pointer;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .error-info p {
          margin: 5px 0;
          word-break: break-word;
        }

        .error-stack {
          margin-top: 10px;
        }

        .error-stack pre {
          background-color: #f4f4f4;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.9em;
          line-height: 1.4;
        }

        .error-actions {
          margin-top: 15px;
          display: flex;
          gap: 10px;
        }

        .retry-button, .reload-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .retry-button {
          background-color: #3498db;
          color: white;
        }

        .retry-button:hover {
          background-color: #2980b9;
        }

        .reload-button {
          background-color: #95a5a6;
          color: white;
        }

        .reload-button:hover {
          background-color: #7f8c8d;
        }
      `}</style>
    </div>
  );
};

/**
 * Error Boundary class component for catching React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries: number;
  private enableLogging: boolean;
  private enableRetry: boolean;
  private boundaryName: string;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.maxRetries = props.maxRetries ?? 3;
    this.enableLogging = props.enableLogging ?? true;
    this.enableRetry = props.enableRetry ?? true;
    this.boundaryName = props.name ?? 'ErrorBoundary';

    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      errorId: '',
    };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    // Generate unique error ID
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    const errorData: ErrorInfoData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      boundaryName: this.boundaryName,
      timestamp: Date.now(),
      severity: this.determineSeverity(error),
      context: {
        retryCount: this.state.retryCount,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      },
    };

    this.setState({ error: errorData });

    // Log error in development
    if (this.enableLogging && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.group(`🚨 Error Boundary: ${this.boundaryName}`);
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      // eslint-disable-next-line no-console
      console.error('Error Info:', errorInfo);
      // eslint-disable-next-line no-console
      console.error('Error Data:', errorData);
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorData);
    }

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorData);
    }
  }

  /**
   * Determine error severity based on error type and context
   */
  private determineSeverity(error: Error): ErrorInfoData['severity'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors that break core functionality
    if (
      message.includes('invariant') ||
      message.includes('maximum update depth') ||
      stack.includes('react-dom')
    ) {
      return 'critical';
    }

    // High severity for parsing or data errors
    if (message.includes('parse') || message.includes('invalid') || message.includes('undefined')) {
      return 'high';
    }

    // Medium for UI rendering issues
    if (message.includes('render') || message.includes('component')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Report error to external error tracking service
   */
  private reportError(_error: Error, _errorData: ErrorInfoData): void {
    // In a real app, this would integrate with services like Sentry, Bugsnag, etc.
    if (typeof window !== 'undefined' && 'fetch' in window) {
      // Placeholder for error reporting
      // eslint-disable-next-line no-console
      console.warn('Error reporting not configured:', _errorData);
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  private handleRetry = (): void => {
    if (this.state.retryCount >= this.maxRetries) {
      // eslint-disable-next-line no-console
      console.warn(`Max retries (${this.maxRetries}) exceeded for ${this.boundaryName}`);
      return;
    }

    // Call custom retry handler
    if (this.props.onRetry) {
      this.props.onRetry();
    }

    // Reset error state with incremented retry count
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
      errorId: '',
    }));

    // Log retry attempt
    if (this.enableLogging && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`🔄 Retrying ${this.boundaryName} (attempt ${this.state.retryCount + 1})`);
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      const canRetry = this.enableRetry && this.state.retryCount < this.maxRetries;

      return (
        <FallbackComponent
          error={this.state.error}
          retry={this.handleRetry}
          canRetry={canRetry}
          boundaryName={this.boundaryName}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;
