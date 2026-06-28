import { fill } from '../fillers/fill.js';
import { mulberry32 } from '../prng.js';
import type { Point, SketchDrawable, SketchOptions } from '../types.js';
import { polylinePaths } from './double-line.js';
import { isElevated, offsetPoints, shadowRng } from './elevation.js';

/** Target edge length (px) when flattening a curve into line segments. */
const SEGMENT_LENGTH = 10;
/** Cap on segments per curve so a pathological control polygon can't explode. */
const MAX_CURVE_SEGMENTS = 256;
/** Angular step (rad) when flattening an elliptical arc. */
const ARC_SEGMENT_ANGLE = Math.PI / 8;

/** One parsed SVG path command: its letter plus already-collected operands. */
interface PathCommand {
  key: string;
  data: number[];
}

/** A flattened subpath: a polyline plus whether it is closed (a `Z`/`z`). */
export interface Subpath {
  points: Point[];
  closed: boolean;
}

const SEP = /^[\s,]+/;
const NUMBER = /^[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/;
const FLAG = /^[01]/;
const PARAM_COUNT: Record<string, number> = {
  m: 2,
  l: 2,
  h: 1,
  v: 1,
  c: 6,
  s: 4,
  q: 4,
  t: 2,
  a: 7,
  z: 0,
};

/**
 * Parse an SVG path `d` string into absolute-agnostic commands. Handles every
 * standard command (`M L H V C S Q T A Z`, absolute & relative), comma/space
 * separators, implicit repeated commands (a lone `M x y x y` ⇒ a `moveto` then a
 * `lineto`), and the single-digit arc flags that may be packed without a
 * separator. Throws on malformed input rather than guessing.
 */
function parsePathData(d: string): PathCommand[] {
  let s = d.trim();
  const commands: PathCommand[] = [];

  const eatSep = (): void => {
    const m = s.match(SEP);
    if (m) {
      s = s.slice(m[0].length);
    }
  };
  const eatNumber = (): number => {
    eatSep();
    const m = s.match(NUMBER);
    if (!m) {
      throw new Error(`Invalid path data: expected a number near "${s.slice(0, 12)}"`);
    }
    s = s.slice(m[0].length);
    return Number.parseFloat(m[0]);
  };
  const eatFlag = (): number => {
    eatSep();
    const m = s.match(FLAG);
    if (!m) {
      throw new Error(`Invalid path data: expected a 0/1 flag near "${s.slice(0, 12)}"`);
    }
    s = s.slice(m[0].length);
    return m[0] === '1' ? 1 : 0;
  };

  let lastKey = '';
  while (s.length > 0) {
    eatSep();
    if (s.length === 0) {
      break;
    }
    const ch = s[0] ?? '';
    let key: string;
    if (/[A-Za-z]/.test(ch)) {
      key = ch;
      s = s.slice(1);
    } else {
      if (!lastKey) {
        throw new Error('Invalid path data: must start with a moveto (M/m) command');
      }
      // Implicit repeat: extra coordinates after an explicit command. A repeated
      // moveto degrades to a lineto, per the SVG path grammar.
      key = lastKey === 'M' ? 'L' : lastKey === 'm' ? 'l' : lastKey;
      if (key === 'Z' || key === 'z') {
        throw new Error('Invalid path data: numbers cannot follow a closepath');
      }
    }

    const lower = key.toLowerCase();
    const count = PARAM_COUNT[lower];
    if (count === undefined) {
      throw new Error(`Invalid path data: unknown command "${key}"`);
    }
    if (lower === 'a') {
      // rx ry x-axis-rotation large-arc-flag sweep-flag x y
      commands.push({
        key,
        data: [
          eatNumber(),
          eatNumber(),
          eatNumber(),
          eatFlag(),
          eatFlag(),
          eatNumber(),
          eatNumber(),
        ],
      });
    } else {
      const data: number[] = [];
      for (let i = 0; i < count; i++) {
        data.push(eatNumber());
      }
      commands.push({ key, data });
    }
    lastKey = key;
  }
  return commands;
}

function dist(a: Point, b: Point): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** Segment count for a curve, from a control-polygon length estimate. */
function segmentCount(length: number): number {
  return Math.min(Math.max(Math.ceil(length / SEGMENT_LENGTH), 1), MAX_CURVE_SEGMENTS);
}

/** Sample a cubic Bézier, returning points for t in (0, 1] (start excluded). */
function cubicPoints(p0: Point, p1: Point, p2: Point, p3: Point): Point[] {
  const n = segmentCount(dist(p0, p1) + dist(p1, p2) + dist(p2, p3));
  const out: Point[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const e = t * t * t;
    out.push([
      a * p0[0] + b * p1[0] + c * p2[0] + e * p3[0],
      a * p0[1] + b * p1[1] + c * p2[1] + e * p3[1],
    ]);
  }
  return out;
}

/** Sample a quadratic Bézier, returning points for t in (0, 1] (start excluded). */
function quadPoints(p0: Point, p1: Point, p2: Point): Point[] {
  const n = segmentCount(dist(p0, p1) + dist(p1, p2));
  const out: Point[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const a = u * u;
    const b = 2 * u * t;
    const c = t * t;
    out.push([a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]);
  }
  return out;
}

/** Signed angle from vector u to vector v. */
function vectorAngle(ux: number, uy: number, vx: number, vy: number): number {
  const dot = ux * vx + uy * vy;
  const len = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
  let a = Math.acos(Math.min(1, Math.max(-1, len === 0 ? 1 : dot / len)));
  if (ux * vy - uy * vx < 0) {
    a = -a;
  }
  return a;
}

/**
 * Flatten an SVG elliptical arc (endpoint parameterization) into sampled points
 * for t in (0, 1] (start excluded), via the center parameterization from SVG
 * spec appendix F.6.5.
 */
function arcPoints(
  p0: Point,
  rxIn: number,
  ryIn: number,
  rotationDeg: number,
  largeArc: number,
  sweep: number,
  end: Point,
): Point[] {
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if (rx === 0 || ry === 0 || (p0[0] === end[0] && p0[1] === end[1])) {
    return [end];
  }
  const phi = (rotationDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const dx = (p0[0] - end[0]) / 2;
  const dy = (p0[1] - end[1]) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  // Scale up the radii if they are too small to span the endpoints.
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const scale = Math.sqrt(lambda);
    rx *= scale;
    ry *= scale;
  }

  const rxs = rx * rx;
  const rys = ry * ry;
  const num = Math.max(0, rxs * rys - rxs * y1p * y1p - rys * x1p * x1p);
  const den = rxs * y1p * y1p + rys * x1p * x1p;
  let coef = den === 0 ? 0 : Math.sqrt(num / den);
  if (largeArc === sweep) {
    coef = -coef;
  }
  const cxp = (coef * (rx * y1p)) / ry;
  const cyp = (coef * -(ry * x1p)) / rx;

  const cx = cosPhi * cxp - sinPhi * cyp + (p0[0] + end[0]) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (p0[1] + end[1]) / 2;

  const theta1 = vectorAngle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dTheta = vectorAngle(
    (x1p - cxp) / rx,
    (y1p - cyp) / ry,
    (-x1p - cxp) / rx,
    (-y1p - cyp) / ry,
  );
  if (!sweep && dTheta > 0) {
    dTheta -= 2 * Math.PI;
  } else if (sweep && dTheta < 0) {
    dTheta += 2 * Math.PI;
  }

  const n = Math.min(
    Math.max(Math.ceil(Math.abs(dTheta) / ARC_SEGMENT_ANGLE), 2),
    MAX_CURVE_SEGMENTS,
  );
  const out: Point[] = [];
  for (let i = 1; i <= n; i++) {
    const t = theta1 + (dTheta * i) / n;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    out.push([
      cx + rx * cosT * cosPhi - ry * sinT * sinPhi,
      cy + rx * cosT * sinPhi + ry * sinT * cosPhi,
    ]);
  }
  return out;
}

/** Reflect `ctrl` through `cur` (for the smooth S/T shorthand control point). */
function reflect(cur: Point, ctrl: Point | null): Point {
  return ctrl ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]] : [cur[0], cur[1]];
}

