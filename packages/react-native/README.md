# @ghds/react-native

React Native component library for the GH Design System. Components render
hand-drawn ("sketchy") outlines via [`@ghds/sketch-core`](../sketch-core) and
[`react-native-svg`](https://github.com/software-mansion/react-native-svg), with
all design values sourced from [`@ghds/tokens`](../tokens). Theming is provided
by [`@shopify/restyle`](https://github.com/Shopify/restyle).

Components: `Button`, `Card`, `Input`.

## Install

```bash
pnpm add @ghds/react-native @ghds/tokens
```

Peer dependencies: `react` (>=18), `react-native` (>=0.74), `react-native-svg`.

Follow the [react-native-svg installation guide](https://github.com/software-mansion/react-native-svg#installation)
to link the native module.

## Usage

Wrap your app in `ThemeProvider` and pass the light or dark theme object from
`@ghds/tokens/rn`:

```tsx
import { ThemeProvider } from '@shopify/restyle';
import { lightTheme, darkTheme } from '@ghds/tokens/rn';
import { Button } from '@ghds/react-native/button';
import { Card } from '@ghds/react-native/card';
import { Input } from '@ghds/react-native/input';

export function App() {
  const colorScheme = useColorScheme(); // 'light' | 'dark'

  return (
    <ThemeProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <Card>
        <Input label="Email" placeholder="you@example.com" />
        <Button variant="primary" onPress={() => {}}>Save</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## Dark mode

`@ghds/tokens/rn` exports two theme objects (`lightTheme`, `darkTheme`).
The choice of which to pass to `ThemeProvider` is left entirely to the consuming
app — GHDS provides the token sets but does not prescribe the switching mechanism.

## How sketchy rendering works

Each component measures its layout with `onLayout`, fixes a PRNG `seed` once per
instance, calls `@ghds/sketch-core` to get SVG path `d` strings, and renders
them with `react-native-svg` `<Svg>/<Path>`. Geometry regenerates only when the
measured size changes, so state transitions never reshuffle the outline.

## Scripts

```bash
pnpm build   # tsc → dist/
pnpm test    # vitest
pnpm lint    # biome
```
