import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { ErrorBoundary, type ErrorFallbackProps } from '../components/ErrorBoundary';

// Component that throws an error for testing
const ErrorThrowingComponent = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>This component works fine!</div>;
};

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Error boundary component that catches JavaScript errors anywhere in the child component tree and displays a fallback UI.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Child components to wrap with error boundary',
    },
    fallback: {
      control: false,
      description: 'Custom fallback component to render when an error occurs',
    },
    onError: {
      action: 'error-caught',
      description: 'Called when an error is caught',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Working component story
export const WorkingComponent: Story = {
  render: args => (
    <ErrorBoundary {...args}>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Working Component</h3>
        <p>This component is working perfectly fine and will not trigger the error boundary.</p>
        <ErrorThrowingComponent shouldThrow={false} />
      </div>
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Normal operation with a working component',
      },
    },
  },
};

// Error caught story
export const ErrorCaught: Story = {
  render: args => (
    <ErrorBoundary {...args}>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Component That Will Error</h3>
        <p>This component will throw an error and trigger the error boundary.</p>
        <ErrorThrowingComponent
          shouldThrow={true}
          errorMessage="Something went wrong in the component!"
        />
      </div>
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error boundary catching and displaying error state',
      },
    },
  },
};

// Custom error message
export const CustomErrorMessage: Story = {
  render: args => (
    <ErrorBoundary {...args}>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Custom Error Scenario</h3>
        <ErrorThrowingComponent
          shouldThrow={true}
          errorMessage="Custom error message for demonstration"
        />
      </div>
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error boundary with a custom error message',
      },
    },
  },
};

// Poker-specific error scenarios
export const PokerParsingError: Story = {
  render: args => {
    const PokerParsingComponent = () => {
      throw new Error('Failed to parse hand history: Invalid format at line 15');
    };

    return (
      <ErrorBoundary {...args}>
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Poker Hand Parser</h3>
          <p>Attempting to parse hand history...</p>
          <PokerParsingComponent />
        </div>
      </ErrorBoundary>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Error boundary handling poker hand parsing errors',
      },
    },
  },
};

export const ReplayEngineError: Story = {
  render: args => {
    const ReplayEngineComponent = () => {
      throw new Error('Replay engine error: Unable to process action at index 23');
    };

    return (
      <ErrorBoundary {...args}>
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Poker Replay Engine</h3>
          <p>Starting hand replay...</p>
          <ReplayEngineComponent />
        </div>
      </ErrorBoundary>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Error boundary handling replay engine errors',
      },
    },
  },
};

// Network/API error simulation
export const NetworkError: Story = {
  render: args => {
    const NetworkComponent = () => {
      throw new Error('Network error: Failed to fetch hand history from server (HTTP 500)');
    };

    return (
      <ErrorBoundary {...args}>
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Hand History Loader</h3>
          <p>Loading hand history from server...</p>
          <NetworkComponent />
        </div>
      </ErrorBoundary>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Error boundary handling network/API errors',
      },
    },
  },
};

// JavaScript runtime error
export const RuntimeError: Story = {
  render: args => {
    const RuntimeErrorComponent = () => {
      const obj: any = null;
      return <div>{obj.someProperty.toString()}</div>; // This will throw "Cannot read property of null"
    };

    return (
      <ErrorBoundary {...args}>
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Component with Runtime Error</h3>
          <p>This component has a null reference error.</p>
          <RuntimeErrorComponent />
        </div>
      </ErrorBoundary>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Error boundary handling JavaScript runtime errors',
      },
    },
  },
};

// Custom fallback UI
export const CustomFallback: Story = {
  render: args => {
    const CustomFallbackComponent: React.FC<ErrorFallbackProps> = ({ error, retry, canRetry }) => (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          borderRadius: '12px',
          color: '#6c757d',
        }}
      >
        <h2 style={{ color: '#dc3545' }}>🎲 Poker Error</h2>
        <p>Oops! Something went wrong with the poker component.</p>
        <p style={{ fontSize: '12px', marginTop: '10px', fontFamily: 'monospace' }}>
          {error.message}
        </p>
        <p style={{ fontSize: '14px', marginTop: '20px' }}>
          Please try refreshing the page or contact support if the problem persists.
        </p>
        {canRetry && (
          <button
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
            onClick={retry}
          >
            Retry
          </button>
        )}
        <button
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    );

    return (
      <ErrorBoundary {...args} fallback={CustomFallbackComponent}>
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Component with Custom Fallback</h3>
          <ErrorThrowingComponent shouldThrow={true} errorMessage="Error with custom fallback UI" />
        </div>
      </ErrorBoundary>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Error boundary with custom fallback UI instead of default error message',
      },
    },
  },
};

// Multiple error boundaries
export const NestedErrorBoundaries: Story = {
  render: args => (
    <ErrorBoundary {...args}>
      <div style={{ padding: '20px', border: '2px solid #007bff', borderRadius: '8px' }}>
        <h3>Outer Error Boundary</h3>
        <p>This outer boundary will catch errors from inner components.</p>

        <ErrorBoundary>
          <div
            style={{
              padding: '15px',
              margin: '10px 0',
              border: '2px solid #28a745',
              borderRadius: '6px',
            }}
          >
            <h4>Inner Error Boundary</h4>
            <p>This inner boundary will catch its own errors first.</p>
            <ErrorThrowingComponent
              shouldThrow={true}
              errorMessage="Error caught by inner boundary"
            />
          </div>
        </ErrorBoundary>

        <div
          style={{
            padding: '15px',
            margin: '10px 0',
            border: '1px solid #ccc',
            borderRadius: '6px',
          }}
        >
          <h4>Working Component</h4>
          <ErrorThrowingComponent shouldThrow={false} />
        </div>
      </div>
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Nested error boundaries showing how errors are caught at different levels',
      },
    },
  },
};

// Complex poker component simulation
export const ComplexPokerComponent: Story = {
  render: args => {
    const ComplexPokerTable = () => {
      const players = ['Alice', 'Bob', 'Charlie'];
      const actions = ['fold', 'call', 'raise'];

      // Simulate a complex component that might fail
      const processingStep = Math.random();
      if (processingStep > 0.7) {
        throw new Error('Poker table rendering failed: Invalid player state');
      }

      return (
        <div style={{ padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
          <h4>🎲 Poker Table Simulation</h4>
          <p>Players: {players.join(', ')}</p>
          <p>Available actions: {actions.join(', ')}</p>
          <p>Processing step: {processingStep.toFixed(3)}</p>
          <p style={{ color: '#28a745' }}>✅ Table rendered successfully!</p>
        </div>
      );
    };

    return (
      <ErrorBoundary {...args}>
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Complex Poker Component</h3>
          <p>This component has a 30% chance of failing to simulate real-world scenarios.</p>
          <ComplexPokerTable />
        </div>
      </ErrorBoundary>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Complex poker component with random failure simulation (refresh to see different outcomes)',
      },
    },
  },
};

// Default story
export const Default: Story = {
  render: args => (
    <ErrorBoundary {...args}>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Protected Component</h3>
        <p>This component is wrapped in an error boundary for protection.</p>
        <ErrorThrowingComponent shouldThrow={false} />
      </div>
    </ErrorBoundary>
  ),
};
