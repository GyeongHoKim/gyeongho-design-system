import { useTheme } from '@shopify/restyle';
import { createContext, type ReactNode, useContext, useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

interface InputGroupContextValue {
  /** Whether the whole group (and thus its input) is disabled. */
  disabled: boolean;
  /** Lifts focus state from the inner input up to the group outline. */
  setFocused: (focused: boolean) => void;
}

const InputGroupContext = createContext<InputGroupContextValue>({
  disabled: false,
  setFocused: () => {},
});

/** Props for {@link InputGroup}. */
export interface InputGroupProps {
  /** Disables the whole group and mutes the surface. */
  disabled?: boolean;
  /** Marks the group invalid, painting the danger stroke. */
  invalid?: boolean;
  /** Group content — an {@link InputGroupInput} plus {@link InputGroupAddon}s. */
  children?: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn field that composes a bare {@link InputGroupInput} with leading
 * and/or trailing {@link InputGroupAddon}s (icons, text) inside a single
 * sketchy box. Focus within the group switches the outline to the focus
 * colour. Every colour, padding, radius and sketch parameter comes from
 * `@ghds/tokens` (`comp.inputGroup.*`) via the Restyle theme.
 */
export function InputGroup({
  disabled = false,
  invalid = false,
  children,
  testID,
}: InputGroupProps) {
  const theme = useTheme<Theme>();
  const [focused, setFocused] = useState(false);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.inputGroupSketch.roughness,
    bowing: theme.inputGroupSketch.bowing,
    fillStyle: 'solid',
  });

  let strokeColor: string;
  if (invalid) {
    strokeColor = theme.colors.inputGroupStrokeDanger;
  } else if (focused && !disabled) {
    strokeColor = theme.colors.inputGroupStrokeFocus;
  } else {
    strokeColor = theme.colors.inputGroupStrokeDefault;
  }

  const fillColor = disabled ? theme.colors.inputGroupBgDisabled : theme.colors.inputGroupBgDefault;

  return (
    <InputGroupContext.Provider value={{ disabled, setFocused }}>
      <Box
        onLayout={onLayout}
        flexDirection="row"
        alignItems="center"
        gap="inputGroupGap"
        paddingHorizontal="inputGroupHorizontal"
        paddingVertical="inputGroupVertical"
        borderRadius="inputGroup"
        testID={testID}
      >
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={strokeColor}
          fillColor={fillColor}
          strokeWidth={theme.borderWidths.default}
        />
        {children}
      </Box>
    </InputGroupContext.Provider>
  );
}

/** Props for {@link InputGroupInput}. */
export interface InputGroupInputProps
  extends Omit<TextInputProps, 'editable' | 'onFocus' | 'onBlur'> {
  /** Explicit disabled override; otherwise inherited from the group. */
  disabled?: boolean;
}

/** The bare, borderless text input placed inside an {@link InputGroup}. */
export function InputGroupInput({ disabled, style, ...rest }: InputGroupInputProps) {
  const theme = useTheme<Theme>();
  const { disabled: groupDisabled, setFocused } = useContext(InputGroupContext);
  const isDisabled = disabled ?? groupDisabled;

  return (
    <TextInput
      editable={!isDisabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholderTextColor={theme.colors.inputGroupTextDisabled}
      style={[
        {
          flex: 1,
          minWidth: 0,
          padding: 0,
          backgroundColor: 'transparent',
          color: isDisabled
            ? theme.colors.inputGroupTextDisabled
            : theme.colors.inputGroupTextValue,
          fontFamily: theme.textVariants.body.fontFamily,
          fontSize: theme.textVariants.body.fontSize,
        },
        style,
      ]}
      {...rest}
    />
  );
}

/**
 * A leading or trailing addon slot inside an {@link InputGroup} — an icon or
 * short text. Rendered in the muted addon text colour; place it before or after
 * {@link InputGroupInput} in the child order to position it.
 */
export function InputGroupAddon({ children }: { children?: ReactNode }) {
  return (
    <Box flexDirection="row" alignItems="center" gap="xs" flexShrink={0}>
      {typeof children === 'string' ? (
        <Text variant="label" color="inputGroupAddonText">
          {children}
        </Text>
      ) : (
        children
      )}
    </Box>
  );
}
