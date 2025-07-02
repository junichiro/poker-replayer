import type { Meta, StoryObj } from '@storybook/react';

// Action handlers for demonstration
const logAction = (actionName: string) => () => console.log(`Action: ${actionName}`);

import { ActionHistory } from '../components/ActionHistory';
import type { Action } from '../types';

const meta: Meta<typeof ActionHistory> = {
  title: 'Components/ActionHistory',
  component: ActionHistory,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays the chronological list of actions in a poker hand with highlighting for current action.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    actions: {
      control: 'object',
      description: 'Array of poker actions to display',
    },
    currentActionIndex: {
      control: { type: 'number', min: -1, max: 20 },
      description: 'Index of the currently highlighted action (-1 for none)',
    },
    visible: {
      control: 'boolean',
      description: 'Whether the action history is visible',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names',
    },
    onActionClick: {
      action: 'action-click',
      description: 'Called when an action is clicked',
    },
    enableVirtualization: {
      control: 'boolean',
      description: 'Enable virtualization for long action lists',
    },
    itemHeight: {
      control: { type: 'number', min: 20, max: 60 },
      description: 'Height of each action item in pixels',
    },
    maxHeight: {
      control: { type: 'number', min: 100, max: 500 },
      description: 'Maximum height of the action list container',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample actions for stories
const basicActions: Action[] = [
  { index: 0, street: 'preflop', type: 'blind', player: 'Player2', amount: 10 },
  { index: 1, street: 'preflop', type: 'blind', player: 'Player3', amount: 20 },
  { index: 2, street: 'preflop', type: 'deal', cards: ['As', 'Kh'] },
  { index: 3, street: 'preflop', type: 'fold', player: 'Player4' },
  { index: 4, street: 'preflop', type: 'call', player: 'Player5', amount: 20 },
  { index: 5, street: 'preflop', type: 'raise', player: 'Player1', amount: 80 },
  { index: 6, street: 'preflop', type: 'fold', player: 'Player2' },
  { index: 7, street: 'preflop', type: 'call', player: 'Player3', amount: 60 },
  { index: 8, street: 'preflop', type: 'call', player: 'Player5', amount: 60 },
  { index: 9, street: 'flop', type: 'deal', cards: ['Ah', '7s', '2c'] },
  { index: 10, street: 'flop', type: 'check', player: 'Player3' },
  { index: 11, street: 'flop', type: 'check', player: 'Player5' },
  { index: 12, street: 'flop', type: 'bet', player: 'Player1', amount: 150 },
  { index: 13, street: 'flop', type: 'fold', player: 'Player3' },
  { index: 14, street: 'flop', type: 'call', player: 'Player5', amount: 150 },
];

const tournamentActions: Action[] = [
  { index: 0, street: 'preflop', type: 'blind', player: 'Villain1', amount: 50 },
  { index: 1, street: 'preflop', type: 'blind', player: 'Villain2', amount: 100 },
  { index: 2, street: 'preflop', type: 'deal', cards: ['Qh', 'Qd'] },
  { index: 3, street: 'preflop', type: 'fold', player: 'Villain3' },
  { index: 4, street: 'preflop', type: 'raise', player: 'Villain4', amount: 300 },
  { index: 5, street: 'preflop', type: 'fold', player: 'Villain5' },
  { index: 6, street: 'preflop', type: 'fold', player: 'Villain6' },
  { index: 7, street: 'preflop', type: 'fold', player: 'Villain7' },
  { index: 8, street: 'preflop', type: 'fold', player: 'Villain8' },
  { index: 9, street: 'preflop', type: 'raise', player: 'Hero', amount: 900 },
  { index: 10, street: 'preflop', type: 'fold', player: 'Villain1' },
  { index: 11, street: 'preflop', type: 'fold', player: 'Villain2' },
  { index: 12, street: 'preflop', type: 'call', player: 'Villain4', amount: 600 },
  { index: 13, street: 'flop', type: 'deal', cards: ['2s', '8c', 'Qc'] },
  { index: 14, street: 'flop', type: 'check', player: 'Villain4' },
  { index: 15, street: 'flop', type: 'bet', player: 'Hero', amount: 1200 },
  { index: 16, street: 'flop', type: 'call', player: 'Villain4', amount: 1200 },
  { index: 17, street: 'turn', type: 'deal', cards: ['9h'] },
  { index: 18, street: 'turn', type: 'check', player: 'Villain4' },
  { index: 19, street: 'turn', type: 'bet', player: 'Hero', amount: 2400, isAllIn: true },
  { index: 20, street: 'turn', type: 'call', player: 'Villain4', amount: 2400, isAllIn: true },
  { index: 21, street: 'river', type: 'deal', cards: ['7d'] },
  { index: 22, street: 'showdown', type: 'show', player: 'Hero', cards: ['Qh', 'Qd'] },
  { index: 23, street: 'showdown', type: 'show', player: 'Villain4', cards: ['Ac', 'Tc'] },
  { index: 24, street: 'showdown', type: 'collected', player: 'Hero', amount: 9000 },
];

const longActionList: Action[] = Array.from({ length: 100 }, (_, i) => ({
  index: i,
  street:
    i < 20 ? 'preflop' : i < 40 ? 'flop' : i < 60 ? 'turn' : i < 80 ? 'river' : ('showdown' as any),
  type: i % 4 === 0 ? 'bet' : i % 4 === 1 ? 'call' : i % 4 === 2 ? 'raise' : ('fold' as any),
  player: `Player${(i % 6) + 1}`,
  amount: i % 4 !== 3 ? (i + 1) * 10 : undefined,
}));

// Basic stories
export const Default: Story = {
  args: {
    actions: basicActions,
    currentActionIndex: 5,
    visible: true,
    onActionClick: logAction('action-click'),
    enableVirtualization: false,
    itemHeight: 32,
    maxHeight: 300,
  },
};

export const NoCurrentAction: Story = {
  args: {
    ...Default.args,
    currentActionIndex: -1,
  },
};

export const FirstAction: Story = {
  args: {
    ...Default.args,
    currentActionIndex: 0,
  },
};

export const LastAction: Story = {
  args: {
    ...Default.args,
    currentActionIndex: basicActions.length - 1,
  },
};

// Tournament example
export const TournamentActions: Story = {
  args: {
    ...Default.args,
    actions: tournamentActions,
    currentActionIndex: 15,
    maxHeight: 400,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tournament hand with preflop 3-bet, flop continuation betting, and turn all-in',
      },
    },
  },
};

