import { darkTheme, lightTheme, ThemeProvider } from '@ghds/react-native';
import type { Decorator, Preview } from '@storybook/react';
import { View } from 'react-native';

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
