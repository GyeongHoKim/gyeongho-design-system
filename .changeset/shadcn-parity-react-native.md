---
"@ghds/react-native": minor
---

Add shadcn-parity components to `@ghds/react-native`, all hand-drawn via the
sketch layer and driven entirely by `@ghds/tokens` (`sys`/`comp` tiers).

New components:

- **Primitives & layout:** `Separator`, `Label`, `Kbd`, `Empty`, `Toggle`, `ButtonGroup`
- **Overlays & disclosure:** `Popover`, `HoverCard` (opens on long-press — touch has no hover), `Collapsible` (animated height, reduce-motion aware), `ToggleGroup` (+ `ToggleGroupItem`, context-based single/multiple), `Combobox` (searchable)
- **Modals:** `AlertDialog`, `Sheet` (edge-anchored side panel), `Drawer` (bottom sheet)
- **Touch-adapted menus:** `ContextMenu` (long-press), `Menubar` (horizontally scrollable), `NavigationMenu` (tap-to-open panels), `Command` (searchable palette)
- **Composites:** `Calendar`, `DatePicker`, `Sidebar`, `Chart` (bar/line via `react-native-svg`)

**BREAKING — Toast is now a notification system.** The old single controlled
`<Toast open onClose duration>` is replaced by:

- an imperative `toast()` API (`toast.success` / `.error` / `.warning` / `.info`,
  `toast.dismiss(id)`, `toast.dismissAll()`) backed by a module-level emitter, with
  a queue, variants and auto-dismiss;
- a `Toaster` viewport (aliased `ToastProvider`) to mount once in the tree — it
  renders the active toasts in a stacked, position-aware, reduce-motion-aware overlay;
- `Toast` is kept as the per-item visual (now presentational: `variant`/`title`/
  `description`/`onDismiss`).

Migrate by mounting a `<Toaster />` near the app root and calling `toast(...)`
instead of rendering a controlled `<Toast>`.
