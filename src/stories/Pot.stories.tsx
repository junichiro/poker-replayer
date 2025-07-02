import type { Meta, StoryObj } from '@storybook/react';

// Action handlers for demonstration
const logAction = (actionName: string) => () => console.log(`Action: ${actionName}`);

import { Pot } from '../components/Pot';
import type { Pot as PotType } from '../types';

const meta: Meta<typeof Pot> = {
  title: 'Components/Pot',
  component: Pot,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays poker pot information including main pot, side pots, and eligible players.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    pots: {
      control: 'object',
      description: 'Array of pot objects to display',
    },
    showDetails: {
      control: 'boolean',
      description: 'Whether to show detailed pot information',
    },
    showEligiblePlayers: {
      control: 'boolean',
      description: 'Whether to show eligible players for each pot',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'detailed'],
      description: 'Visual style variant',
    },
    animate: {
      control: 'boolean',
      description: 'Whether to animate pot changes',
    },
    onClick: {
      action: 'pot-click',
      description: 'Called when pot is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample pot data
const singlePot: PotType[] = [
  {
    amount: 240,
    players: ['Player1', 'Player2', 'Player3'],
    isSide: false,
    eligiblePlayers: ['Player1', 'Player2', 'Player3'],
  },
];

const mainAndSidePots: PotType[] = [
  {
    amount: 150,
    players: ['ShortStack', 'Player2', 'Player3'],
    isSide: false,
    eligiblePlayers: ['ShortStack', 'Player2', 'Player3'],
  },
  {
    amount: 200,
    players: ['Player2', 'Player3'],
    isSide: true,
    sidePotLevel: 1,
    eligiblePlayers: ['Player2', 'Player3'],
  },
];

const multipleSidePots: PotType[] = [
  {
    amount: 120,
    players: ['ShortStack1', 'ShortStack2', 'Player3', 'Player4'],
    isSide: false,
    eligiblePlayers: ['ShortStack1', 'ShortStack2', 'Player3', 'Player4'],
  },
  {
    amount: 300,
    players: ['ShortStack2', 'Player3', 'Player4'],
    isSide: true,
    sidePotLevel: 1,
    eligiblePlayers: ['ShortStack2', 'Player3', 'Player4'],
  },
  {
    amount: 800,
    players: ['Player3', 'Player4'],
    isSide: true,
    sidePotLevel: 2,
    eligiblePlayers: ['Player3', 'Player4'],
  },
];

const splitPot: PotType[] = [
  {
    amount: 1000,
    players: ['Player1', 'Player2'],
    isSide: false,
    isSplit: true,
    eligiblePlayers: ['Player1', 'Player2'],
    oddChipWinner: 'Player1',
  },
];

const largePot: PotType[] = [
  {
    amount: 15750,
    players: ['Hero', 'Villain'],
    isSide: false,
    eligiblePlayers: ['Hero', 'Villain'],
  },
];

// Basic stories
export const Default: Story = {
  args: {
    pots: singlePot,
    showDetails: true,
    showEligiblePlayers: true,
    variant: 'default',
    animate: true,
    onClick: logAction('pot-click'),
  },
};

export const SingleMainPot: Story = {
  args: {
    ...Default.args,
    pots: singlePot,
  },
};

export const MainAndSidePot: Story = {
  args: {
    ...Default.args,
    pots: mainAndSidePots,
  },
  parameters: {
    docs: {
      description: {
        story: 'Main pot with one side pot, typical when one player goes all-in',
      },
    },
  },
};

export const MultipleSidePots: Story = {
  args: {
    ...Default.args,
    pots: multipleSidePots,
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex scenario with main pot and multiple side pots',
      },
    },
  },
};

export const SplitPot: Story = {
  args: {
    ...Default.args,
    pots: splitPot,
  },
  parameters: {
    docs: {
      description: {
        story: 'Split pot scenario where two players tie',
      },
    },
  },
};

export const LargePot: Story = {
  args: {
    ...Default.args,
    pots: largePot,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large tournament or high-stakes pot',
      },
    },
  },
};

