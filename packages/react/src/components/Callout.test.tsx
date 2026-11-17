import type { IconName } from '@ghds/icons';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { cssVars } from '../lib/cssVars.js';
import { Callout, type CalloutVariant } from './Callout.js';
import { Icon } from './Icon.js';

const VARIANTS: CalloutVariant[] = ['info', 'tip', 'warning'];

/** The outline is the stroked path that is neither a fill nor a shadow. */
function outlineStroke(container: HTMLElement): string | null {
  const outline = [...container.querySelectorAll('svg path')].find(
    (path) => path.getAttribute('fill') === 'none' && path.getAttribute('stroke') !== null,
  );
  return outline?.getAttribute('stroke') ?? null;
}

describe('Callout', () => {
  it('renders the heading and body inside a note', () => {
    render(
      <Callout variant="tip" heading="Recommended fonts">
        Load the fonts with Fontsource.
      </Callout>,
    );
    const note = screen.getByRole('note');
    expect(note).toHaveTextContent('Recommended fonts');
    expect(note).toHaveTextContent('Load the fonts with Fontsource.');
  });

  it('omits the heading when none is given', () => {
    render(<Callout>Body only</Callout>);
    const note = screen.getByRole('note');
    const content = note.lastElementChild;
    expect(content?.children).toHaveLength(1);
    expect(content).toHaveTextContent('Body only');
  });

  it('renders rich children', () => {
    render(
      <Callout heading={<em>Heads up</em>}>
        <p>
          See the <a href="#fonts">fonts guide</a>.
        </p>
      </Callout>,
    );
    expect(screen.getByText('Heads up').tagName).toBe('EM');
    expect(screen.getByRole('link', { name: 'fonts guide' })).toBeInTheDocument();
  });

  it('defaults to the info variant', () => {
    render(<Callout>Note</Callout>);
    expect(screen.getByRole('note')).toHaveAttribute('data-variant', 'info');
  });

  it.each(VARIANTS)('colours the %s outline and icon from comp.callout tokens', (variant) => {
    const { container } = render(<Callout variant={variant}>Body</Callout>);
    expect(outlineStroke(container)).toBe(cssVars.comp.callout.stroke[variant]);
    const icon = container.querySelector('[data-callout-icon]');
    expect(icon).toHaveStyle({ color: cssVars.comp.callout.icon[variant] });
  });

  it.each<[CalloutVariant, IconName]>([
    ['info', 'info'],
    ['tip', 'star'],
    ['warning', 'warning'],
  ])('maps the %s variant to the %s icon', (variant, icon) => {
    const { container } = render(<Callout variant={variant}>a</Callout>);
    const { container: reference } = render(<Icon name={icon} size="sm" />);
    const actual = container.querySelector('[data-callout-icon] svg')?.innerHTML;
    expect(actual).toBeTruthy();
    expect(actual).toBe(reference.querySelector('svg')?.innerHTML);
  });

  it('draws a decorative sketch outline', () => {
    const { container } = render(<Callout>Body</Callout>);
    // Exclude the variant icon's SVG so the assertions only see the sketch surface.
    const svg = [...container.querySelectorAll('svg')].find(
      (el) => !el.closest('[data-callout-icon]'),
    );
    expect(svg).toBeDefined();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('omits the heading when it is an empty string', () => {
    render(<Callout heading="">Body only</Callout>);
    const content = screen.getByRole('note').lastElementChild;
    expect(content?.children).toHaveLength(1);
  });

  it('is not a live region and has no dismiss affordance', () => {
    render(
      <Callout variant="warning" heading="Careful">
        Body
      </Callout>,
    );
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('note')).not.toHaveAttribute('aria-live');
  });

  it('forwards the ref and lets callers override the role', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Callout
        ref={(el) => {
          node = el;
        }}
        role="region"
        aria-label="Tip"
      >
        Body
      </Callout>,
    );
    expect(screen.getByRole('region', { name: 'Tip' })).toBe(node);
  });
});
