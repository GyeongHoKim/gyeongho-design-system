---
'@ghds/react': patch
---

`ContextMenu`, `Menubar`, `NavigationMenu`, `Popover`, `HoverCard`, `DatePicker` and `Combobox` size their panels / fields from the new `comp.*.minWidth` tokens instead of hardcoded `rem` values. Rendered widths are unchanged at the default root font size.
