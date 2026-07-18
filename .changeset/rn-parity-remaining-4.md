---
"@ghds/react-native": minor
---

Add React Native implementations of the four components that were previously web-only, completing cross-platform parity: `ScrollArea`, `Direction` (`DirectionProvider`/`useDirection`), `NativeSelect`, and `Resizable` (`ResizablePanelGroup`/`ResizablePanel`/`ResizableHandle`).

Each is built RN-idiomatically on React Native core primitives (no interaction dependencies beyond the picker):
- `ScrollArea` wraps a native `ScrollView` in a sketchy border (native scroll indicators — RN scrollbars aren't themeable).
- `Direction` is a pure context provider whose default respects `I18nManager.isRTL` when no provider is present.
- `NativeSelect` wraps the platform picker via `@react-native-picker/picker`, added as an **optional** `peerDependency` (install it only if you use `NativeSelect`). Its API is data-driven (`items`) rather than the web's `<option>` children.
- `Resizable` uses a `PanResponder`-based touch-drag handle with percentage-based panel splitting.
