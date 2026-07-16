import { darkTheme, lightTheme, ThemeProvider } from '@ghds/react-native';
import type { Decorator, Preview } from '@storybook/react';
import isChromatic from 'chromatic/isChromatic';
import { View } from 'react-native';

// GHD-45: pin the sketch PRNG seed under Chromatic so the hand-drawn geometry is
// byte-deterministic across snapshot runs — otherwise every run re-rolls the
// random seed and reports a false visual diff. `isChromatic()` checks both the
// user agent and the `chromatic=true` URL param — the URL param is the reliable
// signal for React Native (web) Storybook, where the UA may not carry
// "Chromatic". Key mirrors `DETERMINISTIC_SEED_GLOBAL` in @ghds/sketch-core.
if (isChromatic()) {
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
