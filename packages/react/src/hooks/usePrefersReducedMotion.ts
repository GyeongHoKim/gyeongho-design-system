import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function mediaQuery(): MediaQueryList | null {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY)
    : null;
}

function subscribe(onChange: () => void): () => void {
  const query = mediaQuery();
  if (!query) return () => {};
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  return mediaQuery()?.matches ?? false;
}

// The server cannot know the OS setting, so it renders without motion and the
// client corrects it after hydration.
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Whether the user asks for reduced motion (`prefers-reduced-motion: reduce`).
 * Follows OS setting changes live. Returns `true` on the server and `false`
 * where `matchMedia` is unavailable.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
