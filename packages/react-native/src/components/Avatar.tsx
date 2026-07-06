import { useTheme } from '@shopify/restyle';
import { useState } from 'react';
import { Image, type ImageStyle } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Rendered diameter of an {@link Avatar}. */
export type AvatarSize = 'sm' | 'md' | 'lg';

/** Props for {@link Avatar}. */
export interface AvatarProps {
  /** Image URI. Falls back to initials (then an empty circle) on load failure. */
  src?: string;
  /** Name — used for the accessible label and the initials fallback. */
  name?: string;
  /** Overrides the accessible label (defaults to `name`). */
  alt?: string;
  /** Rendered diameter. Defaults to `'md'`. */
  size?: AvatarSize;
  /** Test handle for queries. */
  testID?: string;
}

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

const IMAGE_STYLE: ImageStyle = { width: '100%', height: '100%' };

/**
 * A hand-drawn circular avatar. Shows an image when `src` loads, otherwise the
 * initials derived from `name`, otherwise an empty sketched circle. The sketchy
 * ellipse outline comes from `@ghds/sketch-core` (rendered with
 * `react-native-svg`); every colour, size and sketch parameter is sourced from
 * `@ghds/tokens` via the Restyle theme (`comp.avatar.*`).
 */
export function Avatar({ src, name, alt, size = 'md', testID }: AvatarProps) {
  const theme = useTheme<Theme>();
  // Track *which* src failed rather than a sticky boolean, so a new `src` is
  // retried instead of being stranded behind the initials fallback forever.
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);

  const {
    onLayout,
    size: measured,
    drawable,
  } = useSketch({
    shape: 'ellipse',
    inset: theme.borderWidths.default,
    roughness: theme.avatarSketch.roughness,
    bowing: theme.avatarSketch.bowing,
  });

  const dimension = theme.avatarSizes[size];
  const label = alt ?? name;
  const showImage = src !== undefined && failedSrc !== src;

  return (
    <Box
      onLayout={onLayout}
      alignItems="center"
      justifyContent="center"
      backgroundColor="avatarBg"
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        overflow: 'hidden',
      }}
      testID={testID}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
    >
      <SketchBackground
        drawable={drawable}
        size={measured}
        strokeColor={theme.colors.avatarStroke}
        strokeWidth={theme.borderWidths.default}
      />
      {showImage ? (
        <Image
          source={{ uri: src }}
          onError={() => setFailedSrc(src)}
          style={IMAGE_STYLE}
          // Decorative: the container Box already carries the accessible name,
          // so the image must not create a second node announcing it again.
          accessible={false}
          accessibilityLabel=""
        />
      ) : (
        <Text variant="label" color="avatarText">
          {name ? initialsFrom(name) : ''}
        </Text>
      )}
    </Box>
  );
}
