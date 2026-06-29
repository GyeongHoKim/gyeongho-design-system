import '@ghds/tokens/css';
import type { Decorator, Preview } from '@storybook/react-vite';

/**
 * Wraps every story in a themed surface. The `data-theme` attribute drives the
 * CSS variables emitted by `@ghds/tokens/css`, so switching the Theme toolbar
 * re-colors the sketchy components live (they consume `var(--…)` tokens).
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
  return (
    <div
      data-theme={theme}
      style={{
        background: 'var(--sys-color-bg-canvas)',
        color: 'var(--sys-color-text-primary)',
        padding: 'var(--sys-spacing-xl)',
        minHeight: '100vh',
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'GHDS color scheme',
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
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
};

export default preview;
