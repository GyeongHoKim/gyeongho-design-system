import '@ghds/tokens/css';
import '@ghds/web-components';
import type { Preview } from '@storybook/web-components';

/**
 * Dark mode is a pure CSS-variable override. The decorator below sets
 * `data-theme` on <html>, exactly as a real consumer would, and the token
 * stylesheet swaps every `--sys-*` value — no component re-render needed.
 */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: { test: 'error' },
  },
  globalTypes: {
    theme: {
      description: 'GHDS color theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      return story();
    },
  ],
};

export default preview;
