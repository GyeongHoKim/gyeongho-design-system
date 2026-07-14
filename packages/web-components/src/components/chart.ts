import type { SketchDrawable, SketchOptions } from '@ghds/sketch-core';
import { ellipse, line, rectangle } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { css, html, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type SketchParams, SketchyBase } from '../sketchy-base.js';

/** One data series. */
export interface GhChartSeries {
  name: string;
  values: number[];
}

export type GhChartType = 'bar' | 'line';

const GRID_LINES = 4;
const SERIES_COLORS = 5;

/**
 * `<gh-chart>` — a hand-drawn bar or line chart.
 *
 * Renders `series` against `labels` as sketchy bars or lines
 * (`@ghds/sketch-core`), with a grid and axes. Series cycle through
 * `sys.color.chart.1..5` (via `comp.chart.series.*`). Exposes `role="img"` with
 * an `aria-label` summary. All colours and sketch parameters come from
 * `@ghds/tokens` (`comp.chart.*`); the pixel `height` is a public layout prop.
 */
@customElement('gh-chart')
export class GhChart extends SketchyBase {
  static override styles = [
    SketchyBase.sketchStyles,
    css`
      :host {
        display: block;
        width: 100%;
      }

      .chart {
        position: relative;
        width: 100%;
      }

      svg.plot {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      .grid path {
        fill: none;
        stroke: var(--comp-chart-grid);
        stroke-width: var(--sys-border-width-thin);
        stroke-linecap: round;
      }

      .axis path {
        fill: none;
        stroke: var(--comp-chart-axis);
        stroke-width: var(--comp-chart-stroke-width);
        stroke-linecap: round;
      }

      .series-stroke {
        fill: none;
        stroke: currentColor;
        stroke-width: var(--comp-chart-stroke-width);
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .series-fill {
        fill: none;
        stroke: currentColor;
        stroke-width: var(--sys-border-width-thin);
        stroke-linecap: round;
      }

      .series-dot {
        fill: currentColor;
        stroke: currentColor;
      }

      .s1 {
        color: var(--comp-chart-series-1);
      }
      .s2 {
        color: var(--comp-chart-series-2);
      }
      .s3 {
        color: var(--comp-chart-series-3);
      }
      .s4 {
        color: var(--comp-chart-series-4);
      }
      .s5 {
        color: var(--comp-chart-series-5);
      }

      text.label {
        fill: var(--comp-chart-text);
        font-family: var(--sys-typography-caption-fontFamily);
        font-size: var(--sys-typography-caption-fontSize);
      }
    `,
  ];

  /** Chart type. */
  @property({ type: String, reflect: true }) type: GhChartType = 'bar';
  /** The data series. */
  @property({ attribute: false }) series: GhChartSeries[] = [];
  /** X-axis category labels. */
  @property({ attribute: false }) labels: string[] = [];
  /** Plot height in CSS px (a layout prop, not a design token). */
  @property({ type: Number }) height = 240;
  /** Accessible summary; auto-generated when empty. */
  @property({ type: String }) label = '';

  private readonly internals: ElementInternals = this.attachInternals();

  protected override get frame(): HTMLElement {
    return this;
  }

  protected override updated(): void {
    this.internals.role = 'img';
    this.internals.ariaLabel = this.label || this.autoLabel();
  }

  private autoLabel(): string {
    const names = this.series.map((s) => s.name).join(', ');
    return `${this.type} chart${names ? ` of ${names}` : ''}`;
  }

  // Abstract member of SketchyBase; unused because this component paints many
  // shapes itself in render() rather than a single frame drawable.
  protected override sketch(): SketchDrawable {
    return { strokePaths: [], fillPaths: [] };
  }

  protected override sketchParams(): SketchParams {
    return {
      roughness: tokens.comp.chart.sketch.roughness,
      bowing: tokens.comp.chart.sketch.bowing,
    };
  }

  private options(index: number, extra?: Partial<SketchOptions>): SketchOptions {
    return {
      roughness: tokens.comp.chart.sketch.roughness,
      bowing: tokens.comp.chart.sketch.bowing,
      seed: this.effectiveSeed + index * 101,
      ...extra,
    };
  }

