import '@ghds/tokens/css';
// Self-hosted web fonts (Fontsource) — see the website Fonts guide.
import '@fontsource/gochi-hand/400.css';
import '@fontsource/gaegu/400.css';
import '@fontsource-variable/nunito-sans/wght.css';
import '@fontsource-variable/noto-sans-kr/wght.css';
import '@fontsource/pretendard/400.css';
import '@fontsource/pretendard/500.css';
import '@fontsource/pretendard/700.css';
import type { Decorator, Preview } from '@storybook/react-vite';
import isChromatic from 'chromatic/isChromatic';

// storycap exposes `window.emitCapture` on pages it drives — this is the same
// check `storycap`'s own `isScreenshot()` does. Inlined rather than imported:
// the `storycap` package barrel also exports `withScreenshot`, which pulls in
// a `@storybook/preview-api` version that conflicts with Storybook 9's build.
const isStorycap = (): boolean =>
  typeof window !== 'undefined' && !!(window as unknown as Record<string, unknown>).emitCapture;

// GHD-45: pin the sketch PRNG seed under Chromatic (and reg-suit/storycap) so the
// hand-drawn geometry is byte-deterministic across snapshot runs — otherwise every
// run re-rolls the random seed and reports a false visual diff. `isChromatic()`
// checks both the user agent and the `chromatic=true` URL param; `isStorycap()`
// is the equivalent signal for our self-hosted reg-suit/storycap pipeline.
// Key mirrors `DETERMINISTIC_SEED_GLOBAL` in @ghds/sketch-core; dev stays random.
if (isChromatic() || isStorycap()) {
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
  // Block every story's first render on web font load. Sketchy components measure
  // their box via ResizeObserver and redraw only when that size changes — if a
  // custom font (esp. the variable fonts) swaps in *after* first paint, the reflow
  // regenerates the hand-drawn geometry at a slightly different size, producing a
  // capture that differs run-to-run even with a pinned seed. Waiting here means the
  // font is already final before any component measures itself.
  loaders: [async () => ({ fontsReady: await document.fonts.ready.then(() => true) })],
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
    a11y: { test: 'error' },
  },
};

export default preview;
