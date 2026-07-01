import '@ghds/tokens/css';
import '@ghds/web-components';
import type { Preview } from '@storybook/web-components';
import isChromatic from 'chromatic/isChromatic';

// GHD-45: pin the sketch PRNG seed under Chromatic so the hand-drawn geometry is
// byte-deterministic across snapshot runs — otherwise every run re-rolls the
// random seed and reports a false visual diff. `isChromatic()` checks both the
// user agent and the `chromatic=true` URL param (robust across Storybook types).
// Key mirrors `DETERMINISTIC_SEED_GLOBAL` in @ghds/sketch-core; dev stays random.
if (isChromatic()) {
  (globalThis as Record<string, unknown>).__GHDS_SKETCH_SEED__ = 0x5eed;
}

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
