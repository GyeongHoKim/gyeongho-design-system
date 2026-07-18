import { Alert } from '@ghds/react/alert';
import { Badge } from '@ghds/react/badge';
import { Button } from '@ghds/react/button';
import { Card } from '@ghds/react/card';
import { Input } from '@ghds/react/input';
import { darkTokens, tokens } from '@ghds/tokens';
// Raw text of the generated token stylesheet — the reference-preserving CSS the
// package ships. We parse its `:root` (light) and `[data-theme="dark"]` blocks
// out of it (see THEME_BASE) to pin the preview to a chosen theme.
import tokensCss from '@ghds/tokens/css?raw';
import { useMemo, useState } from 'react';

/**
 * Interactive theming playground.
 *
 * GHDS ships its CSS custom properties as a live `comp → sys → ref` reference
 * chain (see `@ghds/tokens`), so overriding a single semantic `--sys-color-*`
 * variable re-themes every component that aliases it — no component code
 * changes. This island demonstrates exactly that: each color picker rewrites
 * one `--sys-color-*` property on the scoped preview container, and the GHDS
 * React components inside re-paint instantly.
 *
 * Overrides are tracked per theme (light / dark), matching how a real consumer
 * themes GHDS: `:root { … }` for light and `[data-theme="dark"] { … }` for
 * dark. The generated snippet emits exactly those blocks, ready to paste.
 *
 * Every default value is read from `@ghds/tokens` (never hand-copied), so the
 * playground follows the source of truth automatically.
 */

type Theme = 'light' | 'dark';

interface Knob {
  /** The generated CSS custom property this control overrides. */
  readonly cssVar: string;
  /** Human label shown next to the swatch. */
  readonly label: string;
  /** Per-theme defaults, sourced from `@ghds/tokens`. */
  readonly light: string;
  readonly dark: string;
}

const cl = tokens.sys.color;
const cd = darkTokens.sys.color;

/** The curated set of semantic color knobs — the smallest surface that lets a
 * consumer rebrand GHDS, mirroring shadcn's flat semantic layer. */
const KNOBS: readonly Knob[] = [
  {
    cssVar: '--sys-color-bg-primary-default',
    label: 'Primary',
    light: cl.bg.primary.default,
    dark: cd.bg.primary.default,
  },
  {
    cssVar: '--sys-color-bg-primary-hover',
    label: 'Primary (hover)',
    light: cl.bg.primary.hover,
    dark: cd.bg.primary.hover,
  },
  {
    cssVar: '--sys-color-bg-danger-default',
    label: 'Danger',
    light: cl.bg.danger.default,
    dark: cd.bg.danger.default,
  },
  {
    cssVar: '--sys-color-bg-success-default',
    label: 'Success',
    light: cl.bg.success.default,
    dark: cd.bg.success.default,
  },
  {
    cssVar: '--sys-color-bg-warning-default',
    label: 'Warning',
    light: cl.bg.warning.default,
    dark: cd.bg.warning.default,
  },
  {
    cssVar: '--sys-color-bg-info-default',
    label: 'Info',
    light: cl.bg.info.default,
    dark: cd.bg.info.default,
  },
  { cssVar: '--sys-color-bg-canvas', label: 'Canvas', light: cl.bg.canvas, dark: cd.bg.canvas },
  { cssVar: '--sys-color-bg-surface', label: 'Surface', light: cl.bg.surface, dark: cd.bg.surface },
  {
    cssVar: '--sys-color-text-primary',
    label: 'Text',
    light: cl.text.primary,
    dark: cd.text.primary,
  },
  {
    cssVar: '--sys-color-text-secondary',
    label: 'Text (muted)',
    light: cl.text.secondary,
    dark: cd.text.secondary,
  },
  { cssVar: '--sys-color-text-link', label: 'Link', light: cl.text.link, dark: cd.text.link },
  {
    cssVar: '--sys-color-border-focus',
    label: 'Focus ring',
    light: cl.border.focus,
    dark: cd.border.focus,
  },
];

const defaultFor = (knob: Knob, theme: Theme): string =>
  theme === 'dark' ? knob.dark : knob.light;

/** Knobs whose value in `ov` differs from the theme default — the set that
 * actually needs to appear in the generated override snippet. */
function changedFor(ov: Record<string, string>, theme: Theme): Knob[] {
  return KNOBS.filter((k) => ov[k.cssVar] && ov[k.cssVar] !== defaultFor(k, theme));
}

/** Parse a single selector block out of the generated stylesheet into a
 * `{ '--name': value }` map, keeping values in their authored (reference) form. */
function parseBlock(css: string, marker: string): Record<string, string> {
  const start = css.indexOf(marker);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const out: Record<string, string> = {};
  for (const decl of body.split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const name = decl.slice(0, idx).trim();
    if (name.startsWith('--')) out[name] = decl.slice(idx + 1).trim();
  }
  return out;
}

