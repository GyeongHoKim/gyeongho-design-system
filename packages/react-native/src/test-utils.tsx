import { ThemeProvider } from '@shopify/restyle';
import { type RenderOptions, type RenderResult, render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { darkTheme, lightTheme, type Theme } from './theme/theme.js';

type Wrapper = (props: { children: ReactNode }) => ReactElement;

/**
 * One wrapper per theme object, created once and reused, so `rerender` keeps
 * the same wrapper component instead of remounting the tree.
 */
const wrappers = new WeakMap<Theme, Wrapper>();

function wrapperFor(theme: Theme): Wrapper {
  let wrapper = wrappers.get(theme);
  if (!wrapper) {
    wrapper = ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;
    wrappers.set(theme, wrapper);
  }
  return wrapper;
}

/** Render a component inside the GHDS Restyle `ThemeProvider` (light by default). */
export function renderWithTheme(
  ui: ReactElement,
  theme: Theme = lightTheme,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: wrapperFor(theme), ...options });
}

export { darkTheme, lightTheme };
