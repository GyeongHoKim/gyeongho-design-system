import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

type Tier = 'ref' | 'sys' | 'comp';

interface TokenEntry {
  value: unknown;
  type: string | undefined;
}

type TokenMap = Map<string, TokenEntry>;

const REFERENCE = /\{([^}]+)\}/g;
const WHOLE_REFERENCE = /^\{([^}]+)\}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function flatten(
  node: unknown,
  prefix: string,
  inherited: string | undefined,
  out: TokenMap,
): void {
  if (!isRecord(node)) {
    return;
  }
  if ('$value' in node) {
    const type = typeof node.$type === 'string' ? node.$type : inherited;
    out.set(prefix, { value: node.$value, type });
    return;
  }
  const nextType = typeof node.$type === 'string' ? node.$type : inherited;
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) {
      continue;
    }
    flatten(child, prefix ? `${prefix}.${key}` : key, nextType, out);
  }
}

function loadFiles(files: string[]): TokenMap {
  const map: TokenMap = new Map();
  for (const file of files) {
    const json = JSON.parse(readFileSync(file, 'utf8'));
    flatten(json, '', undefined, map);
  }
  return map;
}

function jsonFilesIn(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(dir, name));
}

const REF_FILES = jsonFilesIn(path.join(SRC, 'ref'));
const COMP_FILES = jsonFilesIn(path.join(SRC, 'comp'));
const SHARED_FILE = path.join(SRC, 'sys', '_shared.json');

function themeMap(theme: 'light' | 'dark'): TokenMap {
  return loadFiles([
    ...REF_FILES,
    SHARED_FILE,
    path.join(SRC, 'sys', `${theme}.json`),
    ...COMP_FILES,
  ]);
}

function tierOf(tokenPath: string): Tier {
  return tokenPath.split('.')[0] as Tier;
}

function referencesIn(value: unknown): string[] {
  if (typeof value !== 'string') {
    return [];
  }
  return [...value.matchAll(REFERENCE)].map((match) => match[1] as string);
}

function resolve(tokenPath: string, map: TokenMap, seen = new Set<string>()): string {
  if (seen.has(tokenPath)) {
    throw new Error(`circular reference at ${tokenPath}`);
  }
  seen.add(tokenPath);
  const entry = map.get(tokenPath);
  if (!entry) {
    throw new Error(`missing token ${tokenPath}`);
  }
  if (typeof entry.value === 'string') {
    const whole = WHOLE_REFERENCE.exec(entry.value);
    if (whole) {
      return resolve(whole[1] as string, map, seen);
    }
  }
  return String(entry.value);
}

