import '@ghds/tokens/css';
// Self-hosted web fonts (Fontsource) — see the website Fonts guide.
import '@fontsource/gochi-hand/400.css';
import '@fontsource/gaegu/400.css';
import '@fontsource-variable/nunito-sans/wght.css';
import '@fontsource-variable/noto-sans-kr/wght.css';
import '@fontsource/pretendard/400.css';
import '@fontsource/pretendard/500.css';
import '@fontsource/pretendard/700.css';
import type { Preview } from '@storybook/web-components';
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
 * Dark mode is a pure CSS-variable override. The decorator below sets
 * `data-theme` on <html>, exactly as a real consumer would, and the token
 * stylesheet swaps every `--sys-*` value — no component re-render needed.
 */
const preview: Preview = {
  // Block every story's first render on web font load. Sketchy components measure
  // their box via ResizeObserver and redraw only when that size changes — if a
  // custom font (esp. the variable fonts) swaps in *after* first paint, the reflow
  // regenerates the hand-drawn geometry at a slightly different size, producing a
  // capture that differs run-to-run even with a pinned seed. Waiting here means the
  // font is already final before any component measures itself.
  loaders: [async () => ({ fontsReady: await document.fonts.ready.then(() => true) })],
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
