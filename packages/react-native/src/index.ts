/**
 * @ghds/react-native — hand-drawn React Native component library.
 *
 * Components render the platform-agnostic `@ghds/sketch-core` IR via
 * `react-native-svg` and are themed with `@shopify/restyle` from
 * `@ghds/tokens`. Wrap your app in `ThemeProvider` with `lightTheme` or
 * `darkTheme` (the host app chooses; this library ships both).
 */

export { ThemeProvider } from '@shopify/restyle';
export type { ButtonProps, ButtonVariant } from './components/Button.js';
export { Button } from './components/Button.js';
export type { CardProps } from './components/Card.js';
export { Card } from './components/Card.js';
export type { InputProps } from './components/Input.js';
export { Input } from './components/Input.js';
export type { Size, SketchParams } from './sketch/options.js';
export { buildRectangleOutline, makeSeed } from './sketch/options.js';
export type { SketchBackgroundProps } from './sketch/SketchBackground.js';
export { SketchBackground } from './sketch/SketchBackground.js';
export type { UseSketchParams, UseSketchResult } from './sketch/useSketch.js';
export { useSketch } from './sketch/useSketch.js';
export type { BoxProps, TextProps, Theme } from './theme/index.js';
export { Box, darkTheme, lightTheme, Text } from './theme/index.js';
