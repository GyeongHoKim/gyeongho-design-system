import { type RefObject, useEffect } from 'react';

/**
 * Invoke `onOutside` when a `pointerdown` lands outside every element in `refs`,
 * while `active` is true. `pointerdown` (rather than `click`) fires before the
 * trigger's own click handler, avoiding the "outside click reopens the trigger"
 * race. Shared by overlay components (Select, Menu, …) so the close-on-outside
 * behaviour lives in one place.
 */
export function useClickOutside(
  refs: ReadonlyArray<RefObject<Element | null>>,
  active: boolean,
  onOutside: () => void,
): void {
  useEffect(() => {
    if (!active) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (refs.every((ref) => !ref.current?.contains(target))) {
        onOutside();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [active, onOutside, refs]);
}