  private renderPlot(): unknown {
    const w = this.sketchWidth;
    const h = this.sketchHeight;
    if (w <= 0 || h <= 0) {
      return svg``;
    }
    const padL = Number.parseFloat(tokens.sys.spacing.xl);
    const padB = Number.parseFloat(tokens.sys.spacing.xl);
    const padT = Number.parseFloat(tokens.sys.spacing.md);
    const padR = Number.parseFloat(tokens.sys.spacing.md);
    const x0 = padL;
    const y0 = padT;
    const plotW = Math.max(w - padL - padR, 1);
    const plotH = Math.max(h - padT - padB, 1);
    const y1 = y0 + plotH;

    const allValues = this.series.flatMap((s) => s.values);
    const max = Math.max(1, ...allValues);

    const nodes: unknown[] = [];
    let seedIndex = 0;

    // Grid + baseline.
    const gridPaths: string[] = [];
    for (let i = 0; i <= GRID_LINES; i++) {
      const gy = y0 + (plotH * i) / GRID_LINES;
      gridPaths.push(...line(x0, gy, x0 + plotW, gy, this.options(seedIndex++)).strokePaths);
    }
    nodes.push(svg`<g class="grid">${gridPaths.map((d) => svg`<path d=${d}></path>`)}</g>`);
    const axis = line(x0, y0, x0, y1, this.options(seedIndex++)).strokePaths;
    nodes.push(svg`<g class="axis">${axis.map((d) => svg`<path d=${d}></path>`)}</g>`);

    const count = Math.max(this.labels.length, ...this.series.map((s) => s.values.length), 1);
    const slot = plotW / count;

    if (this.type === 'bar') {
      const seriesCount = Math.max(this.series.length, 1);
      const groupPad = slot * 0.2;
      const barW = (slot - groupPad) / seriesCount;
      this.series.forEach((s, si) => {
        const paths: string[] = [];
        s.values.forEach((value, vi) => {
          const barH = (value / max) * plotH;
          const bx = x0 + vi * slot + groupPad / 2 + si * barW;
          const by = y1 - barH;
          const drawable = rectangle(
            bx,
            by,
            Math.max(barW - 2, 1),
            Math.max(barH, 1),
            this.options(seedIndex++, { fillStyle: 'hachure' }),
          );
          paths.push(...drawable.fillPaths.map((d) => `F${d}`), ...drawable.strokePaths);
        });
        nodes.push(
          svg`<g class=${`s${(si % SERIES_COLORS) + 1}`}>${paths.map((d) =>
            d.startsWith('F')
              ? svg`<path class="series-fill" d=${d.slice(1)}></path>`
              : svg`<path class="series-stroke" d=${d}></path>`,
          )}</g>`,
        );
      });
    } else {
      this.series.forEach((s, si) => {
        const points = s.values.map((value, vi) => {
          const px = x0 + vi * slot + slot / 2;
          const py = y1 - (value / max) * plotH;
          return [px, py] as [number, number];
        });
        const strokes: string[] = [];
        for (let i = 0; i < points.length - 1; i++) {
          const a = points[i];
          const b = points[i + 1];
          if (a && b) {
            strokes.push(...line(a[0], a[1], b[0], b[1], this.options(seedIndex++)).strokePaths);
          }
        }
        const dots: string[] = [];
        for (const [px, py] of points) {
          const dotR = Number.parseFloat(tokens.sys.spacing.xs);
          dots.push(
            ...ellipse(
              px - dotR,
              py - dotR,
              dotR * 2,
              dotR * 2,
              this.options(seedIndex++, { fillStyle: 'solid' }),
            ).fillPaths,
          );
        }
        nodes.push(
          svg`<g class=${`s${(si % SERIES_COLORS) + 1}`}>
            ${strokes.map((d) => svg`<path class="series-stroke" d=${d}></path>`)}
            ${dots.map((d) => svg`<path class="series-dot" d=${d}></path>`)}
          </g>`,
        );
      });
    }

    // X-axis labels.
    const labelNodes = this.labels.map((text, i) => {
      const lx = x0 + i * slot + slot / 2;
      return svg`<text class="label" x=${lx} y=${y1 + padB * 0.6} text-anchor="middle">${text}</text>`;
    });

    return svg`<svg
      class="plot"
      viewBox="0 0 ${w} ${h}"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      ${nodes}
      ${labelNodes}
    </svg>`;
  }

  protected override render(): unknown {
    return html`<div class="chart" style=${`height:${this.height}px`}>${this.renderPlot()}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gh-chart': GhChart;
  }
}
