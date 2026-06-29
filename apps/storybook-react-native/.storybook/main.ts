import type { StorybookConfig } from '@storybook/react-native-web-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      // @ghds/react-native ships ESM dist but pulls react-native-svg, which the
      // framework already transpiles for web. Nothing extra is required here.
    },
  },
};

export default config;
