import type { Meta, StoryObj } from '@storybook/react';

// Action handlers for demonstration
const logAction = (actionName: string) => () => console.log(`Action: ${actionName}`);

import { Table } from '../components/Table';
import type { Player, Pot } from '../types';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Poker table component that arranges players, displays community cards, and shows pot information.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    players: {
      control: 'object',
      description: 'Array of players at the table',
    },
    communityCards: {
      control: 'object',
      description: 'Community cards on the board',
    },
    pots: {
      control: 'object',
      description: 'Pot information',
    },
    dealerPosition: {
      control: { type: 'number', min: 1, max: 9 },
      description: 'Seat number of the dealer',
    },
    maxSeats: {
      control: { type: 'select' },
      options: [2, 6, 9],
      description: 'Maximum number of seats at the table',
    },
    tableTheme: {
      control: { type: 'select' },
      options: ['green', 'blue', 'red', 'black'],
      description: 'Color theme of the table',
    },
    showPositions: {
      control: 'boolean',
      description: 'Whether to show position labels',
    },
    showDealer: {
      control: 'boolean',
      description: 'Whether to show dealer button',
    },
    onPlayerClick: {
      action: 'player-click',
      description: 'Called when a player is clicked',
    },
    onSeatClick: {
      action: 'seat-click',
      description: 'Called when an empty seat is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const fullRingSamplePlayers: Player[] = [
  {
    seat: 1,
    name: 'Hero',
    chips: 2500,
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
    seat: 3,
    name: 'Player3',
    chips: 1800,
    cards: ['Qs', 'Jd'],
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
    seat: 5,
    name: 'Player5',
    chips: 3200,
    cards: ['Tc', '9h'],
    position: 'CO',
    isActive: true,
    isAllIn: false,
    currentBet: 80,
    isDealer: false,
    isFolded: false,
    hasBigBlind: false,
    hasSmallBlind: false,
  },
  {
    seat: 6,
    name: 'Dealer',
    chips: 2100,
    cards: ['7s', '6c'],
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
    seat: 7,
    name: 'SmallBlind',
    chips: 1950,
    cards: [],
    position: 'SB',
    isActive: false,
    isAllIn: false,
    currentBet: 0,
    isDealer: false,
    isFolded: true,
    hasBigBlind: false,
    hasSmallBlind: true,
  },
  {
    seat: 8,
    name: 'BigBlind',
    chips: 2800,
    cards: ['Ad', '2c'],
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

const sixMaxPlayers: Player[] = [
  {
    seat: 1,
    name: 'UTG',
    chips: 1500,
    cards: ['Ah', 'Kd'],
    position: 'UTG',
    isActive: true,
    isAllIn: false,
    currentBet: 0,
    isDealer: false,
    isFolded: false,
    hasBigBlind: false,
    hasSmallBlind: false,
  },
  {
    seat: 2,
    name: 'MP',
    chips: 2200,
    cards: ['Qs', 'Jh'],
    position: 'MP',
    isActive: true,
    isAllIn: false,
    currentBet: 0,
    isDealer: false,
    isFolded: false,
    hasBigBlind: false,
    hasSmallBlind: false,
  },
  {
    seat: 3,
    name: 'CO',
    chips: 1800,
    cards: ['Tc', '9s'],
    position: 'CO',
    isActive: true,
    isAllIn: false,
    currentBet: 0,
    isDealer: false,
    isFolded: false,
    hasBigBlind: false,
    hasSmallBlind: false,
  },
  {
    seat: 4,
    name: 'BTN',
    chips: 2500,
    cards: ['8h', '7d'],
    position: 'BTN',
    isActive: true,
    isAllIn: false,
    currentBet: 0,
    isDealer: true,
    isFolded: false,
    hasBigBlind: false,
    hasSmallBlind: false,
  },
  {
    seat: 5,
    name: 'SB',
    chips: 1900,
    cards: ['6c', '5h'],
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
    name: 'BB',
    chips: 2100,
    cards: ['4s', '3d'],
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

const headsUpPlayers: Player[] = [
  {
    seat: 1,
    name: 'Hero',
    chips: 5000,
    cards: ['As', 'Ah'],
    position: 'BTN',
    isActive: true,
    isAllIn: false,
    currentBet: 500,
    isDealer: true,
    isFolded: false,
    hasBigBlind: false,
    hasSmallBlind: true,
  },
  {
    seat: 2,
    name: 'Villain',
    chips: 4800,
    cards: ['Ks', 'Kd'],
    position: 'BB',
    isActive: true,
    isAllIn: false,
    currentBet: 1000,
    isDealer: false,
    isFolded: false,
    hasBigBlind: true,
    hasSmallBlind: false,
  },
];

const samplePots: Pot[] = [
  {
    amount: 480,
    players: ['Hero', 'Player3', 'Player5', 'BigBlind'],
    isSide: false,
    eligiblePlayers: ['Hero', 'Player3', 'Player5', 'BigBlind'],
  },
];

// Basic stories
export const Default: Story = {
  args: {
    players: fullRingSamplePlayers,
    communityCards: ['Ah', '7s', '2c'],
    pots: samplePots,
    dealerPosition: 6,
    maxSeats: 9,
    tableTheme: 'green',
    showPositions: true,
    showDealer: true,
    onPlayerClick: logAction('player-click'),
    onSeatClick: logAction('seat-click'),
  },
};

// Different table sizes
export const SixMaxTable: Story = {
  args: {
    ...Default.args,
    players: sixMaxPlayers,
    maxSeats: 6,
    dealerPosition: 4,
    pots: [
      {
        amount: 180,
        players: ['UTG', 'MP', 'BTN', 'SB', 'BB'],
        isSide: false,
        eligiblePlayers: ['UTG', 'MP', 'BTN', 'SB', 'BB'],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: '6-max poker table with all positions filled',
      },
    },
  },
};

export const HeadsUpTable: Story = {
  args: {
    ...Default.args,
    players: headsUpPlayers,
    maxSeats: 2,
    dealerPosition: 1,
    communityCards: ['As', 'Ah', 'Kh'],
    pots: [
      {
        amount: 1500,
        players: ['Hero', 'Villain'],
        isSide: false,
        eligiblePlayers: ['Hero', 'Villain'],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Heads-up poker table with pocket Aces vs pocket Kings',
      },
    },
  },
};

// Different board states
export const Preflop: Story = {
  args: {
    ...Default.args,
    communityCards: [],
    pots: [
      {
        amount: 60,
        players: ['Hero', 'Player3', 'BigBlind'],
        isSide: false,
        eligiblePlayers: ['Hero', 'Player3', 'BigBlind'],
      },
    ],
  },
};

export const Flop: Story = {
  args: {
    ...Default.args,
    communityCards: ['Ah', '7s', '2c'],
  },
};

export const Turn: Story = {
  args: {
    ...Default.args,
    communityCards: ['Ah', '7s', '2c', 'Kd'],
    pots: [
      {
        amount: 920,
        players: ['Hero', 'Player5'],
        isSide: false,
        eligiblePlayers: ['Hero', 'Player5'],
      },
    ],
  },
};

export const River: Story = {
  args: {
    ...Default.args,
    communityCards: ['Ah', '7s', '2c', 'Kd', '3h'],
    pots: [
      {
        amount: 1840,
        players: ['Hero', 'Player5'],
        isSide: false,
        eligiblePlayers: ['Hero', 'Player5'],
      },
    ],
  },
};

// Table themes
export const BlueTheme: Story = {
  args: {
    ...Default.args,
    tableTheme: 'blue',
  },
};

export const RedTheme: Story = {
  args: {
    ...Default.args,
    tableTheme: 'red',
  },
};

export const BlackTheme: Story = {
  args: {
    ...Default.args,
    tableTheme: 'black',
  },
};

// Feature toggles
export const WithoutPositions: Story = {
  args: {
    ...Default.args,
    showPositions: false,
  },
};

export const WithoutDealer: Story = {
  args: {
    ...Default.args,
    showDealer: false,
  },
};

export const MinimalTable: Story = {
  args: {
    ...Default.args,
    showPositions: false,
    showDealer: false,
  },
};

// Special scenarios
export const AllInScenario: Story = {
  args: {
    ...Default.args,
    players: fullRingSamplePlayers.map((player, index) => ({
      ...player,
      isAllIn: index === 0 || index === 2,
      chips: index === 0 ? 0 : index === 2 ? 0 : player.chips,
      currentBet: index === 0 ? 2500 : index === 2 ? 1800 : player.currentBet,
    })),
    pots: [
      {
        amount: 1800,
        players: ['Hero', 'Player3', 'Player5', 'Dealer'],
        isSide: false,
        eligiblePlayers: ['Hero', 'Player3', 'Player5', 'Dealer'],
      },
      {
        amount: 2100,
        players: ['Hero', 'Player5', 'Dealer'],
        isSide: true,
        sidePotLevel: 1,
        eligiblePlayers: ['Hero', 'Player5', 'Dealer'],
      },
    ],
    communityCards: ['Js', 'Jh', '7c'],
  },
  parameters: {
    docs: {
      description: {
        story: 'All-in scenario with main pot and side pot',
      },
    },
  },
};

export const TournamentFinalTable: Story = {
  args: {
    ...Default.args,
    players: [
      {
        seat: 1,
        name: 'ChipLeader',
        chips: 150000,
        cards: ['As', 'Ad'],
        position: 'UTG',
        isActive: true,
        isAllIn: false,
        currentBet: 0,
        isDealer: false,
        isFolded: false,
        hasBigBlind: false,
        hasSmallBlind: false,
      },
      {
        seat: 4,
        name: 'MediumStack',
        chips: 85000,
        cards: ['Ks', 'Kh'],
        position: 'BTN',
        isActive: true,
        isAllIn: false,
        currentBet: 0,
        isDealer: true,
        isFolded: false,
        hasBigBlind: false,
        hasSmallBlind: false,
      },
      {
        seat: 7,
        name: 'ShortStack',
        chips: 25000,
        cards: ['Qh', 'Qd'],
        position: 'BB',
        isActive: true,
        isAllIn: false,
        currentBet: 4000,
        isDealer: false,
        isFolded: false,
        hasBigBlind: true,
        hasSmallBlind: false,
      },
    ],
    maxSeats: 9,
    dealerPosition: 4,
    communityCards: [],
    pots: [
      {
        amount: 6000,
        players: ['ChipLeader', 'MediumStack', 'ShortStack'],
        isSide: false,
        eligiblePlayers: ['ChipLeader', 'MediumStack', 'ShortStack'],
      },
    ],
    tableTheme: 'black',
  },
  parameters: {
    docs: {
      description: {
        story: 'Tournament final table with 3 players and high chip counts',
      },
    },
  },
};

// Empty table
export const EmptyTable: Story = {
  args: {
    ...Default.args,
    players: [],
    communityCards: [],
    pots: [],
    dealerPosition: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty table ready for players to join',
      },
    },
  },
};

// Sparse table (some empty seats)
export const SparseTable: Story = {
  args: {
    ...Default.args,
    players: [
      fullRingSamplePlayers[0], // Seat 1
      fullRingSamplePlayers[2], // Seat 5
      fullRingSamplePlayers[4], // Seat 7
    ],
    dealerPosition: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with some empty seats - typical during late tournament play',
      },
    },
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on players or empty seats to see interaction events in the Actions panel',
      },
    },
  },
};
