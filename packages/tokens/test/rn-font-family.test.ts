import { describe, expect, it } from 'vitest';
// @ts-expect-error — generated build output, resolved after `pnpm build`
import { darkTokens, lightTokens } from '../dist/rn/index.js';

// React Native takes a single family name, not a CSS stack. The RN build maps
// each `ref.fontFamily` stack to one face that covers both Latin and Korean.
// A stack edit must never silently change that face.

const EXPECTED_RN_FAMILY = {
  sketch: 'Gaegu',
  sans: 'NotoSansKR',
  mono: 'Menlo',
} as const;

const EXPECTED_ROLE_FAMILY = {
  heading: 'Gaegu',
  title: 'Gaegu',
  body: 'NotoSansKR',
  label: 'NotoSansKR',
  caption: 'NotoSansKR',
  code: 'Menlo',
} as const;

interface FontFamilyTokens {
  ref: { fontFamily: Record<string, string> };
  sys: { typography: Record<string, { fontFamily?: string }> };
}

describe('React Native font families', () => {
  for (const [name, tokens] of [
    ['light', lightTokens],
    ['dark', darkTokens],
  ] as const) {
    const typed = tokens as FontFamilyTokens;

    it(`maps every ref.fontFamily stack to its RN face (${name})`, () => {
      expect(typed.ref.fontFamily).toEqual(EXPECTED_RN_FAMILY);
    });

    it(`maps every sys.typography role to its RN face (${name})`, () => {
      const roleFamily = Object.fromEntries(
        Object.entries(typed.sys.typography)
          .filter(([, style]) => style.fontFamily !== undefined)
          .map(([role, style]) => [role, style.fontFamily]),
      );
      expect(roleFamily).toEqual(EXPECTED_ROLE_FAMILY);
    });
  }
});
