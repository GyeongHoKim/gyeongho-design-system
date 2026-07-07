import { type DependencyList, useEffect } from 'react';
import { AccessibilityInfo, type Animated } from 'react-native';

/**
 * Start an `Animated` loop unless the OS "reduce motion" setting is on, and
 * stop it on cleanup. Shared by Spinner, Progress, and Skeleton so the
 * reduce-motion guard and loop lifecycle live in one place rather than being
 * copy-pasted per component.
 *
 * @param createLoop  Lazily builds the loop (closes over the caller's `Animated.Value`s).
 * @param deps        Effect dependencies — re-create the loop when these change.
 * @param enabled     When `false`, no loop runs (e.g. a determinate Progress).
 */
export function useReducedMotionLoop(
  createLoop: () => Animated.CompositeAnimation,
  deps: DependencyList,
  enabled = true,
): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: `createLoop` closes over the caller's animated values; re-runs are governed by `deps`.
  useEffect(() => {
    if (!enabled) {
      return;
    }
    let cancelled = false;
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled || reduce) {
        return;
      }
      loop = createLoop();
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [...deps, enabled]);
}
