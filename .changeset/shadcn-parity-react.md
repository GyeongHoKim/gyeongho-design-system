---
"@ghds/react": minor
---

Add shadcn-parity components to `@ghds/react`.

New components:

- Primitives: `Separator`, `Label`, `Kbd`, `Empty`, `Toggle`, `ButtonGroup`
- Floating: `Popover`, `HoverCard`, `Collapsible`, `ToggleGroup`, `Combobox`
- Overlays: `AlertDialog`, `Sheet`, `Drawer` (plus a shared `useFocusTrap` hook)
- Menus: `ContextMenu`, `Menubar`, `NavigationMenu`, `Command` / `CommandDialog`
- Composites: `Calendar`, `DatePicker`, `Sidebar`, `Chart`

All are token-driven (`@ghds/tokens`), hand-drawn via `@ghds/sketch-core`, keyboard-
accessible, and theme-reactive (light + dark).

**BREAKING — Toast is now a notification system.** The old single controlled
`<Toast open onClose duration>` component is replaced by:

- a `Toaster` provider (portal viewport, `position` prop, stacking, respects
  `prefers-reduced-motion`);
- an imperative `toast(message, opts)` API with `toast.success/error/warning/info(...)`
  returning an id, and `toast.dismiss(id)`;
- `Toast` retained as the presentational unit (`variant` / `title` / `children` /
  `onDismiss`) — its `open` / `onClose` / `duration` props are gone.

Migration: mount a `<Toaster />` near your app root and call `toast(...)` instead of
rendering a controlled `<Toast>`.
