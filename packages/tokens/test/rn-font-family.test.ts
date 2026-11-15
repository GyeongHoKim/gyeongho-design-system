import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// @ts-expect-error — generated build output, resolved after `pnpm build`
import { darkTokens, lightTokens } from '../dist/rn/index.js';

// React Native takes a single family name, not a CSS stack. The RN build maps
// each `ref.fontFamily` stack to one face that covers both Latin and Korean.
// A stack edit must never silently change that face.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
