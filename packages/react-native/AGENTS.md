# @ghds/react-native — AGENTS.md

> Package-specific guide. See the [root `AGENTS.md`](../../AGENTS.md) for the
> project overview and the project-wide **Code Quality Gate**.

React Native component library for GHDS. All components consume design values from `@ghds/tokens` — never hardcode design values (see the root Code Quality Gate).

- Components live in `src/components/`.
- Use the `node-linker=hoisted` pnpm setting (configured in `.npmrc`) for React Native Metro bundler compatibility.
- **No barrel export.** There is no `src/index.ts` and no `"."` entry in `package.json`'s `exports` — every component is its own subpath, kebab-case, matching the component's file name (`Button.tsx` → `@ghds/react-native/button`). `Box`/`Text`/`Theme`/`darkTheme`/`lightTheme`/`ThemeProvider` are grouped under a single `@ghds/react-native/theme` subpath since they're always consumed together. Adding a new component means adding a new `tsdown.config.ts` entry + a new `exports` map entry, not touching a shared barrel file.
- Use TypeScript strict mode. All props must have explicit types.

---

## Commands

```bash
# Build
pnpm build --filter @ghds/react-native

# Test
pnpm turbo run test --filter @ghds/react-native

# Lint
pnpm lint --filter @ghds/react-native

# Storybook (lives under apps/)
cd apps/storybook-react-native && pnpm dev
```

---

## Creating Components

The tokens package outputs platform-agnostic JSON; use the same import paths as the other platforms and reference `sys` or `comp` tier values only.

```typescript
import { tokens } from '@ghds/tokens';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.sys.color.bg.primary,
    paddingHorizontal: tokens.sys.spacing.component.md,
  },
});
```

Before starting work on a component, confirm the required tokens exist in `@ghds/tokens`. If they are missing, add them in a separate changeset before the component changeset.

---

## Fonts

React Native does not support CSS comma-separated font stacks, and a custom font has one
file per weight. The `@ghds/tokens/rn` build therefore converts each web font-family stack
to a **face table**: per platform, one weight-specific family name for every
`ref.fontWeight`.

| Token | Web stack (CSS) | iOS | Android |
| --- | --- | --- | --- |
| `ref.fontFamily.sans` | `'Nunito Sans Variable', 'Pretendard', 'Noto Sans KR Variable', …` | `NotoSansKR-Regular` (400), `NotoSansKR-Medium` (500), `NotoSansKR-Bold` (700) | same as iOS |
| `ref.fontFamily.sketch` | `'Gochi Hand', 'Gaegu', …` | `Gaegu-Regular` (400, 500), `Gaegu-Bold` (700) | same as iOS |
| `ref.fontFamily.mono` | `ui-monospace, 'SFMono-Regular', 'Menlo', …` | `Menlo-Regular` (400, 500), `Menlo-Bold` (700) | `monospace` |

```ts
lightTokens.sys.typography.label.fontFamily;
// { ios: { '400': 'NotoSansKR-Regular', '500': 'NotoSansKR-Medium', '700': 'NotoSansKR-Bold' },
//   android: { … } }
```

Noto Sans KR and Gaegu include both Latin and Korean glyphs, so text renders in both
languages without per-glyph fallback (which RN cannot do). Gaegu ships no Medium, so 500
resolves to Regular, as CSS font matching would.

### How the theme uses it

`toTextVariant` (`src/theme/theme.ts`) picks the family for the variant's weight on the
current platform (`Platform.OS`), so every text variant names exactly one font file:

| Variant | Weight | iOS | Android |
| --- | --- | --- | --- |
| `heading`, `title` | 700 | `Gaegu-Bold` | `Gaegu-Bold` |
| `body`, `caption` | 400 | `NotoSansKR-Regular` | `NotoSansKR-Regular` |
| `label` | 500 | `NotoSansKR-Medium` | `NotoSansKR-Medium` |
| `code` | 400 | `Menlo-Regular` | `monospace` |

