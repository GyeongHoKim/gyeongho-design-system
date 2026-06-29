import '@testing-library/jest-dom/vitest';

/**
 * jsdom ships no layout engine, so it has no `ResizeObserver` and every element
 * measures 0×0. `useSketch` only generates geometry once it has a non-zero size,
 * so we install a minimal observer that reports a deterministic box. This lets
 * component tests assert that sketch paths are actually rendered.
 */
const MOCK_WIDTH = 160;
const MOCK_HEIGHT = 48;

class MockResizeObserver implements ResizeObserver {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    const box: ResizeObserverSize = {
      inlineSize: MOCK_WIDTH,
      blockSize: MOCK_HEIGHT,
    };
    const entry = {
      target,
      contentRect: {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: MOCK_WIDTH,
        bottom: MOCK_HEIGHT,
        width: MOCK_WIDTH,
        height: MOCK_HEIGHT,
        toJSON: () => ({}),
      } as DOMRectReadOnly,
      borderBoxSize: [box],
      contentBoxSize: [box],
      devicePixelContentBoxSize: [box],
    } satisfies ResizeObserverEntry;
    this.callback([entry], this);
  }

  unobserve(): void {}

  disconnect(): void {}
}

globalThis.ResizeObserver = MockResizeObserver;
