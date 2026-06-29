import { ThemeProvider } from '@shopify/restyle';
import { type RenderOptions, type RenderResult, render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { darkTheme, lightTheme, type Theme } from './theme/theme.js';

/** Render a component inside the GHDS Restyle `ThemeProvider` (light by default). */
export function renderWithTheme(
  ui: ReactElement,
  theme: Theme = lightTheme,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...options });
}

export { darkTheme, lightTheme };
