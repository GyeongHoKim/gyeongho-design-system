/**
 * Single-source token reader for the Design Style page.
 *
 * Everything here is DERIVED from the built `@ghds/tokens` output — the same
 * object the React and Lit component libraries consume. No design value is
 * hand-copied: we import the generated `tokens` (light) and `darkTokens`
 * objects and walk them. If a token changes in `@ghds/tokens`, these pages
 * update automatically on the next build.
 */
import { darkTokens, tokens } from '@ghds/tokens';

/** A token leaf value. Most leaves are strings, but `lineHeight` (1.5) and
 * `fontWeight` (400) are emitted as numbers — both must be representable. */
export type TokenLeaf = string | number;

/** A recursive, read-only tree of design tokens whose leaves are scalars. */
export type TokenTree = { readonly [key: string]: TokenLeaf | TokenTree };

/** A resolved token: its dotted path plus its light (and optional dark) value. */
export interface FlatToken {
  /** Dotted token path, e.g. `sys.color.bg.primary.default`. */
  readonly path: string;
  /** The matching generated CSS custom property, e.g. `--sys-color-bg-primary-default`. */
  readonly cssVar: string;
  /** Resolved value in the light theme, e.g. `#3e47c9` or `1.5`. */
  readonly value: TokenLeaf;
  /** Resolved value in the dark theme, present only when it differs from light. */
  readonly darkValue?: TokenLeaf;
}

// `tokens`/`darkTokens` are deeply-readonly token trees with scalar leaves, so
// they satisfy `TokenTree` structurally — no unsafe cast needed.
const light: TokenTree = tokens;
const dark: TokenTree = darkTokens;

function isTree(node: TokenLeaf | TokenTree): node is TokenTree {
  return typeof node === 'object';
}

/** The generated CSS variable name for a dotted token path. */
export function toCssVar(path: string): string {
  return `--${path.replace(/\./g, '-')}`;
}

/** Walk to a nested subtree by dotted path (throws if the path is missing). */
function at(root: TokenTree, path: string): TokenTree {
  let node: TokenLeaf | TokenTree = root;
  for (const key of path.split('.')) {
    if (!isTree(node) || !(key in node)) {
      throw new Error(`Unknown token path: ${path}`);
    }
    node = node[key] as TokenLeaf | TokenTree;
  }
  if (!isTree(node)) {
    throw new Error(`Token path is a leaf, expected a subtree: ${path}`);
  }
  return node;
}

/** Flatten a token subtree (depth-first) into `{ path, cssVar, value }` rows. */
function flatten(node: TokenTree, prefix: string): FlatToken[] {
  const out: FlatToken[] = [];
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isTree(value)) {
      out.push(...flatten(value, path));
    } else {
      out.push({ path, cssVar: toCssVar(path), value });
    }
  }
  return out;
}

/**
 * Flatten a subtree into resolved token rows. When `withDark` is set, each row
 * also gets a `darkValue` wherever the dark theme differs from light — the dark
 * tree is only traversed when asked, so theme-invariant sections (spacing,
 * radius, shadow) skip the extra work entirely.
 */
export function section(dotted: string, withDark = false): FlatToken[] {
  const lightRows = flatten(at(light, dotted), dotted);
  if (!withDark) {
    return lightRows;
  }
  const darkRows = new Map(flatten(at(dark, dotted), dotted).map((row) => [row.path, row.value]));
  return lightRows.map((row) => {
    const darkValue = darkRows.get(row.path);
    return darkValue !== undefined && darkValue !== row.value ? { ...row, darkValue } : row;
  });
}

/** A named family of reference color swatches, e.g. `brand` → 50…900. */
export interface PaletteFamily {
  readonly name: string;
  readonly swatches: FlatToken[];
}

/** The reference color palette (`ref.palette.*`), grouped by family. */
export function paletteFamilies(): PaletteFamily[] {
  const palette = at(light, 'ref.palette');
  const families: PaletteFamily[] = [];
  for (const [name, value] of Object.entries(palette)) {
    if (isTree(value)) {
      families.push({ name, swatches: flatten(value, `ref.palette.${name}`) });
    } else {
      // Standalone swatch (white / black) — present it as a single-item family.
      const path = `ref.palette.${name}`;
      families.push({ name, swatches: [{ path, cssVar: toCssVar(path), value }] });
    }
  }
  return families;
}

/** One semantic typography role (`sys.typography.<role>`). */
export interface TypographyRole {
  readonly role: string;
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight: string;
}

/** The semantic typography scale (`sys.typography.*`). Only role-shaped entries
 * (those carrying a `fontSize`) are returned — sibling groups such as
 * `tracking` are not type roles and are skipped. */
export function typographyRoles(): TypographyRole[] {
  const typography = at(light, 'sys.typography');
  const roles: TypographyRole[] = [];
  for (const [role, value] of Object.entries(typography)) {
    if (isTree(value) && 'fontSize' in value) {
      roles.push({
        role,
        fontFamily: String(value.fontFamily ?? ''),
        fontSize: String(value.fontSize ?? ''),
        lineHeight: String(value.lineHeight ?? ''),
        fontWeight: String(value.fontWeight ?? ''),
      });
    }
  }
  return roles;
}

/** Convenience accessors for the Design Style page sections. */
export const designStyle = {
  palette: paletteFamilies,
  // Colors are the only theme-variant section, so they request dark values.
  semanticColors: (): FlatToken[] => section('sys.color', true),
  typography: typographyRoles,
  spacing: (): FlatToken[] => section('sys.spacing'),
  radius: (): FlatToken[] => section('sys.radius'),
  shadow: (): FlatToken[] => section('sys.shadow'),
};
