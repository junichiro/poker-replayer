import type { Meta, StoryObj } from '@storybook/react';

import { Controls, type ControlsPropsLegacy } from '../components/Controls';

// Action handlers for demonstration
const logAction = (actionName: string) => () => console.log(`Action: ${actionName}`);

const meta: Meta<ControlsPropsLegacy> = {
  title: 'Components/Controls',
  component: Controls,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Playback controls for poker hand replay with play, pause, previous, next, and reset controls.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isPlaying: {
      control: 'boolean',
      description: 'Whether the replay is currently playing',
    },
    currentActionIndex: {
      control: { type: 'number', min: -1 },
      description: 'Current action index in the replay (-1 means before first action)',
    },
    totalActions: {
      control: { type: 'number', min: 1 },
      description: 'Total number of actions in the replay',
    },
    onPlayPause: {
      action: 'play-pause',
      description: 'Called when play/pause button is clicked',
    },
    onPrevious: {
      action: 'previous',
      description: 'Called when previous button is clicked',
    },
    onNext: {
      action: 'next',
      description: 'Called when next button is clicked',
    },
    onReset: {
      action: 'reset',
      description: 'Called when reset button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state
export const Default: Story = {
  args: {
    isPlaying: false,
    currentActionIndex: 0,
    totalActions: 15,
    onPlayPause: logAction('play-pause'),
    onPrevious: logAction('previous'),
    onNext: logAction('next'),
    onReset: logAction('reset'),
  },
};

// Playing state
export const Playing: Story = {
  args: {
    ...Default.args,
    isPlaying: true,
    currentActionIndex: 5,
  },
};

// Paused state
export const Paused: Story = {
  args: {
    ...Default.args,
    isPlaying: false,
    currentActionIndex: 8,
  },
};

// At beginning
export const AtBeginning: Story = {
  args: {
    ...Default.args,
    isPlaying: false,
    currentActionIndex: -1,
  },
};

// At end
export const AtEnd: Story = {
  args: {
    ...Default.args,
    isPlaying: false,
    currentActionIndex: 14,
    totalActions: 15,
  },
};

// Middle of replay
export const MiddleOfReplay: Story = {
  args: {
    ...Default.args,
    isPlaying: true,
    currentActionIndex: 7,
    totalActions: 15,
  },
};

// Long replay example
export const LongReplay: Story = {
  args: {
    ...Default.args,
    currentActionIndex: 25,
    totalActions: 50,
    isPlaying: true,
  },
};

// Short replay example
export const ShortReplay: Story = {
  args: {
    ...Default.args,
    currentActionIndex: 2,
    totalActions: 5,
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    ...Default.args,
    currentActionIndex: 7,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click any control button to see interaction events in the Actions panel',
      },
    },
  },
};
