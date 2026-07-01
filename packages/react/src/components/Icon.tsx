import { ICON_VIEWBOX, type IconName, iconPaths, iconSeed } from '@ghds/icons';
import { path } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type SVGAttributes, useMemo } from 'react';
import { toPx } from '../lib/units.js';

/** Semantic icon size, mapped to `sys.icon.size.*` tokens. */
export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps
  extends Omit<SVGAttributes<SVGSVGElement>, 'children' | 'width' | 'height'> {
  /** Which icon to render (a key of `@ghds/icons`). */
  name: IconName;
  /** Size role. Defaults to `'md'`. */
  size?: IconSize;
  /**
   * Accessible name. When provided, the icon is exposed as `role="img"` with
   * this label; when omitted, the icon is decorative (`aria-hidden`) and screen
   * readers skip it — pair it with adjacent text in that case.
   */
  label?: string;
}

// Sketch numerics are theme-independent, so they come from the raw token object.
// The stroke color defaults to `currentColor` so an icon adopts its context's
// text color (e.g. a button label); consumers override via `color`/CSS.
const ROUGHNESS = tokens.sys.sketch.roughness;
const BOWING = tokens.sys.sketch.bowing;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);

/**
 * A hand-drawn icon. The path geometry is the single source of truth in
 * `@ghds/icons`; it is sketched at render time by `@ghds/sketch-core` (so it
 * matches the rest of GHDS) and sized from `sys.icon.size` tokens. The seed is
 * derived from the icon name, so every instance of an icon looks identical
 * (deterministic across re-renders, SSR and snapshots).
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 'md', label, style, ...rest },
  ref,
) {
  const drawable = useMemo(
    () => path(iconPaths[name], { roughness: ROUGHNESS, bowing: BOWING, seed: iconSeed(name) }),
    [name],
  );

  const dimension = tokens.sys.icon.size[size];
  const rootStyle: CSSProperties = {
    display: 'inline-block',
    flexShrink: 0,
    verticalAlign: 'middle',
    color: 'currentColor',
    ...style,
  };

  return (
    <svg
      ref={ref}
      // `...rest` is spread first so the token-driven sizing and the computed
      // accessibility contract below always win — a consumer can't silently
      // override `role`/`aria-*` (use the `label` prop to name an icon).
      {...rest}
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      fill="none"
      // Labelled icons are exposed as images; unlabelled ones are decorative and
      // hidden from assistive tech (pair them with adjacent text).
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable={false}
      style={rootStyle}
    >
      {label ? <title>{label}</title> : null}
      {drawable.strokePaths.map((d, i) => (
        <path
          // biome-ignore lint/suspicious/noArrayIndexKey: paths are a fixed, ordered IR list
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
});
