import { useTheme } from '@shopify/restyle';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Line } from 'react-native-svg';
import type { Theme } from '../theme/theme.js';

export type CardVariant = 'plain' | 'sticky' | 'lined';
export type CardTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type CardFastener = 'none' | 'tape' | 'pin';
export type CardTilt = 'none' | 'left' | 'right';

export type PaperVariant = Exclude<CardVariant, 'plain'>;

// Pin drawing geometry (viewBox units); the head centre lands on the top edge.
const VIEW_WIDTH = 28;
const VIEW_HEIGHT = 30;
const HEAD_X = 14;
const HEAD_Y = 11;

const hiddenFromAccessibility = {
  // `aria-hidden` is what react-native-web renders; the other two are native-only.
  'aria-hidden': true,
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
} as const;

/** Lean angle (degrees) of a card; only paper variants lean. */
export function cardAngle(theme: Theme, variant: CardVariant, tilt: CardTilt): number {
  if ((variant !== 'sticky' && variant !== 'lined') || tilt === 'none') return 0;
  const amount = theme.card.tilt[variant];
  return tilt === 'left' ? -amount : amount;
}

/** Style fragment applying the lean and the top-centre pivot fasteners need. */
export function leanStyle(angle: number, fastener: CardFastener): ViewStyle {
  return {
    ...(angle !== 0 ? { transform: [{ rotate: `${angle}deg` }] } : {}),
    ...(fastener !== 'none' ? { transformOrigin: 'top' } : {}),
  };
}

/** Decorative tape or pin overhanging a card's top edge. */
export function CardFastenerMark({
  kind,
  tone,
  angle,
}: {
  kind: 'tape' | 'pin';
  tone: CardTone;
  angle: number;
}) {
  const theme = useTheme<Theme>();
  const f = theme.card.fastener;

  if (kind === 'tape') {
    const { tape } = f;
    const { width: edgeWidth, color: edgeColor } = tape.border;
    // iOS rejects a dashed border whose sides differ in width, so the two
    // dashed side edges are SVG lines. The dash pattern matches React Native's
    // own dashed border (3x the border width), and each line sits half its
    // width inside the edge, like a border would.
    const dash = edgeWidth * 3;
    const edgeXs = [edgeWidth / 2, tape.width - edgeWidth / 2];
    return (
      <View
        {...hiddenFromAccessibility}
        testID="card-tape"
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          left: '50%',
          marginLeft: -tape.width / 2,
          top: -tape.height / 2,
          width: tape.width,
          height: tape.height,
          backgroundColor: tape.bg,
          opacity: tape.opacity,
          transform: [{ rotate: `${-angle - tape.tilt}deg` }],
        }}
      >
        <Svg
          {...hiddenFromAccessibility}
          pointerEvents="none"
          testID="card-tape-edges"
          width={tape.width}
          height={tape.height}
          style={StyleSheet.absoluteFill}
        >
          {edgeXs.map((x) => (
            <Line
              key={x}
              x1={x}
              y1={0}
              x2={x}
              y2={tape.height}
              stroke={edgeColor}
              strokeWidth={edgeWidth}
              strokeDasharray={`${dash} ${dash}`}
            />
          ))}
        </Svg>
      </View>
    );
  }

  const { pin } = f;
  const scale = pin.size / VIEW_WIDTH;
  return (
    <Svg
      {...hiddenFromAccessibility}
      pointerEvents="none"
      testID="card-pin"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      width={pin.size}
      height={VIEW_HEIGHT * scale}
      style={{
        position: 'absolute',
        left: '50%',
        marginLeft: -HEAD_X * scale,
        top: -HEAD_Y * scale,
      }}
    >
      <Ellipse cx={17} cy={24} rx={7} ry={3} fill={pin.shadow} fillOpacity={pin.shadowOpacity} />
      <Line
        x1={14}
        y1={14}
        x2={16}
        y2={24}
        stroke={pin.needle}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={14} cy={11} r={10} fill={pin.color[tone]} />
      <Circle cx={10.5} cy={7.5} r={3.5} fill={pin.highlight} fillOpacity={pin.highlightOpacity} />
    </Svg>
  );
}

/**
 * Margin line plus horizontal rules for the lined paper, behind the content.
 * Like the web gradient, the rules sit at `padding.top + k * gap - width` for
 * every `k` that fits, so they run through the top padding too.
 */
export function LinedGuides({ height }: { height: number }) {
  const theme = useTheme<Theme>();
  const { rule, margin, padding } = theme.card.lined;
  const first = (padding.top % rule.gap || rule.gap) - rule.width;
  const count =
    height > 0 ? Math.max(0, Math.floor((height - first - rule.width) / rule.gap) + 1) : 0;
  const rules = Array.from({ length: count }, (_, i) => first + i * rule.gap);

  return (
    <View {...hiddenFromAccessibility} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <View
        testID="card-margin-line"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          // `start` follows the layout direction, like the lined padding (`paddingStart`).
          start: margin.offset,
          width: margin.width,
          backgroundColor: margin.color,
        }}
      />
      {rules.map((top) => (
        <View
          key={top}
          testID="card-rule"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top,
            height: rule.width,
            backgroundColor: rule.color,
          }}
        />
      ))}
    </View>
  );
}

/** Surface style (paper colour, radius, padding, shadow) of a `sticky` or `lined` card. */
export function paperSurface(theme: Theme, variant: PaperVariant, tone: CardTone): ViewStyle {
  if (variant === 'sticky') {
    const { bg, radius, padding, shadow } = theme.card.sticky;
    return {
      backgroundColor: bg[tone],
      borderTopLeftRadius: radius.small,
      borderTopRightRadius: radius.small,
      borderBottomRightRadius: radius.small,
      borderBottomLeftRadius: radius.fold,
      paddingTop: padding.top,
      paddingHorizontal: padding.inline,
      paddingBottom: padding.bottom,
      ...shadow,
    };
  }
  const { bg, radius, padding, shadow } = theme.card.lined;
  return {
    backgroundColor: bg,
    borderRadius: radius,
    paddingTop: padding.top,
    paddingEnd: padding.inline,
    paddingBottom: padding.bottom,
    paddingStart: padding.start,
    ...shadow,
  };
}