/** Convert parsed commands into absolute, flattened polyline subpaths. */
export function linearizePath(d: string): Subpath[] {
  const commands = parsePathData(d);
  const first = commands[0];
  if (first && first.key.toLowerCase() !== 'm') {
    throw new Error('Invalid path data: must start with a moveto (M/m) command');
  }
  const subpaths: Subpath[] = [];
  let current: Subpath | null = null;
  let cur: Point = [0, 0];
  let start: Point = [0, 0];
  let prevCubicCtrl: Point | null = null;
  let prevQuadCtrl: Point | null = null;

  const ensure = (): Subpath => {
    if (!current) {
      current = { points: [[cur[0], cur[1]]], closed: false };
      subpaths.push(current);
    }
    return current;
  };

  for (const { key, data } of commands) {
    const rel = key === key.toLowerCase();
    const bx = rel ? cur[0] : 0;
    const by = rel ? cur[1] : 0;

    switch (key.toLowerCase()) {
      case 'm': {
        cur = [bx + (data[0] ?? 0), by + (data[1] ?? 0)];
        start = [cur[0], cur[1]];
        current = { points: [[cur[0], cur[1]]], closed: false };
        subpaths.push(current);
        prevCubicCtrl = null;
        prevQuadCtrl = null;
        break;
      }
      case 'l': {
        cur = [bx + (data[0] ?? 0), by + (data[1] ?? 0)];
        ensure().points.push([cur[0], cur[1]]);
        prevCubicCtrl = null;
        prevQuadCtrl = null;
        break;
      }
      case 'h': {
        cur = [bx + (data[0] ?? 0), cur[1]];
        ensure().points.push([cur[0], cur[1]]);
        prevCubicCtrl = null;
        prevQuadCtrl = null;
        break;
      }
      case 'v': {
        cur = [cur[0], by + (data[0] ?? 0)];
        ensure().points.push([cur[0], cur[1]]);
        prevCubicCtrl = null;
        prevQuadCtrl = null;
        break;
      }
      case 'c': {
        const c1: Point = [bx + (data[0] ?? 0), by + (data[1] ?? 0)];
        const c2: Point = [bx + (data[2] ?? 0), by + (data[3] ?? 0)];
        const end: Point = [bx + (data[4] ?? 0), by + (data[5] ?? 0)];
        ensure().points.push(...cubicPoints(cur, c1, c2, end));
        cur = end;
        prevCubicCtrl = c2;
        prevQuadCtrl = null;
        break;
      }
      case 's': {
        const c1 = reflect(cur, prevCubicCtrl);
        const c2: Point = [bx + (data[0] ?? 0), by + (data[1] ?? 0)];
        const end: Point = [bx + (data[2] ?? 0), by + (data[3] ?? 0)];
        ensure().points.push(...cubicPoints(cur, c1, c2, end));
        cur = end;
        prevCubicCtrl = c2;
        prevQuadCtrl = null;
        break;
      }
      case 'q': {
        const c1: Point = [bx + (data[0] ?? 0), by + (data[1] ?? 0)];
        const end: Point = [bx + (data[2] ?? 0), by + (data[3] ?? 0)];
        ensure().points.push(...quadPoints(cur, c1, end));
        cur = end;
        prevQuadCtrl = c1;
        prevCubicCtrl = null;
        break;
      }
      case 't': {
        const c1 = reflect(cur, prevQuadCtrl);
        const end: Point = [bx + (data[0] ?? 0), by + (data[1] ?? 0)];
        ensure().points.push(...quadPoints(cur, c1, end));
        cur = end;
        prevQuadCtrl = c1;
        prevCubicCtrl = null;
        break;
      }
      case 'a': {
        const end: Point = [bx + (data[5] ?? 0), by + (data[6] ?? 0)];
        ensure().points.push(
          ...arcPoints(
            cur,
            data[0] ?? 0,
            data[1] ?? 0,
            data[2] ?? 0,
            data[3] ?? 0,
            data[4] ?? 0,
            end,
          ),
        );
        cur = end;
        prevCubicCtrl = null;
        prevQuadCtrl = null;
        break;
      }
      case 'z': {
        if (current) {
          current.closed = true;
        }
        cur = [start[0], start[1]];
        prevCubicCtrl = null;
        prevQuadCtrl = null;
        break;
      }
    }
  }
  return subpaths;
}

