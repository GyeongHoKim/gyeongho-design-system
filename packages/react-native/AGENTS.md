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

React Native does not support CSS comma-separated font stacks. The `@ghds/tokens/rn`
build converts each web font-family stack to a **single family name**:

| Token | Web stack (CSS) | RN value |
| --- | --- | --- |
| `ref.fontFamily.sketch` | `'Gochi Hand', 'Gaegu', …` | `Gaegu` |
| `ref.fontFamily.sans` | `'Nunito Sans Variable', 'Pretendard', 'Noto Sans KR Variable', …` | `NotoSansKR` |
| `ref.fontFamily.mono` | `ui-monospace, 'SFMono-Regular', 'Menlo', …` | `Menlo` |

`Gaegu` and `NotoSansKR` include both Latin and Korean glyphs, so text renders in both
languages without per-glyph fallback (which RN cannot do).

### What the app must register

The RN value is only a **name**. Neither `@ghds/tokens` nor `@ghds/react-native` ships
font files; the consuming app loads them.

The theme (`src/theme/theme.ts`) passes the family name **and** a separate `fontWeight`
to every text style. Each weight must therefore be registered **under the same family
name**, so `fontWeight` can select it:

| Family name | Weights the tokens use | Font files |
| --- | --- | --- |
| `NotoSansKR` | 400 (body, caption), 500 (label) | [Noto Sans KR](https://fonts.google.com/specimen/Noto+Sans+KR) static `Regular`, `Medium`; add `Bold` for 700 |
| `Gaegu` | 700 (heading, title) | [Gaegu](https://fonts.google.com/specimen/Gaegu) `Bold`; add `Regular` for 400 |
| `Menlo` | 400 (code) | System font on iOS. Android has no `Menlo` and falls back to its default face. |

A face registered under any other name (for example `NotoSansKR-Bold`) is never used:
no GHDS style asks for it.

### Expo SDK 58 and later (recommended)

`useFonts` accepts an array of font family definitions, which registers several files
under one family name:

```tsx
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export function App() {
  const [loaded, error] = useFonts([
    {
      fontFamily: 'NotoSansKR',
      fontDefinitions: [
        { path: require('./assets/fonts/NotoSansKR-Regular.ttf'), weight: 400 },
        { path: require('./assets/fonts/NotoSansKR-Medium.ttf'), weight: 500 },
        { path: require('./assets/fonts/NotoSansKR-Bold.ttf'), weight: 700 },
      ],
    },
    {
      fontFamily: 'Gaegu',
      fontDefinitions: [
        { path: require('./assets/fonts/Gaegu-Regular.ttf'), weight: 400 },
        { path: require('./assets/fonts/Gaegu-Bold.ttf'), weight: 700 },
      ],
    },
  ]);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;
  return /* your app */;
}
```

### Older Expo SDKs

The map form of `useFonts` registers one file per name. Register the face that matches
how each family is mostly used:

```tsx
const [loaded, error] = useFonts({
  NotoSansKR: require('./assets/fonts/NotoSansKR-Regular.ttf'),
  Gaegu: require('./assets/fonts/Gaegu-Bold.ttf'),
});
```

Other weights of the same family are then not loaded. The platform renders them from
the registered file and may synthesize the weight, so labels (500) will not match the
design exactly. Upgrade to SDK 58 to load every weight.

### Do not use the `expo-font` config plugin with a plain file list

The config plugin does not register the names the tokens use. With a list of file paths,
Android names each family after its file (`NotoSansKR-Regular`) and iOS reads the name
from inside the file (`Noto Sans KR`). Neither matches `NotoSansKR`, so text falls back
to the system font. Load fonts at runtime with `useFonts` instead.

---

## Testing

- Each component must have unit tests covering all interactive states.
- Test on **both iOS and Android** simulators before marking a PR as ready.
- Test across light and dark color schemes.
