import { act, fireEvent, screen } from '@testing-library/react';
import { type ComponentType, useState } from 'react';
import { View, type ViewProps } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { lightTheme, renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { Card, type CardFastener, type CardVariant } from './Card.js';

/** react-native-web's View takes `dir`, which sets the layout direction for its subtree. */
const DirView = View as unknown as ComponentType<ViewProps & { dir: 'ltr' | 'rtl' }>;

/** Fire react-native-web's stored onLayout handler (the jsdom ResizeObserver stub never does). */
function layout(testID: string, width: number, height: number) {
  act(() => {
    const node = screen.getByTestId(testID) as HTMLElement & {
      __reactLayoutHandler?: (e: unknown) => void;
    };
    node.__reactLayoutHandler?.({ nativeEvent: { layout: { x: 0, y: 0, width, height } } });
  });
}

function Counter() {
  const [count, setCount] = useState(0);
  return <Text onPress={() => setCount((n) => n + 1)}>count {count}</Text>;
}

describe('Card', () => {
  it('renders its children', () => {
    renderWithTheme(
      <Card>
        <Text>Card body</Text>
      </Card>,
    );
    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('exposes a testID handle', () => {
    renderWithTheme(<Card testID="my-card" />);
    expect(screen.getByTestId('my-card')).toBeInTheDocument();
  });

  it('renders the elevated variant without error', () => {
    renderWithTheme(
      <Card elevated testID="raised">
        <Text>Raised</Text>
      </Card>,
    );
    expect(screen.getByTestId('raised')).toBeInTheDocument();
    expect(screen.getByText('Raised')).toBeInTheDocument();
  });

  it('is exposed as a labelled region when an accessibility label is given', () => {
    renderWithTheme(<Card accessibilityLabel="Summary card" testID="labelled" />);
    expect(screen.getByTestId('labelled')).toHaveAttribute('aria-label', 'Summary card');
  });

  describe('paper variants', () => {
    const { card } = lightTheme;

    function style(testID: string) {
      return screen.getByTestId(testID).style;
    }

    it('sticky uses the tone background, fold radius and no sketch', () => {
      // react-native-web warns once that the theme's native shadow* props are deprecated.
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      renderWithTheme(<Card variant="sticky" tone="warning" testID="paper" />);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('"shadow*" style props are deprecated'),
      );
      warn.mockRestore();
      const s = style('paper');
      expect(s.backgroundColor).not.toBe('');
      expect(screen.queryByTestId('sketch-svg')).toBeNull();
      expect(s.borderBottomLeftRadius).toBe(`${card.sticky.radius.fold}px`);
      expect(s.borderTopLeftRadius).toBe(`${card.sticky.radius.small}px`);
      expect(s.paddingTop).toBe(`${card.sticky.padding.top}px`);
    });

    it('sticky tone follows theme.card.sticky.bg', () => {
      const custom = {
        ...lightTheme,
        card: {
          ...card,
          sticky: { ...card.sticky, bg: { ...card.sticky.bg, warning: '#010203' } },
        },
      };
      renderWithTheme(<Card variant="sticky" tone="warning" testID="paper" />, custom);
      expect(style('paper').backgroundColor).toBe('rgb(1, 2, 3)');
    });

    it('tilt left rotates by the negative variant tilt', () => {
      renderWithTheme(<Card variant="sticky" tilt="left" testID="paper" />);
      expect(style('paper').transform).toBe(`rotate(-${card.tilt.sticky}deg)`);
    });

    it('tilt right rotates by the positive variant tilt', () => {
      renderWithTheme(<Card variant="lined" tilt="right" testID="paper" />);
      expect(style('paper').transform).toBe(`rotate(${card.tilt.lined}deg)`);
    });

    it('renders an unknown variant as plain', () => {
      renderWithTheme(<Card variant={'foo' as CardVariant} tilt="left" testID="paper" />);
      const s = style('paper');
      expect(s.paddingTop).toBe('');
      expect(s.transform).toBe('');
      expect(screen.queryAllByTestId('card-rule')).toHaveLength(0);
      expect(screen.getByTestId('paper').className).toContain('r-padding-');
    });

    it('plain ignores tilt', () => {
      renderWithTheme(<Card tilt="left" testID="paper" />);
      expect(style('paper').transform).toBe('');
    });

    it('lined paints rules phase-aligned from the top edge to the bottom', () => {
      renderWithTheme(<Card variant="lined" testID="paper" />);
      const height = 120;
      act(() => {
        // react-native-web stores the onLayout handler on the DOM node; the
        // jsdom ResizeObserver stub never fires it, so invoke it directly.
        const node = screen.getByTestId('paper') as HTMLElement & {
          __reactLayoutHandler?: (e: unknown) => void;
        };
        node.__reactLayoutHandler?.({ nativeEvent: { layout: { width: 200, height } } });
      });
      // padding.top 32, gap 24, rule width 1: rules sit at 32 + 24k - 1, starting inside the
      // top padding like the web gradient.
      expect(screen.getAllByTestId('card-rule').map((r) => r.style.top)).toEqual([
        '7px',
        '31px',
        '55px',
        '79px',
        '103px',
      ]);
      expect(screen.getByTestId('card-margin-line')).toBeInTheDocument();
    });

    it('lined margin line follows the inline-start edge', () => {
      const offset = `${card.lined.margin.offset}px`;
      const { unmount } = renderWithTheme(<Card variant="lined" />);
      expect(screen.getByTestId('card-margin-line').style.left).toBe(offset);
      unmount();
      renderWithTheme(
        <DirView dir="rtl">
          <Card variant="lined" />
        </DirView>,
      );
      const line = screen.getByTestId('card-margin-line');
      expect(line.style.right).toBe(offset);
      expect(line.style.left).toBe('');
    });

    it('lined renders no rules before layout', () => {
      renderWithTheme(<Card variant="lined" testID="paper" />);
      expect(screen.queryAllByTestId('card-rule')).toHaveLength(0);
    });

    it('pin fastener renders a decorative svg on every variant', () => {
      renderWithTheme(<Card fastener="pin" />);
      const pin = screen.getByTestId('card-pin');
      expect(pin.tagName.toLowerCase()).toBe('svg');
      expect(pin).toHaveAttribute('aria-hidden', 'true');
      expect(pin).toHaveAttribute('data-accessibility-elements-hidden', 'true');
      expect(pin).toHaveAttribute('data-important-for-accessibility', 'no-hide-descendants');
    });

    it('tape fastener is hidden from assistive technology', () => {
      // react-native-web drops the native-only props on a View; aria-hidden is what reaches the DOM.
      renderWithTheme(<Card fastener="tape" />);
      expect(screen.getByTestId('card-tape')).toHaveAttribute('aria-hidden', 'true');
    });

    it('pin highlight uses its own opacity token', () => {
      const pin = { ...card.fastener.pin, shadowOpacity: 0.11, highlightOpacity: 0.22 };
      const custom = { ...lightTheme, card: { ...card, fastener: { ...card.fastener, pin } } };
      renderWithTheme(<Card fastener="pin" />, custom);
      const highlight = screen.getByTestId('card-pin').querySelector('circle[r="3.5"]');
      expect(highlight).toHaveAttribute('fill-opacity', '0.22');
    });

    it('tape fastener draws dashed side edges as svg lines and counter-rotates the tilt', () => {
      renderWithTheme(<Card variant="sticky" tilt="left" fastener="tape" testID="paper" />);
      const tape = screen.getByTestId('card-tape');
      const t = card.fastener.tape;
      // iOS rejects dashed borders with unequal side widths, so the tape has no border at all.
      expect(tape.style.borderLeftStyle).toBe('');
      expect(tape.style.borderLeftWidth).toBe('');
      expect(tape.style.width).toBe(`${t.width}px`);
      expect(tape.style.height).toBe(`${t.height}px`);
      expect(tape.style.opacity).toBe(String(t.opacity));
      const edges = screen.getByTestId('card-tape-edges');
      expect(edges).toHaveAttribute('aria-hidden', 'true');
      const lines = [...edges.querySelectorAll('line')];
      expect(lines).toHaveLength(2);
      const inset = t.border.width / 2;
      expect(lines.map((l) => l.getAttribute('x1'))).toEqual([`${inset}`, `${t.width - inset}`]);
      for (const l of lines) {
        expect(l.getAttribute('x2')).toBe(l.getAttribute('x1'));
        expect(l.getAttribute('y1')).toBe('0');
        expect(l.getAttribute('y2')).toBe(`${t.height}`);
        expect(l).toHaveAttribute('stroke', t.border.color);
        expect(l).toHaveAttribute('stroke-width', `${t.border.width}`);
        // The dash pattern React Native's own dashed border uses: 3 x the border width.
        expect(l).toHaveAttribute(
          'stroke-dasharray',
          `${t.border.width * 3} ${t.border.width * 3}`,
        );
      }
      expect(tape.style.transform).toBe(`rotate(${card.tilt.sticky - t.tilt}deg)`);
      expect(style('paper').transformOrigin).toBe('top');
    });

    it('tape edges follow custom theme border values', () => {
      const tapeTheme = { ...card.fastener.tape, border: { color: '#010203', width: 4 } };
      const custom = {
        ...lightTheme,
        card: { ...card, fastener: { ...card.fastener, tape: tapeTheme } },
      };
      renderWithTheme(<Card fastener="tape" />, custom);
      const line = screen.getByTestId('card-tape-edges').querySelector('line');
      expect(line).toHaveAttribute('stroke', '#010203');
      expect(line).toHaveAttribute('stroke-width', '4');
      expect(line).toHaveAttribute('stroke-dasharray', '12 12');
    });

    it('plain with elevated still draws the sketch outline and elevation shadow', () => {
      renderWithTheme(<Card elevated testID="raised" />);
      expect(screen.queryByTestId('sketch-svg')).toBeNull();
      layout('raised', 200, 120);
      const svg = screen.getByTestId('sketch-svg');
      const strokes = (color: string) => svg.querySelectorAll(`path[stroke="${color}"]`).length;
      expect(strokes(lightTheme.colors.borderDefault)).toBeGreaterThan(0);
      expect(strokes(lightTheme.colors.borderSubtle)).toBeGreaterThan(0);
    });

    it('plain without elevated draws the outline but no elevation shadow', () => {
      renderWithTheme(<Card testID="flat" />);
      layout('flat', 200, 120);
      const svg = screen.getByTestId('sketch-svg');
      expect(svg.querySelectorAll(`path[stroke="${lightTheme.colors.borderDefault}"]`).length).toBe(
        svg.querySelectorAll('path').length,
      );
    });
  });

  describe('layout observation across variant switches', () => {
    it.each([
      'sticky',
      'lined',
      'plain',
    ] as const)('attaches a layout handler at mount (%s)', (variant) => {
      renderWithTheme(<Card variant={variant} testID="c" />);
      const node = screen.getByTestId('c') as HTMLElement & { __reactLayoutHandler?: unknown };
      expect(node.__reactLayoutHandler).toBeTypeOf('function');
    });

    it('measures a card mounted as sticky once it becomes lined', () => {
      const { rerender } = renderWithTheme(<Card variant="sticky" testID="c" />);
      rerender(<Card variant="lined" testID="c" />);
      layout('c', 200, 120);
      expect(screen.getAllByTestId('card-rule').length).toBeGreaterThan(0);
    });

    it('measures a card mounted as sticky once it becomes plain', () => {
      const { rerender } = renderWithTheme(<Card variant="sticky" testID="c" />);
      rerender(<Card variant="plain" testID="c" />);
      layout('c', 200, 120);
      expect(screen.getByTestId('sketch-svg').querySelectorAll('path').length).toBeGreaterThan(0);
    });
  });

  describe('switching variant at runtime', () => {
    it('keeps child state across variants', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const ui = (variant: CardVariant, fastener: CardFastener = 'none') => (
        <Card variant={variant} fastener={fastener} testID="c">
          <Counter />
        </Card>
      );
      const { rerender } = renderWithTheme(ui('plain'));
      const root = screen.getByTestId('c');
      fireEvent.click(screen.getByText('count 0'));
      const child = screen.getByText('count 1');
      for (const [variant, fastener] of [
        ['sticky', 'pin'],
        ['lined', 'tape'],
        ['plain', 'pin'],
        ['plain', 'none'],
      ] as const) {
        rerender(ui(variant, fastener));
        expect(screen.getByTestId('c')).toBe(root);
        expect(screen.getByText('count 1')).toBe(child);
      }
      warn.mockRestore();
    });
  });
});
