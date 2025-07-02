import type { Meta, StoryObj } from '@storybook/react';

// Action handlers for demonstration
const logAction = (actionName: string) => () => console.log(`Action: ${actionName}`);

import { PokerHandReplay } from '../components/PokerHandReplay';

const meta: Meta<typeof PokerHandReplay> = {
  title: 'Components/PokerHandReplay',
  component: PokerHandReplay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Main component for replaying poker hands with full table visualization, controls, and hand history.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    handHistory: {
      control: 'text',
      description: 'PokerStars hand history text to parse and replay',
    },
    config: {
      control: 'object',
      description: 'Configuration options for the replay',
    },
    onActionChange: {
      action: 'action-change',
      description: 'Called when the current action changes',
    },
    onReplayEvent: {
      action: 'replay-event',
      description: 'Called when replay events occur (start, pause, end, etc.)',
    },
    enableLoadingStates: {
      control: 'boolean',
      description: 'Whether to show loading states during parsing',
    },
    enableErrorRecovery: {
      control: 'boolean',
      description: 'Whether to enable automatic error recovery',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample hand history for stories
const sampleHandHistory = `PokerStars Hand #123456789: Hold'em No Limit ($0.10/$0.20 USD) - 2023/01/01 12:00:00 ET
Table 'Sample Table' 6-max Seat #1 is the button
Seat 1: Player1 ($20.00 in chips)
Seat 2: Player2 ($20.00 in chips)
Seat 3: Player3 ($20.00 in chips)
Seat 4: Player4 ($20.00 in chips)
Seat 5: Player5 ($20.00 in chips)
Seat 6: Player6 ($20.00 in chips)
Player2: posts small blind $0.10
Player3: posts big blind $0.20
*** HOLE CARDS ***
Dealt to Player1 [As Kh]
Player4: folds
Player5: calls $0.20
Player6: folds
Player1: raises $0.60 to $0.80
Player2: folds
Player3: calls $0.60
Player5: calls $0.60
*** FLOP *** [Ah 7s 2c]
Player3: checks
Player5: checks
Player1: bets $1.50
Player3: folds
Player5: calls $1.50
*** TURN *** [Ah 7s 2c] [Kd]
Player5: checks
Player1: bets $3.00
Player5: calls $3.00
*** RIVER *** [Ah 7s 2c Kd] [3h]
Player5: checks
Player1: bets $6.00
Player5: folds
Uncalled bet ($6.00) returned to Player1
Player1 collected $11.40 from pot
*** SUMMARY ***
Total pot $12.00 | Rake $0.60
Board [Ah 7s 2c Kd 3h]
Seat 1: Player1 (button) showed [As Kh] and won ($11.40) with two pair, Aces and Kings
Seat 5: Player5 folded on the River`;

const tournamentHandHistory = `PokerStars Hand #987654321: Tournament #123456789, $10+$1 USD Hold'em No Limit - Level I (10/20) - 2023/01/01 12:00:00 ET
Table '123456789 1' 9-max Seat #1 is the button
Seat 1: Hero ($1500 in chips)
Seat 2: Villain1 ($1500 in chips)
Seat 3: Villain2 ($1500 in chips)
Seat 4: Villain3 ($1500 in chips)
Seat 5: Villain4 ($1500 in chips)
Seat 6: Villain5 ($1500 in chips)
Seat 7: Villain6 ($1500 in chips)
Seat 8: Villain7 ($1500 in chips)
Seat 9: Villain8 ($1500 in chips)
Villain1: posts small blind 10
Villain2: posts big blind 20
*** HOLE CARDS ***
Dealt to Hero [Qh Qd]
Villain3: folds
Villain4: raises 40 to 60
Villain5: folds
Villain6: folds
Villain7: calls 60
Villain8: folds
Hero: raises 180 to 240
Villain1: folds
Villain2: folds
Villain4: calls 180
Villain7: folds
*** FLOP *** [2s 8c Qc]
Villain4: checks
Hero: bets 320
Villain4: calls 320
*** TURN *** [2s 8c Qc] [9h]
Villain4: checks
Hero: bets 940 and is all-in
Villain4: calls 940 and is all-in
*** RIVER *** [2s 8c Qc 9h] [7d]
*** SHOW DOWN ***
Hero: shows [Qh Qd] (three of a kind, Queens)
Villain4: shows [Ac Tc] (high card Ace)
Hero collected 3090 from pot
*** SUMMARY ***
Total pot 3090 | Rake 0
Board [2s 8c Qc 9h 7d]
Seat 1: Hero (button) showed [Qh Qd] and won (3090) with three of a kind, Queens
Seat 5: Villain4 showed [Ac Tc] and lost with high card Ace`;

const allInHandHistory = `PokerStars Hand #555666777: Hold'em No Limit ($0.25/$0.50 USD) - 2023/01/01 12:00:00 ET
Table 'Action Table' 6-max Seat #3 is the button
Seat 1: ShortStack ($15.00 in chips)
Seat 2: BigStack ($100.00 in chips)
Seat 3: Player3 ($50.00 in chips)
Seat 4: Player4 ($75.00 in chips)
Seat 5: Player5 ($60.00 in chips)
Seat 6: Hero ($80.00 in chips)
Player4: posts small blind $0.25
Player5: posts big blind $0.50
*** HOLE CARDS ***
Dealt to Hero [Jh Js]
Hero: raises $1.50 to $2.00
ShortStack: raises $13.00 to $15.00 and is all-in
BigStack: calls $15.00
Player3: folds
Player4: folds
Player5: folds
Hero: calls $13.00
BigStack: calls $0.00
*** FLOP *** [Tc 4h 2s]
Hero: checks
BigStack: bets $20.00
Hero: raises $45.00 to $65.00 and is all-in
BigStack: calls $45.00
*** TURN *** [Tc 4h 2s] [5d]
*** RIVER *** [Tc 4h 2s 5d] [Jd]
*** SHOW DOWN ***
Hero: shows [Jh Js] (three of a kind, Jacks)
BigStack: shows [As Ac] (a pair of Aces)
Hero collected $130.00 from side pot
ShortStack: shows [Kh Kd] (a pair of Kings)
Hero collected $45.75 from main pot
*** SUMMARY ***
Total pot $175.75 Main pot $45.75. Side pot $130.00. | Rake $0.00
Board [Tc 4h 2s 5d Jd]
Seat 1: ShortStack showed [Kh Kd] and lost with a pair of Kings
Seat 2: BigStack showed [As Ac] and lost with a pair of Aces
Seat 6: Hero showed [Jh Js] and won ($175.75) with three of a kind, Jacks`;

// Basic stories
export const Default: Story = {
  args: {
    handHistory: sampleHandHistory,
    config: {
      autoPlay: false,
      theme: 'light',
      animationSpeed: 1,
    },
    onActionChange: logAction('action-change'),
    onReplayEvent: logAction('replay-event'),
    enableLoadingStates: true,
    enableErrorRecovery: true,
  },
};

export const AutoPlay: Story = {
  args: {
    ...Default.args,
    config: {
      ...Default.args!.config,
      autoPlay: true,
    },
  },
};

// Theme variations
export const DarkTheme: Story = {
  args: {
    ...Default.args,
    config: {
      ...Default.args!.config,
      theme: 'dark',
    },
  },
};

export const CasinoTheme: Story = {
  args: {
    ...Default.args,
    config: {
      ...Default.args!.config,
      theme: 'casino',
    },
  },
};

export const ProfessionalTheme: Story = {
  args: {
    ...Default.args,
    config: {
      ...Default.args!.config,
      theme: 'professional',
    },
  },
};

// Speed variations
export const SlowMotion: Story = {
  args: {
    ...Default.args,
    config: {
      ...Default.args!.config,
      animationSpeed: 0.3,
      autoPlay: true,
    },
  },
};

export const FastForward: Story = {
  args: {
    ...Default.args,
    config: {
      ...Default.args!.config,
      animationSpeed: 2.5,
      autoPlay: true,
    },
  },
};

// Different configuration variants
export const NoAutoPlay: Story = {
  args: {
    ...Default.args,
    config: {
      ...Default.args!.config,
      autoPlay: false,
    },
  },
};

export const LargeSize: Story = {
  args: {
    ...Default.args,
    config: {
      ...Default.args!.config,
      size: 'large',
    },
  },
};

export const SmallSize: Story = {
  args: {
    ...Default.args,
    config: {
      ...Default.args!.config,
      size: 'small',
    },
  },
};

// Tournament hand
export const TournamentHand: Story = {
  args: {
    ...Default.args,
    handHistory: tournamentHandHistory,
    config: {
      ...Default.args!.config,
      theme: 'professional',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Tournament hand with pocket Queens vs Ace-Ten all-in preflop',
      },
    },
  },
};

// All-in scenario
export const AllInScenario: Story = {
  args: {
    ...Default.args,
    handHistory: allInHandHistory,
    config: {
      ...Default.args!.config,
      theme: 'casino',
      animationSpeed: 0.8,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex all-in scenario with main pot and side pot involving three players',
      },
    },
  },
};

