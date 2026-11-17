---
'@ghds/react-native': patch
---

`Menu`, `ContextMenu`, `NavigationMenu`, `Popover` and `HoverCard` read their panel minimum widths from the overlay min-width tokens (new `theme.overlayMinWidths`) instead of a hardcoded `160` and `spacing['2xl']` multiples. Rendered widths are unchanged.
