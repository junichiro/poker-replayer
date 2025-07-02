import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '../components/Card';

// Action handlers for demonstration
const logAction = (actionName: string) => () => console.log(`Action: ${actionName}`);

const meta: Meta<typeof Card> = {
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
    isHighlighted: {
      control: 'boolean',
      description: 'Whether the card should be highlighted',
    },
    isSelected: {
      control: 'boolean',
      description: 'Whether the card is selected',
    },
    variant: {
      control: { type: 'select' },
      options: ['traditional', 'modern', 'minimal'],
      description: 'Visual style variant of the card',
    },
    onClick: {
      action: 'clicked',
      description: 'Called when card is clicked',
    },
    onHover: {
      action: 'hovered',
      description: 'Called when card is hovered',
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
    variant: 'traditional',
    onClick: logAction('card-clicked'),
    onHover: logAction('card-hovered'),
  },
};

export const KingOfHearts: Story = {
  args: {
    card: 'Kh',
    size: 'medium',
    variant: 'traditional',
    onClick: logAction('card-clicked'),
  },
};

export const QueenOfDiamonds: Story = {
  args: {
    card: 'Qd',
    size: 'medium',
    variant: 'traditional',
    onClick: logAction('card-clicked'),
  },
};

export const JackOfClubs: Story = {
  args: {
    card: 'Jc',
    size: 'medium',
    variant: 'traditional',
    onClick: logAction('card-clicked'),
  },
};

// Size variations
export const SmallCard: Story = {
  args: {
    card: 'As',
    size: 'small',
    variant: 'traditional',
  },
};

export const LargeCard: Story = {
  args: {
    card: 'As',
    size: 'large',
    variant: 'traditional',
  },
};

// Card states
export const HiddenCard: Story = {
  args: {
    card: 'As',
    size: 'medium',
    isHidden: true,
    variant: 'traditional',
  },
};

export const HighlightedCard: Story = {
  args: {
    card: 'As',
    size: 'medium',
    isHighlighted: true,
    variant: 'traditional',
  },
};

export const SelectedCard: Story = {
  args: {
    card: 'As',
    size: 'medium',
    isSelected: true,
    variant: 'traditional',
  },
};

// Visual variants
export const ModernVariant: Story = {
  args: {
    card: 'As',
    size: 'medium',
    variant: 'modern',
  },
};

export const MinimalVariant: Story = {
  args: {
    card: 'As',
    size: 'medium',
    variant: 'minimal',
  },
};

// All suits showcase
export const AllSuits: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <Card card="As" size="medium" variant="traditional" />
      <Card card="Ah" size="medium" variant="traditional" />
      <Card card="Ad" size="medium" variant="traditional" />
      <Card card="Ac" size="medium" variant="traditional" />
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
  render: () => (
    <div style={{ display: 'flex', gap: '5px' }}>
      <Card card="As" size="medium" variant="traditional" />
      <Card card="Ks" size="medium" variant="traditional" />
      <Card card="Qh" size="medium" variant="traditional" />
      <Card card="Jd" size="medium" variant="traditional" />
      <Card card="Tc" size="medium" variant="traditional" />
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
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <Card card="As" isHidden size="medium" variant="traditional" />
      <Card card="Kh" isHidden size="medium" variant="modern" />
      <Card card="Qd" isHidden size="medium" variant="minimal" />
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
    variant: 'traditional',
    onClick: logAction('card-clicked'),
    onHover: logAction('card-hovered'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Click and hover this card to see interaction events in the Actions panel',
      },
    },
  },
};
