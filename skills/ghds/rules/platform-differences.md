# Platform Differences

GHDS ships the same design as three separate implementations — `@ghds/react`, `@ghds/web-components` (Lit, `gh-*` custom elements), and `@ghds/react-native`. They are **not** a single API with three renderers; prop names, event shapes, and even the supported variant set diverge in specific, verified ways. Do not port a prop name from one platform to another without checking this file first.

## Modal accessible title: `title` vs `heading`

React and React Native both use `title`. Web Components uses `heading` for the identical concept.

```tsx
// React / React Native
<Modal title="Delete item?" open={open} onClose={onClose}>
  ...
</Modal>
```

```html
<!-- Web Components — the prop is `heading`, not `title` -->
<gh-modal heading="Delete item?" open>
  ...
</gh-modal>
```

**Gotcha:** `title` is also a native HTML global attribute (hover tooltip). Setting `title="Delete item?"` on `<gh-modal>` does not error — it silently renders a browser tooltip instead of wiring the dialog's accessible name. This is a wrong-behavior trap, not a compile-time catch.

## Change events: three different shapes

- **React** — native `onChange(event)`; read `event.target.value` / `event.target.checked`.
- **Web Components** — no callback prop at all; the element dispatches a native DOM `change`/`input` event, so the consumer must `addEventListener`.
- **React Native** — differently-named callbacks that receive a bare value, not an event: `onCheckedChange?: (checked: boolean) => void` (`Checkbox`, `Switch`) and `onChangeText?: (text: string) => void` (`Input` — note the name, it is **not** `onChange`).

```tsx
// React
<Checkbox onChange={(e) => setChecked(e.target.checked)} />
<Input onChange={(e) => setValue(e.target.value)} />
```

```html
<!-- Web Components -->
<gh-checkbox id="my-checkbox"></gh-checkbox>
<script>
  document.getElementById('my-checkbox').addEventListener('change', (e) => {
    console.log(e.target.checked);
  });
</script>
```

```tsx
// React Native — NOT onChange
<Checkbox onCheckedChange={(checked) => setChecked(checked)} />
<Switch onCheckedChange={(checked) => setChecked(checked)} />
<Input onChangeText={(text) => setValue(text)} />
```

## Button content: children vs `label`-only

React and Web Components accept arbitrary children/slotted content. React Native's `Button` only accepts a `label: string` prop — there is no children slot, so rich or composed content (an icon plus text, for example) is not possible.

```tsx
// React / Web Components — arbitrary children
<Button variant="primary"><Icon name="save" /> Save changes</Button>
```

```tsx
// Incorrect on React Native — Button has no children prop
<Button><Icon name="save" /> Save changes</Button>

// Correct on React Native — label is a plain string
<Button label="Save changes" variant="primary" />
```

## Button `variant`: React Native has no `'neutral'`

React and Web Components support `'primary' | 'danger' | 'neutral'`. React Native's `ButtonVariant` is `'primary' | 'danger'` only — `'neutral'` does not exist there.

```tsx
// React / Web Components — three variants
<Button variant="neutral">Cancel</Button>
```

```tsx
// Incorrect on React Native — 'neutral' is not in the RN ButtonVariant union;
// this is a type error, not a silent fallback
<Button label="Cancel" variant="neutral" />

// Correct on React Native — only 'primary' | 'danger' exist; use 'primary' with
// custom styling, or a plain Pressable, for a neutral/tertiary action
<Button label="Cancel" variant="primary" />
```

## React-Native-only props

`testID` and `accessibilityHint` exist only on React Native — they have no equivalent prop on React or Web Components. When porting a component's usage from React/Web Components to React Native, add them where useful for testing/accessibility; when porting the other direction, drop them (they don't exist elsewhere and TypeScript will reject them on React/Web Components).

## Web-Components-only: native form participation

`Button`, `Checkbox`, and `Switch` on Web Components participate in native `<form>` submission and reset via `ElementInternals`/form-association — a real `<form>` submit or reset affects them automatically. React has no equivalent (plain DOM form semantics apply instead — you wire submission yourself), and React Native has no native `<form>` concept at all.

## Accessibility prop gaps on React Native

Three distinct situations — do not treat them as equivalent:

- **`accessibilityValue` / `accessibilityState`** — these nested RN accessibility objects are not forwarded to the DOM by react-native-web. You do not need to work around this yourself: GHDS's React Native components already set the flat ARIA equivalent (`aria-checked`, `aria-valuenow`, etc.) internally alongside them, so the ARIA output a screen reader sees is correct in practice. This is mentioned only so you understand why passing these props yourself has no additional effect.
- **`onAccessibilityAction`** — genuinely unsupported when a React Native app is rendered via react-native-web. It's currently exposed only on `Slider`. If you need a custom accessibility action on `Slider` in a web-rendered React Native context, there is no supported workaround today.
- **Keyboard interaction (`onKeyDown`-based)** — not implemented for React Native at all. This is a real feature gap, not a forwarding issue: `Slider` has no arrow-key stepping on React Native, and `Tabs` has no roving-tabindex arrow-key navigation on React Native. If your product needs full keyboard parity between the web platforms and React Native, plan around this explicitly.
