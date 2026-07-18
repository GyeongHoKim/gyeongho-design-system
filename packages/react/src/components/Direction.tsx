import { createContext, type ReactNode, useContext } from 'react';

/** Reading direction of the UI. */
export type Direction = 'ltr' | 'rtl';

const DirectionContext = createContext<Direction>('ltr');

export interface DirectionProviderProps {
  /** Reading direction applied to all descendant GHDS components. */
  dir: Direction;
  children?: ReactNode;
}

/**
 * Propagates a reading direction (`ltr` / `rtl`) to descendant GHDS components
 * through React context. Behavioral only — it renders no DOM element and owns
 * no design values, so there is no sketch layer.
 *
 * Set the matching `dir` attribute on your document/root element for CSS logical
 * properties to resolve; this provider lets components read the value in JS
 * (via {@link useDirection}) without each one inspecting the DOM.
 */
export function DirectionProvider({ dir, children }: DirectionProviderProps) {
  return <DirectionContext.Provider value={dir}>{children}</DirectionContext.Provider>;
}

/**
 * Reads the nearest ancestor {@link DirectionProvider}'s direction. Returns
 * `'ltr'` when no provider is present.
 */
export function useDirection(): Direction {
  return useContext(DirectionContext);
}
