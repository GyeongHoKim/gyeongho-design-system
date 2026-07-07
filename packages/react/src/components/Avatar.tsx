import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, useState } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Rendered diameter of an {@link Avatar}. */
export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Image URL. Falls back to initials (then an empty circle) if it fails to load. */
  src?: string;
  /** Person/entity name — used for the accessible label and the initials fallback. */
  name?: string;
  /** Overrides the accessible label (defaults to `name`). */
  alt?: string;
  /** Rendered diameter. Defaults to `'md'`. */
  size?: AvatarSize;
}

const avatar = tokens.comp.avatar;
const c = cssVars.comp.avatar;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

interface TypographyRole {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly lineHeight: number;
  readonly fontWeight: number;
}

const FONT: Record<AvatarSize, TypographyRole> = {
  sm: tokens.sys.typography.caption,
  md: tokens.sys.typography.label,
  lg: tokens.sys.typography.body,
};

/** First letters of the first and last whitespace-separated words, uppercased. */
export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * A hand-drawn circular avatar. Shows an image when `src` loads, otherwise the
 * initials derived from `name`, otherwise an empty sketched circle. The sketchy
 * ellipse outline comes from `@ghds/sketch-core` (via {@link useSketch}); every
 * colour, size and sketch parameter is sourced from `@ghds/tokens`
 * (`comp.avatar.*`).
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, alt, size = 'md', style, ...rest },
  forwardedRef,
) {
  // Track *which* src failed rather than a sticky boolean, so a new `src`
  // (e.g. a refreshed signed URL after the old one expired) is retried instead
  // of being stranded behind the initials fallback forever.
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);
  const {
    ref: sketchRef,
    drawable,
    size: measured,
  } = useSketch<HTMLSpanElement>({
    shape: 'ellipse',
    roughness: avatar.sketch.roughness,
    bowing: avatar.sketch.bowing,
    inset: INSET,
  });

  const ref = mergeRefs(sketchRef, forwardedRef);
  const dimension = avatar.size[size];
  const label = alt ?? name;
  const showImage = src !== undefined && failedSrc !== src;
  const font = FONT[size];

  const rootStyle: CSSProperties = {
    // Scopes the `SketchSurface` (`z-index: -1`) to this avatar.
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    width: dimension,
    height: dimension,
    borderRadius: tokens.sys.radius.pill,
    overflow: 'hidden',
    flexShrink: 0,
    background: c.bg,
    color: c.text,
    fontFamily: font.fontFamily,
    fontSize: font.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(font.lineHeight),
    userSelect: 'none',
    ...style,
  };

  // A named avatar is an image landmark; an anonymous one is decorative.
  const a11y = label
    ? ({ role: 'img', 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const);

  return (
    <span ref={ref} style={rootStyle} {...a11y} {...rest}>
      <SketchSurface
        drawable={drawable}
        width={measured.width}
        height={measured.height}
        strokeColor={c.stroke}
        strokeWidth={STROKE_WIDTH}
      />
      {showImage ? (
        <img
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 'inherit',
          }}
        />
      ) : (
        <span aria-hidden="true" style={{ position: 'relative' }}>
          {name ? initialsFrom(name) : null}
        </span>
      )}
    </span>
  );
});
