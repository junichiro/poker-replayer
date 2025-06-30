import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from '../components/LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Loading indicators for various async operations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    message: { control: 'text' },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
    },
    variant: {
      control: { type: 'select' },
      options: ['spin', 'pulse', 'dots', 'bars', 'card'],
    },
    showMessage: { control: 'boolean' },
    centered: { control: 'boolean' },
    overlay: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'medium',
    message: 'Loading...',
    color: 'primary',
    variant: 'spin',
    showMessage: true,
    centered: false,
    overlay: false,
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    message: 'Processing...',
    showMessage: true,
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    message: 'Parsing hand history...',
    showMessage: true,
    centered: true,
  },
};

export const CardVariant: Story = {
  args: {
    size: 'large',
    message: 'Dealing cards...',
    variant: 'card',
    showMessage: true,
    centered: true,
  },
};