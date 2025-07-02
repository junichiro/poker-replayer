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
    isCurrentPlayer: {
      control: 'boolean',
      description: 'Whether this is the player whose turn it is',
    },
    isHero: {
      control: 'boolean',
      description: 'Whether this is the main player (user)',
    },
    showCards: {
      control: 'boolean',
      description: "Whether to show the player's hole cards",
    },
    onClick: {
      action: 'clicked',
      description: 'Called when player is clicked',
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
  isActive: true,
  isAllIn: false,
  currentBet: 0,
  isDealer: false,
  isFolded: false,
  hasBigBlind: false,
  hasSmallBlind: false,
};

export const Default: Story = {
  args: {
    player: samplePlayer,
    showCards: true,
    onClick: logAction('player-clicked'),
  },
};

export const CurrentPlayer: Story = {
  args: {
    player: samplePlayer,
    isCurrentPlayer: true,
    showCards: true,
    onClick: logAction('player-clicked'),
  },
};

export const HeroPlayer: Story = {
  args: {
    player: {
      ...samplePlayer,
      name: 'Hero',
    },
    isHero: true,
    showCards: true,
    onClick: logAction('player-clicked'),
  },
};

// Player positions
export const ButtonPosition: Story = {
  args: {
    player: {
      ...samplePlayer,
      position: 'BTN',
      isDealer: true,
    },
    showCards: true,
  },
};

export const BigBlindPosition: Story = {
  args: {
    player: {
      ...samplePlayer,
      position: 'BB',
      hasBigBlind: true,
      currentBet: 20,
    },
    showCards: true,
  },
};

export const SmallBlindPosition: Story = {
  args: {
    player: {
      ...samplePlayer,
      position: 'SB',
      hasSmallBlind: true,
      currentBet: 10,
    },
    showCards: true,
  },
};

// Player states
export const AllInPlayer: Story = {
  args: {
    player: {
      ...samplePlayer,
      isAllIn: true,
      chips: 0,
      currentBet: 1500,
    },
    showCards: true,
  },
};

export const FoldedPlayer: Story = {
  args: {
    player: {
      ...samplePlayer,
      isFolded: true,
      cards: [],
    },
    showCards: false,
  },
};

export const InactivePlayer: Story = {
  args: {
    player: {
      ...samplePlayer,
      isActive: false,
      chips: 0,
    },
    showCards: false,
  },
};

// Card visibility states
export const HiddenCards: Story = {
  args: {
    player: {
      ...samplePlayer,
      name: 'Opponent',
    },
    showCards: false,
  },
};

export const ShownCards: Story = {
  args: {
    player: samplePlayer,
    showCards: true,
  },
};

// Different chip amounts
export const ShortStack: Story = {
  args: {
    player: {
      ...samplePlayer,
      name: 'ShortStack',
      chips: 250,
    },
    showCards: true,
  },
};

export const BigStack: Story = {
  args: {
    player: {
      ...samplePlayer,
      name: 'BigStack',
      chips: 15000,
    },
    showCards: true,
  },
};

export const MidStack: Story = {
  args: {
    player: {
      ...samplePlayer,
      name: 'MidStack',
      chips: 3750,
    },
    showCards: true,
  },
};

// Premium hands showcase
export const PocketAces: Story = {
  args: {
    player: {
      ...samplePlayer,
      name: 'LuckyPlayer',
      cards: ['As', 'Ah'],
    },
    showCards: true,
  },
};

export const PocketKings: Story = {
  args: {
    player: {
      ...samplePlayer,
      name: 'StrongHand',
      cards: ['Ks', 'Kh'],
    },
    showCards: true,
  },
};

export const AceKingSuited: Story = {
  args: {
    player: {
      ...samplePlayer,
      name: 'BigSlick',
      cards: ['As', 'Ks'],
    },
    showCards: true,
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
        isActive: true,
        isAllIn: false,
        currentBet: 20,
        isDealer: false,
        isFolded: false,
        hasBigBlind: false,
        hasSmallBlind: false,
      },
      {
        seat: 2,
        name: 'Player2',
        chips: 2000,
        cards: ['Qs', 'Jh'],
        position: 'MP',
        isActive: true,
        isAllIn: false,
        currentBet: 20,
        isDealer: false,
        isFolded: false,
        hasBigBlind: false,
        hasSmallBlind: false,
      },
      {
        seat: 3,
        name: 'Player3',
        chips: 750,
        cards: [],
        position: 'CO',
        isActive: false,
        isAllIn: false,
        currentBet: 0,
        isDealer: false,
        isFolded: true,
        hasBigBlind: false,
        hasSmallBlind: false,
      },
      {
        seat: 4,
        name: 'Player4',
        chips: 3200,
        cards: ['Td', '9c'],
        position: 'BTN',
        isActive: true,
        isAllIn: false,
        currentBet: 80,
        isDealer: true,
        isFolded: false,
        hasBigBlind: false,
        hasSmallBlind: false,
      },
      {
        seat: 5,
        name: 'Player5',
        chips: 1000,
        cards: ['8h', '7s'],
        position: 'SB',
        isActive: true,
        isAllIn: false,
        currentBet: 10,
        isDealer: false,
        isFolded: false,
        hasBigBlind: false,
        hasSmallBlind: true,
      },
      {
        seat: 6,
        name: 'Player6',
        chips: 1800,
        cards: ['Ac', '2d'],
        position: 'BB',
        isActive: true,
        isAllIn: false,
        currentBet: 20,
        isDealer: false,
        isFolded: false,
        hasBigBlind: true,
        hasSmallBlind: false,
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
            isHero={index === 0}
            isCurrentPlayer={index === 3}
            showCards={index === 0} // Only show hero's cards
            onClick={logAction(`player-${player.seat}-clicked`)}
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
    player: samplePlayer,
    isCurrentPlayer: true,
    showCards: true,
    onClick: logAction('player-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Click this player to see interaction events in the Actions panel',
      },
    },
  },
};