/**
 * Parse an SVG path `d` string and render it as sketchy, jittered path data —
 * the entry point for icons and curved components. Curves (`C/S/Q/T`) and arcs
 * (`A`) are flattened to line segments, then every segment is double-stroked
 * with the same seeded jitter as {@link line}/{@link polygon}, so a path's hand
 * drawn look is identical to the rest of the engine and fully deterministic for
 * a given seed. Closed subpaths (`Z`) can be filled via `o.fillStyle`, and the
 * whole path casts a drop shadow when `o.elevation > 0`.
 */
export function path(d: string, o: SketchOptions): SketchDrawable {
  const subpaths = linearizePath(d);
  const rng = mulberry32(o.seed);

  const strokePaths: string[] = [];
  for (const sp of subpaths) {
    if (sp.points.length < 2) {
      continue;
    }
    strokePaths.push(...polylinePaths(sp.points, sp.closed, o, rng));
  }

  // Stroke first, then fill (closed subpaths only) — one shared rng keeps the
  // whole path reproducible as a unit, matching polygon's ordering.
  const fillPaths: string[] = [];
  for (const sp of subpaths) {
    if (sp.closed && sp.points.length >= 3) {
      fillPaths.push(...fill(sp.points, o, rng));
    }
  }

  if (isElevated(o)) {
    const srng = shadowRng(o.seed);
    const shadowPaths: string[] = [];
    for (const sp of subpaths) {
      if (sp.points.length < 2) {
        continue;
      }
      shadowPaths.push(
        ...polylinePaths(offsetPoints(sp.points, o.elevation ?? 0), sp.closed, o, srng),
      );
    }
    return { strokePaths, fillPaths, shadowPaths };
  }
  return { strokePaths, fillPaths };
}
