import type { LitElement } from 'lit';

/** Append an element to the document body and wait for its first render. */
export async function mount<T extends LitElement>(element: T): Promise<T> {
  document.body.append(element);
  await element.updateComplete;
  return element;
}

/** Remove every child from the document body between tests. */
export function cleanup(): void {
  document.body.replaceChildren();
}

interface Measurable {
  measure(): void;
  updateComplete: Promise<boolean>;
}

/**
 * Force a measured size on a {@link SketchyBase} element (jsdom reports a
 * zero box). Stubs `getBoundingClientRect` on the element's measured frame
 * (which may be an internal sub-region), re-measures, and awaits the render so
 * the sketch `<svg>` paths are present.
 */
export async function setSize(element: Measurable, width: number, height: number): Promise<void> {
  const rect = {
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
  const frame = (element as unknown as { frame?: HTMLElement }).frame ?? (element as HTMLElement);
  frame.getBoundingClientRect = () => rect;
  element.measure();
  await element.updateComplete;
}
