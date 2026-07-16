# @ghds/react-native — AGENTS.md

> Package-specific guide. See the [root `AGENTS.md`](../../AGENTS.md) for the
> project overview and the project-wide **Code Quality Gate**.

React Native component library for GHDS. All components consume design values from `@ghds/tokens` — never hardcode design values (see the root Code Quality Gate).

- Components live in `src/components/`.
- Use the `node-linker=hoisted` pnpm setting (configured in `.npmrc`) for React Native Metro bundler compatibility.
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
build automatically converts each web font-family stack to a **single family name**
that RN can consume:

| Token | Web stack (CSS) | RN value |
| --- | --- | --- |
| `ref.fontFamily.sketch` | `'Gochi Hand', 'Gaegu', …` | `Gaegu` |
| `ref.fontFamily.sans` | `'Nunito Sans Variable', 'Pretendard', …` | `Pretendard` |
| `ref.fontFamily.mono` | `ui-monospace, 'SFMono-Regular', 'Menlo', …` | `Menlo` |

The chosen RN face includes both Latin and Korean glyphs, so text renders correctly
in both languages without per-glyph fallback (which RN cannot do).

### Loading fonts in your Expo app

The RN token value is just a **name** — you must still load the actual font files.
Use [`expo-font`](https://docs.expo.dev/develop/user-interface/fonts/) to embed
Pretendard and Gaegu `.ttf` files at build time or load them at runtime.

#### Option A — Config plugin (recommended, build-time embedding)

```bash
pnpm add expo-font
```

Download the `.ttf` files and place them in `assets/fonts/`:
- `Pretendard-Regular.ttf`, `Pretendard-Medium.ttf`, `Pretendard-Bold.ttf`
- `Gaegu-Regular.ttf`

Then add the plugin to `app.json` (or `app.config.js`):

```json
{
  "plugins": [
    [
      "expo-font",
      {
        "fonts": [
          "node_modules/@ghds/tokens/dist/rn-assets/Pretendard-Regular.ttf",
          "node_modules/@ghds/tokens/dist/rn-assets/Pretendard-Medium.ttf",
          "node_modules/@ghds/tokens/dist/rn-assets/Pretendard-Bold.ttf",
          "node_modules/@ghds/tokens/dist/rn-assets/Gaegu-Regular.ttf"
        ]
      }
    ]
  ]
}
```

> Font file paths above are illustrative — download the `.ttf` files from the
> [Pretendard GitHub releases](https://github.com/orioncactus/pretendard/releases)
> and [Gaegu Google Fonts](https://fonts.google.com/specimen/Gaegu) and place
> them in your app's `assets/fonts/` directory.

#### Option B — Runtime loading with `useFonts`

```tsx
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export function App() {
  const [loaded, error] = useFonts({
    Pretendard: require('./assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard-Medium.ttf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.ttf'),
    Gaegu: require('./assets/fonts/Gaegu-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;
  return /* your app */;
}
```

### Font weight mapping

RN does not support CSS `font-weight` on a single family file. Each weight needs a
separate `.ttf` with a distinct family name. The GHDS theme sets `fontWeight` as a
string (`'400'`, `'500'`, `'700'`), which RN applies to whichever family is loaded.
Register each weight as a separate entry in `useFonts` (or the config plugin) and,
if you need weight-specific rendering, override `fontFamily` per variant in your
theme.

---

## Testing

- Each component must have unit tests covering all interactive states.
- Test on **both iOS and Android** simulators before marking a PR as ready.
- Test across light and dark color schemes.
