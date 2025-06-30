/**
 * Specialized Error Boundary for parser-related errors
 *
 * Provides specific error handling for PokerStars hand history parsing
 * with detailed error context and recovery options.
 */

import React from "react";
import { ErrorBoundary, ErrorFallbackProps } from "./ErrorBoundary";
export interface ParserErrorDetails {
  line?: number;
  context?: string;
  column?: number;
  expected?: string;
  actual?: string;
}

export interface ParserErrorFallbackProps extends ErrorFallbackProps {
  /** Original hand history text for retry */
  handHistory?: string;
  /** Parser-specific error details */
  parserError?: ParserErrorDetails;
}

/**
 * Specialized error fallback for parser errors
 */
/**
 * Type guard to check if an unknown value is a ParserErrorDetails
 */
function isParserErrorDetails(value: unknown): value is ParserErrorDetails {
  return (
    typeof value === "object" &&
    value !== null &&
    (typeof (value as ParserErrorDetails).line === "number" ||
      typeof (value as ParserErrorDetails).line === "undefined") &&
    (typeof (value as ParserErrorDetails).context === "string" ||
      typeof (value as ParserErrorDetails).context === "undefined")
  );
}

const ParserErrorFallback: React.FC<ParserErrorFallbackProps> = ({
  error,
  retry,
  canRetry,
  boundaryName: _boundaryName,
  handHistory,
  parserError,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Use type guard to safely access parser error properties
  const safeParserError = isParserErrorDetails(parserError)
    ? parserError
    : undefined;

  const handleCopyHandHistory = () => {
    if (handHistory && navigator.clipboard) {
      navigator.clipboard.writeText(handHistory);
    }
  };

  const handleDownloadError = () => {
    const errorData = {
      error: error.message,
      handHistory,
      parserError,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    const blob = new Blob([JSON.stringify(errorData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parser-error-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getErrorSuggestions = () => {
    const message = error.message.toLowerCase();
    const suggestions: string[] = [];

    if (message.includes("invalid header")) {
      suggestions.push(
        "Ensure the hand history starts with a valid PokerStars header",
      );
      suggestions.push(
        "Check that the tournament or cash game information is present",
      );
    }

    if (message.includes("player") || message.includes("seat")) {
      suggestions.push("Verify all player information is correctly formatted");
      suggestions.push("Check that seat numbers are valid and consecutive");
    }

    if (message.includes("action") || message.includes("betting")) {
      suggestions.push("Ensure all betting actions are properly formatted");
      suggestions.push("Check that bet amounts are valid numbers");
    }

    if (message.includes("card") || message.includes("hole")) {
      suggestions.push('Verify card formats (e.g., "As", "Kh", "2c")');
      suggestions.push("Check that all cards are valid playing cards");
    }

    if (message.includes("pot") || message.includes("showdown")) {
      suggestions.push(
        "Ensure pot calculations and showdown information is complete",
      );
      suggestions.push("Check that winner information is properly formatted");
    }

    if (suggestions.length === 0) {
      suggestions.push(
        "Try copying the hand history from PokerStars client again",
      );
      suggestions.push("Check for any unusual characters or formatting");
      suggestions.push("Ensure the hand history is complete and not truncated");
    }

    return suggestions;
  };

  return (
    <div className="parser-error-boundary">
      <div className="error-header">
        <h2>Hand History Parsing Failed</h2>
        <p className="error-description">
          We encountered an error while parsing your PokerStars hand history.
          This usually happens when the hand history format is unexpected or
          contains invalid data.
        </p>
      </div>

      <div className="error-details-section">
        <div className="error-summary">
          <h3>Error Details</h3>
          <div className="error-info">
            <p>
              <strong>Error:</strong> {error.message}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {new Date(error.timestamp).toLocaleString()}
            </p>
            {safeParserError && (
              <>
                {safeParserError.line && (
                  <p>
                    <strong>Line:</strong> {safeParserError.line}
                  </p>
                )}
                {safeParserError.context && (
                  <p>
                    <strong>Context:</strong> {safeParserError.context}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="error-suggestions">
          <h3>Suggestions</h3>
          <ul>
            {getErrorSuggestions().map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>

      {handHistory && (
        <div className="hand-history-section">
          <h3>Hand History</h3>
          <div className="hand-history-preview">
            <pre>
              {handHistory.substring(0, 500)}
              {handHistory.length > 500 ? "..." : ""}
            </pre>
          </div>
          <div className="hand-history-actions">
            <button onClick={handleCopyHandHistory} className="copy-button">
              Copy Hand History
            </button>
            <button onClick={handleDownloadError} className="download-button">
              Download Error Report
            </button>
          </div>
        </div>
      )}

      {isDevelopment && error.stack && (
        <details className="debug-section">
          <summary>Debug Information</summary>
          <div className="debug-content">
            <h4>Stack Trace</h4>
            <pre className="stack-trace">{error.stack}</pre>
            {safeParserError && (
              <>
                <h4>Parser Error</h4>
                <pre>{JSON.stringify(safeParserError, null, 2)}</pre>
              </>
            )}
          </div>
        </details>
      )}

      <div className="error-actions">
        {canRetry && (
          <button onClick={retry} className="retry-button">
            Try Parsing Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="reload-button"
        >
          Start Over
        </button>
      </div>

      <style>{`
        .parser-error-boundary {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fdf2f2;
          border: 1px solid #e74c3c;
          border-radius: 8px;
          font-family: Arial, sans-serif;
          color: #721c24;
        }

        .error-header h2 {
          color: #e74c3c;
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 1.5em;
        }

        .error-description {
          margin-bottom: 20px;
          line-height: 1.5;
          color: #555;
        }

        .error-details-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .error-details-section {
            grid-template-columns: 1fr;
          }
        }

        .error-summary, .error-suggestions {
          background-color: #f8f8f8;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #ddd;
        }

        .error-summary h3, .error-suggestions h3 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #333;
          font-size: 1.1em;
        }

        .error-info p {
          margin: 5px 0;
          word-break: break-word;
        }

        .error-suggestions ul {
          margin: 0;
          padding-left: 20px;
        }

        .error-suggestions li {
          margin: 8px 0;
          line-height: 1.4;
        }

        .hand-history-section {
          margin: 20px 0;
          background-color: #f8f8f8;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #ddd;
        }

        .hand-history-section h3 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #333;
        }

        .hand-history-preview {
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 10px;
          max-height: 200px;
          overflow-y: auto;
        }

        .hand-history-preview pre {
          margin: 0;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .hand-history-actions {
          display: flex;
          gap: 10px;
        }

        .copy-button, .download-button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s;
        }

        .copy-button {
          background-color: #3498db;
          color: white;
        }

        .copy-button:hover {
          background-color: #2980b9;
        }

        .download-button {
          background-color: #95a5a6;
          color: white;
        }

        .download-button:hover {
          background-color: #7f8c8d;
        }

        .debug-section {
          margin: 20px 0;
          background-color: #f4f4f4;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        .debug-section summary {
          cursor: pointer;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .debug-content h4 {
          margin: 15px 0 5px 0;
          color: #333;
        }

        .stack-trace {
          background-color: #fff;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 11px;
          line-height: 1.3;
          border: 1px solid #ddd;
        }

        .error-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }

        .retry-button, .reload-button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: background-color 0.2s;
        }

        .retry-button {
          background-color: #27ae60;
          color: white;
        }

        .retry-button:hover {
          background-color: #229954;
        }

        .reload-button {
          background-color: #3498db;
          color: white;
        }

        .reload-button:hover {
          background-color: #2980b9;
        }
      `}</style>
    </div>
  );
};

/**
 * Parser-specific Error Boundary component
 */
export interface ParserErrorBoundaryProps {
  children: React.ReactNode;
  handHistory?: string;
  onRetry?: () => void;
  className?: string;
}

export const ParserErrorBoundary: React.FC<ParserErrorBoundaryProps> = ({
  children,
  handHistory,
  onRetry,
  className,
}) => {
  const customFallback = React.useCallback(
    (props: any) => (
      <ParserErrorFallback
        {...props}
        handHistory={handHistory}
        parserError={props.error?.parserError}
      />
    ),
    [handHistory],
  );

  return (
    <ErrorBoundary
      name="ParserErrorBoundary"
      fallback={customFallback}
      onRetry={onRetry}
      maxRetries={3}
      enableLogging={true}
      enableRetry={true}
    >
      <div className={className}>{children}</div>
    </ErrorBoundary>
  );
};

export default ParserErrorBoundary;
