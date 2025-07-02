import type { Meta, StoryObj } from '@storybook/react';

import { Card, type CardPropsTraditional } from '../components/Card';

// Action handlers for demonstration
const logAction = (actionName: string) => () => console.log(`Action: ${actionName}`);

const meta: Meta<CardPropsTraditional> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A poker playing card component with support for different suits, ranks, and visual styles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    card: {
      control: { type: 'select' },
      options: ['As', 'Ks', 'Qh', 'Jd', 'Tc', '9s', '8h', '7d', '6c', '5s', '4h', '3d', '2c'],
      description: 'The card value (rank + suit)',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the card',
    },
    isHidden: {
      control: 'boolean',
      description: 'Whether the card is face down',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card examples
export const AceOfSpades: Story = {
  args: {
    card: 'As',
    size: 'medium',
  },
};

export const KingOfHearts: Story = {
  args: {
    card: 'Kh',
    size: 'medium',
  },
};

export const QueenOfDiamonds: Story = {
  args: {
    card: 'Qd',
    size: 'medium',
  },
};

export const JackOfClubs: Story = {
  args: {
    card: 'Jc',
    size: 'medium',
  },
};

// Size variations
export const SmallCard: Story = {
  args: {
    card: 'As',
    size: 'small',
  },
};

export const LargeCard: Story = {
  args: {
    card: 'As',
    size: 'large',
  },
};

// Card states
export const HiddenCard: Story = {
  args: {
    card: 'As',
    size: 'medium',
    isHidden: true,
  },
};

// All suits showcase
export const AllSuits: Story = {
  args: {
    card: 'As',
    size: 'medium',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <Card card="As" size="medium" />
      <Card card="Ah" size="medium" />
      <Card card="Ad" size="medium" />
      <Card card="Ac" size="medium" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows the Ace in all four suits: Spades, Hearts, Diamonds, Clubs',
      },
    },
  },
};

// Poker hand example
export const PokerHand: Story = {
  args: {
    card: 'As',
    size: 'medium',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '5px' }}>
      <Card card="As" size="medium" />
      <Card card="Ks" size="medium" />
      <Card card="Qh" size="medium" />
      <Card card="Jd" size="medium" />
      <Card card="Tc" size="medium" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of a straight poker hand: A-K-Q-J-T',
      },
    },
  },
};

// Card back variations
export const CardBacks: Story = {
  args: {
    card: 'As',
    isHidden: true,
    size: 'medium',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <Card card="As" isHidden size="medium" />
      <Card card="Kh" isHidden size="medium" />
      <Card card="Qd" isHidden size="medium" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different card back designs for hidden cards',
      },
    },
  },
};

// Interactive example with state changes
export const InteractiveCard: Story = {
  args: {
    card: 'As',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Click and hover this card to see interaction events in the Actions panel',
      },
    },
  },
};
