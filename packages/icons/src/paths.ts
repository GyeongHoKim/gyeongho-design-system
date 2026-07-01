/**
 * Icon path data — the single source of truth for GHDS iconography.
 *
 * Every value is an SVG path `d` string authored on a **24×24 grid**
 * ({@link ICON_VIEWBOX}). Paths are intentionally simple, stroke-based outlines:
 * they carry geometry only (no color, no stroke width, no fill) and are meant to
 * be run through `@ghds/sketch-core`'s `path()` at render time so they inherit
 * the hand-drawn look. Renderers (`@ghds/react`, `@ghds/web-components`,
 * `@ghds/react-native`) consume these strings and paint them with token colors.
 *
 * Curves and arcs are allowed — sketch-core flattens them before sketching.
 */
export const iconPaths = {
  close: 'M6 6 L18 18 M6 18 L18 6',
  check: 'M5 13 L10 18 L20 6',
  plus: 'M12 5 L12 19 M5 12 L19 12',
  minus: 'M5 12 L19 12',
  'chevron-left': 'M15 5 L8 12 L15 19',
  'chevron-right': 'M9 5 L16 12 L9 19',
  'chevron-up': 'M5 15 L12 8 L19 15',
  'chevron-down': 'M5 9 L12 16 L19 9',
  'arrow-left': 'M20 12 L4 12 M10 6 L4 12 L10 18',
  'arrow-right': 'M4 12 L20 12 M14 6 L20 12 L14 18',
  'arrow-up': 'M12 20 L12 4 M6 10 L12 4 L18 10',
  'arrow-down': 'M12 4 L12 20 M6 14 L12 20 L18 14',
  menu: 'M4 7 L20 7 M4 12 L20 12 M4 17 L20 17',
  search: 'M11 4 A7 7 0 1 0 11 18 A7 7 0 1 0 11 4 Z M16 16 L21 21',
  home: 'M3 11 L12 3 L21 11 M6 9 L6 20 L18 20 L18 9',
  user: 'M12 4 A4 4 0 1 0 12 12 A4 4 0 1 0 12 4 Z M5 20 C5 15 9 14 12 14 C15 14 19 15 19 20',
  info: 'M12 3 A9 9 0 1 0 12 21 A9 9 0 1 0 12 3 Z M12 11 L12 16 M12 7.5 L12 8',
  warning: 'M12 3 L22 20 L2 20 Z M12 9 L12 14 M12 16.5 L12 17',
  trash: 'M4 7 L20 7 M9 7 L9 4 L15 4 L15 7 M6 7 L7 20 L17 20 L18 7 M10 11 L10 17 M14 11 L14 17',
  star: 'M12 3 L14.7 9.2 L21 9.7 L16 14 L17.6 20.5 L12 17 L6.4 20.5 L8 14 L3 9.7 L9.3 9.2 Z',
  heart: 'M12 20 C3 13 5 6 9 6 C11 6 12 8 12 9 C12 8 13 6 15 6 C19 6 21 13 12 20 Z',
  'external-link': 'M13 4 L20 4 L20 11 M20 4 L11 13 M17 13 L17 20 L4 20 L4 7 L11 7',
  mail: 'M3 6 L21 6 L21 18 L3 18 Z M3 6 L12 13 L21 6',
  calendar: 'M4 6 L20 6 L20 20 L4 20 Z M4 10 L20 10 M8 4 L8 8 M16 4 L16 8',
  eye: 'M2 12 C6 6 18 6 22 12 C18 18 6 18 2 12 Z M12 9 A3 3 0 1 0 12 15 A3 3 0 1 0 12 9 Z',
  bell: 'M8 17 C8 17 6 16 6 11 C6 7 9 6 12 6 C15 6 18 7 18 11 C18 16 16 17 16 17 Z M10 20 L14 20',
} as const;
