import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain-JS build script, no type declarations
import {
  buildBundle,
  sourceLeafPaths,
  themes,
  tokenSetOrder,
} from '../scripts/build-penpot-tokens.mjs';
// @ts-expect-error — plain-JS build script, no type declarations
import { EXCLUDED_DTCG_TYPES, PENPOT_TOKEN_TYPES } from '../scripts/penpot-token-types.mjs';

// Guards the GHD-42 acceptance criteria for the Penpot import bundle:
// it parses, every `{alias}` reference is preserved (never resolved to a
// literal), every leaf carries an explicit `$type`, and the ref→sys→comp
// reference graph resolves within each theme.
//
// Plus the dialect contract: GHDS authors W3C DTCG types, Penpot accepts only
// its own 17. Anything Penpot cannot store is dropped — with its aliases —
// rather than emitted as a token Penpot will reject at import.

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

describe('penpot token bundle: dialect', () => {
  it('types every leaf with one of the types Penpot accepts', () => {
    const foreign: string[] = [];
    for (const setName of tokenSetOrder) {
      for (const [path, leaf] of leavesOf(setName)) {
        if (!PENPOT_TOKEN_TYPES.has(leaf.$type as string)) {
          foreign.push(`${path} → ${leaf.$type}`);
        }
      }
    }
    expect(foreign).toEqual([]);
  });

  it('maps each DTCG dimension onto the Penpot type for its role', () => {
    const ref = leavesOf('ref');
    const sys = leavesOf('sys');
    const comp = leavesOf('comp');
    // Penpot gates which shape property a token may be applied to by its
    // type, so a padding token typed `dimension` would be unusable in the UI.
    expect(ref.get('ref.spacing.4')?.$type).toBe('spacing');
    expect(ref.get('ref.radius.md')?.$type).toBe('borderRadius');
    expect(ref.get('ref.borderWidth.thin')?.$type).toBe('borderWidth');
    expect(ref.get('ref.fontSize.md')?.$type).toBe('fontSizes');
    expect(ref.get('ref.iconSize.md')?.$type).toBe('sizing');
    expect(ref.get('ref.letterSpacing.wide')?.$type).toBe('letterSpacing');
    // `sys.border.width.*` is a border width, not a sizing token — the rule
    // order in penpot-token-types.mjs is what makes this hold.
    expect(sys.get('sys.border.width.default')?.$type).toBe('borderWidth');
    expect(sys.get('sys.typography.tracking.wide')?.$type).toBe('letterSpacing');
    expect(comp.get('comp.button.padding.horizontal')?.$type).toBe('spacing');
    expect(comp.get('comp.checkbox.size')?.$type).toBe('sizing');
    expect(comp.get('comp.separator.thickness')?.$type).toBe('borderWidth');
  });

  it('routes the DTCG types Penpot lacks to their nearest equivalent', () => {
    const ref = leavesOf('ref');
    // No duration type in Penpot; milliseconds survive as a bare number.
    expect(ref.get('ref.duration.fast')).toEqual({ $type: 'number', $value: 120 });
    expect(ref.get('ref.opacity.disabled')?.$type).toBe('opacity');
    expect(ref.get('ref.fontFamily.sans')?.$type).toBe('fontFamilies');
    expect(ref.get('ref.fontWeight.regular')).toEqual({ $type: 'fontWeights', $value: '400' });
  });

  it('keeps font stacks quoted so Penpot splits them on commas, not spaces', () => {
    const sans = leavesOf('ref').get('ref.fontFamily.sans')?.$value as string;
    // Unquoted, Penpot resolves "Nunito Sans Variable" to three families.
    expect(sans).toContain("'Nunito Sans Variable'");
    expect(sans.split(',').length).toBeGreaterThan(1);
  });

  it('expands shadows into the array-of-strings composite Penpot stores', () => {
    const md = leavesOf('ref').get('ref.shadow.md');
    expect(md?.$type).toBe('shadow');
    expect(md?.$value).toEqual([
      {
        color: 'rgba(28, 25, 22, 0.12)',
        inset: 'false',
        offsetX: '0px',
        offsetY: '2px',
        blur: '6px',
        spread: '0px',
      },
    ]);
    // Downstream tiers still alias rather than re-expand.
    expect(leavesOf('sys').get('sys.shadow.md')?.$value).toBe('{ref.shadow.md}');
  });
});

describe('penpot token bundle: exclusions', () => {
  const emitted = new Set<string>();
  for (const setName of tokenSetOrder) {
    for (const path of leavesOf(setName).keys()) {
      emitted.add(path);
    }
  }

  it('drops cubicBezier tokens and everything that aliases them', () => {
    // Penpot rejects a token whose alias does not resolve, so dropping
    // ref.easing.* without dropping sys.animation.easing.* would fail the
    // entire import — not just the easing tokens.
    expect(EXCLUDED_DTCG_TYPES.has('cubicBezier')).toBe(true);
    expect(stats.dropped).toEqual([
      'ref.easing.accelerate',
      'ref.easing.decelerate',
      'ref.easing.emphasized',
      'ref.easing.standard',
      'sys.animation.easing.emphasized',
      'sys.animation.easing.enter',
      'sys.animation.easing.exit',
      'sys.animation.easing.standard',
    ]);
    for (const path of stats.dropped) {
      expect(emitted.has(path)).toBe(false);
    }
  });

  it('emits every source token that was not explicitly dropped', () => {
    // Drift guard: a token may only leave the bundle through the reported
    // exclusion list, never by falling through a mapping gap.
    const expected = new Set<string>(sourceLeafPaths());
    for (const path of stats.dropped) {
      expected.delete(path);
    }
    expect([...emitted].sort()).toEqual([...expected].sort());
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
