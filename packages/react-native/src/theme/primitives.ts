import { createBox, createText } from '@shopify/restyle';
import type { ComponentProps } from 'react';
import type { Theme } from './theme.js';

/** Theme-aware layout primitive. All style props are typed against `Theme`. */
export const Box = createBox<Theme>();

/** Theme-aware text primitive driven by `textVariants` from the GHDS theme. */
export const Text = createText<Theme>();

export type BoxProps = ComponentProps<typeof Box>;
export type TextProps = ComponentProps<typeof Text>;
