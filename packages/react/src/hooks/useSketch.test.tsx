import { rectangle, roundedRectangle, setForcedSeed } from '@ghds/sketch-core';
import { render } from '@testing-library/react';
import { type JSX, useRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { type UseSketchParams, type UseSketchResult, useSketch } from './useSketch.js';

type ResultHolder = { current: UseSketchResult<HTMLDivElement> | null };

const SOLID: UseSketchParams = { roughness: 1.4, bowing: 2, fillStyle: 'solid' };

/** Runs `useSketch` with `params` and stores the latest result in `result`. */
function Probe({ params, result }: { params: UseSketchParams; result: ResultHolder }): JSX.Element {
  const sketch = useSketch<HTMLDivElement>(params);
  result.current = sketch;
  return <div ref={sketch.ref} />;
}

/** Records every seed `useSketch` returns, one per render. */
function SeedProbe({ seeds }: { seeds: number[] }): JSX.Element {
  const renders = useRef(0);
  renders.current += 1;
  const sketch = useSketch<HTMLDivElement>({ roughness: 1.4, bowing: 2 });
  seeds.push(sketch.seed);
  return <div ref={sketch.ref}>{renders.current}</div>;
}

describe('useSketch', () => {
  afterEach(() => setForcedSeed(null));

  it('generates deterministic geometry once a size is measured', () => {
    const result: ResultHolder = { current: null };
    render(<Probe params={SOLID} result={result} />);

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
    const { rerender } = render(<SeedProbe seeds={seeds} />);
    rerender(<SeedProbe seeds={seeds} />);
    rerender(<SeedProbe seeds={seeds} />);
    // Every observed seed value is identical (no per-render reshuffle).
    expect(new Set(seeds).size).toBe(1);
  });

  it('uses the host-pinned seed for snapshot determinism (GHD-45)', () => {
    // With a forced seed, separate mounts must produce byte-identical geometry —
    // this is what stops Chromatic from reporting false diffs every run.
    setForcedSeed(0x5eed);
    const a: ResultHolder = { current: null };
    const b: ResultHolder = { current: null };
    render(
      <>
        <Probe params={SOLID} result={a} />
        <Probe params={SOLID} result={b} />
      </>,
    );

    expect(a.current?.seed).toBe(0x5eed);
    expect(b.current?.seed).toBe(0x5eed);
    expect(a.current?.drawable?.strokePaths).toEqual(b.current?.drawable?.strokePaths);
    expect(a.current?.drawable?.fillPaths).toEqual(b.current?.drawable?.fillPaths);
  });

  function drawableFor(params: UseSketchParams) {
    const result: ResultHolder = { current: null };
    render(<Probe params={params} result={result} />);
    return result.current?.drawable;
  }

  it('draws roundedRectangle when radius > 0 (inset applied)', () => {
    setForcedSeed(0x5eed);
    // The mock ResizeObserver reports 160×48; inset 2 leaves 156×44.
    expect(drawableFor({ roughness: 1.4, bowing: 2, inset: 2, radius: 9999 })).toEqual(
      roundedRectangle(2, 2, 156, 44, 9999, { roughness: 1.4, bowing: 2, seed: 0x5eed }),
    );
  });

  it('without radius → unchanged rectangle output', () => {
    setForcedSeed(0x5eed);
    expect(drawableFor({ roughness: 1.4, bowing: 2, inset: 2 })).toEqual(
      rectangle(2, 2, 156, 44, { roughness: 1.4, bowing: 2, seed: 0x5eed }),
    );
  });
});
