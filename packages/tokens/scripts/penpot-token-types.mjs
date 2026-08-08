// penpot-token-types.mjs
//
// The GHDS ↔ Penpot token dialect. GHDS authors tokens in W3C DTCG (`$type`:
// `color`, `dimension`, `number`, `shadow`, `duration`, `cubicBezier`,
// `fontFamily`, `fontWeight`); Penpot speaks the Tokens Studio vocabulary and
// accepts exactly the 17 types below. This module owns the translation.
//
// Every rule here was verified empirically against a live Penpot file through
// the plugin API (`TokenSet.addToken`). See "Penpot export" in AGENTS.md for the
// three known fidelity losses (easing dropped, shadow alpha, `em` letter-spacing).

/** The complete `TokenType` union Penpot accepts. Anything else is rejected. */
export const PENPOT_TOKEN_TYPES = new Set([
  'borderRadius',
  'borderWidth',
  'color',
  'dimension',
  'fontFamilies',
  'fontSizes',
  'fontWeights',
  'letterSpacing',
  'number',
  'opacity',
  'rotation',
  'shadow',
  'sizing',
  'spacing',
  'textCase',
  'textDecoration',
  'typography',
]);

/**
 * DTCG types with no Penpot counterpart. Tokens of these types — and any
 * token that aliases one, transitively — are dropped from the bundle.
 *
 * `cubicBezier`: Penpot has no easing type. Penpot also *rejects a token whose
 * alias does not resolve*, so a half-dropped chain would fail the whole import;
 * the cascade in `dropExcluded()` is what keeps the bundle insertable.
 */
export const EXCLUDED_DTCG_TYPES = new Set(['cubicBezier']);

/** Matches a whole-token alias — the only alias form GHDS uses. */
export const WHOLE_ALIAS = /^\{([^}]+)\}$/;

const isAlias = (value) => typeof value === 'string' && WHOLE_ALIAS.test(value);

// Segments are lower-cased and matched by substring so camelCase names like
// `indicatorSize`, `maxWidth` or `borderWidth` are caught by a single needle.
const segmentsOf = (path) => path.split('.').map((s) => s.toLowerCase());
const has = (segments, needles) => segments.some((seg) => needles.some((n) => seg.includes(n)));

/**
 * `dimension` is a single DTCG type but six different Penpot types. Penpot
 * gates which shape properties a token may be applied to by its type, so
 * mapping every dimension to plain `dimension` would leave a designer unable
 * to drop `comp.button.padding.horizontal` onto a padding field. The role is
 * recoverable from the token path, which follows the documented
 * `{tier}.{category}.{role}.{variant}.{state}` schema.
 *
 * Ordered — the first match wins, and the order encodes real precedence:
 * `sys.border.width.default` is a border width, not a sizing token, so the
 * borderWidth rule must be tested before the generic width/height rule.
 */
const DIMENSION_RULES = [
  { type: 'borderRadius', test: (s) => has(s, ['radius']) },
  {
    type: 'borderWidth',
    test: (s) =>
      has(s, ['borderwidth', 'thickness']) || (has(s, ['border', 'stroke']) && has(s, ['width'])),
  },
  { type: 'fontSizes', test: (s) => has(s, ['fontsize']) },
  // Before `spacing` — "letterSpacing" contains "spacing".
  { type: 'letterSpacing', test: (s) => has(s, ['letterspacing', 'tracking']) },
  {
    type: 'spacing',
    test: (s) => has(s, ['spacing', 'padding', 'gap', 'gutter', 'offset', 'inset', 'margin']),
  },
  { type: 'sizing', test: (s) => has(s, ['size', 'width', 'height', 'breakpoint', 'rail']) },
];

/**
 * Translate a DTCG `$type` to its Penpot `TokenType`, using the token's dot
 * path to disambiguate where DTCG is coarser than Penpot.
 * Returns `undefined` for excluded types.
 */
