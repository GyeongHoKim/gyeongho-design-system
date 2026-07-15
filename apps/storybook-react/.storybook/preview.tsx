import '@ghds/tokens/css';
// Self-hosted web fonts (Fontsource) — see the website Fonts guide.
import '@fontsource/gochi-hand/400.css';
import '@fontsource/gaegu/400.css';
import '@fontsource-variable/nunito-sans/wght.css';
import '@fontsource/pretendard/400.css';
import '@fontsource/pretendard/500.css';
import '@fontsource/pretendard/700.css';
import type { Decorator, Preview } from '@storybook/react-vite';
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
