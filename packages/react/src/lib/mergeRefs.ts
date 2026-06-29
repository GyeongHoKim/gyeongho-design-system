import type { MutableRefObject, Ref, RefCallback } from 'react';

/**
 * Compose several React refs into a single callback ref. Used to attach both the
 * `useSketch` measuring ref and any caller-forwarded ref to the same node.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref !== null && ref !== undefined) {
        (ref as MutableRefObject<T | null>).current = node;
      }
    }
  };
}