export function penpotTypeFor(dtcgType, path) {
  if (EXCLUDED_DTCG_TYPES.has(dtcgType)) {
    return undefined;
  }
  const segments = segmentsOf(path);
  switch (dtcgType) {
    case 'color':
      return 'color';
    case 'shadow':
      return 'shadow';
    // Penpot has no duration type; milliseconds survive as a plain number.
    case 'duration':
      return 'number';
    case 'fontFamily':
      return 'fontFamilies';
    case 'fontWeight':
      return 'fontWeights';
    case 'dimension':
      return DIMENSION_RULES.find((rule) => rule.test(segments))?.type ?? 'dimension';
    case 'number':
      return has(segments, ['opacity']) ? 'opacity' : 'number';
    default:
      return undefined;
  }
}

/** `"0px 2px 6px 0px rgba(28, 25, 22, 0.12)"` → its component parts. */
function parseBoxShadow(css) {
  const inset = /(^|\s)inset(\s|$)/.test(css);
  const body = css.replace(/(^|\s)inset(\s|$)/, ' ').trim();

  // Pull the color off first: it is the only part that may contain spaces.
  const colorMatch = body.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\s*$/);
  const color = colorMatch ? colorMatch[0].trim() : '#000000';
  const lengths = body
    .slice(0, colorMatch ? colorMatch.index : body.length)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const [offsetX = '0', offsetY = '0', blur = '0', spread = '0'] = lengths;
  // Penpot wants an array (multi-layer shadows) of all-string fields.
  return [{ color, inset: String(inset), offsetX, offsetY, blur, spread }];
}

/**
 * Penpot splits a font stack on commas itself and honours the quotes, so the
 * raw CSS stack goes through almost verbatim — stripping the quotes would make
 * it read `'Gochi Hand'` as two families. The one exception is a vendor family
 * whose name starts with a hyphen (`-apple-system`): unquoted, Penpot rejects
 * the whole token. Quoting it is a no-op for CSS and for Penpot's resolution.
 */
function quoteLeadingHyphenFamilies(stack) {
  if (typeof stack !== 'string') {
    return stack;
  }
  return stack
    .split(',')
    .map((part) => {
      const family = part.trim();
      return family.startsWith('-') ? `'${family}'` : family;
    })
    .join(', ');
}

/**
 * Translate a DTCG `$value` into the shape Penpot stores for that type.
 * Aliases are returned untouched — preserving the comp→sys→ref reference
 * graph inside Penpot is the whole point of exporting from `src/`.
 */
export function penpotValueFor(dtcgType, value) {
  if (isAlias(value)) {
    return value;
  }
  switch (dtcgType) {
    // "200ms" → 200. Penpot's number type has no unit.
    case 'duration':
      return typeof value === 'string' ? Number(value.replace(/ms$/, '')) : value;
    case 'fontFamily':
      return quoteLeadingHyphenFamilies(value);
    case 'shadow':
      return typeof value === 'string' ? parseBoxShadow(value) : value;
    case 'fontWeight':
      return String(value);
    default:
      return value;
  }
}

/**
 * Remove excluded tokens and, transitively, every token that aliases one.
 * `leaves` is a Map of dot-path → `{ $type, $value, … }`; mutated in place.
 * Returns the sorted list of dropped paths.
 */
export function dropExcluded(leaves) {
  const dropped = new Set();

  for (const [path, leaf] of leaves) {
    if (EXCLUDED_DTCG_TYPES.has(leaf.$type)) {
      dropped.add(path);
    }
  }

  // Chase the alias graph to a fixpoint: sys.animation.easing.* aliases
  // ref.easing.*, and a comp token could alias that in turn.
  let changed = true;
  while (changed) {
    changed = false;
    for (const [path, leaf] of leaves) {
      if (dropped.has(path)) {
        continue;
      }
      const match = typeof leaf.$value === 'string' ? leaf.$value.match(WHOLE_ALIAS) : null;
      if (match && dropped.has(match[1])) {
        dropped.add(path);
        changed = true;
      }
    }
  }

  for (const path of dropped) {
    leaves.delete(path);
  }
  return [...dropped].sort();
}
