import type { Meta, StoryObj } from '@storybook/react';

// Action handlers for demonstration
const logAction = (actionName: string) => () => console.log(`Action: ${actionName}`);

import { Controls } from '../components/Controls';

const meta: Meta<typeof Controls> = {
  title: 'Components/Controls',
  component: Controls,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Playback controls for poker hand replay with play, pause, step, and speed controls.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isPlaying: {
      control: 'boolean',
      description: 'Whether the replay is currently playing',
    },
    canPlay: {
      control: 'boolean',
      description: 'Whether play/pause is enabled',
    },
    canStepBack: {
      control: 'boolean',
      description: 'Whether stepping backward is enabled',
    },
    canStepForward: {
      control: 'boolean',
      description: 'Whether stepping forward is enabled',
    },
    currentStep: {
      control: { type: 'number', min: 0, max: 20 },
      description: 'Current step in the replay',
    },
    totalSteps: {
      control: { type: 'number', min: 1, max: 30 },
      description: 'Total number of steps in the replay',
    },
    speed: {
      control: { type: 'select' },
      options: [0.5, 1, 1.5, 2, 3],
      description: 'Playback speed multiplier',
    },
    showSpeedControl: {
      control: 'boolean',
      description: 'Whether to show speed control slider',
    },
    showStepInfo: {
      control: 'boolean',
      description: 'Whether to show step counter',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'minimal'],
      description: 'Visual style variant',
    },
    onPlay: {
      action: 'play',
      description: 'Called when play button is clicked',
    },
    onPause: {
      action: 'pause',
      description: 'Called when pause button is clicked',
    },
    onStepBack: {
      action: 'step-back',
      description: 'Called when step back button is clicked',
    },
    onStepForward: {
      action: 'step-forward',
      description: 'Called when step forward button is clicked',
    },
    onReset: {
      action: 'reset',
      description: 'Called when reset button is clicked',
    },
    onSpeedChange: {
      action: 'speed-change',
      description: 'Called when speed is changed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state
export const Default: Story = {
  args: {
    isPlaying: false,
    canPlay: true,
    canStepBack: false,
    canStepForward: true,
    currentStep: 0,
    totalSteps: 15,
    speed: 1,
    showSpeedControl: true,
    showStepInfo: true,
    variant: 'default',
    onPlay: logAction('play'),
    onPause: logAction('pause'),
    onStepBack: logAction('step-back'),
    onStepForward: logAction('step-forward'),
    onReset: logAction('reset'),
    onSpeedChange: logAction('speed-change'),
  },
};

// Playing state
export const Playing: Story = {
  args: {
    ...Default.args,
    isPlaying: true,
    canStepBack: true,
    currentStep: 5,
  },
};

// Paused state
export const Paused: Story = {
  args: {
    ...Default.args,
    isPlaying: false,
    canStepBack: true,
    canStepForward: true,
    currentStep: 8,
  },
};

// At beginning
export const AtBeginning: Story = {
  args: {
    ...Default.args,
    isPlaying: false,
    canStepBack: false,
    canStepForward: true,
    currentStep: 0,
  },
};

// At end
export const AtEnd: Story = {
  args: {
    ...Default.args,
    isPlaying: false,
    canPlay: false,
    canStepBack: true,
    canStepForward: false,
    currentStep: 15,
    totalSteps: 15,
  },
};

// Middle of replay
export const MiddleOfReplay: Story = {
  args: {
    ...Default.args,
    isPlaying: true,
    canStepBack: true,
    canStepForward: true,
    currentStep: 7,
    totalSteps: 15,
  },
};

// Speed variations
export const SlowSpeed: Story = {
  args: {
    ...Default.args,
    speed: 0.5,
    currentStep: 3,
  },
};

export const FastSpeed: Story = {
  args: {
    ...Default.args,
    speed: 2,
    currentStep: 3,
  },
};

export const VeryFastSpeed: Story = {
  args: {
    ...Default.args,
    speed: 3,
    currentStep: 3,
  },
};

// Variant styles
export const CompactVariant: Story = {
  args: {
    ...Default.args,
    variant: 'compact',
    showSpeedControl: false,
    currentStep: 5,
  },
};

export const MinimalVariant: Story = {
  args: {
    ...Default.args,
    variant: 'minimal',
    showSpeedControl: false,
    showStepInfo: false,
    currentStep: 5,
  },
};

// Without optional controls
export const WithoutSpeedControl: Story = {
  args: {
    ...Default.args,
    showSpeedControl: false,
    currentStep: 5,
  },
};

export const WithoutStepInfo: Story = {
  args: {
    ...Default.args,
    showStepInfo: false,
    currentStep: 5,
  },
};

export const MinimalControls: Story = {
  args: {
    ...Default.args,
    showSpeedControl: false,
    showStepInfo: false,
    currentStep: 5,
  },
};

// Long replay example
export const LongReplay: Story = {
  args: {
    ...Default.args,
    currentStep: 25,
    totalSteps: 50,
    isPlaying: true,
    canStepBack: true,
    canStepForward: true,
  },
};

// Short replay example
export const ShortReplay: Story = {
  args: {
    ...Default.args,
    currentStep: 2,
    totalSteps: 5,
    canStepBack: true,
    canStepForward: true,
  },
};

// Different speeds showcase
export const SpeedShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>0.5x Speed</h3>
        <Controls
          isPlaying={true}
          canPlay={true}
          canStepBack={true}
          canStepForward={true}
          currentStep={3}
          totalSteps={10}
          speed={0.5}
          showSpeedControl={true}
          showStepInfo={true}
          onPlay={logAction('play-slow')}
          onPause={logAction('pause-slow')}
          onStepBack={logAction('step-back-slow')}
          onStepForward={logAction('step-forward-slow')}
          onReset={logAction('reset-slow')}
          onSpeedChange={logAction('speed-change-slow')}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>1x Speed (Normal)</h3>
        <Controls
          isPlaying={true}
          canPlay={true}
          canStepBack={true}
          canStepForward={true}
          currentStep={3}
          totalSteps={10}
          speed={1}
          showSpeedControl={true}
          showStepInfo={true}
          onPlay={logAction('play-normal')}
          onPause={logAction('pause-normal')}
          onStepBack={logAction('step-back-normal')}
          onStepForward={logAction('step-forward-normal')}
          onReset={logAction('reset-normal')}
          onSpeedChange={logAction('speed-change-normal')}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>2x Speed</h3>
        <Controls
          isPlaying={true}
          canPlay={true}
          canStepBack={true}
          canStepForward={true}
          currentStep={3}
          totalSteps={10}
          speed={2}
          showSpeedControl={true}
          showStepInfo={true}
          onPlay={logAction('play-fast')}
          onPause={logAction('pause-fast')}
          onStepBack={logAction('step-back-fast')}
          onStepForward={logAction('step-forward-fast')}
          onReset={logAction('reset-fast')}
          onSpeedChange={logAction('speed-change-fast')}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different playback speeds',
      },
    },
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    ...Default.args,
    currentStep: 5,
    canStepBack: true,
    canStepForward: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Try clicking the controls to see interaction events in the Actions panel',
      },
    },
  },
};