// Variant styles
export const CompactVariant: Story = {
  args: {
    ...Default.args,
    variant: 'compact',
    showDetails: false,
  },
};

export const DetailedVariant: Story = {
  args: {
    ...Default.args,
    variant: 'detailed',
    pots: mainAndSidePots,
  },
};

// Feature toggles
export const WithoutDetails: Story = {
  args: {
    ...Default.args,
    showDetails: false,
    pots: mainAndSidePots,
  },
};

export const WithoutEligiblePlayers: Story = {
  args: {
    ...Default.args,
    showEligiblePlayers: false,
    pots: mainAndSidePots,
  },
};

export const MinimalDisplay: Story = {
  args: {
    ...Default.args,
    showDetails: false,
    showEligiblePlayers: false,
    variant: 'compact',
  },
};

// Animation states
export const WithoutAnimation: Story = {
  args: {
    ...Default.args,
    animate: false,
  },
};

// Different pot sizes showcase
export const PotSizesShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Small Pot ($45)</h4>
        <Pot
          pots={[
            {
              amount: 45,
              players: ['Player1', 'Player2'],
              isSide: false,
              eligiblePlayers: ['Player1', 'Player2'],
            },
          ]}
          showDetails={true}
          showEligiblePlayers={false}
          variant="default"
          onClick={logAction('small-pot-click')}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Medium Pot ($340)</h4>
        <Pot
          pots={[
            {
              amount: 340,
              players: ['Player1', 'Player2', 'Player3'],
              isSide: false,
              eligiblePlayers: ['Player1', 'Player2', 'Player3'],
            },
          ]}
          showDetails={true}
          showEligiblePlayers={false}
          variant="default"
          onClick={logAction('medium-pot-click')}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Large Pot ($2,850)</h4>
        <Pot
          pots={[
            {
              amount: 2850,
              players: ['Hero', 'Villain'],
              isSide: false,
              eligiblePlayers: ['Hero', 'Villain'],
            },
          ]}
          showDetails={true}
          showEligiblePlayers={false}
          variant="default"
          onClick={logAction('large-pot-click')}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different pot sizes from small to large',
      },
    },
  },
};

// Complex all-in scenario
export const ComplexAllInScenario: Story = {
  render: () => {
    const complexPots: PotType[] = [
      {
        amount: 300, // Main pot (3 players x $100 each)
        players: ['ShortStack1', 'ShortStack2', 'BigStack'],
        isSide: false,
        eligiblePlayers: ['ShortStack1', 'ShortStack2', 'BigStack'],
      },
      {
        amount: 400, // Side pot 1 (2 players x $200 each)
        players: ['ShortStack2', 'BigStack'],
        isSide: true,
        sidePotLevel: 1,
        eligiblePlayers: ['ShortStack2', 'BigStack'],
      },
      {
        amount: 1000, // Side pot 2 (BigStack's extra $1000)
        players: ['BigStack'],
        isSide: true,
        sidePotLevel: 2,
        eligiblePlayers: ['BigStack'],
      },
    ];

    return (
      <Pot
        pots={complexPots}
        showDetails={true}
        showEligiblePlayers={true}
        variant="detailed"
        animate={true}
        onClick={logAction('complex-scenario-pot-click')}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Complex all-in scenario with main pot and two side pots, showing detailed eligible players',
      },
    },
  },
};

// Tournament scenario
export const TournamentPot: Story = {
  args: {
    ...Default.args,
    pots: [
      {
        amount: 12500,
        players: ['Hero', 'ChipLeader', 'MediumStack'],
        isSide: false,
        eligiblePlayers: ['Hero', 'ChipLeader', 'MediumStack'],
      },
    ],
    variant: 'detailed',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large tournament pot with significant chip amounts',
      },
    },
  },
};

// Empty pot state
export const EmptyPot: Story = {
  args: {
    ...Default.args,
    pots: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no pots are available',
      },
    },
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    ...Default.args,
    pots: mainAndSidePots,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on the pot to see interaction events in the Actions panel',
      },
    },
  },
};
