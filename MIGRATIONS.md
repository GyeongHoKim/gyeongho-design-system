# Migrations

How breaking changes in GHDS are communicated, and a running log of them. A
bolded line in a changelog is easy to miss — this file is the single place a
consumer can scan to see what broke and how to adapt.

See [`VERSIONING.md`](./VERSIONING.md) for what counts as breaking and the
pre-1.0 caveat (breaking changes can ship in a `0.x` minor).

## Convention

When you ship a breaking change:

1. **In the changeset**, add a `**Migration**` subsection with concrete
   before → after guidance, not just a description of what changed:

   ```md
   Rename `<Foo bar>` to `<Foo baz>` to match the new naming.

   **Migration**
   - Before: `<Foo bar="x" />`
   - After:  `<Foo baz="x" />`
   ```

2. **Add an entry to this file** (reverse-chronological, newest first) under the
   affected package, linking the Linear issue (`GHD-##`) and the version the
   change landed in. Keep the log by package until volume justifies splitting it
   into `migrations/<package>-<version>.md` files.

3. For deprecations (a softer path than removal), mark the old export with a
   JSDoc `@deprecated` tag naming the replacement, per
   [`GOVERNANCE.md`](./GOVERNANCE.md#component-lifecycle). Deprecations get a
   migration entry when the removal actually happens.

---

## Log

### `@ghds/tokens` / `@ghds/react-native`

#### `@ghds/tokens` 0.14.0, `@ghds/react-native` 0.13.0 — weight-specific RN font families (GHD-63)

RN font names used to resolve only through runtime `useFonts` family definitions
(Expo SDK 58+), and `Menlo` does not exist on Android. Every `fontFamily` token in
`@ghds/tokens/rn` is now a face table `{ ios, android }` mapping each weight
(`"400"`, `"500"`, `"700"`) to the font's PostScript name, and the RN theme picks
one per text variant without `fontWeight`. CSS, TS and JSON token output is unchanged.

**Migration**

- Fonts: name the files after their PostScript names (`NotoSansKR-Regular.ttf`,
  `NotoSansKR-Medium.ttf`, `NotoSansKR-Bold.ttf`, `Gaegu-Regular.ttf`,
  `Gaegu-Bold.ttf`) and embed them with the `expo-font` config plugin, bare RN
  asset linking, or `useFonts({ 'NotoSansKR-Medium': require(…), … })`.
  - Before: `useFonts([{ fontFamily: 'NotoSansKR', fontDefinitions: [...] }])`
  - After: `["expo-font", { "fonts": ["./assets/fonts/NotoSansKR-Medium.ttf", …] }]`
- Tokens read directly:
  - Before: `fontFamily: tokens.sys.typography.label.fontFamily` (`'NotoSansKR'`) plus `fontWeight: '500'`
  - After: `fontFamily: tokens.sys.typography.label.fontFamily[Platform.OS === 'ios' ? 'ios' : 'android']['500']` (`'NotoSansKR-Medium'`), no `fontWeight`
- Theme overrides: emphasise with the family, not the weight.
  - Before: `fontWeight={theme.textVariants.label.fontWeight}`
  - After: `fontFamily={theme.textVariants.label.fontFamily}` (plus `fontWeight`, which is `undefined` on native)

See `packages/react-native/AGENTS.md` → Fonts for the full setup.

### `@ghds/react` / `@ghds/react-native`

#### 0.3.0 — `buildRectangleOutline` → `buildOutline` (GHD-31)

The low-level sketch export was renamed to support ellipse geometry (needed by
Radio/Switch). The high-level `useSketch` hook is backward-compatible (its new
`shape` option defaults to `'rectangle'`); only direct imports of the low-level
function break.

**Migration**

- Before: `buildRectangleOutline(size, inset, params)`
- After: `buildOutline('rectangle', size, inset, params)` — pass the shape as
  the first argument. Use `'ellipse'` for round outlines.

Only affects code that imported `buildRectangleOutline` directly. If you only
used `useSketch`, no change is required.

---

_No further breaking changes recorded. New entries go above, newest first._
