---
"@ghds/tokens": minor
"@ghds/react": minor
"@ghds/web-components": minor
"@ghds/react-native": minor
---

Add the Table across all three platforms (GHD-36, M11 slice 8 — completing the 표현·상태 group).

- **`@ghds/tokens`** — new `comp.table` token file (surface fill, outline, header/row-border/selected colours, cell padding), aliasing `sys` only.
- **`@ghds/react`** — `Table` with a sketchy outline, sortable headers (`aria-sort`), and optional row selection (a leading GHDS-Checkbox column + select-all with an indeterminate state). Sorting and selection are controlled (`sort`/`onSortChange`, `selectedIds`/`onSelectionChange`).
- **`@ghds/web-components`** — `<gh-table>` (properties for `columns`/`rows`/`sort`/`selectedIds`; dispatches `sort-change` and `selection-change`; composes `<gh-checkbox>`).
- **`@ghds/react-native`** — `Table` built from flex `Box` rows (`role="table"`/`row`/`columnheader`/`cell`), a sketchy outline, header sort buttons, and a `role="checkbox"` selection control.

Each ships unit tests, Storybook stories, and an eight-section documentation page. This table is the data foundation for the M12 data-state patterns.