// Different poker scenarios
export const PremiumHands: Story = {
  render: () => {
    const premiumHandHistory = `PokerStars Hand #111222333: Hold'em No Limit ($0.10/$0.20 USD) - 2023/01/01 12:00:00 ET
Table 'Premium Table' 6-max Seat #1 is the button
Seat 1: Hero ($20.00 in chips)
Seat 2: Villain ($20.00 in chips)
*** HOLE CARDS ***
Dealt to Hero [As Ah]
Hero: raises $0.60 to $0.80
Villain: raises $2.40 to $3.20
Hero: raises $16.80 to $20.00 and is all-in
Villain: calls $16.80 and is all-in
*** FLOP *** [2s 7h Qc]
*** TURN *** [2s 7h Qc] [Kd]
*** RIVER *** [2s 7h Qc Kd] [3h]
*** SHOW DOWN ***
Hero: shows [As Ah] (a pair of Aces)
Villain: shows [Kh Ks] (three of a kind, Kings)
Villain collected $40.00 from pot
*** SUMMARY ***
Total pot $40.00 | Rake $0.00
Board [2s 7h Qc Kd 3h]
Seat 1: Hero showed [As Ah] and lost with a pair of Aces
Seat 2: Villain showed [Kh Ks] and won ($40.00) with three of a kind, Kings`;

    return (
      <PokerHandReplay
        handHistory={premiumHandHistory}
        config={{
          autoPlay: false,
          theme: 'dark',
          animationSpeed: 1,
        }}
        onActionChange={logAction('premium-hand-action-change')}
        onReplayEvent={logAction('premium-hand-replay-event')}
        enableLoadingStates={true}
        enableErrorRecovery={true}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pocket Aces vs Pocket Kings all-in preflop - a classic cooler scenario',
      },
    },
  },
};

// Error handling
export const InvalidHandHistory: Story = {
  args: {
    ...Default.args,
    handHistory: 'Invalid hand history format',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows error handling when provided with invalid hand history format',
      },
    },
  },
};

export const EmptyHandHistory: Story = {
  args: {
    ...Default.args,
    handHistory: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows loading state when no hand history is provided',
      },
    },
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    ...Default.args,
    config: {
      ...Default.args!.config,
      animationSpeed: 1.2,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Fully interactive poker hand replay - use controls to step through the hand and see action events',
      },
    },
  },
};
