---
'@ghds/tokens': minor
---

Add overlay and field minimum-width tokens so components stop hardcoding them:

- `sys.overlay.minWidth.{sm,md,lg,xl}` (`160px` / `192px` / `224px` / `240px`, from `ref.overlay.minWidth.*`).
- `sys.field.minWidth` (`224px`, from `ref.field.minWidth`) for input-like triggers.
- Component aliases: `comp.contextMenu.minWidth`, `comp.menubar.panel.minWidth` (sm); `comp.popover.minWidth`, `comp.hoverCard.minWidth` (md); `comp.navigationMenu.panel.minWidth` (lg); `comp.datePicker.field.minWidth`, `comp.combobox.field.minWidth` (field).
