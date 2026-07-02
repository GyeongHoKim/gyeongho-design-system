import { ICON_VIEWBOX, type IconName, iconPaths, iconSeed } from '@ghds/icons';
import { path } from '@ghds/sketch-core';
import { useTheme } from '@shopify/restyle';
import { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';
import type { Theme } from '../theme/theme.js';

/** Semantic icon size, mapped to `sys.icon.size.*` theme tokens. */
export type IconSize = 'sm' | 'md' | 'lg';

/** Props for {@link Icon}. */
export interface IconProps {
  /** Which icon to render (a key of `@ghds/icons`). */
  name: IconName;
  /** Size role. Defaults to `'md'`. */
  size?: IconSize;
  /**
   * Stroke color (a token hex value). Defaults to the `iconDefault` theme color.
   */
  color?: string;
  /**
   * Accessible label. When set, the icon is exposed as an image with this label;
   * otherwise it is decorative and hidden from assistive tech.
   */
  label?: string;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn icon. The path geometry is the single source of truth in
 * `@ghds/icons`; it is sketched by `@ghds/sketch-core` (so it matches the rest
 * of GHDS) and rendered via `react-native-svg` — the only platform difference
 * from the web adapter. Size and default color come from `@ghds/tokens` (via the
 * Restyle theme). The seed is derived from the icon name, so an icon looks
 * identical everywhere.
 */
export function Icon({ name, size = 'md', color, label, testID }: IconProps) {
  const theme = useTheme<Theme>();
  const { roughness, bowing } = theme.sketch;

  const drawable = useMemo(
    () => path(iconPaths[name], { roughness, bowing, seed: iconSeed(name) }),
    [name, roughness, bowing],
  );

  const dimension = theme.iconSizes[size];
  const stroke = color ?? theme.colors.iconDefault;

  return (
    <Svg
      testID={testID}
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={label ? undefined : true}
      importantForAccessibility={label ? 'auto' : 'no-hide-descendants'}
    >
      {drawable.strokePaths.map((d) => (
        <Path
          key={`stroke:${d}`}
          d={d}
          stroke={stroke}
          strokeWidth={theme.borderWidths.default}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
