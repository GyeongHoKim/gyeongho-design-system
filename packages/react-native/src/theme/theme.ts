import { darkTokens, lightTokens } from '@ghds/tokens/rn';
import { createTheme } from '@shopify/restyle';
import type { TextStyle } from 'react-native';

/**
 * The shape of one tokens object. Widened to the union of the light and dark
 * builds so {@link buildTheme} returns one identical `Theme` type for both —
 * the host app can swap themes without any structural mismatch.
 */
type Tokens = typeof lightTokens | typeof darkTokens;

/** A single GHDS typography token (multiplier line-height, numeric weight). */
interface TypographyToken {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
}

/**
 * Convert a GHDS typography token into a React Native text style.
 *
 * GHDS stores `lineHeight` as a unitless multiplier (web/CSS convention) and
 * `fontWeight` as a number. React Native expects an absolute pixel line-height
 * and a string font-weight, so we derive both here. No design value is
 * invented — only the unit representation changes.
 */
function toTextVariant(token: TypographyToken): {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
} {
  return {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: Math.round(token.fontSize * token.lineHeight),
    fontWeight: String(token.fontWeight) as TextStyle['fontWeight'],
  };
}

/**
 * Build a Restyle theme from a GHDS tokens object. Every value originates in
 * `@ghds/tokens` (`sys` + `comp` tiers only); nothing is hardcoded. Running
 * this for both the light and dark token sets yields two structurally identical
 * themes that the host app can swap via Restyle's `ThemeProvider`.
 */
function buildTheme(t: Tokens) {
  return createTheme({
    colors: {
      transparent: 'transparent',

      // sys backgrounds
      bgCanvas: t.sys.color.bg.canvas,
      bgSurface: t.sys.color.bg.surface,
      bgMuted: t.sys.color.bg.muted,
      bgSubtle: t.sys.color.bg.subtle,

      // sys text
      textPrimary: t.sys.color.text.primary,
      textSecondary: t.sys.color.text.secondary,
      textDisabled: t.sys.color.text.disabled,
      textLink: t.sys.color.text.link,

      // sys borders
      borderDefault: t.sys.color.border.default,
      borderStrong: t.sys.color.border.strong,
      borderSubtle: t.sys.color.border.subtle,
      borderFocus: t.sys.color.border.focus,
      borderDanger: t.sys.color.border.danger,

      // sys icons
      iconDefault: t.sys.color.icon.default,
      iconMuted: t.sys.color.icon.muted,

      // comp.button colors
      buttonBgPrimary: t.comp.button.bg.primary.default,
      buttonBgPrimaryHover: t.comp.button.bg.primary.hover,
      buttonBgPrimaryActive: t.comp.button.bg.primary.active,
      buttonBgPrimaryDisabled: t.comp.button.bg.primary.disabled,
      buttonBgDanger: t.comp.button.bg.danger.default,
      buttonBgDangerHover: t.comp.button.bg.danger.hover,
      buttonTextPrimary: t.comp.button.text.primary,
      buttonTextDanger: t.comp.button.text.danger,
      buttonTextDisabled: t.comp.button.text.disabled,
    },
    spacing: {
      none: t.sys.spacing.none,
      xs: t.sys.spacing.xs,
      sm: t.sys.spacing.sm,
      md: t.sys.spacing.md,
      lg: t.sys.spacing.lg,
      xl: t.sys.spacing.xl,
      '2xl': t.sys.spacing['2xl'],
      // comp.button padding (resolves to the same values as sys spacing, kept
      // as named comp keys so Button consumes its own component tier tokens)
      buttonHorizontal: t.comp.button.padding.horizontal,
      buttonVertical: t.comp.button.padding.vertical,
    },
    borderRadii: {
      sm: t.sys.radius.sm,
      md: t.sys.radius.md,
      lg: t.sys.radius.lg,
      pill: t.sys.radius.pill,
      button: t.comp.button.radius,
    },
    borderWidths: {
      thin: t.sys.border.width.thin,
      default: t.sys.border.width.default,
      thick: t.sys.border.width.thick,
    },
    iconSizes: {
      sm: t.sys.icon.size.sm,
      md: t.sys.icon.size.md,
      lg: t.sys.icon.size.lg,
    },
    textVariants: {
      defaults: toTextVariant(t.sys.typography.body),
      heading: toTextVariant(t.sys.typography.heading),
      title: toTextVariant(t.sys.typography.title),
      body: toTextVariant(t.sys.typography.body),
      label: toTextVariant(t.sys.typography.label),
      caption: toTextVariant(t.sys.typography.caption),
    },
    // Sketch geometry parameters (design values from the `sketch` token group).
    // Consumed by the sketch adapter, not by Restyle's style resolvers.
    sketch: {
      roughness: t.sys.sketch.roughness,
      bowing: t.sys.sketch.bowing,
      hachureGap: t.sys.sketch.hachureGap,
      hachureAngle: t.sys.sketch.hachureAngle,
    },
    buttonSketch: {
      roughness: t.comp.button.sketch.roughness,
      bowing: t.comp.button.sketch.bowing,
    },
  });
}

/** Restyle theme built from the GHDS light token set. */
export const lightTheme = buildTheme(lightTokens);

/** Restyle theme built from the GHDS dark token set (same structure as light). */
export const darkTheme: typeof lightTheme = buildTheme(darkTokens);

/** The GHDS Restyle theme type. Use with `createBox`/`createText` generics. */
export type Theme = typeof lightTheme;
