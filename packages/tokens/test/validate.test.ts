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
const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number];

function themeFile(theme: Theme): string {
  return path.join(SRC, 'sys', `${theme}.json`);
}

function themeMap(theme: Theme): TokenMap {
  return loadFiles([...REF_FILES, SHARED_FILE, themeFile(theme), ...COMP_FILES]);
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

// --- Contrast matrix (generated, not a hardcoded subset) ---
//
// Thresholds per WCAG 2.1: 4.5:1 for normal body text (1.4.3); 3:1 for large
// text and informational non-text UI such as icons and state-bearing borders
// (1.4.11). Every text/icon/border role is checked against EVERY neutral
// background surface, so a regression in any pairing fails the build.
//
// EXEMPT (WCAG 1.4.3): `disabled` text/background and purely decorative borders
// (`border.default`/`strong`/`subtle`) carry no contrast requirement and are
// intentionally excluded from the required matrix.
const BG_SURFACES = ['bg.canvas', 'bg.surface', 'bg.muted', 'bg.subtle'] as const;
const TEXT_ROLES = ['text.primary', 'text.secondary', 'text.link'] as const;
const ICON_ROLES = ['icon.default', 'icon.muted'] as const;
const BORDER_INFO_ROLES = ['border.focus', 'border.danger'] as const;

// Text drawn on filled semantic backgrounds (its own foreground/background pair).
const ON_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['text.onPrimary', 'bg.primary.default'],
  ['text.onPrimary', 'bg.primary.hover'],
  ['text.onPrimary', 'bg.primary.active'],
  ['text.onDanger', 'bg.danger.default'],
  ['text.onDanger', 'bg.danger.hover'],
  ['text.onDanger', 'bg.danger.active'],
  ['text.onSuccess', 'bg.success.default'],
  ['text.onSuccess', 'bg.success.hover'],
  ['text.onWarning', 'bg.warning.default'],
  ['text.onWarning', 'bg.warning.hover'],
  ['text.onInfo', 'bg.info.default'],
  ['text.onInfo', 'bg.info.hover'],
];

interface Pair {
  fg: string;
  bg: string;
  min: number;
}

function contrastMatrix(): Pair[] {
  const pairs: Pair[] = [];
  for (const text of TEXT_ROLES) {
    for (const bg of BG_SURFACES) {
      pairs.push({ fg: text, bg, min: 4.5 });
    }
  }
  for (const icon of ICON_ROLES) {
    for (const bg of BG_SURFACES) {
      pairs.push({ fg: icon, bg, min: 3 });
    }
  }
  for (const border of BORDER_INFO_ROLES) {
    for (const bg of BG_SURFACES) {
      pairs.push({ fg: border, bg, min: 3 });
    }
  }
  for (const [fg, bg] of ON_PAIRS) {
    pairs.push({ fg, bg, min: 4.5 });
  }
  return pairs;
}

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

describe('theme parity', () => {
  function semanticKeys(theme: Theme): string[] {
    const map: TokenMap = new Map();
    flatten(JSON.parse(readFileSync(themeFile(theme), 'utf8')), '', undefined, map);
    return [...map.keys()].sort();
  }

  it('light and dark define an identical set of semantic keys', () => {
    const light = semanticKeys('light');
    const dark = semanticKeys('dark');
    const onlyLight = light.filter((key) => !dark.includes(key));
    const onlyDark = dark.filter((key) => !light.includes(key));
    expect(onlyLight, `keys missing from dark.json: ${onlyLight.join(', ')}`).toEqual([]);
    expect(onlyDark, `keys missing from light.json: ${onlyDark.join(', ')}`).toEqual([]);
  });
});

describe('WCAG 2.1 AA contrast', () => {
  for (const theme of THEMES) {
    const map = themeMap(theme);
    for (const pair of contrastMatrix()) {
      it(`${theme}: ${pair.fg} on ${pair.bg} ≥ ${pair.min}:1`, () => {
        const ratio = contrast(
          resolve(`sys.color.${pair.fg}`, map),
          resolve(`sys.color.${pair.bg}`, map),
        );
        expect(ratio).toBeGreaterThanOrEqual(pair.min);
      });
    }
  }
});

describe('token map integrity & orphans', () => {
  it('loads a non-empty token map with the expected core roles', () => {
    const map = themeMap('light');
    // A glob/path regression that returns zero (or too few) tokens must FAIL here.
    expect(map.size).toBeGreaterThan(100);
    for (const required of [
      'ref.palette.brand.500',
      'sys.color.bg.surface',
      'sys.color.text.primary',
      'sys.sketch.roughness',
      'comp.button.bg.primary.default',
    ]) {
      expect(map.has(required), `missing required token ${required}`).toBe(true);
    }
  });

  it('reports ref tokens that no sys/comp token consumes (warning only)', () => {
    const referenced = new Set<string>();
    for (const theme of THEMES) {
      for (const [, entry] of themeMap(theme)) {
        for (const ref of referencesIn(entry.value)) {
          referenced.add(ref);
        }
      }
    }
    const map = themeMap('light');
    const orphans = [...map.keys()].filter(
      (tokenPath) => tierOf(tokenPath) === 'ref' && !referenced.has(tokenPath),
    );
    if (orphans.length > 0) {
      // Orphan ref tokens are allowed (palette completeness) — warn, do not fail.
      console.warn(`[tokens] ${orphans.length} orphan ref token(s):\n  ${orphans.join('\n  ')}`);
    }
    expect(referenced.size).toBeGreaterThan(0);
  });
});
