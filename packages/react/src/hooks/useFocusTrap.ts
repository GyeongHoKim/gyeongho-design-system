import { type KeyboardEvent, type RefObject, useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface UseFocusTrapResult<E extends HTMLElement> {
  /** Attach to the element that should trap focus. */
  readonly containerRef: RefObject<E | null>;
  /** Attach to the container; forwards Escape and cycles Tab within the trap. */
  readonly onKeyDown: (event: KeyboardEvent<E>) => void;
}

/**
 * Shared overlay behaviour for modal surfaces (AlertDialog, Sheet, Drawer) —
 * the same contract `Modal` implements inline: while `active`, focus moves into
 * the container, `Tab`/`Shift+Tab` cycle within it, body scroll is locked, and
 * on deactivation focus returns to the previously-focused element. `onEscape`
 * is invoked when Escape is pressed.
 */
export function useFocusTrap<E extends HTMLElement = HTMLElement>(
  active: boolean,
  onEscape: () => void,
): UseFocusTrapResult<E> {
  const containerRef = useRef<E | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!active) {
      return;
    }
    previousFocus.current = (document.activeElement as HTMLElement) ?? null;
    const container = containerRef.current;
    const focusables = container?.querySelectorAll<HTMLElement>(FOCUSABLE);
    (focusables && focusables.length > 0 ? focusables[0] : container)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus?.();
    };
  }, [active]);

  const onKeyDown = (event: KeyboardEvent<E>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onEscapeRef.current();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const focusables = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const activeEl = document.activeElement;
    if (event.shiftKey && (activeEl === first || activeEl === container)) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && activeEl === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return { containerRef, onKeyDown };
}