/**
 * Every custom property from the light / dark theme blocks of the generated
 * stylesheet, kept in *reference* form (`--comp-x: var(--sys-y)`), applied to
 * the preview container for the active theme.
 *
 * This re-roots the entire `comp → sys → ref` chain at the container. That's
 * what makes a scoped override work: CSS substitutes a custom property's
 * `var(...)` at the element where the property is *declared*. Because `--comp-*`
 * is declared here (not only on the document `:root`), overriding a `--sys-*`
 * on the container re-substitutes into `--comp-*` within the preview — so
 * comp-driven components (Button, Badge, Alert) re-theme too, not just elements
 * that read `--sys-*` directly. It also pins the preview to the chosen theme
 * regardless of the surrounding site theme.
 */
const THEME_BASE: Record<Theme, Record<string, string>> = {
  light: parseBlock(tokensCss, ':root {'),
  dark: parseBlock(tokensCss, '[data-theme="dark"] {'),
};

/** Empty per-theme override maps. */
const emptyOverrides = (): Record<Theme, Record<string, string>> => ({ light: {}, dark: {} });

export default function ThemePlayground(): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>('light');
  const [overrides, setOverrides] = useState<Record<Theme, Record<string, string>>>(emptyOverrides);

  const setColor = (cssVar: string, value: string) =>
    setOverrides((prev) => ({ ...prev, [theme]: { ...prev[theme], [cssVar]: value } }));

  /** Clear overrides for the theme currently being edited. */
  const reset = () => setOverrides((prev) => ({ ...prev, [theme]: {} }));

  const changedActive = changedFor(overrides[theme], theme);

  const snippet = useMemo(() => {
    const block = (selector: string, t: Theme) => {
      const changed = changedFor(overrides[t], t);
      if (changed.length === 0) return '';
      const lines = changed.map((k) => `  ${k.cssVar}: ${overrides[t][k.cssVar]};`);
      return `${selector} {\n${lines.join('\n')}\n}`;
    };
    const blocks = [block(':root', 'light'), block('[data-theme="dark"]', 'dark')].filter(Boolean);
    return blocks.length > 0
      ? blocks.join('\n\n')
      : '/* Adjust a color above to generate your override snippet. */\n:root {\n}';
  }, [overrides]);

  const hasAnyChange =
    changedFor(overrides.light, 'light').length > 0 ||
    changedFor(overrides.dark, 'dark').length > 0;

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const previewStyle = { ...THEME_BASE[theme], ...overrides[theme] } as React.CSSProperties;

  return (
    <div className="playground">
      <div className="playground-controls">
        <div className="playground-controls-head">
          <div className="playground-theme-toggle">
            <Button
              variant={theme === 'light' ? 'primary' : 'neutral'}
              aria-pressed={theme === 'light'}
              onClick={() => setTheme('light')}
            >
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'primary' : 'neutral'}
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme('dark')}
            >
              Dark
            </Button>
          </div>
          <Button variant="neutral" onClick={reset} disabled={changedActive.length === 0}>
            Reset
          </Button>
        </div>
        <div className="playground-swatches">
          {KNOBS.map((k) => {
            const current = overrides[theme][k.cssVar] ?? defaultFor(k, theme);
            return (
              <label key={k.cssVar} className="playground-swatch">
                <input
                  type="color"
                  value={current}
                  aria-label={`${k.label} color (${theme})`}
                  onChange={(e) => setColor(k.cssVar, e.target.value)}
                />
                <span className="playground-swatch-label">
                  <span className="playground-swatch-name">{k.label}</span>
                  <code>{current}</code>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Scoped preview — every `--sys-color-*` is set on this container for the
          active theme, so the GHDS components below re-theme live without
          touching the site chrome. */}
      <div className="playground-preview" data-theme={theme} style={previewStyle}>
        <div className="demo-row">
          <Button variant="primary">Primary</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="neutral">Cancel</Button>
        </div>
        <div className="demo-row">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
        <Card fill="solid">
          <Input label="Email" placeholder="you@example.com" />
          <p style={{ margin: 0, color: 'var(--sys-color-text-secondary)' }}>
            Body text in a card, with an{' '}
            <a href="#playground" style={{ color: 'var(--sys-color-text-link)' }}>
              inline link
            </a>
            .
          </p>
        </Card>
        <Alert variant="info" title="Heads up">
          This alert re-themes from the same tokens.
        </Alert>
      </div>

      <div className="playground-output">
        <div className="playground-output-head">
          <span className="demo-label" style={{ margin: 0 }}>
            Your override — paste into your global stylesheet
          </span>
          <Button variant="neutral" onClick={copy} disabled={!hasAnyChange}>
            {copied ? 'Copied!' : 'Copy CSS'}
          </Button>
        </div>
        <pre>
          <code>{snippet}</code>
        </pre>
      </div>
    </div>
  );
}
