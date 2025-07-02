import type { Meta, StoryObj } from '@storybook/react';

// Action handlers for demonstration
const logAction = (actionName: string) => () => console.log(`Action: ${actionName}`);

import { Player } from '../components/Player';
import type { Player as PlayerType } from '../types';

const meta: Meta<typeof Player> = {
  title: 'Components/Player',
  component: Player,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A poker player component displaying player information, cards, chip stack, and current status.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    player: {
      control: 'object',
      description: 'Player data object containing name, chips, cards, and position',
    },
    currentChips: {
      control: 'number',
      description: 'Current chip count during the hand (overrides player.chips)',
    },
    isAllIn: {
      control: 'boolean',
      description: 'Whether the player is all-in',
    },
    showCards: {
      control: 'boolean',
      description: "Whether to show the player's hole cards",
    },
    seatPosition: {
      control: 'number',
      description: 'Seat position at the table (for positioning)',
    },
    maxSeats: {
      control: 'number',
      description: 'Maximum number of seats at the table (for positioning)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic player examples
const samplePlayer: PlayerType = {
  seat: 1,
  name: 'Player1',
  chips: 1500,
  cards: ['As', 'Kh'],
  position: 'BTN',
  isHero: false,
  currentChips: 1500,
  isAllIn: false,
};

export const Default: Story = {
  args: {
    player: samplePlayer,
    showCards: true,
    seatPosition: 1,
    maxSeats: 6,
  },
};

export const CurrentPlayer: Story = {
  args: {
    player: samplePlayer,
    showCards: true,
    currentChips: 1200,
    seatPosition: 1,
    maxSeats: 6,
  },
};

export const HeroPlayer: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      name: 'Hero',
      isHero: true,
    },
  },
};

// Player positions
export const ButtonPosition: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      position: 'BTN',
    },
  },
};

export const BigBlindPosition: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      position: 'BB',
      currentChips: 1480,
    },
    seatPosition: 3,
  },
};

export const SmallBlindPosition: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      position: 'SB',
      currentChips: 1490,
    },
    seatPosition: 2,
  },
};

// Player states
export const AllInPlayer: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      chips: 1500,
      allInAmount: 1500,
    },
    isAllIn: true,
    currentChips: 0,
  },
};

export const FoldedPlayer: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      cards: undefined,
    },
    showCards: false,
  },
};

export const InactivePlayer: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      chips: 0,
    },
    currentChips: 0,
    showCards: false,
  },
};

// Card visibility states
export const HiddenCards: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      name: 'Opponent',
    },
    showCards: false,
  },
};

export const ShownCards: Story = {
  args: {
    ...Default.args,
    player: samplePlayer,
  },
};

// Different chip amounts
export const ShortStack: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      name: 'ShortStack',
      chips: 250,
    },
    currentChips: 250,
  },
};

export const BigStack: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      name: 'BigStack',
      chips: 15000,
    },
    currentChips: 15000,
  },
};

export const MidStack: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      name: 'MidStack',
      chips: 3750,
    },
    currentChips: 3750,
  },
};

// Premium hands showcase
export const PocketAces: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      name: 'LuckyPlayer',
      cards: ['As', 'Ah'],
    },
  },
};

export const PocketKings: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      name: 'StrongHand',
      cards: ['Ks', 'Kh'],
    },
  },
};

export const AceKingSuited: Story = {
  args: {
    ...Default.args,
    player: {
      ...samplePlayer,
      name: 'BigSlick',
      cards: ['As', 'Ks'],
    },
  },
};

// Table showcase with multiple players
export const SixPlayerTable: Story = {
  render: () => {
    const players: PlayerType[] = [
      {
        seat: 1,
        name: 'Hero',
        chips: 1500,
        cards: ['As', 'Kh'],
        position: 'UTG',
        isHero: true,
        currentChips: 1480,
        isAllIn: false,
      },
      {
        seat: 2,
        name: 'Player2',
        chips: 2000,
        cards: ['Qs', 'Jh'],
        position: 'MP',
        currentChips: 1980,
        isAllIn: false,
      },
      {
        seat: 3,
        name: 'Player3',
        chips: 750,
        position: 'CO',
        currentChips: 750,
        isAllIn: false,
      },
      {
        seat: 4,
        name: 'Player4',
        chips: 3200,
        cards: ['Td', '9c'],
        position: 'BTN',
        currentChips: 3120,
        isAllIn: false,
      },
      {
        seat: 5,
        name: 'Player5',
        chips: 1000,
        cards: ['8h', '7s'],
        position: 'SB',
        currentChips: 990,
        isAllIn: false,
      },
      {
        seat: 6,
        name: 'Player6',
        chips: 1800,
        cards: ['Ac', '2d'],
        position: 'BB',
        currentChips: 1780,
        isAllIn: false,
      },
    ];

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {players.map((player, index) => (
          <Player
            key={player.seat}
            player={player}
            showCards={index === 0} // Only show hero's cards
            currentChips={player.currentChips}
            seatPosition={player.seat}
            maxSeats={6}
          />
        ))}
      </div>
    );
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story:
          'Example of a 6-player poker table showing different player states, positions, and chip stacks.',
      },
    },
  },
};

// Interactive player with actions
export const InteractivePlayer: Story = {
  args: {
    ...Default.args,
    player: samplePlayer,
    currentChips: 1400,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click this player to see interaction events in the Actions panel',
      },
    },
  },
};
