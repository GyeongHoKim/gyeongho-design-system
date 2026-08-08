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
// leaf token and drop the now-redundant group markers.
//
// Dialect: GHDS authors W3C DTCG types, Penpot speaks Tokens Studio. Every
// leaf is translated through `penpot-token-types.mjs` — `$type` to one of
// Penpot's 17 types, `$value` to the shape Penpot stores for it. `{alias}`
// values are never touched, so the comp→sys→ref graph survives the trip.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dropExcluded, penpotTypeFor, penpotValueFor } from './penpot-token-types.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = join(__dirname, '..');
const SRC = join(PKG, 'src');
const OUT_DIR = join(PKG, 'dist', 'penpot');
const OUT_FILE = join(OUT_DIR, 'penpot.tokens.json');
const PAYLOAD_FILE = join(OUT_DIR, 'plugin-payload.json');

/** Read + parse one JSON file. */
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

/** List `*.json` files in a src subdirectory, sorted for deterministic output. */
const jsonFiles = (subdir) =>
  readdirSync(join(SRC, subdir))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => join(SRC, subdir, f));

// Skip keys that would walk the prototype chain — token files are trusted
// local source, but a stray `__proto__`/`constructor`/`prototype` key must
// never reach `target[k] = …` (CodeQL: prototype-polluting function).
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Deep-merge plain objects (used to fold many tier files into one tree). */
function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (UNSAFE_KEYS.has(k)) continue;
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
 * Flatten a tier tree into `leaves` (dot-path → leaf) so the exclusion cascade
 * and the type translation can work on whole paths. Group-level `$type` is
 * pushed down onto each leaf; group-level `$description` is parked in `groups`
 * and re-attached when the tree is rebuilt.
 */
function flatten(node, prefix, inheritedType, leaves, groups) {
  if (isToken(node)) {
    leaves.set(prefix, {
      $type: node.$type ?? inheritedType,
      $value: node.$value,
      $description: node.$description,
      typeFromGroup: node.$type === undefined,
    });
    return;
  }

  const ownType = node.$type ?? inheritedType;
  if (prefix && node.$description !== undefined) {
    groups.set(prefix, node.$description);
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === '$type' || k === '$description' || UNSAFE_KEYS.has(k)) continue;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, ownType, leaves, groups);
    }
  }
}

