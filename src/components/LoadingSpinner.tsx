/**
 * Loading Spinner components for various loading states
 * 
 * Provides reusable loading indicators with customizable appearance,
 * sizes, and animation styles for different use cases.
 */

import React from 'react';

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'small' | 'medium' | 'large' | number;
  /** Loading message to display */
  message?: string;
  /** Color theme */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | string;
  /** Animation style */
  variant?: 'spin' | 'pulse' | 'dots' | 'bars' | 'card';
  /** Whether to show message below spinner */
  showMessage?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Whether to center the spinner */
  centered?: boolean;
  /** Overlay background */
  overlay?: boolean;
}

export interface ProgressSpinnerProps extends LoadingSpinnerProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Show progress text */
  showProgress?: boolean;
  /** Progress color */
  progressColor?: string;
  /** Background color */
  backgroundColor?: string;
}

export interface SkeletonProps {
  /** Width of skeleton */
  width?: string | number;
  /** Height of skeleton */
  height?: string | number;
  /** Skeleton variant */
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'table' | 'player';
  /** Number of lines for text variant */
  lines?: number;
  /** Animation style */
  animation?: 'wave' | 'pulse' | 'none';
  /** Custom CSS class */
  className?: string;
}

/**
 * Size configuration for spinners
 */
const sizeConfig = {
  small: 16,
  medium: 24,
  large: 32
};

/**
 * Color configuration
 */
const colorConfig = {
  primary: '#3498db',
  secondary: '#95a5a6',
  success: '#27ae60',
  warning: '#f39c12',
  error: '#e74c3c'
};

/**
 * Basic loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  color = 'primary',
  variant = 'spin',
  showMessage = true,
  className = '',
  centered = true,
  overlay = false
}) => {
  const spinnerSize = typeof size === 'number' ? size : sizeConfig[size];
  const spinnerColor = colorConfig[color as keyof typeof colorConfig] || color;

  const SpinnerComponent = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div 
            className="loading-pulse"
            style={{
              width: spinnerSize,
              height: spinnerSize,
              backgroundColor: spinnerColor
            }}
          />
        );

      case 'dots':
        return (
          <div className="loading-dots">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="loading-dot"
                style={{
                  width: spinnerSize / 3,
                  height: spinnerSize / 3,
                  backgroundColor: spinnerColor,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className="loading-bars">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="loading-bar"
                style={{
                  width: spinnerSize / 8,
                  height: spinnerSize,
                  backgroundColor: spinnerColor,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        );

      case 'card':
        return (
          <div className="loading-card-flip">
            <div 
              className="loading-card"
              style={{
                width: spinnerSize * 1.2,
                height: spinnerSize,
                borderColor: spinnerColor
              }}
            />
          </div>
        );

      default: // 'spin'
        return (
          <div 
            className="loading-spin"
            style={{
              width: spinnerSize,
              height: spinnerSize,
              borderColor: `${spinnerColor}33`,
              borderTopColor: spinnerColor
            }}
          />
        );
    }
  };

  const content = (
    <div className={`loading-spinner ${centered ? 'centered' : ''} ${className}`}>
      <SpinnerComponent />
      {showMessage && message && (
        <div className="loading-message">{message}</div>
      )}

      <style>{`
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .loading-spinner.centered {
          justify-content: center;
          min-height: 60px;
        }

        .loading-message {
          font-size: 14px;
          color: #666;
          text-align: center;
          margin-top: 8px;
        }

        .loading-spin {
          border: 2px solid;
          border-radius: 50%;
          animation: loading-spin-animation 1s linear infinite;
        }

        .loading-pulse {
          border-radius: 50%;
          animation: loading-pulse-animation 1.5s ease-in-out infinite;
        }

        .loading-dots {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .loading-dot {
          border-radius: 50%;
          animation: loading-dots-animation 1.4s ease-in-out infinite both;
        }

        .loading-bars {
          display: flex;
          gap: 2px;
          align-items: flex-end;
        }

        .loading-bar {
          animation: loading-bars-animation 1.2s ease-in-out infinite;
        }

        .loading-card-flip {
          perspective: 100px;
        }

        .loading-card {
          border: 2px solid;
          border-radius: 4px;
          animation: loading-card-animation 2s ease-in-out infinite;
        }

        @keyframes loading-spin-animation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes loading-pulse-animation {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        @keyframes loading-dots-animation {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        @keyframes loading-bars-animation {
          0%, 40%, 100% { transform: scaleY(0.4); }
          20% { transform: scaleY(1); }
        }

        @keyframes loading-card-animation {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }
      `}</style>
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
        <style>{`
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
        `}</style>
      </div>
    );
  }

  return content;
};

/**
 * Progress spinner with percentage display
 */
