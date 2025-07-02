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
    pot: {
      control: 'object',
      description: 'Pot object to display',
    },
    showDetails: {
      control: 'boolean',
      description: 'Whether to show detailed pot information',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample pot data
const singlePot: PotType = {
  amount: 240,
  players: ['Player1', 'Player2', 'Player3'],
  isSide: false,
  eligiblePlayers: ['Player1', 'Player2', 'Player3'],
};

const mainPot: PotType = {
  amount: 150,
  players: ['ShortStack', 'Player2', 'Player3'],
  isSide: false,
  eligiblePlayers: ['ShortStack', 'Player2', 'Player3'],
};

const sidePot: PotType = {
  amount: 200,
  players: ['Player2', 'Player3'],
  isSide: true,
  sidePotLevel: 1,
  eligiblePlayers: ['Player2', 'Player3'],
};

const sidePot2: PotType = {
  amount: 800,
  players: ['Player3', 'Player4'],
  isSide: true,
  sidePotLevel: 2,
  eligiblePlayers: ['Player3', 'Player4'],
};

const splitPot: PotType = {
  amount: 1000,
  players: ['Player1', 'Player2'],
  isSide: false,
  isSplit: true,
  eligiblePlayers: ['Player1', 'Player2'],
  oddChipWinner: 'Player1',
};

const largePot: PotType = {
  amount: 15750,
  players: ['Hero', 'Villain'],
  isSide: false,
  eligiblePlayers: ['Hero', 'Villain'],
};

// Basic stories
export const Default: Story = {
  args: {
    pot: singlePot,
    showDetails: true,
  },
};

export const SingleMainPot: Story = {
  args: {
    pot: singlePot,
    showDetails: true,
  },
};

export const MainPot: Story = {
  args: {
    pot: mainPot,
    showDetails: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Main pot with one side pot, typical when one player goes all-in',
      },
    },
  },
};

export const SidePotLevel1: Story = {
  args: {
    pot: sidePot,
    showDetails: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Side pot (level 1) when player goes all-in',
      },
    },
  },
};

export const SidePotLevel2: Story = {
  args: {
    pot: sidePot2,
    showDetails: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Side pot (level 2) for complex all-in scenarios',
      },
    },
  },
};

export const SplitPot: Story = {
  args: {
    pot: splitPot,
    showDetails: true,
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
    pot: largePot,
    showDetails: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large tournament or high-stakes pot',
      },
    },
  },
};

// Feature toggles
export const WithoutDetails: Story = {
  args: {
    pot: singlePot,
    showDetails: false,
  },
};

export const DetailedPot: Story = {
  args: {
    pot: mainPot,
    showDetails: true,
  },
};

export const WithCustomClass: Story = {
  args: {
    pot: singlePot,
    showDetails: true,
    className: 'custom-pot-style',
  },
};

export const MinimalDisplay: Story = {
  args: {
    pot: singlePot,
    showDetails: false,
  },
};

// Different pot sizes showcase
export const PotSizesShowcase: Story = {
  render: () => {
    const smallPot: PotType = {
      amount: 45,
      players: ['Player1', 'Player2'],
      isSide: false,
      eligiblePlayers: ['Player1', 'Player2'],
    };

    const mediumPot: PotType = {
      amount: 340,
      players: ['Player1', 'Player2', 'Player3'],
      isSide: false,
      eligiblePlayers: ['Player1', 'Player2', 'Player3'],
    };

    const largePotSize: PotType = {
      amount: 2850,
      players: ['Hero', 'Villain'],
      isSide: false,
      eligiblePlayers: ['Hero', 'Villain'],
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Small Pot ($45)</h4>
          <Pot pot={smallPot} showDetails={true} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Medium Pot ($340)</h4>
          <Pot pot={mediumPot} showDetails={true} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Large Pot ($2,850)</h4>
          <Pot pot={largePotSize} showDetails={true} />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different pot sizes from small to large',
      },
    },
  },
};

// Tournament scenario
export const TournamentPot: Story = {
  args: {
    pot: {
      amount: 12500,
      players: ['Hero', 'ChipLeader', 'MediumStack'],
      isSide: false,
      eligiblePlayers: ['Hero', 'ChipLeader', 'MediumStack'],
    },
    showDetails: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large tournament pot with significant chip amounts',
      },
    },
  },
};

// Zero pot amount
export const ZeroPot: Story = {
  args: {
    pot: {
      amount: 0,
      players: [],
      isSide: false,
      eligiblePlayers: [],
    },
    showDetails: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when pot has zero amount',
      },
    },
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    pot: singlePot,
    showDetails: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on the pot to see interaction events in the Actions panel',
      },
    },
  },
};