/** Rebuild the nested DTCG tree from flattened leaves. */
function nest(leaves, groups) {
  const root = {};
  for (const [path, leaf] of leaves) {
    const segments = path.split('.');
    let cursor = root;
    for (const segment of segments.slice(0, -1)) {
      if (UNSAFE_KEYS.has(segment)) continue;
      cursor[segment] ??= {};
      cursor = cursor[segment];
    }
    const out = { $type: leaf.$type, $value: leaf.$value };
    if (leaf.$description !== undefined) out.$description = leaf.$description;
    cursor[segments.at(-1)] = out;
  }

  // Re-attach group descriptions, but only to groups that survived.
  for (const [path, description] of groups) {
    let cursor = root;
    for (const segment of path.split('.')) {
      cursor = cursor?.[segment];
      if (cursor === undefined) break;
    }
    if (cursor && !isToken(cursor)) {
      cursor.$description = description;
    }
  }
  return root;
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

/** Which tier file(s) back each token set. */
const SET_SOURCES = {
  ref: () => mergeDir('ref'),
  sys: () => readJson(join(SRC, 'sys', '_shared.json')),
  'sys.color.light': () => readJson(join(SRC, 'sys', 'light.json')),
  'sys.color.dark': () => readJson(join(SRC, 'sys', 'dark.json')),
  comp: () => mergeDir('comp'),
};

/**
 * Every token path present in `src/**`, before any exclusion. The drift test
 * diffs this against the emitted bundle so a token can never go missing
 * silently — only by way of the reported exclusion list.
 */
export function sourceLeafPaths() {
  const paths = new Set();
  for (const setName of tokenSetOrder) {
    const leaves = new Map();
    flatten(SET_SOURCES[setName](), '', undefined, leaves, new Map());
    for (const path of leaves.keys()) {
      paths.add(path);
    }
  }
  return paths;
}

/**
 * Build the Penpot import bundle from `src/**`. Pure: reads source files,
 * returns `{ bundle, stats }`, writes nothing. The CLI wrapper below handles
 * output; tests call this directly.
 */
export function buildBundle() {
  const leavesBySet = new Map();
  const groupsBySet = new Map();
  for (const setName of tokenSetOrder) {
    const leaves = new Map();
    const groups = new Map();
    flatten(SET_SOURCES[setName](), '', undefined, leaves, groups);
    leavesBySet.set(setName, leaves);
    groupsBySet.set(setName, groups);
  }

  // The alias graph spans sets (sys → ref, comp → sys), so the cascade has to
  // see every tier at once. `sys.color.light`/`dark` share paths, but they
  // share types too, so collapsing them here is safe.
  const union = new Map();
  for (const setName of tokenSetOrder) {
    for (const [path, leaf] of leavesBySet.get(setName)) {
      union.set(path, leaf);
    }
  }
  const dropped = dropExcluded(union);
  const droppedPaths = new Set(dropped);

  const stats = { tokens: 0, aliases: 0, typed: 0, stampedFromGroup: 0, dropped, untyped: [] };
  const sets = {};

  for (const setName of tokenSetOrder) {
    const translated = new Map();
    for (const [path, leaf] of leavesBySet.get(setName)) {
      if (droppedPaths.has(path)) continue;

      const penpotType = penpotTypeFor(leaf.$type, path);
      stats.tokens += 1;
      if (penpotType === undefined) {
        stats.untyped.push(`${path} (${leaf.$type ?? 'no $type'})`);
      } else {
        stats.typed += 1;
        if (leaf.typeFromGroup) stats.stampedFromGroup += 1;
      }
      if (typeof leaf.$value === 'string' && leaf.$value.includes('{')) {
        stats.aliases += 1;
      }

      translated.set(path, {
        $type: penpotType,
        $value: penpotValueFor(leaf.$type, leaf.$value),
        $description: leaf.$description,
      });
    }
    sets[setName] = nest(translated, groupsBySet.get(setName));
  }

  const bundle = { ...sets, $themes: themes, $metadata: { tokenSetOrder } };
  return { bundle, stats };
}

/**
 * Flatten the bundle into the arguments Penpot's plugin API wants, as
 * `[{ set, tokens: [[name, type, value], …] }]` in `tokenSetOrder`.
 *
 * The JSON bundle is the portable artifact (Tokens Studio dialect, importable
 * through Penpot's UI); this payload is the scripted path, replayed through
 * `TokenSet.addToken`. Tuples rather than objects because the payload is
 * pasted into a plugin console — the key names would triple its size.
 *
 * Order is load-bearing: Penpot rejects a token whose alias does not resolve
 * yet, so ref must land before sys, and sys before comp.
 */
export function buildPluginPayload(bundle) {
  return tokenSetOrder.map((setName) => {
    const leaves = new Map();
    collectLeaves(bundle[setName], '', leaves);
    return {
      set: setName,
      tokens: [...leaves].map(([name, leaf]) => [name, leaf.$type, leaf.$value]),
    };
  });
}

function collectLeaves(node, prefix, out) {
  if (isToken(node)) {
    out.set(prefix, node);
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    collectLeaves(child, prefix ? `${prefix}.${key}` : key, out);
  }
}

/** Write the bundle to `dist/penpot/` and print a validation summary. */
function main() {
  const { bundle, stats } = buildBundle();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
  writeFileSync(PAYLOAD_FILE, JSON.stringify(buildPluginPayload(bundle)), 'utf8');

  console.log(`penpot:tokens → ${OUT_FILE.replace(`${PKG}/`, '')}`);
  console.log(`               ${PAYLOAD_FILE.replace(`${PKG}/`, '')}`);
  console.log(
    `  sets: ${tokenSetOrder.join(', ')}  |  themes: ${themes.map((t) => t.name).join(', ')}`,
  );
  console.log(
    `  tokens: ${stats.tokens}  aliases preserved: ${stats.aliases}  ` +
      `typed leaves: ${stats.typed} (of which ${stats.stampedFromGroup} inherited from a group)`,
  );

  if (stats.dropped.length > 0) {
    console.log(
      `  dropped ${stats.dropped.length} token(s) with no Penpot equivalent (and their aliases):`,
    );
    for (const path of stats.dropped) {
      console.log(`    - ${path}`);
    }
  }

  if (stats.untyped.length > 0) {
    console.error(
      `  ⚠ ${stats.untyped.length} token(s) have no Penpot type — check the source tiers:`,
    );
    for (const entry of stats.untyped) {
      console.error(`    - ${entry}`);
    }
    process.exitCode = 1;
  }
}

// Run only when invoked directly (`node scripts/build-penpot-tokens.mjs`),
// not when imported by the test suite.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
