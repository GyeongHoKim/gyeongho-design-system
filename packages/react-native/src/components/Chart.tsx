import { line, path, rectangle, type SketchDrawable } from '@ghds/sketch-core';
import { useTheme } from '@shopify/restyle';
import { useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { makeSeed } from '../sketch/options.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** One data point in a {@link Chart}. */
export interface ChartDatum {
  label: string;
  value: number;
}

/** Colour series index (1–5), mapped to `comp.chart.series.*`. */
export type ChartSeries = 1 | 2 | 3 | 4 | 5;

/** Props for {@link Chart}. */
export interface ChartProps {
  /** `'bar'` draws vertical bars; `'line'` draws a connected line. */
  type: 'bar' | 'line';
  /** The data points, left to right. */
  data: ChartDatum[];
  /** Which colour series to use. Defaults to `1`. */
  series?: ChartSeries;
  /** Plot height in px. Defaults to a token-derived value. */
  height?: number;
  /** Accessible summary of the chart. */
  accessibilityLabel?: string;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A minimal hand-drawn chart (bar or line) rendered with `react-native-svg`.
 * The geometry is sketched by `@ghds/sketch-core` (so bars/lines match the rest
 * of GHDS), and every colour comes from `@ghds/tokens` — the categorical series
 * palette is `comp.chart.series.1…5` (which alias `sys.color.chart.*`), with the
 * axis in `comp.chart.axis`. The chart exposes an accessible label since its
 * SVG marks are decorative to assistive tech.
 */
export function Chart({ type, data, series = 1, height, accessibilityLabel, testID }: ChartProps) {
  const theme = useTheme<Theme>();
  const [width, setWidth] = useState(0);
  const seedRef = useRef<number | null>(null);
  if (seedRef.current === null) {
    seedRef.current = makeSeed();
  }
  const seed = seedRef.current;

  const plotHeight = height ?? theme.spacing['2xl'] * 3;
  const inset = theme.borderWidths.default * 2;
  const strokeWidth = theme.chartStrokeWidth;
  const seriesColor = theme.colors[`chartSeries${series}` as const];

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setWidth((prev) => (prev === next ? prev : next));
  };

  const { marks, baseline } = useMemo<{
    marks: { id: string; drawable: SketchDrawable }[];
    baseline: SketchDrawable | null;
  }>(() => {
    if (width <= 0 || data.length === 0) {
      return { marks: [], baseline: null };
    }
    const plotWidth = width - inset * 2;
    const usableHeight = plotHeight - inset * 2;
    const maxValue = Math.max(...data.map((d) => d.value), 0) || 1;
    const band = plotWidth / data.length;
    const opts = { roughness: theme.chartSketch.roughness, bowing: theme.chartSketch.bowing, seed };
    const baselineY = plotHeight - inset;

    const axis = line(inset, baselineY, width - inset, baselineY, opts);

    if (type === 'bar') {
      const barWidth = band * 0.6;
      const bars = data.map((datum, i) => {
        const barHeight = Math.max((datum.value / maxValue) * usableHeight, 1);
        const x = inset + i * band + (band - barWidth) / 2;
        const y = baselineY - barHeight;
        return {
          id: `${datum.label}-${i}`,
          drawable: rectangle(x, y, barWidth, barHeight, { ...opts, fillStyle: 'solid' }),
        };
      });
      return { marks: bars, baseline: axis };
    }

    const points = data.map((datum, i) => {
      const x = inset + i * band + band / 2;
      const y = baselineY - (datum.value / maxValue) * usableHeight;
      return `${x} ${y}`;
    });
    const d = `M ${points.join(' L ')}`;
    return { marks: [{ id: 'line', drawable: path(d, opts) }], baseline: axis };
  }, [
    width,
    data,
    type,
    plotHeight,
    inset,
    seed,
    theme.chartSketch.roughness,
    theme.chartSketch.bowing,
  ]);

  return (
    <Box testID={testID} accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View onLayout={onLayout} style={{ width: '100%', height: plotHeight }}>
        {width > 0 && (
          <Svg width={width} height={plotHeight}>
            {baseline?.strokePaths.map((d) => (
              <Path
                key={`axis:${d}`}
                d={d}
                stroke={theme.colors.chartAxis}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            ))}
            {marks.flatMap((mark) => [
              ...mark.drawable.fillPaths.map((d) => (
                <Path
                  key={`fill-${mark.id}:${d}`}
                  d={d}
                  stroke={seriesColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                />
              )),
              ...mark.drawable.strokePaths.map((d) => (
                <Path
                  key={`stroke-${mark.id}:${d}`}
                  d={d}
                  stroke={seriesColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )),
            ])}
          </Svg>
        )}
      </View>
      <Box flexDirection="row" marginTop="xs">
        {data.map((datum) => (
          <Box key={datum.label} flex={1} alignItems="center">
            <Text variant="caption" color="chartText" numberOfLines={1}>
              {datum.label}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