// Long action list with virtualization
export const LongActionList: Story = {
  args: {
    ...Default.args,
    actions: longActionList,
    currentActionIndex: 45,
    enableVirtualization: true,
    maxHeight: 250,
  },
  parameters: {
    docs: {
      description: {
        story: 'Long action list demonstrating virtualization for performance with many actions',
      },
    },
  },
};

// Different heights
export const CompactHeight: Story = {
  args: {
    ...Default.args,
    itemHeight: 24,
    maxHeight: 200,
    currentActionIndex: 8,
  },
};

export const ComfortableHeight: Story = {
  args: {
    ...Default.args,
    itemHeight: 40,
    maxHeight: 350,
    currentActionIndex: 8,
  },
};

// Street-by-street examples
export const PreflopOnly: Story = {
  args: {
    ...Default.args,
    actions: basicActions.filter(action => action.street === 'preflop'),
    currentActionIndex: 3,
  },
};

export const FlopActions: Story = {
  args: {
    ...Default.args,
    actions: basicActions.filter(action => action.street === 'flop'),
    currentActionIndex: 2,
  },
};

// Visibility states
export const Hidden: Story = {
  args: {
    ...Default.args,
    visible: false,
  },
};

// Without click handler
export const ReadOnly: Story = {
  args: {
    ...Default.args,
    currentActionIndex: 10,
    onActionClick: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only mode without click interactions',
      },
    },
  },
};

// Different action types showcase
export const ActionTypesShowcase: Story = {
  render: () => {
    const showcaseActions: Action[] = [
      { index: 0, street: 'preflop', type: 'blind', player: 'Player1', amount: 10 },
      { index: 1, street: 'preflop', type: 'blind', player: 'Player2', amount: 20 },
      { index: 2, street: 'preflop', type: 'deal', cards: ['As', 'Kh'] },
      { index: 3, street: 'preflop', type: 'fold', player: 'Player3' },
      { index: 4, street: 'preflop', type: 'call', player: 'Player4', amount: 20 },
      { index: 5, street: 'preflop', type: 'raise', player: 'Player5', amount: 80 },
      { index: 6, street: 'preflop', type: 'bet', player: 'Player1', amount: 200, isAllIn: true },
      { index: 7, street: 'flop', type: 'check', player: 'Player2' },
      { index: 8, street: 'turn', type: 'timeout', player: 'Player3', reason: 'disconnected' },
      { index: 9, street: 'river', type: 'uncalled', amount: 50 },
      { index: 10, street: 'showdown', type: 'show', player: 'Player1', cards: ['As', 'Kh'] },
      { index: 11, street: 'showdown', type: 'muck', player: 'Player2' },
      { index: 12, street: 'showdown', type: 'collected', player: 'Player1', amount: 450 },
    ];

    return (
      <ActionHistory
        actions={showcaseActions}
        currentActionIndex={6}
        visible={true}
        onActionClick={logAction('showcase-action-click')}
        maxHeight={300}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Showcase of different action types including special actions like timeout, uncalled bet, muck, etc.',
      },
    },
  },
};

// Empty state
export const EmptyActions: Story = {
  args: {
    ...Default.args,
    actions: [],
    currentActionIndex: -1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no actions are available',
      },
    },
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
        story: 'Click on any action to see interaction events in the Actions panel',
      },
    },
  },
};
