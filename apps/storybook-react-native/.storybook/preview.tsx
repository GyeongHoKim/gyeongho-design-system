import { darkTheme, lightTheme, ThemeProvider } from '@ghds/react-native/theme';
import type { Decorator, Preview } from '@storybook/react';
import { View } from 'react-native';

// storycap exposes `window.emitCapture` on pages it drives — this is the same
// check `storycap`'s own `isScreenshot()` does. Inlined rather than imported:
// the `storycap` package barrel also exports `withScreenshot`, which pulls in
// a `@storybook/preview-api` version that conflicts with Storybook 9's build.
const isStorycap = (): boolean =>
  typeof window !== 'undefined' && !!(window as unknown as Record<string, unknown>).emitCapture;

// GHD-45: pin the sketch PRNG seed under storycap so the hand-drawn geometry is
// byte-deterministic across snapshot runs — otherwise every run re-rolls the
// random seed and reports a false visual diff. Key mirrors
// `DETERMINISTIC_SEED_GLOBAL` in @ghds/sketch-core; dev stays random.
if (isStorycap()) {
  (globalThis as Record<string, unknown>).__GHDS_SKETCH_SEED__ = 0x5eed;
}

/**
 * Global theme switcher. `@ghds/react-native` ships both light and dark Restyle
 * themes (built from `@ghds/tokens`); the app picks one — here a Storybook
 * toolbar control does.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'dark' ? darkTheme : lightTheme;
  return (
    <ThemeProvider theme={theme}>
      <View style={{ padding: 24, backgroundColor: theme.colors.bgCanvas }}>
        <Story />
      </View>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'error' },
  },
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
  decorators: [withTheme],
};

export default preview;