export const ProgressSpinner: React.FC<ProgressSpinnerProps> = ({
  progress,
  showProgress = true,
  progressColor = '#3498db',
  backgroundColor = '#ecf0f1',
  size = 'medium',
  message,
  className = '',
  ..._props
}) => {
  const spinnerSize = typeof size === 'number' ? size : sizeConfig[size];
  const strokeWidth = Math.max(2, spinnerSize / 12);
  const radius = (spinnerSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`progress-spinner ${className}`}>
      <div className="progress-spinner-container" style={{ width: spinnerSize, height: spinnerSize }}>
        <svg width={spinnerSize} height={spinnerSize} className="progress-svg">
          {/* Background circle */}
          <circle
            cx={spinnerSize / 2}
            cy={spinnerSize / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={spinnerSize / 2}
            cy={spinnerSize / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="progress-circle"
          />
        </svg>
        
        {showProgress && (
          <div className="progress-text" style={{ fontSize: Math.max(10, spinnerSize / 4) }}>
            {Math.round(progress)}%
          </div>
        )}
      </div>

      {message && <div className="progress-message">{message}</div>}

      <style>{`
        .progress-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .progress-spinner-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-svg {
          transform: rotate(-90deg);
        }

        .progress-circle {
          transition: stroke-dashoffset 0.3s ease;
        }

        .progress-text {
          position: absolute;
          font-weight: bold;
          color: #333;
        }

        .progress-message {
          font-size: 14px;
          color: #666;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

/**
 * Skeleton loading placeholder component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  lines = 1,
  animation = 'wave',
  className = ''
}) => {
  const getSkeletonStyle = () => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: '#f0f0f0',
      borderRadius: '4px'
    };

    switch (variant) {
      case 'circular':
        return {
          ...baseStyle,
          width: width || height || 40,
          height: height || width || 40,
          borderRadius: '50%'
        };

      case 'rectangular':
        return {
          ...baseStyle,
          width: width || '100%',
          height: height || 20
        };

      case 'card':
        return {
          ...baseStyle,
          width: width || 60,
          height: height || 80,
          borderRadius: '8px'
        };

      case 'table':
        return {
          ...baseStyle,
          width: width || '100%',
          height: height || 200,
          borderRadius: '8px'
        };

      case 'player':
        return {
          ...baseStyle,
          width: width || 100,
          height: height || 60,
          borderRadius: '8px'
        };

      default: // 'text'
        return {
          ...baseStyle,
          width: width || '100%',
          height: height || 16
        };
    }
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`skeleton-text ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`skeleton-line ${animation}`}
            style={{
              ...getSkeletonStyle(),
              width: i === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}

        <style>{`
          .skeleton-text {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .skeleton-line {
            position: relative;
            overflow: hidden;
          }

          .skeleton-line.wave::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.6),
              transparent
            );
            animation: skeleton-wave 1.5s ease-in-out infinite;
          }

          .skeleton-line.pulse {
            animation: skeleton-pulse 1.5s ease-in-out infinite;
          }

          @keyframes skeleton-wave {
            0% { left: -100%; }
            100% { left: 100%; }
          }

          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`skeleton ${animation} ${className}`}
      style={getSkeletonStyle()}
    >
      <style>{`
        .skeleton {
          position: relative;
          overflow: hidden;
        }

        .skeleton.wave::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: skeleton-wave 1.5s ease-in-out infinite;
        }

        .skeleton.pulse {
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        @keyframes skeleton-wave {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;