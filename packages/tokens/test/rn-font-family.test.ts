import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// Generated build output: type-checks only after `pnpm build`. `pnpm check-types`
// through turbo builds this package first; a direct script run needs `pnpm build`.
import { darkTokens, lightTokens } from '../dist/rn/index.js';

// React Native takes a single family name, not a CSS stack. The RN build maps
// each `ref.fontFamily` stack to a face that covers both Latin and Korean, as a
// `{ ios, android }` table of weight-specific family names (the fonts'
// PostScript names). Those names match the `expo-font` config plugin and bare
// RN linking on both platforms. A stack edit must never silently change them.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

type WeightTable = Record<string, string>;
interface FaceTable {
  ios: WeightTable;
  android: WeightTable;
}

const SANS: WeightTable = {
  400: 'NotoSansKR-Regular',
  500: 'NotoSansKR-Medium',
  700: 'NotoSansKR-Bold',
};
// Gaegu ships Regular and Bold only; 500 resolves to Regular (CSS matching rule).
const SKETCH: WeightTable = { 400: 'Gaegu-Regular', 500: 'Gaegu-Regular', 700: 'Gaegu-Bold' };

const EXPECTED_RN_FAMILY: Record<string, FaceTable> = {
  sketch: { ios: SKETCH, android: SKETCH },
  sans: { ios: SANS, android: SANS },
  mono: {
    ios: { 400: 'Menlo-Regular', 500: 'Menlo-Regular', 700: 'Menlo-Bold' },
    // Android has no Menlo; `monospace` is its system mono face.
    android: { 400: 'monospace', 500: 'monospace', 700: 'monospace' },
  },
};

const EXPECTED_ROLE_STACK = {
  heading: 'sketch',
  title: 'sketch',
  body: 'sans',
  label: 'sans',
  caption: 'sans',
  code: 'mono',
} as const;

// The face each role resolves to at its own weight, per platform.
const EXPECTED_ROLE_FACE = {
  heading: { ios: 'Gaegu-Bold', android: 'Gaegu-Bold' },
  title: { ios: 'Gaegu-Bold', android: 'Gaegu-Bold' },
  body: { ios: 'NotoSansKR-Regular', android: 'NotoSansKR-Regular' },
  label: { ios: 'NotoSansKR-Medium', android: 'NotoSansKR-Medium' },
  caption: { ios: 'NotoSansKR-Regular', android: 'NotoSansKR-Regular' },
  code: { ios: 'Menlo-Regular', android: 'monospace' },
} as const;

interface FontFamilyTokens {
  ref: { fontFamily: Record<string, FaceTable>; fontWeight: Record<string, number> };
  sys: { typography: Record<string, { fontFamily?: FaceTable; fontWeight?: number }> };
}

describe('React Native font families', () => {
  for (const [name, tokens] of [
    ['light', lightTokens],
    ['dark', darkTokens],
  ] as const) {
    const typed = tokens as unknown as FontFamilyTokens;
    const roles = Object.entries(typed.sys.typography).filter(
      ([, style]) => style.fontFamily !== undefined,
    );

    it(`maps every ref.fontFamily stack to its RN face table (${name})`, () => {
      expect(typed.ref.fontFamily).toEqual(EXPECTED_RN_FAMILY);
    });

    it(`names a face for every ref.fontWeight on both platforms (${name})`, () => {
      const weights = Object.values(typed.ref.fontWeight).map(String).sort();
      for (const table of Object.values(typed.ref.fontFamily)) {
        expect(Object.keys(table.ios).sort()).toEqual(weights);
        expect(Object.keys(table.android).sort()).toEqual(weights);
      }
    });

    it(`maps every sys.typography role to its stack's face table (${name})`, () => {
      const roleFamily = Object.fromEntries(roles.map(([role, style]) => [role, style.fontFamily]));
      const expected = Object.fromEntries(
        Object.entries(EXPECTED_ROLE_STACK).map(([role, stack]) => [
          role,
          EXPECTED_RN_FAMILY[stack],
        ]),
      );
      expect(roleFamily).toEqual(expected);
    });

    it(`resolves every role to a weight-specific face at its own weight (${name})`, () => {
      const roleFace = Object.fromEntries(
        roles.map(([role, style]) => {
          const weight = String(style.fontWeight);
          const table = style.fontFamily as FaceTable;
          return [role, { ios: table.ios[weight], android: table.android[weight] }];
        }),
      );
      expect(roleFace).toEqual(EXPECTED_ROLE_FACE);
    });
  }
});

describe('web font stacks', () => {
  const group: Record<string, unknown> = JSON.parse(
    readFileSync(path.join(ROOT, 'src/ref/typography.json'), 'utf8'),
  ).ref.fontFamily;

  const families = (stack: string): string[] => {
    const value = (group[stack] as { $value: string }).$value;
    return value.split(',').map((name) => name.trim().replace(/^(['"])(.*)\1$/, '$2'));
  };

  const stackNames = Object.keys(group).filter((key) => !key.startsWith('$'));

  // @fontsource-variable/noto-sans-kr registers "Noto Sans KR Variable".
  // Nothing GHDS documents registers the bare "Noto Sans KR" family.
  it.each(stackNames)('%s never names the bare Noto Sans KR family', (stack) => {
    expect(families(stack)).not.toContain('Noto Sans KR');
  });

  it.each(['sans', 'mono'])('%s falls back to Noto Sans KR Variable for Hangul', (stack) => {
    expect(families(stack)).toContain('Noto Sans KR Variable');
  });
});
