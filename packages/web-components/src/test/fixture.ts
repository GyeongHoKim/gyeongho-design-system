import type { LitElement } from 'lit';

/** Append an element to the document body and wait for its first render. */
export async function mount<T extends LitElement>(element: T): Promise<T> {
  document.body.append(element);
  await element.updateComplete;
  return element;
}

/**
 * Return `list[index]`, failing the test with a clear message when it is
 * missing (`noUncheckedIndexedAccess` types every index as possibly undefined).
 */
export function nth<T>(list: ArrayLike<T>, index: number): T {
  const item = list[index];
  if (item === undefined) {
    throw new Error(`expected an item at index ${index}, found ${list.length}`);
  }
  return item;
}

/** Remove every child from the document body between tests. */
export function cleanup(): void {
  document.body.replaceChildren();
}

interface Measurable extends HTMLElement {
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
  const frame = (element as unknown as { frame?: HTMLElement }).frame ?? element;
  frame.getBoundingClientRect = () => rect;
  element.measure();
  await element.updateComplete;
}
