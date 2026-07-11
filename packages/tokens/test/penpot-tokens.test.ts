import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain-JS build script, no type declarations
import { buildBundle, themes, tokenSetOrder } from '../scripts/build-penpot-tokens.mjs';

// Guards the GHD-42 acceptance criteria for the Penpot import bundle:
// it parses, every `{alias}` reference is preserved (never resolved to a
// literal), every leaf carries an explicit `$type`, and the ref→sys→comp
// reference graph resolves within each theme.

interface Leaf {
  $type?: string;
  $value: unknown;
}

function isLeaf(node: unknown): node is Leaf {
  return typeof node === 'object' && node !== null && '$value' in node;
}

function collect(node: unknown, prefix: string, out: Map<string, Leaf>): void {
  if (isLeaf(node)) {
    out.set(prefix, node);
    return;
  }
  if (typeof node !== 'object' || node === null) {
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) {
      continue;
    }
    collect(child, prefix ? `${prefix}.${key}` : key, out);
  }
}

const WHOLE_ALIAS = /^\{([^}]+)\}$/;

const { bundle, stats } = buildBundle();

/** Leaves of one set, keyed by dot-path (path already carries the tier prefix). */
function leavesOf(setName: string): Map<string, Leaf> {
  const map = new Map<string, Leaf>();
  collect((bundle as Record<string, unknown>)[setName], '', map);
  return map;
}

describe('penpot token bundle: shape', () => {
  it('exposes the five tier sets plus $themes and $metadata', () => {
    expect(Object.keys(bundle).sort()).toEqual(
      ['$metadata', '$themes', 'comp', 'ref', 'sys', 'sys.color.dark', 'sys.color.light'].sort(),
    );
  });

  it('orders sets so sys.color.* overrides never collide with the base sys set', () => {
    expect(bundle.$metadata.tokenSetOrder).toEqual(tokenSetOrder);
  });

  it('ships Light and Dark themes that each enable exactly one sys.color set', () => {
    expect(themes.map((t) => t.name)).toEqual(['Light', 'Dark']);
    for (const theme of bundle.$themes) {
      const sets = theme.selectedTokenSets;
      expect(sets['sys.color.light'] === 'enabled').not.toBe(sets['sys.color.dark'] === 'enabled');
    }
  });
});

describe('penpot token bundle: preservation', () => {
  it('keeps every alias as an unresolved {reference}', () => {
    // A resolved bundle would contain literal hex/px values where aliases were.
    let aliasCount = 0;
    for (const setName of tokenSetOrder) {
      for (const leaf of leavesOf(setName).values()) {
        if (typeof leaf.$value === 'string' && leaf.$value.includes('{')) {
          expect(leaf.$value).toMatch(WHOLE_ALIAS);
          aliasCount += 1;
        }
      }
    }
    expect(aliasCount).toBe(stats.aliases);
    expect(aliasCount).toBeGreaterThan(0);
  });

  it('stamps an explicit $type on every leaf token', () => {
    for (const setName of tokenSetOrder) {
      for (const [path, leaf] of leavesOf(setName)) {
        expect(leaf.$type, `${setName} → ${path}`).toBeTypeOf('string');
      }
    }
    expect(stats.typed).toBe(stats.tokens);
  });

  it('preserves non-string primitive values (e.g. numeric 0)', () => {
    const ref = leavesOf('ref');
    expect(ref.get('ref.sketch.roughness.none')?.$value).toBe(0);
    expect(ref.get('ref.sketch.roughness.none')?.$type).toBe('number');
  });
});

describe('penpot token bundle: reference integrity', () => {
  for (const theme of themes) {
    it(`resolves every alias within the ${theme.name} theme`, () => {
      const enabled = Object.entries(theme.selectedTokenSets)
        .filter(([, state]) => state === 'enabled')
        .map(([name]) => name);

      const all = new Map<string, Leaf>();
      for (const setName of enabled) {
        for (const [path, leaf] of leavesOf(setName)) {
          all.set(path, leaf);
        }
      }

      const dangling: string[] = [];
      for (const setName of enabled) {
        for (const [path, leaf] of leavesOf(setName)) {
          if (typeof leaf.$value !== 'string') {
            continue;
          }
          const match = leaf.$value.match(WHOLE_ALIAS);
          if (match && !all.has(match[1])) {
            dangling.push(`${path} → {${match[1]}}`);
          }
        }
      }
      expect(dangling).toEqual([]);
    });
  }

  it('respects tier boundaries: comp→sys and sys→ref only', () => {
    const violations: string[] = [];
    for (const [path, leaf] of leavesOf('comp')) {
      if (typeof leaf.$value === 'string') {
        const match = leaf.$value.match(WHOLE_ALIAS);
        if (match && !match[1].startsWith('sys.')) {
          violations.push(`comp ${path} → ${match[1]}`);
        }
      }
    }
    for (const setName of ['sys', 'sys.color.light', 'sys.color.dark']) {
      for (const [path, leaf] of leavesOf(setName)) {
        if (typeof leaf.$value === 'string') {
          const match = leaf.$value.match(WHOLE_ALIAS);
          if (match && !match[1].startsWith('ref.')) {
            violations.push(`${setName} ${path} → ${match[1]}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