On iOS and Android the variants carry **no `fontWeight`**: the weight is already in the
family name, and Android looks up a different asset (`<name>_bold.ttf`) when a custom font
is asked for bold. On web (`react-native-web`, used by Storybook and the tests) the variants
keep `fontWeight`, because the browser does not know these names and falls back to its
default face. A `react-native-web` app that does register the faces must declare each
`@font-face` under its PostScript name with a `font-weight` descriptor that matches the
face (for example `font-weight: 700` for `Gaegu-Bold`); without it the descriptor defaults
to 400 and the browser adds synthetic bold on top of a face that is already bold.

When a component needs another weight of the same text, switch the **family**, not the
weight. Breadcrumb's current page and the selected Tab use the `label` face:

```tsx
<Text
  variant="body"
  fontFamily={theme.textVariants.label.fontFamily}
  fontWeight={theme.textVariants.label.fontWeight} // undefined on native
/>
```

### What the app must register

Neither `@ghds/tokens` nor `@ghds/react-native` ships font files; the consuming app loads
them. The family names are the fonts' **PostScript names**. Name each file after its
PostScript name, as Expo recommends, and the same name works on both platforms:

| File | Used by | Source |
| --- | --- | --- |
| `NotoSansKR-Regular.ttf` | body, caption | [Noto Sans KR](https://fonts.google.com/specimen/Noto+Sans+KR) static files |
| `NotoSansKR-Medium.ttf` | label | same |
| `NotoSansKR-Bold.ttf` | sans at 700 (optional today) | same |
| `Gaegu-Bold.ttf` | heading, title | [Gaegu](https://fonts.google.com/specimen/Gaegu) |
| `Gaegu-Regular.ttf` | sketch at 400 (optional today) | same |

Code text needs no file: `Menlo` is an iOS system font and `monospace` is Android's
system monospace face.

### Expo: `expo-font` config plugin (recommended)

The config plugin embeds the files at build time, so text renders on first frame with
no loading state. Android names each font after its file and iOS after its PostScript
name; with the files named as above, both match the tokens.

```json
{
  "expo": {
    "plugins": [
      [
        "expo-font",
        {
          "fonts": [
            "./assets/fonts/NotoSansKR-Regular.ttf",
            "./assets/fonts/NotoSansKR-Medium.ttf",
            "./assets/fonts/NotoSansKR-Bold.ttf",
            "./assets/fonts/Gaegu-Regular.ttf",
            "./assets/fonts/Gaegu-Bold.ttf"
          ]
        }
      ]
    ]
  }
}
```

Rebuild the native app (`npx expo prebuild` / a new development build) after changing the
list. Expo Go cannot embed fonts; use runtime loading there.

### Expo: runtime `useFonts` (any SDK, Expo Go)

Register each file under its family name with the map form. No SDK 58 family definitions
are needed, because every weight has its own name:

```tsx
import { useFonts } from 'expo-font';

const [loaded, error] = useFonts({
  'NotoSansKR-Regular': require('./assets/fonts/NotoSansKR-Regular.ttf'),
  'NotoSansKR-Medium': require('./assets/fonts/NotoSansKR-Medium.ttf'),
  'NotoSansKR-Bold': require('./assets/fonts/NotoSansKR-Bold.ttf'),
  'Gaegu-Regular': require('./assets/fonts/Gaegu-Regular.ttf'),
  'Gaegu-Bold': require('./assets/fonts/Gaegu-Bold.ttf'),
});

if (!loaded && !error) return null; // keep the splash screen up until fonts load
```

### Bare React Native

Link the files as assets (Android copies them to `assets/fonts/`, iOS adds them to
`Info.plist` `UIAppFonts`):

```js
// react-native.config.js
module.exports = { assets: ['./assets/fonts'] };
```

Then run `npx react-native-asset` and rebuild both apps.

### Verify on a device

Unit tests run through `react-native-web` in jsdom and cannot show font resolution.
Check headings, labels and code text on real iOS and Android builds after changing fonts.
A name that does not resolve falls back to the system face silently.

---

## Testing

- Each component must have unit tests covering all interactive states.
- Test on **both iOS and Android** simulators before marking a PR as ready.
- Test across light and dark color schemes.
