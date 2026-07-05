import { useTheme } from '@shopify/restyle';
import { useEffect, useState } from 'react';
import {
  type NativeSyntheticEvent,
  TextInput,
  type TextInputContentSizeChangeEventData,
} from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Textarea}. */
export interface TextareaProps {
  /** Visible, accessible label — required (there is no separate label element on RN). */
  label: string;
  /** Controlled text value. */
  value?: string;
  /** Change handler receiving the new text. */
  onChangeText?: (text: string) => void;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Disables editing and applies the disabled token palette. */
  disabled?: boolean;
  /**
   * Grows the field to fit its content instead of scrolling. Measured via
   * `onContentSizeChange`, mirroring the `scrollHeight`-based approach on the
   * other two platforms.
   */
  autoResize?: boolean;
  /** Visible row count — also the minimum height once measured. Defaults to `2`. */
  rows?: number;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * Hand-drawn, multi-line text field. The sketchy outline comes from
 * `@ghds/sketch-core`; the border color reflects focus/disabled state using
 * `sys.color.border` tokens, and the text/placeholder colors and typography
 * come from the Restyle theme — the same generic fields `Input` already
 * consumes (no dedicated `comp.textarea` theme bridge needed). Focus only
 * swaps the stroke color — the geometry (and seed) stay fixed, so the outline
 * does not redraw.
 */
export function Textarea({
  label,
  value,
  onChangeText,
  placeholder,
  disabled = false,
  autoResize = false,
  rows = 2,
  testID,
}: TextareaProps) {
  const theme = useTheme<Theme>();
  const [focused, setFocused] = useState(false);
  const minHeight = rows * theme.textVariants.body.lineHeight + theme.spacing.sm * 2;
  const [measuredHeight, setMeasuredHeight] = useState(minHeight);

  // Keeps `measuredHeight` from going stale if `rows` (and so `minHeight`)
  // grows without `onContentSizeChange` firing — e.g. `rows` changes but the
  // text content doesn't.
  useEffect(() => {
    setMeasuredHeight((current) => Math.max(current, minHeight));
  }, [minHeight]);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.sketch.roughness,
    bowing: theme.sketch.bowing,
  });

  let strokeColor: string;
  if (disabled) {
    strokeColor = theme.colors.borderSubtle;
  } else if (focused) {
    strokeColor = theme.colors.borderFocus;
  } else {
    strokeColor = theme.colors.borderDefault;
  }

  const handleContentSizeChange = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    if (autoResize) {
      setMeasuredHeight(Math.max(minHeight, event.nativeEvent.contentSize.height));
    }
  };

  return (
    <Box>
      <Text variant="label" color="textSecondary" paddingBottom="xs">
        {label}
      </Text>
      <Box
        onLayout={onLayout}
        backgroundColor="bgSurface"
        borderRadius="sm"
        paddingHorizontal="md"
        paddingVertical="sm"
      >
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={strokeColor}
          strokeWidth={theme.borderWidths.default}
        />
        <TextInput
          multiline
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textDisabled}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onContentSizeChange={handleContentSizeChange}
          testID={testID}
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
          style={{
            height: autoResize ? measuredHeight : minHeight,
            color: disabled ? theme.colors.textDisabled : theme.colors.textPrimary,
            fontFamily: theme.textVariants.body.fontFamily,
            fontSize: theme.textVariants.body.fontSize,
            textAlignVertical: 'top',
            padding: 0,
          }}
        />
      </Box>
    </Box>
  );
}
