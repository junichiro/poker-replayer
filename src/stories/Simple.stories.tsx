import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Test/Simple',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    message: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'medium',
    message: 'Loading...',
  },
};