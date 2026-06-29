import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Stories are co-located with the components in @ghds/react (paths are
  // resolved relative to this .storybook config directory).
  stories: ['../../../packages/react/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
