import { type RefObject, useEffect } from 'react';

/** Options for {@link useLoopingAnimation}. */
export interface LoopingAnimationOptions {
  /** Duration of one iteration, in milliseconds. */
  durationMs: number;
  /** CSS timing function. Defaults to `'linear'`. */
  easing?: string;
  /** When `false`, the animation does not run (e.g. a determinate Progress). */
  enabled?: boolean;
}

/**
 * Run an infinite Web Animations API animation on `ref`, automatically
 * suppressed under `prefers-reduced-motion: reduce`. Shared by Spinner,
 * Progress, and Skeleton so the reduced-motion guard and lifecycle live in one
 * place rather than being copy-pasted per component.
 */
export function useLoopingAnimation(
  ref: RefObject<Element | null>,
  keyframes: Keyframe[],
  options: LoopingAnimationOptions,
): void {
  const { durationMs, easing = 'linear', enabled = true } = options;
  // biome-ignore lint/correctness/useExhaustiveDependencies: `keyframes` is a call-site-stable literal; re-runs are governed by the primitive deps.
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof el.animate !== 'function') {
      return;
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const animation = el.animate(keyframes, {
      duration: durationMs,
      easing,
      iterations: Number.POSITIVE_INFINITY,
    });
    return () => animation.cancel();
  }, [ref, durationMs, easing, enabled]);
}
