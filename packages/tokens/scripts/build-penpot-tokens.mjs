// build-penpot-tokens.mjs
//
// Emit a Penpot-importable design-token bundle from the DTCG source
// (`src/**/*.json`), NOT from the resolved `dist/json` output.
//
// Why source, not dist:
//   - dist/json has aliases already resolved to literal values; Penpot would
//     then store flat values with no `{ref…}` reference chain. We want Penpot
//     to hold the 3-tier reference graph so a token edit cascades the same way
//     it does in code.
//
// Output format: the Tokens Studio multi-set dialect that Penpot imports —
//   { <setName>: <tokenTree>, …, "$themes": [...], "$metadata": {...} }
// Sets map to the tier files; a Light/Dark theme toggles the two `sys.color`
// sets. See M14 Phase B (GHD-42).
//
// Normalization: GHDS source leans on DTCG group-level `$type` inheritance
// (e.g. `ref.palette.$type = "color"` applies to every ramp step). Not every
// DTCG consumer honours inheritance, so we propagate `$type` down onto every
// leaf token and drop the now-redundant group markers. `$value` (and therefore
// every `{alias}` reference) is never touched.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = join(__dirname, '..');
const SRC = join(PKG, 'src');
const OUT_DIR = join(PKG, 'dist', 'penpot');
const OUT_FILE = join(OUT_DIR, 'penpot.tokens.json');

/** Read + parse one JSON file. */
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

/** List `*.json` files in a src subdirectory, sorted for deterministic output. */
const jsonFiles = (subdir) =>
  readdirSync(join(SRC, subdir))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => join(SRC, subdir, f));

/** Deep-merge plain objects (used to fold many tier files into one tree). */
function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && !('$value' in v)) {
      target[k] = deepMerge(target[k] && typeof target[k] === 'object' ? target[k] : {}, v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

/** Merge every file in a subdir into a single token tree. */
function mergeDir(subdir) {
  return jsonFiles(subdir).reduce((acc, p) => deepMerge(acc, readJson(p)), {});
}

const isToken = (node) => node && typeof node === 'object' && Object.hasOwn(node, '$value');

/**
 * Return a copy of `node` where every leaf token carries an explicit `$type`
 * (inherited from the nearest ancestor when absent) and group-level `$type`
 * markers are removed. `$value` is copied verbatim — aliases stay as `{…}`.
 * `stats` accumulates metrics for the validation summary.
 */
function normalize(node, inheritedType, stats) {
  const ownType = node.$type ?? inheritedType;

  if (isToken(node)) {
    stats.tokens += 1;
    const out = {};
    // $type first for readability
    const resolvedType = node.$type ?? inheritedType;
    if (resolvedType !== undefined) {
      out.$type = resolvedType;
      stats.typed += 1;
      if (node.$type === undefined) stats.stampedFromGroup += 1;
    }
    out.$value = node.$value;
    if (typeof node.$value === 'string' && node.$value.includes('{')) {
      stats.aliases += 1;
    }
    if (node.$description !== undefined) out.$description = node.$description;
    return out;
  }

  // Group node: recurse, drop its own $type (now carried by the leaves).
  const out = {};
  if (node.$description !== undefined) out.$description = node.$description;
  for (const [k, v] of Object.entries(node)) {
    if (k === '$type' || k === '$description') continue;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = normalize(v, ownType, stats);
    }
  }
  return out;
}

// Order matters for Tokens Studio: later sets override earlier ones on the
// same token path. The two `sys.color.*` sets share paths but are never both
// enabled, so no real collision occurs.
export const tokenSetOrder = ['ref', 'sys', 'sys.color.light', 'sys.color.dark', 'comp'];

const baseSets = { ref: 'enabled', sys: 'enabled', comp: 'enabled' };
export const themes = [
  {
    id: 'ghds-theme-light',
    name: 'Light',
    group: 'Color scheme',
    selectedTokenSets: {
      ...baseSets,
      'sys.color.light': 'enabled',
      'sys.color.dark': 'disabled',
    },
  },
  {
    id: 'ghds-theme-dark',
    name: 'Dark',
    group: 'Color scheme',
    selectedTokenSets: {
      ...baseSets,
      'sys.color.light': 'disabled',
      'sys.color.dark': 'enabled',
    },
  },
];

/**
 * Build the Penpot import bundle from `src/**`. Pure: reads source files,
 * returns `{ bundle, stats }`, writes nothing. The CLI wrapper below handles
 * output; tests call this directly.
 */
export function buildBundle() {
  const stats = { tokens: 0, aliases: 0, typed: 0, stampedFromGroup: 0 };
  const sets = {
    ref: normalize(mergeDir('ref'), undefined, stats),
    sys: normalize(readJson(join(SRC, 'sys', '_shared.json')), undefined, stats),
    'sys.color.light': normalize(readJson(join(SRC, 'sys', 'light.json')), undefined, stats),
    'sys.color.dark': normalize(readJson(join(SRC, 'sys', 'dark.json')), undefined, stats),
    comp: normalize(mergeDir('comp'), undefined, stats),
  };
  const bundle = { ...sets, $themes: themes, $metadata: { tokenSetOrder } };
  return { bundle, stats };
}

/** Write the bundle to `dist/penpot/` and print a validation summary. */
function main() {
  const { bundle, stats } = buildBundle();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');

  const rel = OUT_FILE.replace(`${PKG}/`, '');
  console.log(`penpot:tokens → ${rel}`);
  console.log(
    `  sets: ${tokenSetOrder.join(', ')}  |  themes: ${themes.map((t) => t.name).join(', ')}`,
  );
  console.log(
    `  tokens: ${stats.tokens}  aliases preserved: ${stats.aliases}  ` +
      `typed leaves: ${stats.typed} (of which ${stats.stampedFromGroup} inherited from a group)`,
  );

  if (stats.typed !== stats.tokens) {
    console.error(
      `  ⚠ ${stats.tokens - stats.typed} token(s) have no resolvable $type — check the source tiers.`,
    );
    process.exitCode = 1;
  }
}

// Run only when invoked directly (`node scripts/build-penpot-tokens.mjs`),
// not when imported by the test suite.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
