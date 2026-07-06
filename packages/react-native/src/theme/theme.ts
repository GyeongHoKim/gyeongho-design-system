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
      textDanger: t.sys.color.text.danger,

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

      // comp.checkbox colors
      checkboxBgUncheckedDefault: t.comp.checkbox.bg.unchecked.default,
      checkboxBgUncheckedDisabled: t.comp.checkbox.bg.unchecked.disabled,
      checkboxBgCheckedDefault: t.comp.checkbox.bg.checked.default,
      checkboxBgCheckedHover: t.comp.checkbox.bg.checked.hover,
      checkboxBgCheckedDisabled: t.comp.checkbox.bg.checked.disabled,
      checkboxStrokeDefault: t.comp.checkbox.stroke.default,
      checkboxStrokeHover: t.comp.checkbox.stroke.hover,
      checkboxStrokeChecked: t.comp.checkbox.stroke.checked,
      checkboxStrokeDisabled: t.comp.checkbox.stroke.disabled,
      checkboxMark: t.comp.checkbox.mark,
      checkboxTextLabel: t.comp.checkbox.text.label,
      checkboxTextDisabled: t.comp.checkbox.text.disabled,

      // comp.radio colors
      radioBgDefault: t.comp.radio.bg.default,
      radioBgDisabled: t.comp.radio.bg.disabled,
      radioStrokeDefault: t.comp.radio.stroke.default,
      radioStrokeHover: t.comp.radio.stroke.hover,
      radioStrokeChecked: t.comp.radio.stroke.checked,
      radioStrokeDisabled: t.comp.radio.stroke.disabled,
      radioDotDefault: t.comp.radio.dot.default,
      radioDotDisabled: t.comp.radio.dot.disabled,
      radioTextLabel: t.comp.radio.text.label,
      radioTextDisabled: t.comp.radio.text.disabled,

      // comp.switch colors
      switchBgOffDefault: t.comp.switch.bg.off.default,
      switchBgOffDisabled: t.comp.switch.bg.off.disabled,
      switchBgOnDefault: t.comp.switch.bg.on.default,
      switchBgOnHover: t.comp.switch.bg.on.hover,
      switchBgOnDisabled: t.comp.switch.bg.on.disabled,
      switchStrokeDefault: t.comp.switch.stroke.default,
      switchStrokeChecked: t.comp.switch.stroke.checked,
      switchStrokeDisabled: t.comp.switch.stroke.disabled,
      switchThumbColorDefault: t.comp.switch.thumb.color.default,
      switchThumbColorDisabled: t.comp.switch.thumb.color.disabled,
      switchTextLabel: t.comp.switch.text.label,
      switchTextDisabled: t.comp.switch.text.disabled,

      // comp.select colors
      selectTriggerBgDefault: t.comp.select.trigger.bg.default,
      selectTriggerBgDisabled: t.comp.select.trigger.bg.disabled,
      selectTriggerStrokeDefault: t.comp.select.trigger.stroke.default,
      selectTriggerStrokeHover: t.comp.select.trigger.stroke.hover,
      selectTriggerStrokeFocus: t.comp.select.trigger.stroke.focus,
      selectTriggerStrokeDisabled: t.comp.select.trigger.stroke.disabled,
      selectTriggerTextDefault: t.comp.select.trigger.text.default,
      selectTriggerTextPlaceholder: t.comp.select.trigger.text.placeholder,
      selectTriggerTextDisabled: t.comp.select.trigger.text.disabled,
      selectTriggerTextLabel: t.comp.select.trigger.text.label,
      selectPanelBg: t.comp.select.panel.bg,
      selectPanelStroke: t.comp.select.panel.stroke,
      selectOptionBgDefault: t.comp.select.option.bg.default,
      selectOptionBgHighlighted: t.comp.select.option.bg.highlighted,
      selectOptionBgSelected: t.comp.select.option.bg.selected,
      selectOptionBgSelectedHover: t.comp.select.option.bg.selectedHover,
      selectOptionTextDefault: t.comp.select.option.text.default,
      selectOptionTextSelected: t.comp.select.option.text.selected,
      selectOptionTextDisabled: t.comp.select.option.text.disabled,

      // comp.spinner colors
      spinnerIndicator: t.comp.spinner.indicator,

      // comp.progress colors
      progressBgRail: t.comp.progress.bg.rail,
      progressBgFill: t.comp.progress.bg.fill,
      progressStrokeRail: t.comp.progress.stroke.rail,
      progressStrokeFill: t.comp.progress.stroke.fill,

      // comp.avatar colors
      avatarBg: t.comp.avatar.bg,
      avatarText: t.comp.avatar.text,
      avatarStroke: t.comp.avatar.stroke,

      // comp.badge colors
      badgeBgNeutral: t.comp.badge.bg.neutral,
      badgeBgPrimary: t.comp.badge.bg.primary,
      badgeBgSuccess: t.comp.badge.bg.success,
      badgeBgWarning: t.comp.badge.bg.warning,
      badgeBgDanger: t.comp.badge.bg.danger,
      badgeBgInfo: t.comp.badge.bg.info,
      badgeTextNeutral: t.comp.badge.text.neutral,
      badgeTextPrimary: t.comp.badge.text.primary,
      badgeTextSuccess: t.comp.badge.text.success,
      badgeTextWarning: t.comp.badge.text.warning,
      badgeTextDanger: t.comp.badge.text.danger,
      badgeTextInfo: t.comp.badge.text.info,
      badgeStrokeNeutral: t.comp.badge.stroke.neutral,
      badgeStrokePrimary: t.comp.badge.stroke.primary,
      badgeStrokeSuccess: t.comp.badge.stroke.success,
      badgeStrokeWarning: t.comp.badge.stroke.warning,
      badgeStrokeDanger: t.comp.badge.stroke.danger,
      badgeStrokeInfo: t.comp.badge.stroke.info,

      // comp.slider colors
      sliderBgRailDefault: t.comp.slider.bg.rail.default,
      sliderBgRailDisabled: t.comp.slider.bg.rail.disabled,
      sliderBgFillDefault: t.comp.slider.bg.fill.default,
      sliderBgFillHover: t.comp.slider.bg.fill.hover,
      sliderBgFillDisabled: t.comp.slider.bg.fill.disabled,
      sliderStrokeDefault: t.comp.slider.stroke.default,
      sliderStrokeDisabled: t.comp.slider.stroke.disabled,
      sliderThumbBgDefault: t.comp.slider.thumb.bg.default,
      sliderThumbBgDisabled: t.comp.slider.thumb.bg.disabled,
      sliderThumbStrokeDefault: t.comp.slider.thumb.stroke.default,
      sliderThumbStrokeHover: t.comp.slider.thumb.stroke.hover,
      sliderThumbStrokeFocus: t.comp.slider.thumb.stroke.focus,
      sliderThumbStrokeDisabled: t.comp.slider.thumb.stroke.disabled,
      sliderTextLabel: t.comp.slider.text.label,
      sliderTextDisabled: t.comp.slider.text.disabled,
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
    checkboxSketch: {
      roughness: t.comp.checkbox.sketch.roughness,
      bowing: t.comp.checkbox.sketch.bowing,
    },
    radioSketch: {
      roughness: t.comp.radio.sketch.roughness,
      bowing: t.comp.radio.sketch.bowing,
    },
    switchSketch: {
      roughness: t.comp.switch.sketch.roughness,
      bowing: t.comp.switch.sketch.bowing,
    },
    selectSketch: {
      roughness: t.comp.select.sketch.roughness,
      bowing: t.comp.select.sketch.bowing,
      elevation: t.comp.select.sketch.elevation,
    },
    sliderSketch: {
      roughness: t.comp.slider.sketch.roughness,
      bowing: t.comp.slider.sketch.bowing,
    },
    badgeSketch: {
      roughness: t.comp.badge.sketch.roughness,
      bowing: t.comp.badge.sketch.bowing,
    },
    avatarSketch: {
      roughness: t.comp.avatar.sketch.roughness,
      bowing: t.comp.avatar.sketch.bowing,
    },
    spinnerSketch: {
      roughness: t.comp.spinner.sketch.roughness,
      bowing: t.comp.spinner.sketch.bowing,
    },
    // Spinner diameters + spin duration (ms), read directly from `comp.spinner`.
    spinnerSizes: {
      sm: t.comp.spinner.size.sm,
      md: t.comp.spinner.size.md,
      lg: t.comp.spinner.size.lg,
    },
    spinnerDuration: t.comp.spinner.duration,
    progressSketch: {
      roughness: t.comp.progress.sketch.roughness,
      bowing: t.comp.progress.sketch.bowing,
    },
    progressTrackHeight: t.comp.progress.track.height,
    progressDuration: t.comp.progress.duration,
    // Avatar diameters, read directly from `comp.avatar.size` (not the generic
    // `spacing` scale) so a retarget of the avatar size tokens is picked up here.
    avatarSizes: {
      sm: t.comp.avatar.size.sm,
      md: t.comp.avatar.size.md,
      lg: t.comp.avatar.size.lg,
    },
    // Slider's track height/thumb size, read directly from `comp.slider` (not
    // the generic `spacing`/`iconSizes` scales) so a future retargeting of
    // `comp.slider.track.height`/`thumb.size` to a different `sys` value is
    // picked up here too, the same way React/Web Components read
    // `tokens.comp.slider.*` directly rather than through a generic bridge.
    sliderDimensions: {
      trackHeight: t.comp.slider.track.height,
      thumbSize: t.comp.slider.thumb.size,
    },
  });
}

/** Restyle theme built from the GHDS light token set. */
export const lightTheme = buildTheme(lightTokens);

/** Restyle theme built from the GHDS dark token set (same structure as light). */
export const darkTheme: typeof lightTheme = buildTheme(darkTokens);

/** The GHDS Restyle theme type. Use with `createBox`/`createText` generics. */
export type Theme = typeof lightTheme;
