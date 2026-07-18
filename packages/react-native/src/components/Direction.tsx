import { createContext, type ReactNode, useContext } from 'react';
import { I18nManager } from 'react-native';

/** Reading direction of the UI. */
export type Direction = 'ltr' | 'rtl';

/**
 * Default direction. Unlike the web build (which defaults to `'ltr'`), RN reads
 * the app's own layout direction via `I18nManager` so a component with no
 * {@link DirectionProvider} above it still respects a right-to-left app.
 */
const defaultDirection: Direction = I18nManager.isRTL ? 'rtl' : 'ltr';

const DirectionContext = createContext<Direction>(defaultDirection);

/** Props for {@link DirectionProvider}. */
export interface DirectionProviderProps {
  /** Reading direction applied to all descendant GHDS components. */
  dir: Direction;
  children?: ReactNode;
}

/**
 * Propagates a reading direction (`ltr` / `rtl`) to descendant GHDS components
 * through React context. Behavioural only — it renders no element and owns no
 * design values, so there is no sketch layer. When absent, {@link useDirection}
 * falls back to the app's `I18nManager` layout direction.
 */
export function DirectionProvider({ dir, children }: DirectionProviderProps) {
  return <DirectionContext.Provider value={dir}>{children}</DirectionContext.Provider>;
}

/**
 * Reads the nearest ancestor {@link DirectionProvider}'s direction. Returns the
 * app's `I18nManager` layout direction when no provider is present.
 */
export function useDirection(): Direction {
  return useContext(DirectionContext);
}
