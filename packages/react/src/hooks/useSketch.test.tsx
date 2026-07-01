import { setForcedSeed } from '@ghds/sketch-core';
import { render } from '@testing-library/react';
import { type JSX, useRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { type UseSketchResult, useSketch } from './useSketch.js';

function capture(result: { current: UseSketchResult<HTMLDivElement> | null }) {
  function Probe(): JSX.Element {
    const sketch = useSketch<HTMLDivElement>({ roughness: 1.4, bowing: 2, fillStyle: 'solid' });
    result.current = sketch;
    return <div ref={sketch.ref} />;
  }
  return Probe;
}

describe('useSketch', () => {
  afterEach(() => setForcedSeed(null));

  it('generates deterministic geometry once a size is measured', () => {
    const result = { current: null as UseSketchResult<HTMLDivElement> | null };
    const Probe = capture(result);
    render(<Probe />);

    expect(result.current).not.toBeNull();
    const sketch = result.current as UseSketchResult<HTMLDivElement>;
    // The mock ResizeObserver reports a non-zero box, so a drawable is produced.
    expect(sketch.drawable).not.toBeNull();
    expect(sketch.drawable?.strokePaths.length).toBeGreaterThan(0);
    expect(sketch.drawable?.fillPaths.length).toBeGreaterThan(0);
    expect(sketch.size.width).toBeGreaterThan(0);
    expect(sketch.seed).toBeGreaterThan(0);
  });

  it('keeps a stable seed across re-renders', () => {
    const seeds: number[] = [];
    function Probe(): JSX.Element {
      const renders = useRef(0);
      renders.current += 1;
      const sketch = useSketch<HTMLDivElement>({ roughness: 1.4, bowing: 2 });
      seeds.push(sketch.seed);
      return <div ref={sketch.ref}>{renders.current}</div>;
    }
    const { rerender } = render(<Probe />);
    rerender(<Probe />);
    rerender(<Probe />);
    // Every observed seed value is identical (no per-render reshuffle).
    expect(new Set(seeds).size).toBe(1);
  });

  it('uses the host-pinned seed for snapshot determinism (GHD-45)', () => {
    // With a forced seed, separate mounts must produce byte-identical geometry —
    // this is what stops Chromatic from reporting false diffs every run.
    setForcedSeed(0x5eed);
    const a = { current: null as UseSketchResult<HTMLDivElement> | null };
    const b = { current: null as UseSketchResult<HTMLDivElement> | null };
    const ProbeA = capture(a);
    const ProbeB = capture(b);
    render(
      <>
        <ProbeA />
        <ProbeB />
      </>,
    );

    expect(a.current?.seed).toBe(0x5eed);
    expect(b.current?.seed).toBe(0x5eed);
    expect(a.current?.drawable?.strokePaths).toEqual(b.current?.drawable?.strokePaths);
    expect(a.current?.drawable?.fillPaths).toEqual(b.current?.drawable?.fillPaths);
  });
});