// --- WCAG relative luminance / contrast ---
function channel(srgb: number): number {
  const c = srgb / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

interface Pair {
  text: string;
  bg: string;
  large?: boolean;
}

const CONTRAST_PAIRS: Pair[] = [
  { text: 'sys.color.text.primary', bg: 'sys.color.bg.surface' },
  { text: 'sys.color.text.primary', bg: 'sys.color.bg.canvas' },
  { text: 'sys.color.text.secondary', bg: 'sys.color.bg.surface' },
  { text: 'sys.color.text.secondary', bg: 'sys.color.bg.canvas' },
  { text: 'sys.color.text.link', bg: 'sys.color.bg.surface' },
  { text: 'sys.color.text.link', bg: 'sys.color.bg.canvas' },
  { text: 'sys.color.text.disabled', bg: 'sys.color.bg.surface', large: true },
  { text: 'sys.color.text.disabled', bg: 'sys.color.bg.canvas', large: true },
  { text: 'sys.color.text.onPrimary', bg: 'sys.color.bg.primary.default' },
  { text: 'sys.color.text.onPrimary', bg: 'sys.color.bg.primary.hover' },
  { text: 'sys.color.text.onPrimary', bg: 'sys.color.bg.primary.active' },
  { text: 'sys.color.text.onDanger', bg: 'sys.color.bg.danger.default' },
  { text: 'sys.color.text.onDanger', bg: 'sys.color.bg.danger.hover' },
  { text: 'sys.color.text.onDanger', bg: 'sys.color.bg.danger.active' },
  { text: 'sys.color.text.onSuccess', bg: 'sys.color.bg.success.default' },
  { text: 'sys.color.text.onSuccess', bg: 'sys.color.bg.success.hover' },
  { text: 'sys.color.text.onWarning', bg: 'sys.color.bg.warning.default' },
  { text: 'sys.color.text.onWarning', bg: 'sys.color.bg.warning.hover' },
  { text: 'sys.color.text.onInfo', bg: 'sys.color.bg.info.default' },
  { text: 'sys.color.text.onInfo', bg: 'sys.color.bg.info.hover' },
];

const THEMES = ['light', 'dark'] as const;

describe('alias resolution', () => {
  for (const theme of THEMES) {
    it(`every reference resolves (${theme})`, () => {
      const map = themeMap(theme);
      for (const [tokenPath, entry] of map) {
        for (const ref of referencesIn(entry.value)) {
          expect(map.has(ref), `${tokenPath} → {${ref}} is dangling`).toBe(true);
        }
      }
    });
  }
});

describe('tier boundaries', () => {
  const allowed: Record<Tier, Tier[]> = {
    ref: [],
    sys: ['ref'],
    comp: ['sys'],
  };
  for (const theme of THEMES) {
    it(`tokens only reference the tier directly below (${theme})`, () => {
      const map = themeMap(theme);
      for (const [tokenPath, entry] of map) {
        const fromTier = tierOf(tokenPath);
        for (const ref of referencesIn(entry.value)) {
          const toTier = tierOf(ref);
          expect(
            allowed[fromTier].includes(toTier),
            `${tokenPath} (${fromTier}) illegally references ${ref} (${toTier})`,
          ).toBe(true);
        }
      }
    });
  }

  it('ref tokens are pure values (reference nothing)', () => {
    const map = themeMap('light');
    for (const [tokenPath, entry] of map) {
      if (tierOf(tokenPath) === 'ref') {
        expect(referencesIn(entry.value).length, `${tokenPath} must be a literal`).toBe(0);
      }
    }
  });
});

describe('no circular references', () => {
  for (const theme of THEMES) {
    it(`reference graph is acyclic (${theme})`, () => {
      const map = themeMap(theme);
      const state = new Map<string, 'visiting' | 'done'>();
      const walk = (node: string): void => {
        const current = state.get(node);
        if (current === 'done') {
          return;
        }
        expect(current, `cycle through ${node}`).not.toBe('visiting');
        state.set(node, 'visiting');
        const entry = map.get(node);
        if (entry) {
          for (const ref of referencesIn(entry.value)) {
            walk(ref);
          }
        }
        state.set(node, 'done');
      };
      for (const tokenPath of map.keys()) {
        walk(tokenPath);
      }
    });
  }
});

describe('WCAG 2.1 AA contrast', () => {
  for (const theme of THEMES) {
    const map = themeMap(theme);
    for (const pair of CONTRAST_PAIRS) {
      const threshold = pair.large ? 3 : 4.5;
      it(`${theme}: ${pair.text} on ${pair.bg} ≥ ${threshold}:1`, () => {
        const ratio = contrast(resolve(pair.text, map), resolve(pair.bg, map));
        expect(ratio).toBeGreaterThanOrEqual(threshold);
      });
    }
  }
});

describe('orphan tokens (warning only)', () => {
  it('reports ref tokens that no sys/comp token consumes', () => {
    const referenced = new Set<string>();
    for (const theme of THEMES) {
      for (const [, entry] of themeMap(theme)) {
        for (const ref of referencesIn(entry.value)) {
          referenced.add(ref);
        }
      }
    }
    const map = themeMap('light');
    const orphans: string[] = [];
    for (const tokenPath of map.keys()) {
      if (tierOf(tokenPath) === 'ref' && !referenced.has(tokenPath)) {
        orphans.push(tokenPath);
      }
    }
    if (orphans.length > 0) {
      // Warning, not a failure — orphan ref tokens are allowed (palette completeness).
      console.warn(`[tokens] ${orphans.length} orphan ref token(s):\n  ${orphans.join('\n  ')}`);
    }
    expect(Array.isArray(orphans)).toBe(true);
  });
});
