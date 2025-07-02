import type { Meta, StoryObj } from '@storybook/react';

import { Table, type TableProps } from '../components/Table';
import type { Player, Pot, TableInfo } from '../types';

const meta: Meta<TableProps> = {
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
    table: {
      control: 'object',
      description: 'Table configuration object',
    },
    players: {
      control: 'object',
      description: 'Array of players at the table',
    },
    currentPlayers: {
      control: 'object',
      description: 'Current state of players (optional)',
    },
    boardCards: {
      control: 'object',
      description: 'Community cards on the board',
    },
    pots: {
      control: 'object',
      description: 'Pot information array',
    },
    showAllCards: {
      control: 'boolean',
      description: 'Whether to show all players cards',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const sampleTable: TableInfo = {
  id: 'table-1',
  name: 'Table 1',
  maxSeats: 6,
  dealerSeat: 1,
  smallBlind: 10,
  bigBlind: 20,
};

const samplePlayers: Player[] = [
  {
    seat: 1,
    name: 'Player1',
    chips: 1500,
    cards: ['As', 'Kh'],
    isHero: true,
  },
  {
    seat: 2,
    name: 'Player2',
    chips: 2000,
    cards: ['Qd', '9c'],
  },
  {
    seat: 4,
    name: 'Player4',
    chips: 1200,
    cards: ['Jh', 'Ts'],
  },
  {
    seat: 6,
    name: 'Player6',
    chips: 800,
    cards: ['7d', '3s'],
  },
];

const samplePots: Pot[] = [
  {
    amount: 120,
    players: ['Player1', 'Player2', 'Player4'],
  },
];

// Basic examples
export const Default: Story = {
  args: {
    table: sampleTable,
    players: samplePlayers,
    boardCards: [],
    pots: samplePots,
    showAllCards: false,
  },
};

export const WithCommunityCards: Story = {
  args: {
    ...Default.args,
    boardCards: ['As', '7s', '2c'],
  },
};

export const ShowAllCards: Story = {
  args: {
    ...Default.args,
    boardCards: ['As', '7s', '2c', '9h', '7d'],
    showAllCards: true,
  },
};

export const MultiplePots: Story = {
  args: {
    ...Default.args,
    boardCards: ['As', '7s', '2c'],
    pots: [
      {
        amount: 120,
        players: ['Player1', 'Player2'],
      },
      {
        amount: 200,
        players: ['Player4', 'Player6'],
        isSide: true,
      },
    ],
  },
};

export const HeadsUp: Story = {
  args: {
    table: { ...sampleTable, maxSeats: 2 },
    players: [
      {
        seat: 1,
        name: 'Hero',
        chips: 1500,
        cards: ['As', 'Kh'],
        isHero: true,
      },
      {
        seat: 2,
        name: 'Villain',
        chips: 1500,
        cards: ['Qd', '9c'],
      },
    ],
    boardCards: ['As', '7s', '2c'],
    pots: [
      {
        amount: 60,
        players: ['Hero', 'Villain'],
      },
    ],
    showAllCards: false,
  },
};

export const FullTable: Story = {
  args: {
    table: { ...sampleTable, maxSeats: 9 },
    players: [
      { seat: 1, name: 'UTG', chips: 1500, cards: ['As', 'Kh'] },
      { seat: 2, name: 'UTG+1', chips: 2000, cards: ['Qd', '9c'] },
      { seat: 3, name: 'MP', chips: 1800, cards: ['Jh', 'Ts'] },
      { seat: 4, name: 'MP+1', chips: 1200, cards: ['7d', '3s'] },
      { seat: 5, name: 'HJ', chips: 2200, cards: ['Ah', 'Qs'] },
      { seat: 6, name: 'CO', chips: 1900, cards: ['Kd', 'Jc'] },
      { seat: 7, name: 'BTN', chips: 1600, cards: ['Th', '9s'] },
      { seat: 8, name: 'SB', chips: 1400, cards: ['8h', '6d'] },
      { seat: 9, name: 'BB', chips: 1700, cards: ['5c', '4h'] },
    ],
    boardCards: ['As', '7s', '2c', '9h'],
    pots: [
      {
        amount: 450,
        players: ['UTG', 'MP', 'HJ', 'CO', 'BTN'],
      },
    ],
    showAllCards: false,
  },
};

export const EmptyTable: Story = {
  args: {
    table: sampleTable,
    players: [],
    boardCards: [],
    pots: [],
    showAllCards: false,
  },
};
