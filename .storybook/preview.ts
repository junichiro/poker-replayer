import type { Preview } from '@storybook/react-vite'
import '../src/styles.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      description: {
        component: 'Poker Hand Replay Component Library - Interactive poker hand replaying with beautiful animations.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'casino',
          value: '#0f1419',
        },
        {
          name: 'professional',
          value: '#f8f9fa',
        },
      ],
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focusable-content',
            enabled: true,
          },
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', left: '🌞' },
          { value: 'dark', title: 'Dark', left: '🌙' },
          { value: 'auto', title: 'Auto', left: '🔄' },
          { value: 'casino', title: 'Casino', left: '🎰' },
          { value: 'professional', title: 'Professional', left: '💼' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;